import type {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateFulfillmentResult,
  CreateShippingOptionDTO,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  Logger,
  ValidateFulfillmentDataContext,
} from "@medusajs/framework/types";
import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils";

type InjectedDependencies = { logger: Logger };
type BabanaOptions = {
  api_url?: string;
  api_key?: string;
};

const services = ["standard", "express"] as const;

/**
 * Babana adapter boundary for Medusa Fulfillment. It intentionally performs no
 * external write until Babana's authenticated API and webhook contract are
 * confirmed. Register it only after that contract is implemented.
 */
export default class BabanaFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "babana";

  protected logger_: Logger;
  protected options_: BabanaOptions;

  constructor({ logger }: InjectedDependencies, options: BabanaOptions) {
    super();
    this.logger_ = logger;
    this.options_ = options;
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return services.map((service) => ({
      id: `babana-${service}`,
      name: `Babana ${service}`,
      service_code: service,
      country_code: "cm",
    }));
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: ValidateFulfillmentDataContext,
  ) {
    if (!(await this.validateOption(optionData))) {
      throw new Error("Invalid Babana shipping option data");
    }

    return { ...data, ...optionData, provider: "babana" };
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    return (
      data.country_code === "cm" &&
      services.includes(data.service_code as (typeof services)[number])
    );
  }

  async canCalculate(_data: CreateShippingOptionDTO): Promise<boolean> {
    return false;
  }

  async calculatePrice(
    _optionData: CalculateShippingOptionPriceDTO["optionData"],
    _data: CalculateShippingOptionPriceDTO["data"],
    _context: CalculateShippingOptionPriceDTO["context"],
  ): Promise<CalculatedShippingOptionPrice> {
    throw new Error(
      "Babana rate calculation is disabled until its external API contract is configured",
    );
  }

  async createFulfillment(
    data: Record<string, unknown>,
    _items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    _order: Partial<FulfillmentOrderDTO> | undefined,
    _fulfillment: Partial<
      Omit<FulfillmentDTO, "provider_id" | "data" | "items">
    >,
  ): Promise<CreateFulfillmentResult> {
    this.logger_.warn(
      "Babana fulfillment created without an external shipment; adapter is not registered for production use.",
    );

    return {
      data: {
        ...data,
        provider: "babana",
        status: "pending",
      },
      labels: [],
    };
  }

  async cancelFulfillment(data: Record<string, unknown>) {
    return { ...data, status: "cancelled" };
  }

  async createReturnFulfillment(
    fulfillment: Record<string, unknown>,
  ): Promise<CreateFulfillmentResult> {
    return {
      data: { ...fulfillment, provider: "babana", status: "pending" },
      labels: [],
    };
  }
}
