import type { MarketEntryIntake } from "@shared/marketEntry"

export const emptyIntake: MarketEntryIntake = {
  companyName: "",
  brandName: "",
  industry: "F&B",
  originCountry: "China",
  targetMarket: "Singapore",
  cuisineType: "辣椒酱 / Chili Sauce",
  pricePositioning: "mid",
  businessModel: "hybrid",
  monthlyBudgetSgd: 30000,
  launchTimelineWeeks: 6,
  teamSize: 6,
  hasLocalEntity: false,
  notes: "",
}

export const demoIntake: MarketEntryIntake = {
  companyName: "湘辣记食品有限公司",
  brandName: "湘辣记",
  industry: "F&B",
  originCountry: "China",
  targetMarket: "Singapore",
  cuisineType: "辣椒酱 / Chili Sauce",
  pricePositioning: "mid",
  businessModel: "hybrid",
  monthlyBudgetSgd: 35000,
  launchTimelineWeeks: 8,
  teamSize: 6,
  hasLocalEntity: false,
  notes:
    "Hunan-style chili sauce brand — product line includes classic chopped chili, spicy beef sauce, and garlic chili. Plan to enter Singapore via TikTok-first strategy, starting with e-commerce (Shopee / TikTok Shop) + premium supermarket listings. Target: first product live + social media launch within 8 weeks.",
}
