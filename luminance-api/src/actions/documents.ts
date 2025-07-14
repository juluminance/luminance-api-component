import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getDocuments = action({
  display: {
    label: "Get Documents",
    description: "Get Documents",
  },
  perform: async (context, { connection, limit, projectId, taskId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/documents`, {
      params: { limit, project_id: projectId, task_id: taskId },
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
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "Maximum number of objects that can be retrieved",
    }),
    projectId: input({
      label: "Project Id",
      type: "string",
      required: false,
      clean: (value): number | undefined =>
        value !== undefined && value !== null
          ? util.types.toNumber(value)
          : undefined,
      comments: "Filter by project ID",
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
    label: "Get Documents Document Id",
    description: "Get a specific document",
  },
  perform: async (context, { connection, documentId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/documents/${documentId}`);
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
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
