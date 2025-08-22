import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const createMatter = action({
  display: {
    label: "Create a New Matter",
    description: "Create a new matter in a Division",
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
      label: "Division Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Division ID",
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
    label: "Add Matter Info to an existing Matter",
    description: "Add Matter Info to an existing matter",
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
      label: "Division Id",
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
    label: "Upload a file to an existing matter",
    description: "Upload a file to an existing matter",
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
      label: "Division Id",
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

export default {
  createMatter,
  uploadToMatter,
  AddMatterInfo
};
