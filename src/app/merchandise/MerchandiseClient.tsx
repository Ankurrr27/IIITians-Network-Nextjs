"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import useThemeMode from "@/hooks/useThemeMode";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { iiitCampuses } from "@/data/iiitCampuses";
import { isIIITEmail } from "@/data/iiitDomains";
import {
  ChevronRight,
  ChevronDown,
  Sparkles,
  Search,
  X,
  Star,
  ArrowUpDown,
  BadgeCheck,
  Truck,
  Package,
  Info,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Check,
  Users,
  HelpCircle,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";

function getWebsiteFavicon(website?: string) {
  if (!website) return "";
  try {
    const hostname = new URL(website).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return "";
  }
}

function getShopifyTagForCampus(campusName: string): string {
  const name = campusName.trim();
  if (name.includes("Gwalior")) return "IIIT Gwalior";
  if (name.includes("Jabalpur")) return "IIIT Jabalpur";
  if (name.includes("Kancheepuram")) return "IIIT Kancheepuram";
  if (name.includes("Kurnool")) return "IIIT Kurnool";
  if (name.includes("Sonipat") || name.includes("Sonepat")) return "IIIT Sonepat";
  if (name.includes("Tiruchirappalli") || name.includes("Trichy")) return "IIIT Trichy";
  if (name.includes("Diu")) return "IIIT Vadodara"; // Diu shares Vadodara tags
  if (name.startsWith("IIIT ")) {
    return name;
  }
  return `IIIT ${name}`;
}

function getPersonalizationTier(tags: string[] = []): "req_full" | "req_half" | "req_name" | "req_college" | null {
  if (tags.includes("req_full")) return "req_full";
  if (tags.includes("req_half")) return "req_half";
  if (tags.includes("req_name")) return "req_name";
  if (tags.includes("req_college")) return "req_college";
  return null;
}

function formatBatch(batchStr: string): string {
  const cleaned = batchStr.replace(/\s+/g, "");
  const match = cleaned.match(/^(20\d{2})-(\d{2})$/);
  if (match) {
    return `${match[1]} - ${match[2]}`;
  }
  return batchStr.trim();
}

export type SerializedProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  type: string;
  campuses: string[];
  minPrice: string;
  maxPrice: string;
  hasRange: boolean;
  compareAtPrice: string | null;
  discountPercent: number | null;
  sizes: string[];
  colors: string[];
  images: { url: string; alt: string; width: number; height: number }[];
  availableForSale: boolean;
  reviewRating: number;
  reviewCount: number;
  reviews: {
    id: string;
    rating: number;
    title: string;
    body: string;
    name: string;
    initial: string;
    verified: boolean;
    date: string;
  }[];
  isCustomDrop: boolean;
  freeDelivery: boolean;
  variantsRaw: {
    id: string;
    title: string;
    price: string;
    availableForSale: boolean;
    options: string[];
  }[];
  tags: string[];
};

type Props = {
  products: SerializedProduct[];
  productTypes: string[];
  campuses: string[];
  error: boolean;
};

type SortKey = "default" | "price-asc" | "price-desc" | "rating" | "az";

type CartItem = {
  id: string;
  productId: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  price: number;
  imageUrl: string;
  quantity: number;
  customization: {
    size: string;
    color: string;
    printName?: string;
    college?: string;
    batch?: string;
    branch?: string;
    notes?: string;
    customName?: string;
    customText?: string;
    clubName?: string;
  };
};

function parseRupees(price: string) {
  return parseFloat(price.replace(/[₹,]/g, "")) || 0;
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// Safe, idempotent campus name replacement helper
const transformProductTitle = (title: string, campus: string) => {
  let clean = title;
  
  // Replace "IIIT <Campus>" with selected campus
  clean = clean.replace(/\bIIIT\s+[A-Za-z]+\b/gi, campus);
  
  // Replace "Customisable" or "Fully Customizable" with selected campus
  if (/customisable/i.test(clean)) {
    clean = clean.replace(/Customisable/gi, campus);
  } else if (/Fully Customizable/i.test(clean)) {
    clean = clean.replace(/\(Fully Customizable\)/gi, "").replace(/The Batch/i, `The ${campus} Batch`);
  }
  
  if (!clean.includes(campus)) {
    clean = clean.replace(/^The\s+/i, `The ${campus} `);
  }
  
  return clean.replace(/\s+/g, " ").replace(/[–-]/g, "–").trim();
};

// Professional specs template generator based on product title
const generateDescription = (title: string, campus: string) => {
  const lowerTitle = title.toLowerCase();
  let productType = "Collegiate Apparel";
  let weight = "240GSM";
  let fit = "Relaxed oversized fit";
  let material = "100% Premium Bio-Washed Combed Cotton";

  if (lowerTitle.includes("hoodie")) {
    productType = "Premium Heavyweight Hoodie";
    weight = "320GSM";
    fit = "Relaxed streetwear hoodie fit with lined hood and kangaroo pocket";
    material = "320GSM Premium Heavyweight Cotton Fleece Blend";
  } else if (lowerTitle.includes("polo")) {
    productType = "Premium Pique Polo Tee";
    weight = "200GSM";
    fit = "Classic regular polo fit with ribbed collar and button placket";
    material = "200GSM Premium Bio-Washed Cotton Pique";
  } else if (lowerTitle.includes("oversized")) {
    productType = "Premium Heavyweight Oversized Tee";
    weight = "240GSM";
    fit = "Relaxed streetwear oversized fit with drop shoulders";
    material = "240GSM Premium Bio-Washed Combed Cotton";
  }

  let theme = "Special Edition";
  const themeMatch = title.match(/The\s+IIIT\s+[A-Za-z]+\s+(.*?)\s+(Oversized Tee|Polo Tee|Hoodie|Heritage Polo|Prestige Polo|Batch Nexus)/i);
  if (themeMatch && themeMatch[1]) {
    theme = themeMatch[1].trim();
  }

  return `Official ${campus} ${theme} ${productType}. Engineered with premium grade materials to represent your campus department and heritage with clean, minimalist style and maximum durability.

Product Specifications:
• Fit: ${fit}
• Material: ${material}
• Fabric Weight: ${weight}
• Design: High-definition varsity print/embroidery repping ${campus} ${theme}
• Care Instructions: Machine wash cold inside out, tumble dry low
• Fulfilled & Printed by: KS Verse`;
};

// ── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({
  product,
  selectedCampus,
  onClose,
  isDarkMode,
  addToCart,
}: {
  product: SerializedProduct;
  selectedCampus: string;
  onClose: () => void;
  isDarkMode: boolean;
  addToCart: (
    product: SerializedProduct,
    variant: any,
    size: string,
    color: string,
    customization: {
      printName?: string;
      college?: string;
      batch?: string;
      branch?: string;
      notes?: string;
    }
  ) => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  
  const [printName, setPrintName] = useState("");
  const [branch, setBranch] = useState("");
  const [batch, setBatch] = useState("");
  const [college, setCollege] = useState(selectedCampus || "");
  const [customNotes, setCustomNotes] = useState("");
  const [validationError, setValidationError] = useState("");

  const tier = useMemo(() => getPersonalizationTier(product.tags), [product.tags]);

  useEffect(() => {
    setCollege(selectedCampus || "");
  }, [selectedCampus]);

  const activeCampusObj = useMemo(() => {
    return iiitCampuses.find(
      (c) => c.name.toLowerCase() === selectedCampus.toLowerCase()
    );
  }, [selectedCampus]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const resolvedVariant = useMemo(() => {
    return product.variantsRaw.find((variant) => {
      return variant.options.every((opt) => {
        if (product.sizes.includes(opt)) return opt === selectedSize;
        if (product.colors.includes(opt)) return opt === selectedColor;
        return true;
      });
    });
  }, [product, selectedSize, selectedColor]);

  const handleAdd = () => {
    if (!resolvedVariant) return;

    
    if (tier) {
      if (tier === "req_name") {
        if (!printName.trim()) {
          setValidationError("Name is required.");
          return;
        }
      } else if (tier === "req_college") {
        if (!college.trim()) {
          setValidationError("College is required.");
          return;
        }
      } else if (tier === "req_half") {
        if (!printName.trim()) {
          setValidationError("Name is required.");
          return;
        }
        if (!college.trim()) {
          setValidationError("College is required.");
          return;
        }
        if (!batch.trim()) {
          setValidationError("Batch is required.");
          return;
        }
        if (!/^20\d{2}\s*-\s*\d{2}$/.test(batch.trim()) && !/^20\d{2}-\d{2}$/.test(batch.trim())) {
          setValidationError("Batch format must be 20xx - xx (e.g. 2022 - 26).");
          return;
        }
      } else if (tier === "req_full") {
        if (!printName.trim()) {
          setValidationError("Name is required.");
          return;
        }
        if (!branch.trim()) {
          setValidationError("Branch is required.");
          return;
        }
        if (!batch.trim()) {
          setValidationError("Batch is required.");
          return;
        }
        if (!/^20\d{2}\s*-\s*\d{2}$/.test(batch.trim()) && !/^20\d{2}-\d{2}$/.test(batch.trim())) {
          setValidationError("Batch format must be 20xx - xx (e.g. 2022 - 26).");
          return;
        }
        if (!college.trim()) {
          setValidationError("College is required.");
          return;
        }
      }
    }

    setValidationError("");

    addToCart(
      product,
      resolvedVariant,
      selectedSize,
      selectedColor,
      {
        printName: tier === "req_college" ? college.trim().toUpperCase() : (printName.trim() ? printName.trim().toUpperCase() : undefined),
        college: (tier === "req_half" || tier === "req_full") ? college.trim() : undefined,
        batch: (tier === "req_half" || tier === "req_full") ? formatBatch(batch) : undefined,
        branch: tier === "req_full" ? branch.trim().toUpperCase() : undefined,
        notes: customNotes.trim() || undefined,
      }
    );
    onClose();
  };

  const transformedTitle = transformProductTitle(product.title, selectedCampus);
  const transformedDesc = generateDescription(transformedTitle, selectedCampus);

  const bg = isDarkMode
    ? "bg-[#0d1424] text-slate-100 border-slate-800"
    : "bg-white text-slate-900 border-slate-200";
  const subtle = isDarkMode ? "text-slate-400" : "text-slate-500";
  const divider = isDarkMode ? "border-slate-800" : "border-slate-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full h-[85dvh] sm:h-auto sm:max-w-4xl sm:rounded-[2rem] border shadow-2xl sm:max-h-[92dvh] flex flex-col overflow-hidden rounded-t-[2rem] ${bg}`}
      >
        {/* ─── MOBILE VIEW: AMAZON STYLE BOTTOM SHEET ─── */}
        <div className="flex flex-col h-full w-full overflow-hidden sm:hidden bg-white dark:bg-[#090d16]">
          {/* Mobile Drag Indicator / Header */}
          <div className="flex flex-col items-center border-b pb-2 pt-3 bg-white dark:bg-[#0d1424] border-slate-100 dark:border-slate-850 shrink-0">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
            <div className="flex items-center justify-between w-full px-4">
              <button onClick={onClose} className="text-slate-500 dark:text-slate-400 p-1">
                <X size={18} />
              </button>
              <span className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-white">
                Customize & Buy
              </span>
              <div className="w-8" />
            </div>
          </div>

          {/* Scrollable Details */}
          <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4 space-y-5">
            {/* Image Swiper */}
            <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-950/20 rounded-2xl overflow-hidden flex items-center justify-center">
              {product.images[activeImg] ? (
                <Image
                  src={product.images[activeImg].url}
                  alt={product.images[activeImg].alt}
                  width={product.images[activeImg].width}
                  height={product.images[activeImg].height}
                  className="max-h-[85%] w-full object-contain p-2"
                  priority
                />
              ) : (
                <span className="text-4xl opacity-20">👕</span>
              )}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeImg === i ? "w-4 bg-indigo-500" : "w-1.5 bg-slate-300 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title & Brand */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                IIITians Network Merchandise
              </span>
              <h2 className="text-lg font-black leading-tight text-slate-900 dark:text-white">
                {transformedTitle}
              </h2>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <StarRow rating={product.reviewRating} size={12} />
                  <span className="text-[11px] font-bold text-indigo-555 dark:text-indigo-400">
                    {product.reviewRating} ({product.reviewCount} ratings)
                  </span>
                </div>
              )}
            </div>

            {/* Price Block */}
            <div className="border-y py-3 border-slate-100 dark:border-slate-850 space-y-1">
              <div className="flex items-baseline gap-2">
                {product.discountPercent && (
                  <span className="text-2xl font-light text-rose-500 dark:text-rose-450">
                    -{product.discountPercent}%
                  </span>
                )}
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {product.minPrice}
                </span>
              </div>
              <div className="text-xs text-slate-450 space-y-1 font-semibold">
                {product.compareAtPrice && (
                  <div>
                    M.R.P.: <span className="line-through">{product.compareAtPrice}</span>
                  </div>
                )}
                <div className="text-emerald-600 dark:text-emerald-500 font-extrabold flex items-center gap-1">
                  <Truck size={12} />
                  <span>FREE Delivery by KS Verse</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-455 mb-2">Description</h4>
              <p className="text-[11px] leading-relaxed text-slate-655 dark:text-slate-350 whitespace-pre-line font-medium">
                {transformedDesc}
              </p>
            </div>

            {/* Size & Color Selector */}
            <div className="space-y-4">
              {product.sizes.length > 0 && (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Size: <span className="text-indigo-500 font-extrabold">{selectedSize}</span>
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold border transition ${
                          selectedSize === s
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-slate-300"
                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors.length > 1 && (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Color: <span className="text-indigo-500 font-extrabold">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold border transition ${
                          selectedColor === c
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Customization tier */}
            {tier && (
              <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-500" />
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Personalization Details (Required)
                  </h4>
                </div>

                {validationError && (
                  <div className="text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 px-3 py-2.5 rounded-xl">
                    ⚠️ {validationError}
                  </div>
                )}

                <div className="space-y-3.5">
                  {(tier === "req_name" || tier === "req_half" || tier === "req_full") && (
                    <div>
                      <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                        Print Your Name <span className="text-rose-505">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="e.g. DHRUV"
                        value={printName}
                        onChange={(e) => setPrintName(e.target.value.toUpperCase())}
                        className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                          isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-955"
                        }`}
                      />
                    </div>
                  )}

                  {tier === "req_college" && (
                    <div>
                      <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                        Print Your College <span className="text-rose-505">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. IIIT RANCHI"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                          isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-955"
                        }`}
                      />
                    </div>
                  )}

                  {tier === "req_full" && (
                    <div>
                      <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                        Print Your Branch <span className="text-rose-505">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="e.g. COMPUTER SCIENCE"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                          isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-955"
                        }`}
                      />
                    </div>
                  )}

                  {(tier === "req_half" || tier === "req_full") && (
                    <div className="grid gap-3 grid-cols-2">
                      <div>
                        <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                          Print Your Batch <span className="text-rose-505">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={9}
                          placeholder="2022 - 26"
                          value={batch}
                          onChange={(e) => setBatch(e.target.value)}
                          className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                            isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-955"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                          Print Your College <span className="text-rose-505">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. IIIT RANCHI"
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                            isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-955"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any additional customization notes..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition ${
                        isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-955"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-35 bg-white dark:bg-[#0d1424] border-t border-slate-100 dark:border-slate-850 p-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price:</span>
              <span className="text-lg font-black text-indigo-650 dark:text-indigo-400">
                {product.hasRange ? `From ${product.minPrice}` : product.minPrice}
              </span>
            </div>
            <button
              type="button"
              disabled={!resolvedVariant || !resolvedVariant.availableForSale}
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
            >
              <ShoppingBag size={14} />
              <span>
                {!resolvedVariant
                  ? "Select options"
                  : !resolvedVariant.availableForSale
                  ? "Sold Out"
                  : "Add to Cart"}
              </span>
            </button>
          </div>
        </div>

        {/* ─── DESKTOP VIEW: ORIGINAL TWO-COLUMN SPLIT ─── */}
        <div className="hidden sm:flex flex-row w-full h-full">
          {/* Left — Images */}
          <div className={`sm:w-1/2 flex flex-col justify-between p-6 ${isDarkMode ? "bg-slate-950/20" : "bg-slate-50/50"}`}>
            <div className="flex-1 flex items-center justify-center min-h-[260px] max-h-[380px]">
              {product.images[activeImg] ? (
                <Image
                  src={product.images[activeImg].url}
                  alt={product.images[activeImg].alt}
                  width={product.images[activeImg].width}
                  height={product.images[activeImg].height}
                  className="max-h-[350px] w-full object-contain"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl opacity-20">
                  👕
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center mt-4 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition p-1 bg-white ${
                      activeImg === i ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 hover:border-slate-350"
                    }`}
                    style={{ width: 48, height: 48 }}
                  >
                    <img src={img.url} alt="thumbnail" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Customization Forms */}
          <div className="sm:w-1/2 flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-850 p-6 overflow-y-auto max-h-[50vh] sm:max-h-[90vh]">
            <div>
              <div className="flex items-start gap-3">
                {activeCampusObj?.logo && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 animate-fade-in">
                    <img
                      key={selectedCampus}
                      src={activeCampusObj.logo}
                      alt={`${selectedCampus} logo`}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        const favicon = getWebsiteFavicon(activeCampusObj.website);
                        if (favicon && e.currentTarget.src !== favicon) {
                          e.currentTarget.src = favicon;
                        } else {
                          e.currentTarget.style.display = "none";
                        }
                      }}
                    />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">
                    Premium Quality Apparel
                  </span>
                  <h2 className="text-xl font-black mt-0.5 leading-tight">{transformedTitle}</h2>
                </div>
              </div>
              
              {/* Price */}
              <div className="flex items-baseline flex-wrap gap-x-2 mt-3 border-y py-3 border-slate-100 dark:border-slate-850">
                <span className="text-2xl font-black text-indigo-650 dark:text-indigo-400">
                  {product.hasRange ? `From ${product.minPrice}` : product.minPrice}
                </span>
                {product.compareAtPrice && (
                  <span className={`text-sm line-through ${subtle}`}>
                    M.R.P.: {product.compareAtPrice}
                  </span>
                )}
                {product.discountPercent && (
                  <span className="text-sm text-emerald-600 font-extrabold">
                    ({product.discountPercent}% OFF)
                  </span>
                )}
              </div>

              {/* Specs Description */}
              <div className="mt-4">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 mb-2">Product Description</h4>
                <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-355 whitespace-pre-line font-medium font-semibold">
                  {transformedDesc}
                </p>
              </div>

              {/* Option / Variant Selectors */}
              <div className="space-y-4 mt-6">
                {product.sizes.length > 0 && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Select Size
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold border transition ${
                            selectedSize === s
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-slate-300"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-350 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors.length > 1 && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Select Color
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold border transition ${
                            selectedColor === c
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-350 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customization Inputs */}
                {tier && (
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-4">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Personalize Your Apparel (Required)
                      </h4>
                    </div>

                    {validationError && (
                      <div className="text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 px-3.5 py-2.5 rounded-xl">
                        ⚠️ {validationError}
                      </div>
                    )}

                    <div className="space-y-3">
                      {(tier === "req_name" || tier === "req_half" || tier === "req_full") && (
                        <div>
                          <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                            Print Your Name <span className="text-rose-505">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="e.g. DHRUV"
                            value={printName}
                            onChange={(e) => setPrintName(e.target.value.toUpperCase())}
                            className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                              isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-950"
                            }`}
                          />
                        </div>
                      )}

                      {tier === "req_college" && (
                        <div>
                          <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                            Print Your College <span className="text-rose-505">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. IIIT RANCHI"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                              isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-950"
                            }`}
                          />
                        </div>
                      )}

                      {tier === "req_full" && (
                        <div>
                          <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                            Print Your Branch <span className="text-rose-505">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={30}
                            placeholder="e.g. COMPUTER SCIENCE"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                              isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-950"
                            }`}
                          />
                        </div>
                      )}

                      {(tier === "req_half" || tier === "req_full") && (
                        <div className="grid gap-3 grid-cols-2">
                          <div>
                            <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                              Print Your Batch <span className="text-rose-505">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={9}
                              placeholder="2022 - 26"
                              value={batch}
                              onChange={(e) => setBatch(e.target.value)}
                              className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                                isDarkMode ? "bg-slate-955 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-950"
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                              Print Your College <span className="text-rose-505">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. IIIT RANCHI"
                              value={college}
                              onChange={(e) => setCollege(e.target.value)}
                              className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                                isDarkMode ? "bg-slate-955 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-950"
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-505">
                          Special Instructions / Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Any additional customization details..."
                          value={customNotes}
                          onChange={(e) => setCustomNotes(e.target.value)}
                          className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none ${
                            isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-202 text-slate-950"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery & Timeline info */}
            <div className={`mt-6 rounded-xl border p-3 flex flex-col gap-2 ${divider} ${isDarkMode ? "bg-slate-950/60" : "bg-slate-50"}`}>
              <div className="flex items-center gap-2.5">
                <Truck size={14} className="text-indigo-500 shrink-0" />
                <span className={`text-[11px] font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  7–10 business days · Custom orders printed fresh
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-4">
              <button
                type="button"
                disabled={!resolvedVariant || !resolvedVariant.availableForSale}
                onClick={handleAdd}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white transition hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={14} />
                <span>
                  {!resolvedVariant
                    ? "Select options"
                    : !resolvedVariant.availableForSale
                    ? "Sold Out"
                    : "Add to Cart"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── Main Client Component ─────────────────────────────────────────────────────
export default function MerchandiseClient({
  products,
  productTypes,
  campuses,
  error,
}: Props) {
  const { isDarkMode } = useThemeMode();

  // State
  const [selectedCampus, setSelectedCampus] = useState("IIIT Ranchi");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const activeCampusObj = useMemo(() => {
    return iiitCampuses.find((c) => c.name.toLowerCase() === selectedCampus.toLowerCase());
  }, [selectedCampus]);
  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [openProduct, setOpenProduct] = useState<SerializedProduct | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Freeze background scroll when any modal is open (bulletproof for iOS Safari)
  useEffect(() => {
    const anyModalOpen = isCartOpen || isFilterOpen || !!openProduct;
    if (anyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isCartOpen, isFilterOpen, openProduct]);

  // Custom Club Order Modal
  const [showClubModal, setShowClubModal] = useState(false);
  const [clubFormSuccess, setClubFormSuccess] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: "",
    email: "",
    college: "",
    club: "",
    quantity: "50",
    details: "",
  });

  const sortedCampuses = useMemo(() => {
    return [...iiitCampuses].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Load & Save Cart
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("iiitians-network-cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e);
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("iiitians-network-cart", JSON.stringify(newCart));
    } catch (e) {
      console.error("Failed to save cart to local storage", e);
    }
  };

  const [redirectState, setRedirectState] = useState<{
    active: boolean;
    url: string;
    countdown: number;
  } | null>(null);

  const executeRedirect = (url: string) => {
    saveCart([]);
    window.location.href = url;
  };

  useEffect(() => {
    if (!redirectState || !redirectState.active) return;
    if (redirectState.countdown <= 0) {
      executeRedirect(redirectState.url);
      return;
    }
    const timer = setTimeout(() => {
      setRedirectState((p) => p ? { ...p, countdown: p.countdown - 1 } : null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectState]);

  const handleClose = useCallback(() => setOpenProduct(null), []);

  const addToCart = (
    product: SerializedProduct,
    variant: any,
    size: string,
    color: string,
    customization: {
      printName?: string;
      college?: string;
      batch?: string;
      branch?: string;
      notes?: string;
    }
  ) => {
    const transformedTitle = transformProductTitle(product.title, selectedCampus);
    const { printName = "", college = "", batch = "", branch = "", notes = "" } = customization;
    const customizationKey = `${variant.id}-${size}-${color}-${printName}-${college}-${batch}-${branch}-${notes}`;
    const existingIndex = cart.findIndex((item) => item.id === customizationKey);
    const itemPrice = parseFloat(variant.price);
    const itemImage = product.images[0]?.url || "/placeholder.svg";

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      saveCart(updatedCart);
    } else {
      const newItem: CartItem = {
        id: customizationKey,
        productId: product.id,
        productTitle: transformedTitle,
        variantId: variant.id,
        variantTitle: variant.title,
        price: itemPrice,
        imageUrl: itemImage,
        quantity: 1,
        customization: {
          size,
          color,
          printName,
          college,
          batch,
          branch,
          notes,
        },
      };
      saveCart([...cart, newItem]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === id) {
          const nextQty = item.quantity + delta;
          return { ...item, quantity: nextQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    saveCart(updatedCart);
  };

  const removeItem = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    saveCart(updatedCart);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  // Helper to extract numeric variant ID from Shopify GID
  const getNumericVariantId = (id: string): string => {
    let decoded = id;
    if (!id.startsWith("gid://")) {
      try {
        decoded = atob(id);
      } catch {
        // Fallback if not Base64
      }
    }
    const match = decoded.match(/\/ProductVariant\/(\d+)/);
    return match ? match[1] : decoded;
  };

  // Redirect to ksverse.in/cart with items and clear cart first
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutError("");

    const trimmedEmail = buyerEmail.trim();
    if (!trimmedEmail) {
      setEmailError("Student email is required to proceed.");
      setCheckoutLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      setCheckoutLoading(false);
      return;
    }

    const domain = trimmedEmail.split("@")[1]?.toLowerCase();
    const isIIIT = isIIITEmail(trimmedEmail);
    const isGenericStudent = domain && (domain.endsWith(".edu") || domain.endsWith(".edu.in") || domain.endsWith(".ac.in") || domain.includes("student"));

    if (!isIIIT && !isGenericStudent) {
      setEmailError("Restricted to student email domains only (IIIT domains, .edu, .edu.in, .ac.in).");
      setCheckoutLoading(false);
      return;
    }

    setEmailError("");

    try {
      const addParams = new URLSearchParams();

      // Common cart Attributes & Notes logic (saved to three places simultaneously)
      let concatenatedNote = "";
      const attributesObj: Record<string, string> = {};

      cart.forEach((item, index) => {
        const itemNumStr = cart.length > 1 ? `_${index + 1}` : "";
        const prefix = cart.length > 1 ? `[Item ${index + 1}: ${item.productTitle}] ` : "";
        const custom = item.customization;

        // Attributes (Backups)
        if (custom.printName) {
          attributesObj[`Print_Name_Backup${itemNumStr}`] = custom.printName;
        }
        if (custom.college) {
          attributesObj[`College_Backup${itemNumStr}`] = custom.college;
        }
        if (custom.batch) {
          attributesObj[`Batch_Backup${itemNumStr}`] = custom.batch;
        }
        if (custom.branch) {
          attributesObj[`Branch_Backup${itemNumStr}`] = custom.branch;
        }

        // Cart Note
        let itemNoteParts = [];
        if (custom.printName) {
          itemNoteParts.push(`Print Name: ${custom.printName}`);
        }
        if (custom.branch) {
          itemNoteParts.push(`Branch: ${custom.branch}`);
        }
        if (custom.batch) {
          itemNoteParts.push(`Batch: ${custom.batch}`);
        }
        if (custom.college) {
          itemNoteParts.push(`College: ${custom.college}`);
        }
        if (custom.notes) {
          itemNoteParts.push(`Special Instructions: ${custom.notes}`);
        }

        if (itemNoteParts.length > 0) {
          concatenatedNote += `${prefix}Custom Order: ${itemNoteParts.join(" | ")} | \n`;
        }
      });

      if (cart.length === 1) {
        const item = cart[0];
        const numId = getNumericVariantId(item.variantId);
        addParams.set("id", numId);
        addParams.set("quantity", String(item.quantity));
        
        // Add customization properties
        const custom = item.customization;
        if (custom.size) {
          addParams.set("properties[Size]", custom.size);
        }
        if (custom.color) {
          addParams.set("properties[Color]", custom.color);
        }
        if (custom.printName) {
          addParams.set("properties[Print Name]", custom.printName);
        }
        if (custom.college) {
          addParams.set("properties[College]", custom.college);
        } else {
          addParams.set("properties[College]", selectedCampus);
        }
        if (custom.branch) {
          addParams.set("properties[Branch]", custom.branch);
        }
        if (custom.batch) {
          addParams.set("properties[Batch]", custom.batch);
        }
      } else {
        // Multiple items
        cart.forEach((item) => {
          const numId = getNumericVariantId(item.variantId);
          addParams.append("id[]", numId);
          addParams.append("quantity[]", String(item.quantity));
        });
        
        // Apply properties to first item / fallback
        const firstItem = cart[0];
        const custom = firstItem.customization;
        if (custom.size) {
          addParams.set("properties[Size]", custom.size);
        }
        if (custom.color) {
          addParams.set("properties[Color]", custom.color);
        }
        if (custom.printName) {
          addParams.set("properties[Print Name]", custom.printName);
        }
        if (custom.college) {
          addParams.set("properties[College]", custom.college);
        } else {
          addParams.set("properties[College]", selectedCampus);
        }
        if (custom.branch) {
          addParams.set("properties[Branch]", custom.branch);
        }
        if (custom.batch) {
          addParams.set("properties[Batch]", custom.batch);
        }
      }

      if (concatenatedNote) {
        addParams.set("note", concatenatedNote.trim());
      }
      Object.entries(attributesObj).forEach(([key, val]) => {
        addParams.set(`attributes[${key}]`, val);
      });

      addParams.set("return_to", "/cart");
      addParams.set("checkout[email]", trimmedEmail);

      const redirectUrl = `https://ksverse.in/cart/clear?return_to=${encodeURIComponent(`/cart/add?${addParams.toString()}`)}`;

      setRedirectState({
        active: true,
        url: redirectUrl,
        countdown: 4,
      });
    } catch (err: any) {
      console.error("Cart redirection error:", err);
      setCheckoutError("Failed to proceed to checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Filter and Sort logic
  const filteredAndSorted = useMemo(() => {
    // 1. Filter by selected campus. We show:
    // - Products specifically tagged with the selected campus (e.g. "IIIT Pune")
    // - AND products that are generic custom/department drops (isCustomDrop === true)
    const targetTag = getShopifyTagForCampus(selectedCampus);
    let list = products.filter((p) => {
      const matchCampus = p.campuses.includes(targetTag) || p.isCustomDrop;
      if (!matchCampus) return false;

      if (activeType !== "All" && p.type !== activeType) return false;

      if (
        searchQuery &&
        !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    // 2. Transform titles and descriptions of products for display
    let transformedList = list.map((p) => {
      const tTitle = transformProductTitle(p.title, selectedCampus);
      const tDesc = generateDescription(tTitle, selectedCampus);
      return {
        ...p,
        title: tTitle,
        description: tDesc,
      };
    });

    // 3. Sort options
    switch (sortBy) {
      case "price-asc":
        transformedList.sort((a, b) => parseRupees(a.minPrice) - parseRupees(b.minPrice));
        break;
      case "price-desc":
        transformedList.sort((a, b) => parseRupees(b.minPrice) - parseRupees(a.minPrice));
        break;
      case "rating":
        transformedList.sort((a, b) => b.reviewRating - a.reviewRating || b.reviewCount - a.reviewCount);
        break;
      case "az":
        transformedList.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Sort custom drops last, main collection drops first
        transformedList.sort((a, b) => Number(a.isCustomDrop) - Number(b.isCustomDrop));
    }

    return transformedList;
  }, [products, selectedCampus, activeType, searchQuery, sortBy]);

  const handleClubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClubFormSuccess(true);
    setTimeout(() => {
      setShowClubModal(false);
      setClubFormSuccess(false);
      setClubForm({ name: "", email: "", college: "", club: "", quantity: "50", details: "" });
    }, 3500);
  };

  if (error) {
    return (
      <div
        className={`relative min-h-screen pb-16 pt-24 sm:pb-20 sm:pt-28 ${
          isDarkMode
            ? "bg-[linear-gradient(180deg,_#090d16_0%,_#0d1424_40%,_#0a0a0a_100%)] text-slate-100"
            : "bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] text-slate-900"
        }`}
      >
        <div className="mx-auto max-w-2xl px-4 text-center pt-12">
          <Sparkles className={`mx-auto h-8 w-8 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          <h1 className={`mt-4 text-3xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Merchandise
          </h1>
          <p className={`mt-3 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            We&apos;re having trouble loading products right now. Browse the full collection directly.
          </p>
          <a
            href="https://ksverse.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Browse Collection
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {openProduct && (
        <ProductModal
          product={openProduct}
          selectedCampus={selectedCampus}
          onClose={handleClose}
          isDarkMode={isDarkMode}
          addToCart={addToCart}
        />
      )}

      <div
        className={`relative min-h-screen pb-12 pt-24 transition-colors duration-300 sm:pb-16 sm:pt-20 ${
          isDarkMode
            ? "bg-[linear-gradient(180deg,_#090d16_0%,_#0d1424_40%,_#0a0a0a_100%)] text-slate-100"
            : "bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] text-slate-900"
        }`}
      >
        {/* Radial Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%)]" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1
              className={`mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Represent Your IIIT.
            </h1>
            <p
              className={`mt-2.5 max-w-xl text-xs leading-relaxed sm:text-sm ${
                isDarkMode ? "text-slate-400" : "text-slate-650 font-semibold"
              }`}
            >
              Premium hoodies, polo tees, and oversized tees — customisable for every IIIT campus. Pick your design, add your name, and rep your college.
            </p>
          </div>

          {/* ─── Unified Search + Filter + Cart Toolbar ─── */}
          <div className="mb-6 flex items-center gap-2 sm:gap-3">
            {/* Search bar */}
            <div className={`flex flex-1 items-center gap-2 border px-3 sm:px-4 py-2.5 rounded-2xl transition-colors duration-300 ${
              isDarkMode
                ? "border-slate-800 bg-[#0d1424]"
                : "border-slate-200 bg-white shadow-sm"
            }`}>
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IIIT merchandise..."
                className="w-full bg-transparent text-xs sm:text-sm font-semibold outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 transition">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`relative flex h-10 w-10 sm:h-11 sm:w-auto sm:px-4 shrink-0 items-center justify-center gap-2 rounded-2xl border transition-all duration-200 ${
                isFilterOpen
                  ? isDarkMode
                    ? "border-indigo-500/50 bg-indigo-950/40 text-indigo-400"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : isDarkMode
                    ? "border-slate-800 bg-[#0d1424] text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800 shadow-sm"
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline text-xs font-bold">Filters</span>
              {(selectedCampus !== "All" || sortBy !== "default" || activeType !== "All") && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-black text-white">
                  {[selectedCampus !== "All", sortBy !== "default", activeType !== "All"].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 sm:h-11 sm:w-auto sm:px-5 shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline text-xs font-extrabold">Cart</span>
              {cart.reduce((a, item) => a + item.quantity, 0) > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                  {cart.reduce((a, item) => a + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* ─── Filter Dropdown Panel ─── */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className={`mb-6 rounded-2xl border p-4 sm:p-5 space-y-5 transition-colors duration-300 ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/40"
                    : "border-slate-200 bg-white shadow-sm"
                }`}>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* College filter */}
                    <div className="flex-1 space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        College
                      </label>
                      <div className="flex items-center gap-2">
                        {activeCampusObj?.logo && (
                          <div className="relative h-7 w-7 flex items-center justify-center bg-white rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
                            <img
                              key={selectedCampus}
                              src={activeCampusObj.logo}
                              alt={`${selectedCampus} logo`}
                              className="h-full w-full object-contain"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const favicon = getWebsiteFavicon(activeCampusObj.website);
                                if (favicon && e.currentTarget.src !== favicon) {
                                  e.currentTarget.src = favicon;
                                } else {
                                  e.currentTarget.style.display = "none";
                                }
                              }}
                            />
                          </div>
                        )}
                        <select
                          value={selectedCampus}
                          onChange={(e) => setSelectedCampus(e.target.value)}
                          className={`w-full rounded-xl border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition cursor-pointer ${
                            isDarkMode
                              ? "bg-[#0d1424] border-slate-800 text-indigo-400"
                              : "bg-slate-50 border-slate-200 text-indigo-700"
                          }`}
                        >
                          <option value="All">All Campuses</option>
                          {sortedCampuses.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Sort filter */}
                    <div className="flex-1 space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortKey)}
                        className={`w-full rounded-xl border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition cursor-pointer ${
                          isDarkMode
                            ? "bg-[#0d1424] border-slate-800 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <option value="default">Featured</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                        <option value="az">A → Z</option>
                      </select>
                    </div>
                  </div>

                  {/* Category pills */}
                  {productTypes.length > 1 && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Category
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["All", ...productTypes].map((type) => (
                          <button
                            key={type}
                            onClick={() => setActiveType(type)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                              activeType === type
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                : isDarkMode
                                  ? "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 shadow-sm"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset & close row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedCampus("All");
                        setSortBy("default");
                        setActiveType("All");
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          
          
          {/* Results count info */}
          <p className={`mb-4 text-xs font-semibold ${isDarkMode ? "text-slate-550" : "text-slate-450"}`}>
            {filteredAndSorted.length} product{filteredAndSorted.length !== 1 ? "s" : ""} found
          </p>

          {/* Product Grid */}
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-xl border-slate-300 dark:border-slate-800">
              <ShoppingBag size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-sm font-bold">No products found</h3>
              <p className="text-xs text-slate-400 mt-1">Try tweaking your search or browse options.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {filteredAndSorted.map((product) => {
                const price = parseRupees(product.minPrice);
                const isAvailable = product.availableForSale;

                return (
                  <div
                    key={product.id}
                    onClick={() => setOpenProduct(product)}
                    className={`group flex flex-col justify-between rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer ${
                      isDarkMode
                        ? "border-slate-850 bg-slate-900/30 text-slate-100 hover:bg-slate-900/50"
                        : "border-slate-200/60 bg-white text-slate-900 hover:border-indigo-100 hover:shadow-md shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Image Frame */}
                      <div className={`relative aspect-square w-full flex items-center justify-center overflow-hidden ${
                        isDarkMode ? "bg-slate-950/40" : "bg-slate-50"
                      }`}>
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt}
                            width={product.images[0].width}
                            height={product.images[0].height}
                            className="h-full w-full object-contain p-1.5 sm:p-2"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <span className="text-4xl opacity-20">👕</span>
                        )}

                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-slate-850">
                              Sold Out
                            </span>
                          </div>
                        )}

                        {isAvailable && (
                          <span className={`absolute bottom-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                            isDarkMode
                              ? "bg-indigo-950/60 border-indigo-900/50 text-indigo-400"
                              : "bg-indigo-50 border-indigo-100 text-indigo-700"
                          }`}>
                            Customizable
                          </span>
                        )}

                        {product.discountPercent && (
                          <span className="absolute top-3 left-3 rounded-md bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 shadow-sm">
                            {product.discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Info Details */}
                      <div className="px-3 sm:px-4 pt-3 pb-3 sm:pb-4 space-y-1.5">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2 min-h-[36px] sm:min-h-[44px]">
                          {product.title}
                        </h3>

                        {/* Stars */}
                        {product.reviewCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <StarRow rating={product.reviewRating} size={13} />
                            <span className={`text-[11px] font-semibold ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                              ({product.reviewCount})
                            </span>
                          </div>
                        )}

                        {/* Pricing row */}
                        <div className="flex items-baseline flex-wrap gap-x-2">
                          <span className="text-base sm:text-xl font-black tracking-tight text-indigo-650 dark:text-indigo-400">
                            {product.minPrice}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-[13px] text-slate-450 line-through">
                              {product.compareAtPrice}
                            </span>
                          )}
                          {product.discountPercent && (
                            <span className="text-[13px] text-emerald-600 font-extrabold">
                              {product.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 leading-none mt-1">FREE Delivery by KS Verse</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="hidden sm:block mt-5 pt-3.5 mx-3 sm:mx-4 mb-3 sm:mb-4 border-t border-slate-100 dark:border-slate-850/60">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95 shadow-sm"
                      >
                        <span>Select Size & Customize</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bulk Club Custom Orders Drop Section */}
          <section
            className={`mt-20 rounded-[2.2rem] border p-6 sm:p-10 transition-colors duration-300 ${
              isDarkMode
                ? "bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_40%),_rgba(15,23,42,0.2)] border-slate-800"
                : "bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.03),_transparent_40%),_white] border-slate-200/80 shadow-sm"
            }`}
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Bulk Communities Drop
                </span>
                <h2 className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}>
                  Custom Club & Chapters Orders
                </h2>
                <p className={`mt-3 text-sm leading-relaxed ${
                  isDarkMode ? "text-slate-400" : "text-slate-655 font-medium"
                }`}>
                  Design custom hoodies, technical tees, and community merch kits for Coding Clubs, Technical Chapters, Hackathons, Fest teams, or community batches. Includes full custom designs, batch discounts, and verified delivery.
                </p>
              </div>
              <button
                onClick={() => setShowClubModal(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white transition hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20 shrink-0"
              >
                <Users size={15} />
                <span>Request Custom Merch</span>
              </button>
            </div>
          </section>

          {/* Support / Help Section */}
          <section className="mt-12 text-center max-w-xl mx-auto py-8">
            <HelpCircle className="mx-auto h-7 w-7 text-slate-400 mb-3" />
            <h3 className="text-sm font-extrabold">Need Help with an Order?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              For shipping details, payment support, sizing queries, and refund tracking, please contact KS Verse support directly.
            </p>
            <a
              href="mailto:support@ksverse.in?subject=IIITians%20Network%20Merchandise%20Support"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline mt-3"
            >
              <span>Contact KS Verse Support</span>
              <ExternalLink size={11} />
            </a>
          </section>
        </div>
      </div>

      {/* ─── Cart Drawer Slide-over Panel ──────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" style={{ touchAction: "none", overscrollBehavior: "none" }}>
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
          />
          <div className="pointer-events-none absolute inset-0 flex max-w-full justify-end sm:items-center sm:justify-center p-0 sm:p-4">
            <div className={`pointer-events-auto w-full sm:max-w-md transform transition-all duration-300 animate-slide-in-right ${
              isDarkMode ? "bg-[#0d1424] text-white sm:border sm:border-slate-850" : "bg-white text-slate-900 sm:border sm:border-slate-200"
            } flex flex-col h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] rounded-none sm:rounded-3xl shadow-2xl`}>
              <div className="flex h-full sm:max-h-[calc(100vh-2rem)] flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 p-5">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-indigo-500" />
                    <h2 className="text-base font-extrabold">Your Shopping Cart</h2>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingBag className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <h4 className="text-sm font-bold">Your cart is empty</h4>
                      <p className="text-xs text-slate-400 mt-1">Add custom apparel to show your campus pride.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className={`flex gap-3.5 p-3 rounded-2xl border ${
                          isDarkMode ? "border-slate-900 bg-slate-900/20" : "border-slate-150 bg-slate-50/50"
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.productTitle}
                          className="h-16 w-16 rounded-xl object-contain bg-white border"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold leading-tight truncate pr-2">
                                {item.productTitle}
                              </h4>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-slate-400 hover:text-rose-500 transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-x-2 text-[9px] font-bold text-indigo-500 dark:text-indigo-400 mt-1">
                              {item.customization.size && <span>Size: {item.customization.size}</span>}
                              {item.customization.color && <span>Color: {item.customization.color}</span>}
                            </div>

                            {/* Custom Label Attributes */}
                            {(item.customization.printName || item.customization.branch || item.customization.batch || item.customization.college || item.customization.notes) && (
                              <div className="mt-1.5 space-y-0.5 border-l-2 border-indigo-500/40 pl-2 text-[9px] text-slate-500 font-semibold leading-tight">
                                {item.customization.printName && (
                                  <div>Name: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.customization.printName}</span></div>
                                )}
                                {item.customization.branch && (
                                  <div>Branch: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.customization.branch}</span></div>
                                )}
                                {item.customization.batch && (
                                  <div>Batch: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.customization.batch}</span></div>
                                )}
                                {item.customization.college && (
                                  <div>College: <span className="text-slate-700 dark:text-slate-300 font-bold">{item.customization.college}</span></div>
                                )}
                                {item.customization.notes && (
                                  <div>Notes: <span className="text-slate-750 dark:text-slate-350 font-medium italic">{item.customization.notes}</span></div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-850/40">
                            <span className="text-xs font-black text-slate-900 dark:text-blue-400">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-white">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-slate-550"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="px-2 text-xs font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-slate-550"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Subtotal and Checkout link */}
                {cart.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-200 p-5 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <span>Subtotal</span>
                        <span className="text-slate-900 dark:text-slate-900 font-black text-sm">
                          ₹{cartSubtotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>Shipping & taxes</span>
                        <span>Calculated at checkout</span>
                      </div>
                    </div>

                    {/* Email Domain Constraint Input */}
                    <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3.5 space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400">
                        Student / IIIT Email <span className="text-indigo-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@iiitranchi.ac.in"
                        value={buyerEmail}
                        onChange={(e) => {
                          setBuyerEmail(e.target.value);
                          setEmailError("");
                          setCheckoutError("");
                        }}
                        className={`w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                          emailError
                            ? "border-rose-500 focus:ring-rose-500 bg-rose-50/10"
                            : isDarkMode
                            ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                            : "bg-white border-slate-200 text-slate-950 placeholder:text-slate-400"
                        }`}
                      />
                      {emailError ? (
                        <p className="text-[10px] text-rose-500 font-bold">{emailError}</p>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-semibold leading-tight">
                          Verification is restricted to student domains (e.g. .edu, .edu.in, .ac.in).
                        </p>
                      )}
                    </div>

                    {/* Checkout Error Display */}
                    {checkoutError && (
                      <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 flex items-center gap-2.5 animate-fade-in text-rose-550 dark:text-rose-450">
                        <Info size={14} className="shrink-0 text-rose-550 dark:text-rose-400" />
                        <span className="text-[11px] font-bold">
                          {checkoutError}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-extrabold text-white transition hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {checkoutLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          <span>Generating Checkout...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>Checkout via KS Verse</span>
                          <ChevronRight size={14} />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-semibold">
                      <ShieldCheck size={11} className="text-emerald-500" />
                      <span>Official IIIT Gear | Checkout on KS Verse</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Custom Club Request Modal ─────────────────────────────────────── */}
      {showClubModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setShowClubModal(false)}
        >
          <div
            className={`relative w-full max-w-md rounded-3xl border p-6 shadow-2xl transition-colors duration-300 ${
              isDarkMode ? "bg-[#0d1424] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black tracking-tight">Request Custom Merch</h2>
              <button
                onClick={() => setShowClubModal(false)}
                className="text-slate-400 hover:text-slate-650 transition"
              >
                <X size={18} />
              </button>
            </div>

            {clubFormSuccess ? (
              <div className="text-center py-8">
                <Check className="mx-auto h-12 w-12 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-full mb-3" />
                <h3 className="text-sm font-bold">Request Submitted!</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Thanks for reaching out! We have shared your interest with KS Verse. A custom design specialist will email you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClubSubmit} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Request custom batch hoodies, technical community tees, fests jackets, or customized packages. Minimum order is 30 units.
                </p>
                
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-450">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={clubForm.name}
                    onChange={(e) => setClubForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your Name"
                    className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  />
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455">Email</label>
                    <input
                      type="email"
                      required
                      value={clubForm.email}
                      onChange={(e) => setClubForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="name@iiit.ac.in"
                      className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455">College</label>
                    <input
                      type="text"
                      required
                      value={clubForm.college}
                      onChange={(e) => setClubForm((p) => ({ ...p, college: e.target.value }))}
                      placeholder="e.g. IIIT Kota"
                      className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455">Club Name</label>
                    <input
                      type="text"
                      required
                      value={clubForm.club}
                      onChange={(e) => setClubForm((p) => ({ ...p, club: e.target.value }))}
                      placeholder="e.g. Axios Coding"
                      className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455">Est. Qty</label>
                    <input
                      type="number"
                      required
                      min={30}
                      value={clubForm.quantity}
                      onChange={(e) => setClubForm((p) => ({ ...p, quantity: e.target.value }))}
                      className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-450">Design Details & Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={clubForm.details}
                    onChange={(e) => setClubForm((p) => ({ ...p, details: e.target.value }))}
                    placeholder="Embroidered hoodie with chest logo..."
                    className={`mt-1.5 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                      isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  <SendRequestIcon />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── External Redirect Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {redirectState?.active && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-lg rounded-[2rem] border p-6 shadow-2xl overflow-hidden ${
                isDarkMode ? "bg-[#0d1424] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"
              }`}
            >
              {/* Style block for smooth progress bar and connection animations */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes growProgress {
                  from { width: 0%; }
                  to { width: 100%; }
                }
                .animate-progress-grow {
                  animation: growProgress 4s linear forwards;
                }
              `}} />

              {/* Decorative Blur Glows */}
              <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setRedirectState(null)}
                className={`absolute top-4 right-4 z-20 rounded-full p-1.5 transition ${
                  isDarkMode
                    ? "bg-slate-850 text-slate-400 hover:text-white"
                    : "bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-indigo-500 animate-pulse">
                  Secure Connection Established
                </span>
                <h3 className="text-xl font-black tracking-tight mt-1.5">
                  Redirecting to Merchandise Partner
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed font-semibold">
                  You are being securely directed to our trusted apparel partner, **KS Verse**, to fulfill your order customizations.
                </p>
              </div>

              {/* Logo Cross-over & Loading Animation */}
              <div className="relative flex items-center justify-center py-6 select-none my-4">
                {/* Glowing backdrop circle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-24 w-48 rounded-full bg-indigo-500/10 blur-xl dark:bg-indigo-500/15" />
                </div>

                <div className="relative flex items-center gap-6 z-10">
                  {/* Left Logo: IIITians Network */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`relative flex h-16 w-16 items-center justify-center rounded-2xl p-2.5 shadow-lg border transition-all ${
                      isDarkMode 
                        ? "bg-slate-900/90 border-slate-800/85 shadow-indigo-950/20" 
                        : "bg-white border-slate-200 shadow-slate-200/50"
                    }`}
                  >
                    <img
                      src="/IIITians-Network-Logo-Blue.png" 
                      alt="IIITians Network Logo" 
                      className="h-full w-full object-contain"
                    />
                    {/* Outer pulsing glow */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border border-indigo-500/40 pointer-events-none"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>

                  {/* Connection & Crossover Loader */}
                  <div className="relative flex items-center justify-center w-20">
                    {/* Animated Flowing Line Left to Right */}
                    <div className="absolute h-[2px] w-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden">
                      <motion.div
                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </div>

                    {/* Crossover "X" Badge */}
                    <motion.div
                      animate={{ 
                        rotate: [0, 180, 180, 360],
                        scale: [1, 1.15, 1.15, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        times: [0, 0.4, 0.6, 1]
                      }}
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-black uppercase tracking-wider shadow-sm select-none ${
                        isDarkMode 
                          ? "bg-slate-900 border-slate-850 text-indigo-400 shadow-slate-950" 
                          : "bg-white border-slate-200 text-indigo-600 shadow-slate-100"
                      }`}
                    >
                      ✕
                    </motion.div>
                  </div>

                  {/* Right Logo: KS Verse */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className={`relative flex h-16 w-16 items-center justify-center rounded-2xl p-2.5 shadow-lg border transition-all ${
                      isDarkMode 
                        ? "bg-slate-900/90 border-slate-800/85 shadow-indigo-950/20" 
                        : "bg-white border-slate-200 shadow-slate-200/50"
                    }`}
                  >
                    <img
                      src="https://www.google.com/s2/favicons?domain=ksverse.in&sz=128"
                      alt="KS Verse Logo"
                      className="h-full w-full object-contain rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-xs font-black rounded-md">
                      KSV
                    </div>
                    {/* Outer pulsing glow (staggered) */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border border-indigo-500/40 pointer-events-none"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Transferred Data Summary Card */}
              <div className={`rounded-2xl border p-4 text-xs space-y-2.5 leading-relaxed mb-4 ${
                isDarkMode ? "bg-slate-950/40 border-slate-850/80" : "bg-slate-50 border-slate-200/50"
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-200/40 dark:border-slate-850/40">
                  <span className="font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 text-[10px]">Data Synchronizing:</span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <BadgeCheck size={11} /> Verified
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-slate-650 dark:text-slate-350">
                  <span className="font-bold">Student Email:</span>
                  <span className="font-mono text-indigo-400 font-bold truncate max-w-[200px]">{buyerEmail}</span>
                </div>
                
                <div className="flex justify-between items-center text-slate-650 dark:text-slate-350">
                  <span className="font-bold">Target Campus:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedCampus}</span>
                </div>

                <div className="flex justify-between items-center text-slate-650 dark:text-slate-300">
                  <span className="font-bold">Cart Value:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    ₹{cartSubtotal.toLocaleString("en-IN")} ({cart.reduce((a, item) => a + item.quantity, 0)} item{cart.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              {/* Linear Progress Bar Indicator */}
              <div className="mb-6 space-y-1.5">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full animate-progress-grow" />
                </div>
              </div>

              {/* Countdown / Button Footer */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => executeRedirect(redirectState.url)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-extrabold text-white transition hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  <span>Proceed to KS Verse</span>
                  <ChevronRight size={14} />
                </button>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-450 tracking-wide">
                    Redirecting automatically in <span className="text-indigo-400 font-black">{redirectState.countdown}s</span>...
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SendRequestIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.782 7.165a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm-.707-1.122L1.583 6.945l11.547-4.62-7.201 7.201-.001.022Z" />
    </svg>
  );
}
