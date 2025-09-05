import { action, input, util } from "@prismatic-io/spectral";
import { sendRawRequest } from "@prismatic-io/spectral/dist/clients/http";
import { createHmacHex, hashFunctionsInputModel } from "../utils";

const postPrismaticWebhook = action({
  display: {
    label: "POST to Prismatic Webhook (HMAC)",
    description: "POST payloads to a Prismatic-hosted webhook URL with optional HMAC header.",
  },
  inputs: {
    webhookUrl: input({
      label: "Webhook URL",
      type: "string",
      required: true,
      comments: "Full Prismatic webhook URL",
    }),
    payload: input({
      label: "Payload",
      type: "data",
      required: true,
      comments: "Request body to POST. Typically JSON.",
    }),
    secretKey: input({
      label: "HMAC Secret Key",
      type: "connection",
      required: true,
      comments: "Connection containing the HMAC secret, same as the HMAC Webhook Trigger.",
    }),
    hmacHeaderName: input({
      label: "HMAC Header Name",
      type: "string",
      required: false,
      default: "x-hmac-hash",
      comments: "Header name to place the computed HMAC value.",
    }),
    hmacAlgorithm: input({
      label: "HMAC Algorithm",
      type: "string",
      required: false,
      default: "sha256",
      model: hashFunctionsInputModel,
      comments: "Hash algorithm for HMAC. Typically sha256.",
    }),
    contentType: input({
      label: "Content-Type",
      type: "string",
      required: false,
      default: "application/json",
    }),
    debug: input({
      label: "Debug",
      type: "string",
      required: false,
      default: "false",
      comments: "If 'true', return computed hash, headers, and body for troubleshooting.",
    }),
  },
  perform: async (context, params) => {
    const webhookUrl = util.types.toString(params.webhookUrl);
    const payload = params.payload;
    const secret = util.types.toString(params.secretKey?.fields?.secretKey);
    const hmacHeaderName = util.types.toString(params.hmacHeaderName || "x-hmac-hash");
    const algorithm = util.types.toString(params.hmacAlgorithm || "sha256");
    const contentType = util.types.toString(params.contentType || "application/json");

    const bodyString = typeof payload === "string" ? payload : JSON.stringify(payload ?? {});

    // Only include the HMAC header (no additional headers allowed/configured here)
    const headerPairs: Array<{ key: string; value: string }> = [];

    const computedHash = secret ? createHmacHex(algorithm, secret, bodyString) : undefined;
    if (secret) {
      headerPairs.push({ key: hmacHeaderName, value: computedHash as string });
    }

    const defaultHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": contentType,
    };


    console.log(createHmacHex(algorithm, secret, bodyString))
    const { data, status, headers: responseHeaders } = await sendRawRequest(
      "",
      {
        url: webhookUrl,
        method: "POST",
        data: bodyString,
        headers: headerPairs,
      } as any,
      defaultHeaders
    );

    const debugEnabled = util.types.toString(params.debug) === "true";
    const debugInfo = debugEnabled
      ? {
          computedHash,
          hmacHeaderName,
          algorithm,
          bodySent: bodyString,
          headersSent: headerPairs,
        }
      : undefined;

    return { data, status, headers: responseHeaders, debug: debugInfo } as any;
  },
});

export default {
  postPrismaticWebhook,
};


