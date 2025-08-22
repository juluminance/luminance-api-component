import type { Connection, JSONForm } from "@prismatic-io/spectral";

export interface CreateMatterValues {
  /**
   * Connection
   *
   */
  connection: Connection;
  /**
   * Division Id
   * Division ID.
   *
   */
  projectId: string;
  /**
   * body
   * Request body as JSON objects.
   *
   */
  body: JSONForm;
}

/**
 * Create a New Matter
 *
 * @description Create a new matter in a Division
 */
export const createMatter = {
  key: "createMatter",
  perform: <TReturn>(_values: CreateMatterValues): Promise<TReturn> =>
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
    body: {
      inputType: "jsonForm",
      collection: undefined,
      default: undefined,
      required: true,
    },
  },
} as const;
