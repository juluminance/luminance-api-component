import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getUsers = action({
  display: {
    label: "Get Users",
    description: "Get Users Collection",
  },
  perform: async (
    context,
    {
      connection,
      id,
      limit,
      createdAt,
      createdBy,
      username,
      accountId,
      state,
      multiFactorAuthEnabled,
    }
  ) => {
    const client = createClient(connection);
    const { data } = await client.get(`/users`, {
      params: {
        id,
        limit,
        created_at: createdAt,
        created_by: createdBy,
        username,
        account_id: accountId,
        state,
        multi_factor_auth_enabled: multiFactorAuthEnabled,
      },
    });
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    id: input({
      label: "Id",
      type: "string",
      required: false,
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "Unique User ID",
    }),
    limit: input({
      label: "Limit",
      type: "string",
      required: false,
      default: "50",
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "Maximum number of objects that can be retrieved",
    }),
    createdAt: input({
      label: "Created At",
      type: "string",
      required: false,
      clean: (value): string | undefined =>
        value !== undefined && value !== null
          ? util.types.toString(value)
          : undefined,
      comments: "Time of Creation",
    }),
    createdBy: input({
      label: "Created By",
      type: "string",
      required: false,
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "User ID of Creator",
    }),
    username: input({
      label: "Username",
      type: "string",
      required: false,
      clean: (value): string | undefined =>
        value !== undefined && value !== null
          ? util.types.toString(value)
          : undefined,
      comments: "Username used in login credentials",
    }),
    accountId: input({
      label: "Account Id",
      type: "string",
      required: false,
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "ID of Associated Account this User is Added to",
    }),
    state: input({
      label: "State",
      type: "string",
      required: false,
      default: "active",
      model: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      clean: (value): string | undefined =>
        value !== undefined && value !== null
          ? util.types.toString(value)
          : undefined,
      comments: "Current State of User",
    }),
    multiFactorAuthEnabled: input({
      label: "Multi Factor Auth Enabled",
      type: "boolean",
      required: true,
      clean: (value): boolean => util.types.toBool(value),
      comments: "If true MFA is Enabled for this User",
    }),
  },
});

const getUsersUserId = action({
  display: {
    label: "Get a User",
    description: "Get a specific user",
  },
  perform: async (context, { connection, userId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/users/${userId}`);
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    userId: input({
      label: "User Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "User ID",
    }),
  },
});

export default {
  getUsers,
  getUsersUserId,
};
