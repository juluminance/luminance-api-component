export interface OAuth2Values {
  /**
   * Token URL
   * Token URL.
   *
   * @default https:\/\/<your-domain>.app.luminance.com\/auth\/oauth2\/token
   */
  tokenUrl?: string;
  /**
   * Scopes
   * Space-delimited scopes.
   *
   */
  scopes?: string;
  /**
   * Client ID
   * Client identifier.
   *
   */
  clientId: string;
  /**
   * Client Secret
   * Client secret.
   *
   */
  clientSecret: string;
}

/**
 * OAuth 2.0 Client Credentials
 *
 * @comments
 */
export const oAuth2 = {
  key: "oAuth2",
  perform: (_values: OAuth2Values): Promise<void> => Promise.resolve(),
  inputs: {
    tokenUrl: {
      inputType: "string",
      collection: undefined,
      default: `https:\/\/<your-domain>.app.luminance.com\/auth\/oauth2\/token`,
    },
    scopes: {
      inputType: "string",
      collection: undefined,
      default: ``,
    },
    clientId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    clientSecret: {
      inputType: "password",
      collection: undefined,
      default: ``,
      required: true,
    },
  },
} as const;
