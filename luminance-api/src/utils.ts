import { createHash } from "crypto";
import { util } from "@prismatic-io/spectral";
import { createMD4, createWhirlpool } from "hash-wasm";
import { IHasher } from "hash-wasm/dist/lib/WASMInterface";
import { IDataType } from "hash-wasm/dist/lib/util";

// Implementations for crypto hash functions that are not available in Node
export const nonNativeHashFunctions: Record<string, () => Promise<IHasher>> = {
  md4: createMD4,
  whirlpool: createWhirlpool,
};

type DigestFn = (outputType?: "hex" | "base64") => string | Buffer;

export const createHasher = async (
  algorithm: string,
  payload: IDataType
): Promise<{ digest: DigestFn }> => {
  const nonNativeHash = nonNativeHashFunctions[algorithm];
  if (nonNativeHash) {
    const hasher = await nonNativeHash();
    return {
      digest: (outputType): ReturnType<DigestFn> => {
        hasher.init().update(payload);
        if (outputType === "hex") {
          return hasher.digest("hex");
        } else if (outputType === "base64") {
          return Buffer.from(hasher.digest("binary")).toString("base64");
        }
        return hasher.digest();
      },
    };
  }

  return {
    digest: (outputType): ReturnType<DigestFn> => {
      const hasher = createHash(algorithm).update(payload);
      if (outputType === "hex") {
        return hasher.digest("hex");
      } else if (outputType === "base64") {
        return hasher.digest("base64");
      }
      return hasher.digest();
    },
  };
};

export const hashFunctions = [
  "BLAKE2b512",
  "BLAKE2s256",
  "MD4",
  "MD5",
  "MD5-SHA1",
  "RIPEMD160",
  "SHA1",
  "SHA224",
  "SHA256",
  "SHA3-224",
  "SHA3-256",
  "SHA3-384",
  "SHA3-512",
  "SHA384",
  "SHA512",
  "SHA512-224",
  "SHA512-256",
  "SM3",
  "whirlpool",
];

export const hashFunctionsLowerCase = hashFunctions.map((h) => h.toLowerCase());

export const hashFunctionsInputModel = hashFunctions.map((algorithm) => ({
  label: algorithm,
  value: algorithm.toLowerCase(),
}));

export const supportedContentTypes = [
  "application/json",
  "application/octet-stream",
  "application/xhtml+xml",
  "application/xml",
  "text/css",
  "text/csv",
  "text/html",
  "text/plain",
  "text/xml",
];

export const isSupportedContentType = (contentType: unknown): boolean =>
  supportedContentTypes.includes(util.types.toString(contentType));

export const supportedStatusCodes = {
  100: "100 Continue",
  101: "101 Switching Protocols",
  200: "200 OK",
  201: "201 Created",
  202: "202 Accepted",
  203: "203 Non-Authoritative Information",
  204: "204 No Content",
  205: "205 Reset Content",
  206: "206 Partial Content",
  300: "300 Multiple Choices",
  301: "301 Moved Permanently",
  302: "302 Found",
  303: "303 See Other",
  304: "304 Not Modified",
  307: "307 Temporary Redirect",
  400: "400 Bad Request",
  401: "401 Unauthorized",
  402: "402 Payment Required",
  403: "403 Forbidden",
  404: "404 Not Found",
  405: "405 Method Not Allowed",
  406: "406 Not Acceptable",
  407: "407 Proxy Authentication Required",
  408: "408 Request Timeout",
  409: "409 Conflict",
  410: "410 Gone",
  411: "411 Length Required",
  412: "412 Precondition Failed",
  413: "413 Payload Too Large",
  414: "414 URI Too Long",
  415: "415 Unsupported Media Type",
  416: "416 Range Not Satisfiable",
  417: "417 Expectation Failed",
  426: "426 Upgrade Required",
  428: "428 Precondition Required",
  429: "429 Too Many Requests",
  431: "431 Request Header Fields Too Large",
  451: "451 Unavailable For Legal Reasons",
};

export const isSupportedStatusCode = (statusCode: unknown): boolean =>
  util.types.toString(statusCode) in supportedStatusCodes;
