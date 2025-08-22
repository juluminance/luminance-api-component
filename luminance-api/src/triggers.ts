import {
  input,
  trigger,
  TriggerPayload,
  TriggerResult,
  util,
} from "@prismatic-io/spectral";
import { createHmac } from "crypto";
import { hashFunction } from "./inputs";
import {
  isSupportedContentType,
  isSupportedStatusCode,
  supportedContentTypes,
  supportedStatusCodes,
} from "./utils";

interface ExtendedTriggerPayload extends TriggerPayload {
  response?: {
    statusCode: number;
    contentType: string;
    headers: Record<string, string>;
    body: string;
  };
}

export const hmacWebhookTrigger = trigger({
  display: {
    label: "HMAC Webhook Trigger",
    description: "Validate a payload using an HMAC hash function",
  },
  perform: async ({ executionId }, payload, params) => {
    const lowerHeaders = util.types.lowerCaseHeaders(payload.headers);
    const hmacHeaderName = util.types
      .toString(params.hmacHeaderName)
      .toLowerCase();
    const providedHash = lowerHeaders[hmacHeaderName] || "";

    const hash = createHmac(
      params.hashFunction,
      params.secretKey.fields.secretKey as string
    )
      .update(util.types.toString(payload.rawBody.data))
      .digest("hex");

    if (hash !== providedHash.toLowerCase()) {
      throw new Error(
        `Rejecting payload. The hash '${providedHash}' provided by header '${hmacHeaderName}' did not match the hash that was computed here using ${params.hashFunction} and the configured HMAC secret.`
      );
    }

    const result: ExtendedTriggerPayload = { ...payload };

    const defaultStatusCode = 200;
    const defaultContentType = "application/json";
    const defaultBody = JSON.stringify({ executionId });

    const { statusCode, contentType, headers, body } = params;

    if (statusCode || contentType || headers || body) {
      // If they are specifying any part of the response via inputs we must
      // validate that they provide a sensible combination.
      if (statusCode && !isSupportedStatusCode(statusCode)) {
        throw new Error(`Unsupported response status code: ${statusCode}`);
      }

      if (contentType && !isSupportedContentType(contentType)) {
        throw new Error(`Unsupported response content type: ${contentType}`);
      }

      const responseContentType = util.types.toString(
        contentType,
        defaultContentType
      );

      let responseBody = defaultBody;
      if (body) {
        if (responseContentType.startsWith("application/json")) {
          if (typeof body === "string") {
            if (util.types.isJSON(body)) {
              responseBody = body;
            } else {
              throw new Error(`Specified body is not valid JSON: ${body}`);
            }
          } else {
            try {
              responseBody = JSON.stringify(body);
            } catch {
              throw new Error(
                `Cannot serialize specified body as JSON: ${body}`
              );
            }
          }
        } else {
          // Don't attempt to do anything other than ensure the type is correct.
          responseBody = util.types.toString(body);
        }
      }

      result.response = {
        statusCode: util.types.toInt(statusCode, defaultStatusCode),
        contentType: responseContentType,
        headers: Object.entries(
          util.types.keyValPairListToObject(headers || [])
        ).reduce((prev, [key, val]) => {
          return {
            ...prev,
            [util.types.toString(key)]: util.types.toString(val),
          };
        }, {}),
        body: responseBody,
      };
    } else {
      // Default response.
      result.response = {
        statusCode: 200,
        contentType: "application/json",
        headers: {},
        body: JSON.stringify({ executionId }),
      };
    }

    return Promise.resolve({
      success: true,
      payload: result,
    } as TriggerResult<boolean, TriggerPayload>);
  },
  inputs: {
    statusCode: input({
      label: "Response Status Code",
      type: "string",
      required: false,
      example: "200",
      model: Object.entries(supportedStatusCodes).map(
        ([statusCode, description]) => ({
          label: description,
          value: statusCode,
        })
      ),
      comments: "The HTTP status code to use for the response",
    }),
    contentType: input({
      label: "Response Content Type",
      type: "string",
      required: false,
      example: "application/json",
      model: supportedContentTypes.map((contentType) => ({
        label: contentType,
        value: contentType,
      })),
      comments: "The Content-Type header to use for the response",
    }),
    headers: input({
      label: "Additional Response Headers",
      type: "string",
      required: false,
      collection: "keyvaluelist",
      comments:
        "List of key/value pairs to use as additional headers for the response",
    }),
    body: input({
      label: "Response Body",
      type: "string",
      required: false,
      example: JSON.stringify({ status: "success" }),
      comments: "The body to use for the response",
    }),
    hmacHeaderName: input({
      label: "HMAC Header Name",
      type: "string",
      required: true,
      example: "x-hmac-sha256",
      default: "x-hmac-hash",
      comments:
        "The name of the header that contains the HMAC hash of the payload's body",
    }),
    secretKey: input({
      label: "HMAC Secret Key",
      type: "connection",
      required: true,
    }),
    hashFunction: { ...hashFunction, label: "HMAC Hash Function" },
  },
  synchronousResponseSupport: "valid",
  scheduleSupport: "invalid",
});

export default { hmacWebhookTrigger };
