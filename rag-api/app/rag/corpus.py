from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Document:
    id: str
    title: str
    url: str | None
    text: str
    tags: tuple[str, ...] = ()
    source_type: str = "internal_demo_pack"


def load_demo_corpus() -> list[Document]:
    """
    Demo corpus (static knowledge pack).

    Notes:
    - Keep short, high-signal excerpts so retrieval + citations are easy to demo.
    - URLs are provided for user verification (do not treat as authoritative in-code).
    """

    return [
        Document(
            id="sg-sfa-importer-registration",
            title="SFA food importer registration & regulated food imports – overview",
            url="https://www.sfa.gov.sg/",
            text=(
                "For packaged/processed food imports into Singapore, confirm whether the importer "
                "must register and what food categories are regulated. Plan for product documentation "
                "(ingredient composition, manufacturer details, certificates, shelf-life), traceability, "
                "and potential requirements for controlled food items."
            ),
            tags=("singapore", "sfa", "import", "importer_registration", "processed_food", "packaged_food"),
        ),
        Document(
            id="sg-import-licensing",
            title="Processed food import: customs clearance + importer-of-record checkpoints",
            url="https://www.customs.gov.sg/",
            text=(
                "For importing packaged foods, validate HS classification, duties/taxes treatment, "
                "import permits (as applicable), and who is the importer-of-record. Maintain supplier "
                "specifications, batch traceability, and a recall-ready paper trail to reduce border delays."
            ),
            tags=("singapore", "import", "packaged_food", "labeling", "customs"),
        ),
        Document(
            id="sg-food-labelling",
            title="Food labelling essentials: ingredients, allergens, country of origin, and storage",
            url="https://www.sfa.gov.sg/",
            text=(
                "Packaged food labels commonly need a name/description, ingredients list (descending order), "
                "allergen declaration, net quantity, manufacturer/importer details, storage instructions, "
                "and country of origin where required. Ensure bilingual packaging does not create inconsistencies "
                "and keep label proofs version-controlled."
            ),
            tags=("singapore", "labeling", "ingredients", "allergens", "country_of_origin", "packaged_food"),
        ),
        Document(
            id="sg-nutrition-health-claims",
            title="Nutrition and health claims: substantiation and ad/label safety",
            url="https://www.sfa.gov.sg/",
            text=(
                "Avoid unsubstantiated nutrition/health claims on labels and ads (e.g., 'boosts immunity', "
                "'fat-burning'). If you make nutrition claims (e.g., 'low sodium'), ensure you can substantiate "
                "with lab testing and compliant definitions. Align TikTok ad copy with label-safe claims."
            ),
            tags=("singapore", "nutrition", "health_claims", "advertising", "compliance"),
            source_type="industry",
        ),
        Document(
            id="sg-gst-basics",
            title="GST in Singapore – basics and registration considerations",
            url="https://www.iras.gov.sg/",
            text=(
                "Singapore’s GST regime may require registration once taxable turnover exceeds "
                "thresholds, and businesses must issue tax invoices, keep proper records, and "
                "file periodic returns. For cross-border and e-commerce, confirm place-of-supply "
                "and invoicing treatment with an accountant."
            ),
            tags=("singapore", "tax", "gst", "accounting"),
        ),
        Document(
            id="sg-company-setup",
            title="Company incorporation and local operations setup (ACRA/CorpPass) – checklist",
            url="https://www.acra.gov.sg/",
            text=(
                "Typical setup includes deciding entity type, incorporation, appointing key "
                "officers, opening bank accounts, and setting up CorpPass for government filings. "
                "Define signing authority, bookkeeping policies, and a compliance calendar."
            ),
            tags=("singapore", "incorporation", "acra", "corp_pass", "operations"),
        ),
        # De-emphasized for packaged-food import demo; keep for completeness.
        Document(
            id="sg-employment",
            title="Hiring and work passes – optional (if building a local team)",
            url="https://www.mom.gov.sg/",
            text=(
                "If you hire in Singapore (warehouse ops, sales, marketing), plan for employment contracts "
                "and payroll setup. For foreign hires, confirm work pass requirements. If you operate via a "
                "distributor/agency, clarify who is the employer-of-record."
            ),
            tags=("singapore", "hr", "employment", "work_pass", "optional"),
        ),
        Document(
            id="sg-pdpa",
            title="PDPA – handling customer data and marketing consent",
            url="https://www.pdpc.gov.sg/",
            text=(
                "Collecting customer data (e.g., loyalty programs, TikTok lead forms, delivery "
                "orders) requires attention to consent, purpose limitation, and security. "
                "Maintain a privacy notice and data retention practices."
            ),
            tags=("singapore", "pdpa", "privacy", "marketing"),
        ),
        Document(
            id="tiktok-commerce",
            title="TikTok-first launch – operating considerations",
            url="https://www.tiktok.com/business/",
            text=(
                "For TikTok-first go-to-market: plan short-form content pipeline, creator "
                "collaborations, moderation/brand safety, and measurement (pixel/events). "
                "Ensure claims in ads are supportable, and align offers with fulfillment capacity."
            ),
            tags=("tiktok", "social_commerce", "marketing", "ads"),
            source_type="industry",
        ),
        Document(
            id="sg-fnb-localization",
            title="Singapore packaged-food localization heuristics (chili sauce/condiments)",
            url=None,
            text=(
                "For bottled chili sauce, localize by clarifying spice level on-pack, offering a "
                "smaller trial size, and optimizing for TikTok-friendly usage occasions (noodles, "
                "hotpot, toast). Ensure English label clarity, and test pricing against local "
                "alternatives. Validate demand via a 2-week TikTok-first sampling + promo cycle."
            ),
            tags=("singapore", "cpg", "packaged_food", "localization", "chili_sauce", "pricing"),
            source_type="internal_demo_pack",
        ),
    ]
