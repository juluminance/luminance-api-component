import type { Connection } from "@prismatic-io/spectral";

export interface RawRequestValues {
  /**
   * Connection
   * Example: \/projects.
   *
   */
  connection: Connection;
  /**
   * URL
   * Example: \/projects.
   *
   * @example \/sobjects\/Account
   * @placeholder URL to call
   */
  url: string;
  /**
   * Method
   * The HTTP method to use.
   *
   */
  method:
    | `DELETE`
    | `GET`
    | `HEAD`
    | `LINK`
    | `OPTIONS`
    | `PATCH`
    | `POST`
    | `PURGE`
    | `PUT`
    | `UNLINK`;
  /**
   * Data
   * The HTTP body payload to send to the URL.
   *
   * @example {\\"exampleKey\\": \\"Example Data\\"}
   * @placeholder Data to send
   */
  data?: string;
  /**
   * Form Data
   * The Form Data to be sent as a multipart form upload.
   *
   * @example [{\\"key\\": \\"Example Key\\", \\"value\\": new Buffer(\\"Hello World\\")}]
   * @placeholder Data to send
   */
  formData?: Record<string, string> | Array<{ key: string; value: string }>;
  /**
   * File Data
   * File Data to be sent as a multipart form upload.
   *
   * @example [{key: \\"example.txt\\", value: \\"My File Contents\\"}]
   * @placeholder Data to send
   */
  fileData?: Record<string, string> | Array<{ key: string; value: string }>;
  /**
   * File Data File Names
   * File names to apply to the file data inputs. Keys must match the file data keys above.
   *
   * @placeholder The file name to apply to a file
   */
  fileDataFileNames?:
    | Record<string, string>
    | Array<{ key: string; value: string }>;
  /**
   * Query Parameter
   * A list of query parameters to send with the request. This is the portion at the end of the URL similar to ?key1=value1&key2=value2.
   *
   * @placeholder Query Parameter
   */
  queryParams?: Record<string, string> | Array<{ key: string; value: string }>;
  /**
   * Header
   * A list of headers to send with the request.
   *
   * @example User-Agent: curl\/7.64.1
   * @placeholder Header
   */
  headers?: Record<string, string> | Array<{ key: string; value: string }>;
  /**
   * Response Type
   * The type of data you expect in the response. You can request json, text, or binary data.
   *
   * @default json
   * @placeholder Response Type
   */
  responseType?: `arraybuffer` | `document` | `json` | `text`;
  /**
   * Timeout
   * The maximum time that a client will await a response to its request.
   *
   * @example 2000
   */
  timeout?: string;
  /**
   * Debug Request
   * Enabling this flag will log out the current request.
   *
   * @default false
   */
  debugRequest?: boolean;
  /**
   * Retry Delay (ms)
   * The delay in milliseconds between retries. This is used when 'Use Exponential Backoff' is disabled.
   *
   * @default 0
   * @placeholder Retry Delay
   */
  retryDelayMS?: string;
  /**
   * Retry On All Errors
   * If true, retries on all erroneous responses regardless of type. This is helpful when retrying after HTTP 429 or other 3xx or 4xx errors. Otherwise, only retries on HTTP 5xx and network errors.
   *
   * @default false
   */
  retryAllErrors?: boolean;
  /**
   * Max Retry Count
   * The maximum number of retries to attempt. Specify 0 for no retries.
   *
   * @default 0
   * @placeholder Max Retries
   */
  maxRetries?: string;
  /**
   * Use Exponential Backoff
   * Specifies whether to use a pre-defined exponential backoff strategy for retries. When enabled, 'Retry Delay (ms)' is ignored.
   *
   * @default false
   */
  useExponentialBackoff?: boolean;
}

/**
 * Raw Request
 *
 * @description Issue a raw HTTP request
 */
export const rawRequest = {
  key: "rawRequest",
  perform: <TReturn>(_values: RawRequestValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    connection: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    url: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    method: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    data: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    formData: {
      inputType: "string",
      collection: "keyvaluelist",
      default: ``,
    },
    fileData: {
      inputType: "string",
      collection: "keyvaluelist",
      default: ``,
    },
    fileDataFileNames: {
      inputType: "string",
      collection: "keyvaluelist",
      default: ``,
    },
    queryParams: {
      inputType: "string",
      collection: "keyvaluelist",
      default: ``,
    },
    headers: {
      inputType: "string",
      collection: "keyvaluelist",
      default: ``,
    },
    responseType: {
      inputType: "string",
      collection: undefined,
      default: `json`,
    },
    timeout: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    debugRequest: {
      inputType: "boolean",
      collection: undefined,
      default: `false`,
    },
    retryDelayMS: {
      inputType: "string",
      collection: undefined,
      default: `0`,
    },
    retryAllErrors: {
      inputType: "boolean",
      collection: undefined,
      default: `false`,
    },
    maxRetries: {
      inputType: "string",
      collection: undefined,
      default: `0`,
    },
    useExponentialBackoff: {
      inputType: "boolean",
      collection: undefined,
      default: `false`,
    },
  },
} as const;
