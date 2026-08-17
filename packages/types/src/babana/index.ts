import type { FulfillmentDTO, ShippingOptionDTO } from "@medusajs/types";

export const BABANA_FULFILLMENT_PROVIDER_ID = "fp_babana_babana" as const;

export type BabanaServiceCode = "standard" | "express";
export type BabanaShipmentStatus =
  | "pending"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "failed";

export interface BabanaShippingOptionData {
  service_code: BabanaServiceCode;
  country_code: "cm";
}

export interface BabanaFulfillmentData {
  provider: "babana";
  external_shipment_id?: string;
  tracking_number?: string;
  tracking_url?: string;
  status: BabanaShipmentStatus;
}

/** Medusa stays authoritative; Babana identifiers live in fulfillment data. */
export type BabanaFulfillmentDTO = Omit<FulfillmentDTO, "data"> & {
  data: BabanaFulfillmentData;
};

export type BabanaShippingOptionDTO = Omit<ShippingOptionDTO, "data"> & {
  data: BabanaShippingOptionData;
};
