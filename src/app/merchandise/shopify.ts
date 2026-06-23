// SETUP: Add cdn.shopify.com to next.config.js remotePatterns:
//   images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com' }] }

const SHOPIFY_DOMAIN = "gtg8cv-2r.myshopify.com";
const STOREFRONT_TOKEN = "28b556c4dbee6664c55b5a273a6e32cd";

async function shopifyFetch<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/api/2026-04/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "Shopify GraphQL error");
  return json.data as T;
}

const COLLECTION_QUERY = `
  query GetCollection($handle: String!, $cursor: String) {
    collection(handle: $handle) {
      products(first: 250, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            tags
            productType
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            compareAtPriceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            images(first: 8) {
              edges {
                node { url altText width height }
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  availableForSale
                }
              }
            }
            reviewRating: metafield(namespace: "reviews", key: "rating") {
              value
              type
            }
            reviewCount: metafield(namespace: "reviews", key: "rating_count") {
              value
            }
            reviewData: metafield(namespace: "judgeme", key: "review_widget_data") {
              value
            }
          }
        }
      }
    }
  }
`;

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  productType: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  images: {
    edges: {
      node: { url: string; altText: string | null; width: number; height: number };
    }[];
  };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        compareAtPrice: { amount: string; currencyCode: string } | null;
        availableForSale: boolean;
      };
    }[];
  };
  reviewRating: { value: string; type: string } | null;
  reviewCount: { value: string } | null;
  reviewData: { value: string } | null;
};

type CollectionResponse = {
  collection: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      edges: { node: ShopifyProduct }[];
    };
  } | null;
};

async function fetchAllCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const data: CollectionResponse = await shopifyFetch<CollectionResponse>(COLLECTION_QUERY, {
      handle,
      cursor,
    });
    if (!data.collection) break;

    for (const { node } of data.collection.products.edges) {
      products.push(node);
    }

    const { hasNextPage, endCursor } = data.collection.products.pageInfo;
    if (!hasNextPage) break;
    cursor = endCursor;
  }

  return products;
}

// Returns all products: iiit-drops products first, then unique custom-drops products.
// isCustomDrop=true means the product is only in the secondary (custom-drops) collection.
export async function getCollectionProducts(
  primaryHandle: string,
  secondaryHandle: string
): Promise<(ShopifyProduct & { isCustomDrop: boolean })[]> {
  const [primary, secondary] = await Promise.all([
    fetchAllCollectionProducts(primaryHandle),
    fetchAllCollectionProducts(secondaryHandle),
  ]);

  const secondaryIds = new Set(secondary.map((p) => p.id));
  const seen = new Set<string>();
  const result: (ShopifyProduct & { isCustomDrop: boolean })[] = [];

  for (const p of primary) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      result.push({ ...p, isCustomDrop: secondaryIds.has(p.id) });
    }
  }

  for (const p of secondary) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      result.push({ ...p, isCustomDrop: true });
    }
  }

  return result;
}

export function formatPrice(amount: string): string {
  const num = parseFloat(amount);
  return num % 1 === 0 ? `₹${num.toFixed(0)}` : `₹${num.toFixed(2)}`;
}

const VALID_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];
const VALID_SIZES_SET = new Set(VALID_SIZES);

export function extractSizes(product: ShopifyProduct): string[] {
  const sizes = new Set<string>();
  for (const { node } of product.variants.edges) {
    for (const part of node.title.split(" / ")) {
      const trimmed = part.trim();
      if (VALID_SIZES_SET.has(trimmed)) sizes.add(trimmed);
    }
  }
  return Array.from(sizes).sort(
    (a, b) => VALID_SIZES.indexOf(a) - VALID_SIZES.indexOf(b)
  );
}

export function cleanTitle(title: string): string {
  return title
    .replace(/^The Customisable\s+/i, "")
    .replace(/^The\s+/i, "")
    .replace(/\s*\((?:Print Your Name|Fully Customiz(?:able|ed))\)\s*/gi, " ")
    .replace(/[–—-]\s*\d+GSM(?:\s+(?:Oversized\s+Tee|Polo\s+Tee|Hoodie|Tee|T-Shirt))?$/i, "")
    .replace(/\s+\d+GSM$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getProductType(product: ShopifyProduct): string {
  const t = product.title.toLowerCase();
  if (t.includes("hoodie")) return "Hoodie";
  if (t.includes("polo")) return "Polo Tee";
  if (t.includes("oversized")) return "Oversized Tee";
  if (t.includes("vest")) return "Vest";
  if (t.includes("tee") || t.includes("t-shirt")) return "T-Shirt";
  return product.productType || "Apparel";
}

export function getIIITCampuses(tags: string[]): string[] {
  return tags.filter((t) => t.startsWith("IIIT ")).sort();
}

export function extractColors(product: ShopifyProduct): string[] {
  const colors = new Set<string>();
  for (const { node } of product.variants.edges) {
    for (const part of node.title.split(" / ")) {
      const trimmed = part.trim();
      if (!VALID_SIZES_SET.has(trimmed) && trimmed !== "Unisex") {
        colors.add(trimmed);
      }
    }
  }
  return Array.from(colors);
}

export type JudgeMeReview = {
  uuid: string;
  rating: number;
  title: string;
  body: string;
  reviewer_name: string;
  reviewer_initial: string;
  verified_buyer: boolean;
  created_at: string;
  pictures_urls: string[];
};

export function parseReviews(product: ShopifyProduct): {
  rating: number;
  count: number;
  reviews: JudgeMeReview[];
} {
  const count = product.reviewCount ? parseInt(product.reviewCount.value, 10) : 0;

  let rating = 0;
  if (product.reviewRating) {
    try {
      const parsed = JSON.parse(product.reviewRating.value);
      rating = parseFloat(parsed.value) || 0;
    } catch {
      rating = 0;
    }
  }

  let reviews: JudgeMeReview[] = [];
  if (product.reviewData) {
    try {
      const data = JSON.parse(product.reviewData.value);
      reviews = (data.reviews || [])
        .filter((r: JudgeMeReview) => r.body && r.body.trim().length > 0)
        .map((r: JudgeMeReview) => ({
          uuid: r.uuid,
          rating: r.rating,
          title: r.title || "",
          body: r.body || "",
          reviewer_name: r.reviewer_name,
          reviewer_initial: r.reviewer_initial,
          verified_buyer: r.verified_buyer,
          created_at: r.created_at,
          pictures_urls: r.pictures_urls || [],
        }));
    } catch {
      reviews = [];
    }
  }

  return { rating, count, reviews };
}

export function getCompareAtPrice(product: ShopifyProduct): string | null {
  const compareAt = parseFloat(product.compareAtPriceRange.maxVariantPrice.amount);
  const actual = parseFloat(product.priceRange.minVariantPrice.amount);
  if (compareAt > actual) return formatPrice(product.compareAtPriceRange.maxVariantPrice.amount);
  return null;
}

export function getDiscountPercent(product: ShopifyProduct): number | null {
  const compareAt = parseFloat(product.compareAtPriceRange.maxVariantPrice.amount);
  const actual = parseFloat(product.priceRange.minVariantPrice.amount);
  if (compareAt > actual) return Math.round(((compareAt - actual) / compareAt) * 100);
  return null;
}

export function cleanDescriptionHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/data-[a-z-]+="[^"]*"/gi, "")
    .trim();
}
