import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getMatters = action({
  display: {
    label: "Get Matters for Project",
    description: "Get Matters for a specific project",
  },
  perform: async (context, { connection, projectId, limit }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/projects/${projectId}/matters`, { params: { limit } });
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

const createMatter = action({
  display: {
    label: "Create Matter",
    description: "Create a new matter in a project",
  },
  perform: async (context, { connection, projectId, body }) => {
    const client = createClient(connection);
    const { data } = await client.post(`/projects/${projectId}/matters/create`, body);
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
    body: input({
      label: "body",
      type: "jsonForm",
      required: true,
      comments: "Request body as JSON object",
    }),
  },
});

const getMattersMatterId = action({
  display: {
    label: "Get Matter by ID",
    description: "Get a specific matter in a project",
  },
  perform: async (context, { connection, projectId, matterId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/projects/${projectId}/matters/${matterId}`);
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
  createMatter,
  getMattersMatterId,
};
