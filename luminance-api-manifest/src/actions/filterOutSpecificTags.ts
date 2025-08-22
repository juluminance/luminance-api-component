import type { JSONForm } from "@prismatic-io/spectral";

export interface FilterOutSpecificTagsValues {
  /**
   * Items
   * Array of objects to filter. Map previous step results here (e.g., results from 'Get Matters for Project').
   *
   */
  items: JSONForm;
  /**
   * Field Name
   * Field to test (default: name).
   *
   * @default name
   */
  fieldName?: string;
  /**
   * Filter(s)
   * Comma-separated substrings to match (case-insensitive). Example: sf_,client.
   *
   * @default sf_
   */
  filterString?: string;
}

/**
 * Filter Tags
 *
 * @description Filter matter tags by a case-insensitive substring match on a chosen field
 */
export const filterOutSpecificTags = {
  key: "filterOutSpecificTags",
  perform: <TReturn>(_values: FilterOutSpecificTagsValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    items: {
      inputType: "jsonForm",
      collection: undefined,
      default: undefined,
      required: true,
    },
    fieldName: {
      inputType: "string",
      collection: undefined,
      default: `name`,
    },
    filterString: {
      inputType: "string",
      collection: undefined,
      default: `sf_`,
    },
  },
} as const;
