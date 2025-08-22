import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getAnnotationTypes = action({
  display: {
    label: "Get All Matter Tags",
    description: "Get All Matter Tags",
  },
  perform: async (context, { connection, limit }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/annotation_types`, {
      params: { limit },
    });
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
      clean: (value): number | string | undefined => {
        if (value === null || value === "null") {
          return "null";
        }
        if (value !== undefined) {
          return util.types.toNumber(value);
        }
        return undefined;
      },
      comments: "Maximum number of matter tags that can be retrieved. Use 'null' to get all results.",
    }),
  },
});

export default {
  getAnnotationTypes,
};
