import type { JSONForm } from "@prismatic-io/spectral";

export interface BuildAnnotationsFromMappingValues {
  /**
   * Mappings
   * Array of mapping entries from the configuration variables.
   *
   */
  mappings: JSONForm;
  /**
   * Primary Data
   * Primary source object (e.g., Opportunity).
   *
   */
  primaryData: JSONForm;
  /**
   * Secondary Data
   * Secondary source object (e.g., Account).
   *
   */
  secondaryData?: JSONForm;
  /**
   * Name Prefix
   * Optional. If set, output includes a name with this prefix and a random suffix.
   *
   */
  namePrefix?: string;
  /**
   * Default Currency
   * Default currency code used for currency mappings when unspecified.
   *
   * @default USD
   */
  defaultCurrency?: string;
}

/**
 * Map data between Salesforce and Luminance
 *
 * @description Map input data into Luminance matter tag content using the configured mapping
 */
export const buildAnnotationsFromMapping = {
  key: "buildAnnotationsFromMapping",
  perform: <TReturn>(
    _values: BuildAnnotationsFromMappingValues
  ): Promise<TReturn> => Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    mappings: {
      inputType: "jsonForm",
      collection: undefined,
      default: undefined,
      required: true,
    },
    primaryData: {
      inputType: "jsonForm",
      collection: undefined,
      default: undefined,
      required: true,
    },
    secondaryData: {
      inputType: "jsonForm",
      collection: undefined,
      default: undefined,
    },
    namePrefix: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    defaultCurrency: {
      inputType: "string",
      collection: undefined,
      default: `USD`,
    },
  },
} as const;
