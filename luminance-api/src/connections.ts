import { oauth2Connection, OAuth2Type } from "@prismatic-io/spectral";

export const oAuth2 = oauth2Connection({
  key: "oAuth2",
  display: {
    label: "OAuth 2.0 Client Credentials",
    description: "",
    icons: {},
  },
  oauth2Type: OAuth2Type.ClientCredentials,
  inputs: {
    tokenUrl: {
      label: "Token URL",
      type: "string",
      required: true,
      shown: true,
      default: "https://<your-domain>.app.luminance.com/oauth/token",
      comments: "Token URL",
    },

    scopes: {
      label: "Scopes",
      type: "string",
      required: false,
      shown: true,
      comments: "Space-delimited scopes",
    },
    clientId: {
      label: "Client ID",
      type: "string",
      required: true,
      shown: true,
      comments: "Client identifier",
    },
    clientSecret: {
      label: "Client Secret",
      type: "password",
      required: true,
      shown: true,
      comments: "Client secret",
    },
  },
});

export default [oAuth2];
