import type { Connection } from "@prismatic-io/spectral";

export interface GetProjectsValues {
  /**
   * Connection
   *
   */
  connection: Connection;
  /**
   * Limit
   * Maximum number of objects that can be retrieved.
   *
   */
  limit?: string;
  /**
   * Id
   * Division ID.
   *
   */
  id?: string;
}

/**
 * Get All Divisions
 *
 * @description Get All Divisions
 */
export const getProjects = {
  key: "getProjects",
  perform: <TReturn>(_values: GetProjectsValues): Promise<TReturn> =>
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
    id: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
  },
} as const;
