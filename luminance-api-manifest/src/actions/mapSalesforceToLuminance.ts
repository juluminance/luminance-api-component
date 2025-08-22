import type { Connection } from "@prismatic-io/spectral";

export interface MapSalesforceToLuminanceValues {
  /**
   * Salesforce Connection
   *
   */
  sfConnection: Connection;
  /**
   * Luminance Connection
   *
   */
  luminanceConnection: Connection;
  /**
   * Record ID
   * The ID of the Salesforce record to map (e.g., Opportunity ID, Account ID, etc.).
   *
   */
  recordId: string;
  /**
   * Object Type
   * The Salesforce object type (e.g., 'Opportunity', 'Account', 'Custom_Object__c').
   *
   */
  objectType: string;
  /**
   * Field Mappings
   * Select the field mappings data source to use for mapping fields.
   *
   */
  fieldMappings: string;
}

/**
 * Map Salesforce to Luminance
 *
 * @description Map Salesforce record fields to Luminance annotations using field mappings
 */
export const mapSalesforceToLuminance = {
  key: "mapSalesforceToLuminance",
  perform: <TReturn>(
    _values: MapSalesforceToLuminanceValues
  ): Promise<TReturn> => Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    sfConnection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    luminanceConnection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    recordId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    objectType: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    fieldMappings: {
      inputType: "data",
      collection: undefined,
      default: ``,
      required: true,
    },
  },
} as const;
