import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getWorkflows = action({
  display: {
    label: "Get All Workflows",
    description: "Get All Workflows for a Division",
  },
  perform: async (context, { connection, projectId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/projects/${projectId}/workflows`);
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    projectId: input({
      label: "Division Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Division ID",
    }),
  },
});

export default {
  getWorkflows,
};
