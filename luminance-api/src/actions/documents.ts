import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getDocuments = action({
  display: {
    label: "Get Documents for Project",
    description: "Get Documents for a specific project",
  },
  perform: async (context, { connection, projectId, limit, taskId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/projects/${projectId}/documents`, {
      params: { limit, task_id: taskId },
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
    taskId: input({
      label: "Task Id",
      type: "string",
      required: false,
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "Filter by task ID",
    }),
  },
});

const getDocumentsDocumentId = action({
  display: {
    label: "Get Document by ID",
    description: "Get a specific document in a project",
  },
  perform: async (context, { connection, projectId, documentId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/projects/${projectId}/documents/${documentId}`);
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
    documentId: input({
      label: "Document Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Document ID",
    }),
  },
});

export default {
  getDocuments,
  getDocumentsDocumentId,
};
