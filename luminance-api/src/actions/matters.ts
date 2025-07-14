import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getMatters = action({
  display: {
    label: "Get Matters",
    description: "Get Matters",
  },
  perform: async (context, { connection, limit }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/matters`, { params: { limit } });
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    limit: input({
      label: "Limit",
      type: "string",
      required: false,
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "Maximum number of objects that can be retrieved",
    }),
  },
});

const getMattersMatterId = action({
  display: {
    label: "Get Matters Matter Id",
    description: "Get a specific matter",
  },
  perform: async (context, { connection, matterId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/matters/${matterId}`);
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    matterId: input({
      label: "Matter Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Matter ID",
    }),
  },
});

export default {
  getMatters,
  getMattersMatterId,
};
