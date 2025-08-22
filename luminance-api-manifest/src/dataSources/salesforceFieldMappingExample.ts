import type { Connection } from "@prismatic-io/spectral";

export interface Values {
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
   * Salesforce Objects
   * Enter comma-separated object names (e.g., 'Account', 'Account, Opportunity', 'Custom_Object__c').
   *
   */
  salesforceObjects: string;
}

/**
 * Salesforce &lt;&gt; Luminance Matters Tag Mapper
 *
 * @description Map fields from a Salesforce 'Opportunity' to Luminance Matters Tags
 */
export const salesforceFieldMappingExample = {
  key: "salesforceFieldMappingExample",
  perform: (_values: Values): Promise<void> => Promise.resolve(),
  dataSourceType: "jsonForm",
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
    salesforceObjects: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
  },
} as const;
