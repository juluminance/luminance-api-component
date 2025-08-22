import type { Connection } from "@prismatic-io/spectral";

export interface GetWorkflowsValues {
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
}

/**
 * Get All Workflows
 *
 * @description Get All Workflows for a Division
 */
export const getWorkflows = {
  key: "getWorkflows",
  perform: <TReturn>(_values: GetWorkflowsValues): Promise<TReturn> =>
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
  },
} as const;
