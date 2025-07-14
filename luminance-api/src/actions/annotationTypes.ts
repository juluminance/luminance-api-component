import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getAnnotationTypes = action({
  display: {
    label: "Get Annotation Types",
    description: "Get Annotation Types",
  },
  perform: async (context, { connection, limit }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/annotation_types`, {
      params: { limit },
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
  },
});

const getAnnotationTypesAnnotationTypeId = action({
  display: {
    label: "Get Annotation Types Annotation Type Id",
    description: "Get information on a specific Annotation Type ID",
  },
  perform: async (context, { connection, annotationTypeId }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/annotation_types/${annotationTypeId}`);
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    annotationTypeId: input({
      label: "Annotation Type Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Annotation Type ID",
    }),
  },
});

export default {
  getAnnotationTypes,
  getAnnotationTypesAnnotationTypeId,
};
