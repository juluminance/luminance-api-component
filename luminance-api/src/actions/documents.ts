import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getDocument = action({
  display: {
    label: "Get a Document",
    description: "Get a document from a division",
  },
  perform: async (context, { connection, projectId, documentId }) => {
    const client = createClient(connection);
    const { data } = await client.get(
      `/projects/${projectId}/documents/${documentId}/download`,
      {
        headers: { Accept: "application/octet-stream" },
        responseType: "arraybuffer",
      }
    );
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
  getDocument,
};
