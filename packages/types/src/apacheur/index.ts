import type { OfferDTO } from "../offer";

export const APACHEUR_OFFER_METADATA_KEY = "akamba_apacheur" as const;

export type ApacheurAuctionStatus =
  | "scheduled"
  | "open"
  | "closed"
  | "cancelled";

/**
 * Apacheur extends a Mercur offer through metadata. The offer remains the
 * source of truth for seller, variant, inventory, shipping profile and price.
 * No parallel product or offer table is required.
 */
export interface ApacheurOfferMetadata {
  schema_version: 1;
  mode: "auction";
  currency_code: "xaf";
  starts_at: string;
  ends_at: string;
  starting_amount: number;
  bid_increment: number;
  reserve_amount?: number;
  buy_now_amount?: number;
  status: ApacheurAuctionStatus;
}

export type ApacheurOfferDTO = Omit<OfferDTO, "metadata"> & {
  metadata:
    | (Record<string, unknown> & {
        [APACHEUR_OFFER_METADATA_KEY]: ApacheurOfferMetadata;
      })
    | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

export const isApacheurOfferMetadata = (
  value: unknown,
): value is ApacheurOfferMetadata => {
  if (!isRecord(value)) return false;

  const startsAt = value.starts_at;
  const endsAt = value.ends_at;
  const validStatus = ["scheduled", "open", "closed", "cancelled"].includes(
    String(value.status),
  );

  return (
    value.schema_version === 1 &&
    value.mode === "auction" &&
    value.currency_code === "xaf" &&
    isValidDate(startsAt) &&
    isValidDate(endsAt) &&
    Date.parse(endsAt) > Date.parse(startsAt) &&
    isNonNegativeInteger(value.starting_amount) &&
    isNonNegativeInteger(value.bid_increment) &&
    value.bid_increment > 0 &&
    (value.reserve_amount === undefined ||
      isNonNegativeInteger(value.reserve_amount)) &&
    (value.buy_now_amount === undefined ||
      isNonNegativeInteger(value.buy_now_amount)) &&
    validStatus
  );
};

export const getApacheurOfferMetadata = (
  metadata: Record<string, unknown> | null | undefined,
) => {
  const value = metadata?.[APACHEUR_OFFER_METADATA_KEY];
  return isApacheurOfferMetadata(value) ? value : null;
};

export const withApacheurOfferMetadata = (
  metadata: Record<string, unknown> | null | undefined,
  apacheur: ApacheurOfferMetadata,
): Record<string, unknown> => {
  if (!isApacheurOfferMetadata(apacheur)) {
    throw new Error("Invalid Apacheur offer metadata");
  }

  return {
    ...(metadata || {}),
    [APACHEUR_OFFER_METADATA_KEY]: apacheur,
  };
};
