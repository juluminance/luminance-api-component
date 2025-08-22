import type { Connection } from "@prismatic-io/spectral";

export interface Values {
  /**
   * Connection
   *
   */
  connection: Connection;
  /**
   * Division Id
   *
   */
  divisionId: string;
}

/**
 * Select Workflow
 *
 * @description Fetch Luminance workflows (by division) and present them as a dropdown
 */
export const selectWorkflow = {
  key: "selectWorkflow",
  perform: (_values: Values): Promise<void> => Promise.resolve(),
  dataSourceType: "picklist",
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    divisionId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
  },
} as const;
