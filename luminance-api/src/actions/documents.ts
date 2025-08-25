import { action, input, util } from "@prismatic-io/spectral";
import { createClient, extractBaseUrlFromTokenUrl } from "../client";

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

const getDocumentInfo = action({
  display: {
    label: "Get info on a specific Document",
    description: "Get info on a specific Document",
  },
  perform: async (context, { connection, projectId, documentId }) => {
    const client = createClient(connection);
    const { data } = await client.get(
      `/projects/${projectId}/documents/${documentId}`);
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

const createDocumentLink = action({
  display: {
    label: "Create Document Link",
    description: "Build a Luminance platform document link from a document ID",
  },
  perform: async (context, { connection, documentId }) => {
    const tokenUrl = util.types.toString(connection.fields?.tokenUrl);
    if (!tokenUrl) {
      throw new Error("Token URL is required on the connection to determine subdomain");
    }
    const apiBaseUrl = extractBaseUrlFromTokenUrl(tokenUrl);
    const host = new URL(apiBaseUrl).hostname; // e.g., <sub>.app.luminance.com
    const subdomain = host.split(".")[0] || host;
    const id = encodeURIComponent(util.types.toString(documentId));
    const link = `https://${subdomain}.app.luminance.com/platform/platform-home/groups-dashboard/document/${id}`;
    return { data: link };
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
      clean: (value): number | string => util.types.toString(value),
      comments: "Document ID to link to",
    }),
  },
});

export default {
  getDocument,
  getDocumentInfo,
  createDocumentLink,
};
