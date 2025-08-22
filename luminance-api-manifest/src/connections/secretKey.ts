export interface SecretKeyValues {
  /**
   * HMAC Secret Key
   *
   * @placeholder HMAC Secret Key
   */
  secretKey: string;
}

/**
 * HMAC Secret Key
 *
 * @comments HMAC Secret Key
 */
export const secretKey = {
  key: "secretKey",
  perform: (_values: SecretKeyValues): Promise<void> => Promise.resolve(),
  inputs: {
    secretKey: {
      inputType: "password",
      collection: undefined,
      default: ``,
      required: true,
    },
  },
} as const;
