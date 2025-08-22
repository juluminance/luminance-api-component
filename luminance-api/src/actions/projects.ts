import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getProjects = action({
  display: {
    label: "Get All Divisions",
    description: "Get All Divisions",
  },
  perform: async (context, { connection, limit, id }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/projects`, { params: { limit, id } });
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
    id: input({
      label: "Id",
      type: "string",
      required: false,
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "Division ID",
    }),
  },
});

export default {
  getProjects,
};
