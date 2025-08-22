import type { Connection } from "@prismatic-io/spectral";

export interface Values {
  /**
   * Connection
   *
   */
  connection: Connection;
}

/**
 * Select Division
 *
 * @description Fetch Luminance divisions and present them as a dropdown
 */
export const selectProject = {
  key: "selectProject",
  perform: (_values: Values): Promise<void> => Promise.resolve(),
  dataSourceType: "picklist",
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
  },
} as const;
