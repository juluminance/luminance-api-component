import { get } from "./get";
import { getUsers } from "./getUsers";
import { getUsersUserId } from "./getUsersUserId";
import { getAnnotationTypes } from "./getAnnotationTypes";
import { getProjects } from "./getProjects";
import { createMatter } from "./createMatter";
import { uploadToMatter } from "./uploadToMatter";
import { addMatterInfo } from "./addMatterInfo";
import { getWorkflows } from "./getWorkflows";
import { buildAnnotationsFromMapping } from "./buildAnnotationsFromMapping";
import { mapSalesforceToLuminance } from "./mapSalesforceToLuminance";
import { filterOutSpecificTags } from "./filterOutSpecificTags";
import { createLuminanceMatterTagPayload } from "./createLuminanceMatterTagPayload";
import { createInitialMatterPayload } from "./createInitialMatterPayload";
import { rawRequest } from "./rawRequest";

export default {
  get,
  getUsers,
  getUsersUserId,
  getAnnotationTypes,
  getProjects,
  createMatter,
  uploadToMatter,
  addMatterInfo,
  getWorkflows,
  buildAnnotationsFromMapping,
  mapSalesforceToLuminance,
  filterOutSpecificTags,
  createLuminanceMatterTagPayload,
  createInitialMatterPayload,
  rawRequest,
};
