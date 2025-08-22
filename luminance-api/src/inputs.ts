import { input, util } from "@prismatic-io/spectral";
import { hashFunctionsInputModel, hashFunctionsLowerCase } from "./utils";

export const secretKey = input({
  label: "Secret Key",
  type: "string",
  required: true,
  example: "p@$sW0Rd",
  comments:
    "The cryptographic secret key used to hash the payload's body. This must be a string or byte array",
  clean: (value) => {
    if (typeof value === "string") {
      return value;
    } else {
      return value as Uint8Array;
    }
  },
});

export const hashFunction = input({
  label: "Hash Function",
  type: "string",
  required: true,
  example: "md5",
  default: "sha256",
  model: hashFunctionsInputModel,
  clean: (value): string => {
    const func = util.types.toString(value);
    if (!hashFunctionsLowerCase.includes(func)) {
      throw new Error(
        `The hash function "${value}" must be one of: ${hashFunctionsLowerCase}.`
      );
    }
    return func;
  },
});

export const message = input({
  label: "Message",
  type: "string",
  required: true,
  example: "Hello World",
  comments: "The message to generate a hash of",
  clean: util.types.toString,
});
