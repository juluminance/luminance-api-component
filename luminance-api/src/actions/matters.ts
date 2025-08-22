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
      comments: "Request body as JSON objects",
    }),
  },
});

const AddMatterInfo = action({
  display: {
    label: "Add Matter Info",
    description: "Add Matter Info on an existing matter",
  },
  perform: async (context, { connection, projectId, matterId, body }) => {
    const client = createClient(connection);
    const { data } = await client.post(`/projects/${projectId}/matters/${matterId}/annotations`, body);
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
    body: input({
      label: "body",
      type: "jsonForm",
      required: true,
      comments: "Request body as JSON objects",
    }),
  },
});

const uploadToMatter = action({
  display: {
    label: "Upload a file to a matter",
    description: "Upload a file to a matter",
  },
  perform: async (context, { connection, projectId, folderId, matterId, name, body }) => {
    const client = createClient(connection);
    const { data } = await client.post(`/projects/${projectId}/folders/${folderId}/upload?matter_id=${matterId}&name=${name}&replace=true`, body, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });
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
    folderId: input({
      label: "Folder Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Folder ID",
    }),
    matterId: input({
      label: "Matter Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Matter ID",
    }),
    name: input({
      label: "Name",
      type: "string",
      required: true,
      clean: (value): string => util.types.toString(value),
      comments: "Name of the file to upload",
    }),
    body: input({
      label: "File",
      type: "string",
      required: true,
      clean: (value): string => util.types.toString(value),
      comments: "Base64 encoded file content",
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
  uploadToMatter,
  AddMatterInfo
};
