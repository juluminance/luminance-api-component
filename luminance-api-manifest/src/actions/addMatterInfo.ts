import type { Connection, JSONForm } from "@prismatic-io/spectral";

export interface AddMatterInfoValues {
  /**
   * Connection
   *
   */
  connection: Connection;
  /**
   * Division Id
   * Project ID.
   *
   */
  projectId: string;
  /**
   * Matter Id
   * Matter ID.
   *
   */
  matterId: string;
  /**
   * body
   * Request body as JSON objects.
   *
   */
  body: JSONForm;
}

/**
 * Add Matter Info to an existing Matter
 *
 * @description Add Matter Info to an existing matter
 */
export const addMatterInfo = {
  key: "AddMatterInfo",
  perform: <TReturn>(_values: AddMatterInfoValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    projectId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    matterId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    body: {
      inputType: "jsonForm",
      collection: undefined,
      default: undefined,
      required: true,
    },
  },
} as const;
