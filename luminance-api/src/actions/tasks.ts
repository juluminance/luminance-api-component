import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getTasks = action({
  display: {
    label: "Get Tasks",
    description: "Get Tasks",
  },
  perform: async (context, { connection, limit, projectId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/tasks`, {
      params: { limit, project_id: projectId },
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
  },
});

const getTasksTaskId = action({
  display: {
    label: "Get Tasks Task Id",
    description: "Get a specific task",
  },
  perform: async (context, { connection, taskId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/tasks/${taskId}`);
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    taskId: input({
      label: "Task Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Task ID",
    }),
  },
});

export default {
  getTasks,
  getTasksTaskId,
};
