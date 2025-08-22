import type { Connection } from "@prismatic-io/spectral";

export interface GetAnnotationTypesValues {
  /**
   * Connection
   *
   */
  connection: Connection;
  /**
   * Limit
   * Maximum number of matter tags that can be retrieved. Use 'null' to get all results.
   *
   */
  limit?: string;
}

/**
 * Get All Matter Tags
 *
 * @description Get All Matter Tags
 */
export const getAnnotationTypes = {
  key: "getAnnotationTypes",
  perform: <TReturn>(_values: GetAnnotationTypesValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    limit: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
  },
} as const;
