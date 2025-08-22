import type { Connection } from "@prismatic-io/spectral";

export interface GetUsersUserIdValues {
  /**
   * Connection
   *
   */
  connection: Connection;
  /**
   * User Id
   * User ID.
   *
   */
  userId: string;
}

/**
 * Get Users User Id
 *
 * @description Get a specific user
 */
export const getUsersUserId = {
  key: "getUsersUserId",
  perform: <TReturn>(_values: GetUsersUserIdValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    userId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
  },
} as const;
