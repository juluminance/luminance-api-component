import type { Connection } from "@prismatic-io/spectral";

export interface HmacWebhookTriggerValues {
  /**
   * Response Status Code
   * The HTTP status code to use for the response.
   *
   * @example 200
   */
  statusCode?:
    | `100`
    | `101`
    | `200`
    | `201`
    | `202`
    | `203`
    | `204`
    | `205`
    | `206`
    | `300`
    | `301`
    | `302`
    | `303`
    | `304`
    | `307`
    | `400`
    | `401`
    | `402`
    | `403`
    | `404`
    | `405`
    | `406`
    | `407`
    | `408`
    | `409`
    | `410`
    | `411`
    | `412`
    | `413`
    | `414`
    | `415`
    | `416`
    | `417`
    | `426`
    | `428`
    | `429`
    | `431`
    | `451`;
  /**
   * Response Content Type
   * The Content-Type header to use for the response.
   *
   * @example application\/json
   */
  contentType?:
    | `application/json`
    | `application/octet-stream`
    | `application/xhtml+xml`
    | `application/xml`
    | `text/css`
    | `text/csv`
    | `text/html`
    | `text/plain`
    | `text/xml`;
  /**
   * Additional Response Headers
   * List of key\/value pairs to use as additional headers for the response.
   *
   */
  headers?: Record<string, string> | Array<{ key: string; value: string }>;
  /**
   * Response Body
   * The body to use for the response.
   *
   * @example {\\"status\\":\\"success\\"}
   */
  body?: string;
  /**
   * HMAC Header Name
   * The name of the header that contains the HMAC hash of the payload's body.
   *
   * @default x-hmac-hash
   * @example x-hmac-sha256
   */
  hmacHeaderName?: string;
  /**
   * HMAC Secret Key
   *
   */
  secretKey: Connection;
  /**
   * HMAC Hash Function
   *
   * @default sha256
   * @example md5
   */
  hashFunction?:
    | `blake2b512`
    | `blake2s256`
    | `md4`
    | `md5`
    | `md5-sha1`
    | `ripemd160`
    | `sha1`
    | `sha224`
    | `sha256`
    | `sha3-224`
    | `sha3-256`
    | `sha3-384`
    | `sha3-512`
    | `sha384`
    | `sha512`
    | `sha512-224`
    | `sha512-256`
    | `sm3`
    | `whirlpool`;
}

/**
 * Validate a payload using an HMAC hash function
 *
 * @description Validate a payload using an HMAC hash function
 */
export const hmacWebhookTrigger = {
  key: "hmacWebhookTrigger",
  perform: <TReturn>(_values: HmacWebhookTriggerValues): Promise<TReturn> =>
    Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    statusCode: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    contentType: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    headers: {
      inputType: "string",
      collection: "keyvaluelist",
      default: ``,
    },
    body: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    hmacHeaderName: {
      inputType: "string",
      collection: undefined,
      default: `x-hmac-hash`,
    },
    secretKey: {
      inputType: "connection",
      collection: undefined,
      default: undefined,
      required: true,
    },
    hashFunction: {
      inputType: "string",
      collection: undefined,
      default: `sha256`,
    },
  },
} as const;
