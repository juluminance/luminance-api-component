import { Connection, ConnectionError, util } from "@prismatic-io/spectral";
import {
  HttpClient,
  createClient as createHttpClient,
} from "@prismatic-io/spectral/dist/clients/http";
import { oAuth2 } from "./connections";

export const extractBaseUrlFromTokenUrl = (tokenUrl: string): string => {
  try {
    const url = new URL(tokenUrl);
    const hostname = url.hostname;
    
    // Extract subdomain (everything before the first dot)
    const subdomain = hostname.split('.')[0];
    
    // Construct the API base URL with the subdomain
    return `https://${subdomain}.app.luminance.com/api2`;
  } catch (error) {
    throw new Error(`Invalid token URL format: ${tokenUrl}`);
  }
};

export const toAuthorizationHeaders = (
  connection: Connection
): { Authorization: string } => {
  const accessToken = util.types.toString(connection.token?.access_token);
  if (accessToken) {
    return { Authorization: `Bearer ${accessToken}` };
  }

  const apiKey = util.types.toString(connection.fields?.apiKey);
  if (apiKey) {
    return { Authorization: `Bearer ${apiKey}` };
  }

  const username = util.types.toString(connection.fields?.username);
  const password = util.types.toString(connection.fields?.password);
  if (username && password) {
    const encoded = Buffer.from(`${username}:${password}`).toString("base64");
    return { Authorization: `Basic ${encoded}` };
  }

  throw new Error(
    `Failed to guess at authorization parameters for Connection: ${connection.key}`
  );
};

export const createClient = (
  connection: Connection
): HttpClient => {
  if (![oAuth2.key].includes(connection.key)) {
    throw new ConnectionError(
      connection,
      `Received unexpected connection type: ${connection.key}`
    );
  }

  // Extract the token URL from the connection
  const tokenUrl = util.types.toString(connection.fields?.tokenUrl);
  if (!tokenUrl) {
    throw new Error("Token URL is required but not provided");
  }

  // Generate the base URL from the token URL
  const baseUrl = extractBaseUrlFromTokenUrl(tokenUrl);

  const client = createHttpClient({
    baseUrl,
    headers: {
      ...toAuthorizationHeaders(connection),
      Accept: "application/json",
    },
    responseType: "json",
  });
  return client;
};
