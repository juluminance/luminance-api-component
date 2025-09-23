import { type Element, dataSource, input, util } from "@prismatic-io/spectral";
import { createClient } from "./client";
import { createPrismaticClient } from "./prismatic/client";
import salesforceFieldMapper from "./dataSources/salesforceFieldMapper";
import hubspotFieldMapper from "./dataSources/hubspotFieldMapper";

interface Project {
  id: number | string;
  name: string;
}

interface PrismaticInstanceOption {
  id: string;
  name: string;
}

export const selectProject = dataSource({
  display: {
    label: "Select Division",
    description: "Fetch Luminance divisions and present them as a dropdown",
  },
  dataSourceType: "picklist",
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
  },
  perform: async (context, { connection }) => {
    const client = createClient(connection);
    const { data } = await client.get<Project[]>(`/projects`);
    const options: Element[] = (data || []).map((item) => ({
      key: util.types.toString(item.id),
      label: util.types.toString(item.name),
    }));
    return { result: options };
  },
  examplePayload: {
    result: [
      { key: "1", label: "Division A" },
      { key: "2", label: "Division B" },
    ],
  },
});

export const selectFolder = dataSource({
  display: {
    label: "Select Folder",
    description: "Fetch Luminance folders (by division) and present them as a dropdown",
  },
  dataSourceType: "picklist",
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    divisionId: input({
      label: "Division Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
    }),
  },
  perform: async (context, { connection, divisionId }) => {
    const client = createClient(connection);
    const { data } = await client.get<Project[]>(`/projects/${divisionId}/folders`);
    const options: Element[] = (data || []).map((item) => ({
      key: util.types.toString(item.id),
      label: util.types.toString(item.name),
    }));
    return { result: options };
  },
  examplePayload: {
    result: [
      { key: "10", label: "Folder X" },
      { key: "11", label: "Folder Y" },
    ],
  },
});

export const selectWorkflow = dataSource({
  display: {
    label: "Select Workflow",
    description: "Fetch Luminance workflows (by division) and present them as a dropdown",
  },
  dataSourceType: "picklist",
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    divisionId: input({
      label: "Division Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
    }),
  },
  perform: async (context, { connection, divisionId }) => {
    const client = createClient(connection);
    const { data } = await client.get<Project[]>(`/projects/${divisionId}/workflows`);
    const options: Element[] = (data || []).map((item) => ({
      key: util.types.toString(item.id),
      label: util.types.toString(item.name),
    }));
    return { result: options };
  },
  examplePayload: {
    result: [
      { key: "20", label: "Workflow A" },
      { key: "21", label: "Workflow B" },
    ],
  },
});

export const selectPrismaticInstance = dataSource({
  display: {
    label: "Select Another Instance",
    description: "List instances as a dropdown",
  },
  dataSourceType: "picklist",
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    customerId: input({
      label: "Customer ID (optional)",
      type: "string",
      required: false,
    }),
    apiBaseUrl: input({
      label: "API Base URL (override)",
      type: "string",
      required: false,
      comments: "Optional. Set if connection lacks apiBaseUrl and invokeUrl is unavailable.",
    }),
    authRefreshPath: input({
      label: "Auth Refresh Path (override)",
      type: "string",
      required: false,
      comments: "Optional. Defaults to /auth/refresh",
    }),
  },
  perform: async (context, { connection, customerId, apiBaseUrl, authRefreshPath }) => {
    const connectionOverride = {
      ...(connection as any),
      fields: {
        ...((connection as any)?.fields || {}),
        ...(apiBaseUrl ? { apiBaseUrl } : {}),
        ...(authRefreshPath ? { authRefreshPath } : {}),
      },
    } as any;

    const client = await createPrismaticClient(connectionOverride, context as any);

    const hasCustomer = Boolean(customerId);
    const query = hasCustomer
      ? `query ListInstances($customer: ID) {\n  instances(customer: $customer) {\n    nodes { id name }\n  }\n}`
      : `query ListInstances {\n  instances {\n    nodes { id name }\n  }\n}`;

    const variables = hasCustomer ? { customer: customerId } : undefined;
    const { data } = await client.post<{ data?: { instances?: { nodes?: PrismaticInstanceOption[] } } }>(
      "/api",
      { query, variables }
    );

    const nodes: PrismaticInstanceOption[] = data?.data?.instances?.nodes || [];
    const options: Element[] = nodes.map((n) => ({ key: util.types.toString(n.id), label: util.types.toString(n.name) }));
    return { result: options };
  },
  examplePayload: {
    result: [
      { key: "inst_123", label: "Instance A" },
      { key: "inst_456", label: "Instance B" },
    ],
  },
});

export default { 
  selectProject, 
  selectFolder, 
  selectWorkflow,
  selectPrismaticInstance,
  ...salesforceFieldMapper,
  ...hubspotFieldMapper
};


