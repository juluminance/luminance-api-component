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
      { key: "1", label: "Project A" },
      { key: "2", label: "Project B" },
    ],
  },
});

export default { selectProject };


