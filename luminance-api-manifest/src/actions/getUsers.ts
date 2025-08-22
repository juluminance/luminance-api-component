import type { Connection } from "@prismatic-io/spectral";

export interface GetUsersValues {
  /**
   * Connection
   *
   */
  connection: Connection;
  /**
   * Id
   * Unique User ID.
   *
   */
  id?: string;
  /**
   * Limit
   * Maximum number of objects that can be retrieved.
   *
   * @default 50
   */
  limit?: string;
  /**
   * Created At
   * Time of Creation.
   *
   */
  createdAt?: string;
  /**
   * Created By
   * User ID of Creator.
   *
   */
  createdBy?: string;
  /**
   * Username
   * Username used in login credentials.
   *
   */
  username?: string;
  /**
   * Account Id
   * ID of Associated Account this User is Added to.
   *
   */
  accountId?: string;
  /**
   * State
   * Current State of User.
   *
   * @default active
   */
  state?: `active` | `inactive`;
  /**
   * Multi Factor Auth Enabled
   * If true MFA is Enabled for this User.
   *
   * @default false
   */
  multiFactorAuthEnabled?: boolean;
}

/**
 * Get Users
 *
 * @description Get Users Collection
 */
export const getUsers = {
  key: "getUsers",
  perform: <TReturn>(_values: GetUsersValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    id: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    limit: {
      inputType: "string",
      collection: undefined,
      default: `50`,
    },
    createdAt: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    createdBy: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    username: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    accountId: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    state: {
      inputType: "string",
      collection: undefined,
      default: `active`,
    },
    multiFactorAuthEnabled: {
      inputType: "boolean",
      collection: undefined,
      default: `false`,
    },
  },
} as const;
