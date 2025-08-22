import type { Connection } from "@prismatic-io/spectral";

export interface GetValues {
  /**
   * Connection
   *
   */
  connection: Connection;
}

/**
 * Get System Data
 *
 * @description Get System Data
 */
export const get = {
  key: "get",
  perform: <TReturn>(_values: GetValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
  },
} as const;
