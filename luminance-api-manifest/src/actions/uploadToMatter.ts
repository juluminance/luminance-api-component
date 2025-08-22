import type { Connection } from "@prismatic-io/spectral";

export interface UploadToMatterValues {
  /**
   * Connection
   *
   */
  connection: Connection;
  /**
   * Division Id
   * Project ID.
   *
   */
  projectId: string;
  /**
   * Folder Id
   * Folder ID.
   *
   */
  folderId: string;
  /**
   * Matter Id
   * Matter ID.
   *
   */
  matterId: string;
  /**
   * Name
   * Name of the file to upload.
   *
   */
  name: string;
  /**
   * File
   * Base64 encoded file content.
   *
   */
  body: string;
}

/**
 * Upload a file to an existing matter
 *
 * @description Upload a file to an existing matter
 */
export const uploadToMatter = {
  key: "uploadToMatter",
  perform: <TReturn>(_values: UploadToMatterValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    projectId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    folderId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    matterId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    name: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    body: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
  },
} as const;
