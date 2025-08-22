import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const get = action({
  display: {
    label: "Get System Data",
    description: "Get System Data",
  },
  perform: async (context, { connection }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/`);
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
  },
});

export default {
  get,
};
