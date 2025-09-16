import { action } from "@prismatic-io/spectral";
import { sendRawRequest, inputs } from "@prismatic-io/spectral/dist/clients/http";
import { extractBaseUrlFromTokenUrl, toAuthorizationHeaders } from "../client";
import system from "./system";
import users from "./users";
import annotationTypes from "./annotationTypes";
import workflows from "./workflows";
import dataProcessing, { filterOutSpecificTags, createLuminanceMatterTagPayload, createInitialMatterPayload, convertBinaryToBase64, normalizeConfigMappings, mapStatusUpdateToConfigVariables } from "./dataProcessing";
import projects from "./projects";
import documents from "./documents";
import matters from "./matters";
import salesforceMapper from "./salesforceMapper";
import hubspotMapper from "./hubspotMapper";
import webhooks from "./webhooks";

export default {
  ...system,
  ...users,
  ...annotationTypes,
  ...projects,
  ...documents,
  ...matters,
  ...workflows,
  ...dataProcessing,
  ...salesforceMapper,
  ...hubspotMapper,
  ...webhooks,
  filterOutSpecificTags,
  createLuminanceMatterTagPayload,
  createInitialMatterPayload,
  convertBinaryToBase64,
  normalizeConfigMappings,
  mapStatusUpdateToConfigVariables,
  rawRequest: action({
    display: { label: "Raw Request", description: "Issue a raw HTTP request" },
    inputs: {
      connection: { label: "Connection", type: "connection", required: true, comments: "Example: /projects" },
      ...inputs,
      url: { ...inputs.url, comments: "Example: /projects" },
    },
    perform: async (context, { connection, ...httpInputValues }) => {
      const tokenUrl = connection.fields?.tokenUrl as string | undefined;
      if (!tokenUrl) {
        throw new Error("Token URL is required on the connection to determine base URL");
      }
      const baseUrl = extractBaseUrlFromTokenUrl(tokenUrl);
      const { data } = await sendRawRequest(baseUrl, httpInputValues as any, toAuthorizationHeaders(connection));
      return { data };
    },
  }),
};

