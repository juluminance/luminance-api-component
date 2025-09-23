import { ActionContext, Connection, util } from "@prismatic-io/spectral";
import {
  HttpClient,
  createClient as createHttpClient,
} from "@prismatic-io/spectral/dist/clients/http";

export const createPrismaticClient = async (
  connection: Connection,
  context: ActionContext,
): Promise<HttpClient> => {
  const invokeUrl = util.types.toString((context as any)?.invokeUrl);
  const apiBaseUrlRaw = util.types.toString((connection as any)?.fields?.apiBaseUrl);
  const authRefreshPathRaw = util.types.toString((connection as any)?.fields?.authRefreshPath) || "/auth/refresh";

  let baseUrl: string | undefined;
  if (apiBaseUrlRaw) {
    baseUrl = apiBaseUrlRaw
      .replace(/\/$/, "")
      .replace(/\/api$/, "")
      .replace(/\/api\/$/, "");
  } else if (invokeUrl) {
    // Derive from invokeUrl
    try {
      const { origin } = new URL(invokeUrl);
      baseUrl = origin.includes("prismatic.io") || origin.includes("prismatic-dev.io")
        ? origin.replace("hooks.", "app.")
        : origin.replace("hooks.", "");
    } catch {
      // Fall through to default
    }
  }

  if (!baseUrl) {
    baseUrl = "https://app.prismatic.io";
  }

  const authRefreshPath = `/${authRefreshPathRaw.replace(/^\//, "")}`;

  const refreshTokenApiKey = util.types.toString((connection as any)?.fields?.apiKey);
  const refreshTokenField = util.types.toString((connection as any)?.fields?.refreshToken);
  const refreshTokenRaw = refreshTokenApiKey || refreshTokenField;
  const refreshToken = util.types.toString(refreshTokenRaw).trim();

  if (!refreshToken) {
    throw new Error("Missing Prismatic refresh token on connection (expected in fields.apiKey or fields.refreshToken)");
  }

  const mask = (v?: string): string => (v ? `${v.slice(0, 4)}...${v.slice(-4)} (len=${v.length})` : "undefined");
  (context as any)?.logger?.info?.("createPrismaticClient: attempting refresh", {
    baseUrl,
    authRefreshPath,
    hasInvokeUrl: Boolean(invokeUrl),
    apiBaseUrlProvided: Boolean(apiBaseUrlRaw),
    refreshTokenMasked: mask(refreshToken),
  });

  const authClient = createHttpClient({
    baseUrl,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    responseType: "json",
  });

  let data: { access_token?: string } | undefined;
  try {
    const resp = await authClient.post<{ access_token?: string }>(
      authRefreshPath,
      { refresh_token: refreshToken }
    );
    data = resp.data;
  } catch (err: any) {
    const status = err?.response?.status;
    const errData = err?.response?.data;
    (context as any)?.logger?.error?.("createPrismaticClient: refresh failed", {
      status,
      errorMessage: err?.message,
      data: errData,
      baseUrl,
      authRefreshPath,
    });
    throw new Error(`Failed to refresh access token (status=${status ?? "unknown"})`);
  }

  const accessToken = util.types.toString(data?.access_token);
  if (!accessToken) {
    (context as any)?.logger?.error?.("createPrismaticClient: missing access_token in refresh response", { data });
    throw new Error("Failed to obtain access token from Prismatic using refresh token");
  }

  const client = createHttpClient({
    baseUrl,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    responseType: "json",
  });
  return client;
};


