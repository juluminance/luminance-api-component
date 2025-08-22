import type { JSONForm } from "@prismatic-io/spectral";

export interface CreateLuminanceMatterTagPayloadValues {
  /**
   * Tags
   * Array of tag\/type objects (e.g., results from 'Filter Tags'). Must include 'id' and 'type' fields.
   *
   */
  tags: JSONForm;
  /**
   * Mapped Annotations
   * Output from 'Map data between Salesforce and Luminance' (contains required_matter_annotations).
   *
   */
  mappingResults: JSONForm;
  /**
   * Default Currency
   * Currency to apply to money types when missing.
   *
   * @default USD
   */
  defaultCurrency?: string;
}

/**
 * Create Luminance Matter Tag Payload
 *
 * @description Merge mapped annotations with tag types and coerce values to Luminance formats
 */
export const createLuminanceMatterTagPayload = {
  key: "createLuminanceMatterTagPayload",
  perform: <TReturn>(
    _values: CreateLuminanceMatterTagPayloadValues
  ): Promise<TReturn> => Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    tags: {
      inputType: "jsonForm",
      collection: undefined,
      default: undefined,
      required: true,
    },
    mappingResults: {
      inputType: "jsonForm",
      collection: undefined,
      default: undefined,
      required: true,
    },
    defaultCurrency: {
      inputType: "string",
      collection: undefined,
      default: `USD`,
    },
  },
} as const;
