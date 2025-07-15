import { buildRawRequestAction } from "@prismatic-io/spectral/dist/clients/http";
import system from "./system";
import users from "./users";
import annotationTypes from "./annotationTypes";
import annotationSources from "./annotationSources";
import projects from "./projects";
import tasks from "./tasks";
import documents from "./documents";
import matters from "./matters";

export default {
  ...system,
  ...users,
  ...annotationTypes,
  ...annotationSources,
  ...projects,
  ...tasks,
  ...documents,
  ...matters,
  rawRequest: buildRawRequestAction("https://api.luminance.com"),
};
