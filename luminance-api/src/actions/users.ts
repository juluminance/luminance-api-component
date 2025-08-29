import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getUsers = action({
  display: {
    label: "Get User by Username",
    description: "Get a specific user by their username",
  },
  perform: async (
    context,
    {
      connection,
      username,
    }
  ) => {
    const client = createClient(connection);
    const { data } = await client.get(`/users`, {
      params: {
        username,
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
