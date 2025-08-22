import { type Element, dataSource, input, util } from "@prismatic-io/spectral";
import { createClient } from "./client";

interface Project {
  id: number | string;
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

export default { selectProject, selectFolder, selectWorkflow };


