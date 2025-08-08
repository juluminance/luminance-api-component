import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getProjects = action({
  display: {
    label: "Get Projects",
    description: "Get Projects",
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
      comments: "Project ID",
    }),
  },
});

const getProjectsProjectId = action({
  display: {
    label: "PROD Get Projects Project Id",
    description: "Get a specific project",
  },
  perform: async (context, { connection, projectId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/projects/${projectId}`);
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    projectId: input({
      label: "Project Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Project ID",
    }),
  },
});

export default {
  getProjects,
  getProjectsProjectId,
};
