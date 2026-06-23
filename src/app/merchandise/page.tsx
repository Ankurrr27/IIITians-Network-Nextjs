import React from "react";
import { getCollectionProducts, ShopifyProduct } from "./shopify";
import MerchandiseClient, { SerializedProduct } from "./MerchandiseClient";

export const dynamic = "force-dynamic";

function serializeProduct(
  p: ShopifyProduct & { isCustomDrop: boolean }
): SerializedProduct {
  const minPrice = p.priceRange.minVariantPrice.amount;
  const maxPrice = p.priceRange.maxVariantPrice.amount;
  const hasRange = minPrice !== maxPrice;

  const format = (amt: string) => {
    const num = parseFloat(amt);
    return num % 1 === 0 ? `₹${num.toFixed(0)}` : `₹${num.toFixed(2)}`;
  };

  const compareAtAmt = p.compareAtPriceRange.maxVariantPrice.amount;
  const compareAtPrice =
    parseFloat(compareAtAmt) > parseFloat(minPrice) ? format(compareAtAmt) : null;

  const discountPercent = compareAtPrice
    ? Math.round(
        ((parseFloat(compareAtAmt) - parseFloat(minPrice)) /
          parseFloat(compareAtAmt)) *
          100
      )
    : null;

  let reviewRating = 0;
  if (p.reviewRating) {
    try {
      const parsed = JSON.parse(p.reviewRating.value);
      reviewRating = parseFloat(parsed.value) || 0;
    } catch {
      reviewRating = 0;
    }
  }

  const reviewCount = p.reviewCount ? parseInt(p.reviewCount.value, 10) : 0;

  let reviews: any[] = [];
  if (p.reviewData) {
    try {
      const data = JSON.parse(p.reviewData.value);
      reviews = (data.reviews || [])
        .filter((r: any) => r.body && r.body.trim().length > 0)
        .map((r: any) => ({
          id: r.uuid,
          rating: r.rating,
          title: r.title || "",
          body: r.body || "",
          name: r.reviewer_name,
          initial: r.reviewer_initial,
          verified: r.verified_buyer,
          date: r.created_at,
        }));
    } catch {
      reviews = [];
    }
  }

  const VALID_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];
  const VALID_SIZES_SET = new Set(VALID_SIZES);
  const sizesSet = new Set<string>();
  const colorsSet = new Set<string>();

  for (const { node } of p.variants.edges) {
    for (const part of node.title.split(" / ")) {
      const trimmed = part.trim();
      if (VALID_SIZES_SET.has(trimmed)) {
        sizesSet.add(trimmed);
      } else if (trimmed !== "Unisex") {
        colorsSet.add(trimmed);
      }
    }
  }

  const sizes = Array.from(sizesSet).sort(
    (a, b) => VALID_SIZES.indexOf(a) - VALID_SIZES.indexOf(b)
  );
  const colors = Array.from(colorsSet);

  const images = p.images.edges.map((e) => ({
    url: e.node.url,
    alt: e.node.altText || p.title,
    width: e.node.width || 800,
    height: e.node.height || 800,
  }));

  const campuses = p.tags.filter((t) => t.startsWith("IIIT ")).sort();

  const t = p.title.toLowerCase();
  let type = "Apparel";
  if (t.includes("hoodie")) type = "Hoodie";
  else if (t.includes("polo")) type = "Polo Tee";
  else if (t.includes("oversized")) type = "Oversized Tee";
  else if (t.includes("vest")) type = "Vest";
  else if (t.includes("tee") || t.includes("t-shirt")) type = "T-Shirt";
  else if (p.productType) type = p.productType;

  // Extract raw variants mapping for checkout creation
  const variantsRaw = p.variants.edges.map((v) => ({
    id: v.node.id,
    title: v.node.title,
    price: v.node.price.amount,
    availableForSale: v.node.availableForSale,
    options: v.node.title.split(" / ").map((o) => o.trim()),
  }));

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description || "",
    descriptionHtml: p.descriptionHtml || "",
    type,
    campuses,
    minPrice: format(minPrice),
    maxPrice: format(maxPrice),
    hasRange,
    compareAtPrice,
    discountPercent,
    sizes,
    colors,
    images,
    availableForSale: p.variants.edges.some((v) => v.node.availableForSale),
    reviewRating,
    reviewCount,
    reviews,
    isCustomDrop: p.isCustomDrop,
    freeDelivery: true,
    variantsRaw,
    tags: p.tags || [],
  };
}

export default async function MerchandisePage() {
  try {
    const rawProducts = await getCollectionProducts("iiit-drops", "custom-drops");
    const serialized = rawProducts.map(serializeProduct);

    const productTypes = Array.from(new Set(serialized.map((p) => p.type))).sort();
    const campuses = Array.from(new Set(serialized.flatMap((p) => p.campuses))).sort();

    return (
      <MerchandiseClient
        products={serialized}
        productTypes={productTypes}
        campuses={campuses}
        error={false}
      />
    );
  } catch (err) {
    console.error("Failed to fetch Shopify products:", err);
    return (
      <MerchandiseClient
        products={[]}
        productTypes={[]}
        campuses={[]}
        error={true}
      />
    );
  }
}
