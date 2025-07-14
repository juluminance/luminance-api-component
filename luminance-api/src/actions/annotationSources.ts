import { action, input, util } from "@prismatic-io/spectral";
import { createClient } from "../client";

const getAnnotationSources = action({
  display: {
    label: "Get Annotation Sources",
    description: "Get Annotation Sources",
  },
  perform: async (context, { connection, limit }) => {
    const client = createClient(connection);
    const { data } = await client.get(`/annotation_sources`, {
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

const postAnnotationSources = action({
  display: {
    label: "Post Annotation Sources",
    description: "Create a new annotation_source",
  },
  perform: async (
    context,
    { connection, annotationTypeId, value, description }
  ) => {
    const client = createClient(connection);
    const { data } = await client.post(`/annotation_sources`, {
      annotation_type_id: annotationTypeId,
      value,
      description,
    });
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
      comments: "Associated annotation type ID",
    }),
    value: input({
      label: "Value",
      type: "string",
      required: true,
      clean: (value): string => util.types.toString(value),
      comments: "The value of the annotation source",
    }),
    description: input({
      label: "Description",
      type: "string",
      required: false,
      clean: (value): string | undefined =>
        value !== undefined && value !== null
          ? util.types.toString(value)
          : undefined,
      comments: "Description of the annotation source",
    }),
  },
});

const getAnnotationSourcesAnnotationSourceId = action({
  display: {
    label: "Get Annotation Sources Annotation Source Id",
    description: "Get information on a particular annotation_source_id",
  },
  perform: async (context, { connection, annotationSourceId }) => {
    const client = createClient(connection);
    const { data } = await client.get(
      `/annotation_sources/${annotationSourceId}`
    );
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    annotationSourceId: input({
      label: "Annotation Source Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Annotation Source ID",
    }),
  },
});

const patchAnnotationSourcesAnnotationSourceId = action({
  display: {
    label: "Patch Annotation Sources Annotation Source Id",
    description: "Modify annotation_sources",
  },
  perform: async (
    context,
    { connection, annotationSourceId, value, description }
  ) => {
    const client = createClient(connection);
    const { data } = await client.patch(
      `/annotation_sources/${annotationSourceId}`,
      { value, description }
    );
    return { data };
  },
  inputs: {
    connection: input({
      label: "Connection",
      type: "connection",
      required: true,
    }),
    annotationSourceId: input({
      label: "Annotation Source Id",
      type: "string",
      required: true,
      clean: (value): number => util.types.toNumber(value),
      comments: "Annotation Source ID",
    }),
    value: input({
      label: "Value",
      type: "string",
      required: true,
      clean: (value): string => util.types.toString(value),
      comments: "The value of the annotation source",
    }),
    description: input({
      label: "Description",
      type: "string",
      required: false,
      clean: (value): string | undefined =>
        value !== undefined && value !== null
          ? util.types.toString(value)
          : undefined,
      comments: "Description of the annotation source",
    }),
  },
});

export default {
  getAnnotationSources,
  postAnnotationSources,
  getAnnotationSourcesAnnotationSourceId,
  patchAnnotationSourcesAnnotationSourceId,
};
