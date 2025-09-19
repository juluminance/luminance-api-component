import { action, input, util } from "@prismatic-io/spectral";

type MappingEntry = {
  luminanceFields: string; // annotation_type_id (as string)
  salesforceField?: string; // JSON string: { objectName: string; fieldKey: string }
  salesforceopportunityField?: string; // fallback field key on primary data
  salesforceFieldType?: "text" | "number" | "currency" | "date" | "timestamp";
  luminanceFieldType?: "text" | "number" | "currency" | "timestamp";
};

const toArray = <T = unknown>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Common nesting keys that may contain the array
    const nested = (obj["mymappings"] || obj["mappings"] || obj["items"] || obj["data"]) as unknown;
    if (Array.isArray(nested)) return nested as T[];
    // Fallback: if object values look like homogeneous entries, return values
    const values = Object.values(obj);
    if (values.length && values.every((v) => typeof v === "object")) {
      return values as T[];
    }
    return [];
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return toArray<T>(parsed);
    } catch (_err) {
      return [];
    }
  }
  return [];
};

const toObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return toObject(parsed);
    } catch (_err) {
      return {};
    }
  }
  return {};
};

const alignFieldTypes = (
  value: unknown,
  sourceType: MappingEntry["salesforceFieldType"],
  targetType: MappingEntry["luminanceFieldType"],
  defaultCurrency: string
): unknown => {
  if (sourceType === targetType) {
    return value;
  }

  switch (sourceType) {
    case "currency": {
      if (targetType === "number") {
        return (value as number) || 0;
      }
      if (targetType === "text") {
        return value != null ? String(value) : "";
      }
      return value;
    }
    case "number": {
      if (targetType === "currency") {
        return { value: (value as number) || 0, currency: defaultCurrency };
      }
      if (targetType === "text") {
        return value != null ? String(value) : "";
      }
      return value;
    }
    case "date": {
      if (value) {
        const asDate = new Date(String(value));
        return isNaN(asDate.getTime()) ? new Date().toISOString() : asDate.toISOString();
      }
      return new Date().toISOString();
    }
    case "timestamp": {
      if (targetType === "text") {
        return (value as string) || new Date().toISOString();
      }
      return value;
    }
    case "text": {
      if (targetType === "number") {
        const num = parseFloat(String(value));
        return isNaN(num) ? 0 : num;
      }
      if (targetType === "currency") {
        const num = parseFloat(String(value));
        return { value: isNaN(num) ? 0 : num, currency: defaultCurrency };
      }
      return value;
    }
    default:
      return value;
  }
};

const mapToLuminanceAnnotations = (
  mappings: MappingEntry[],
  primaryData: Record<string, unknown>,
  secondaryData: Record<string, unknown>,
  defaultCurrency: string
) => {
  return (mappings || []).map((mapping) => {
    const annotationTypeId = parseInt(mapping.luminanceFields, 10);
    const salesforceFieldType = mapping.salesforceFieldType || "text";
    const luminanceFieldType = mapping.luminanceFieldType || "text";

    let objectName = "Opportunity"; // primary by default
    let fieldKey = mapping.salesforceopportunityField || "";

    if (mapping.salesforceField) {
      try {
        const fieldData = JSON.parse(mapping.salesforceField);
        objectName = fieldData.objectName || objectName;
        fieldKey = fieldData.fieldKey || fieldKey;
      } catch (_err) {
        // ignore parse errors and fall back
      }
    }

    let fieldValue: unknown = undefined;
    if (objectName === "Account") {
      fieldValue = secondaryData ? secondaryData[fieldKey] : undefined;
    } else {
      fieldValue = primaryData ? primaryData[fieldKey] : undefined;
    }

    const alignedValue = alignFieldTypes(
      fieldValue,
      salesforceFieldType,
      luminanceFieldType,
      defaultCurrency
    );

    let content: Record<string, unknown> = {};
    if (salesforceFieldType === "date" || salesforceFieldType === "timestamp") {
      content = { timestamp: (alignedValue as string) || new Date().toISOString() };
    } else {
      switch (luminanceFieldType) {
        case "currency":
          content = {
            value: (alignedValue as { value?: number }).value || 0,
            currency:
              (alignedValue as { currency?: string }).currency || defaultCurrency,
          };
          break;
        case "timestamp":
          content = {
            timestamp: (alignedValue as string) || new Date().toISOString(),
          };
          break;
        case "number":
          content = { value: (alignedValue as number) || 0 };
          break;
        default:
          content = { value: alignedValue != null ? alignedValue : "" };
      }
    }

    return {
      annotation_type_id: annotationTypeId,
      content,
    };
  });
};

// HubSpot variant: builds annotations from HubSpot mappings
const mapHubSpotToLuminanceAnnotations = (
  mappings: Array<Record<string, unknown>>,
  primaryData: Record<string, unknown>,
  secondaryData: Record<string, unknown>,
  defaultCurrency: string
) => {
  const normalizeHubSpotSourceType = (hsType: string | undefined):
    | "text"
    | "number"
    | "currency"
    | "date"
    | "timestamp" => {
    const t = (hsType || "").toLowerCase();
    if (t.includes("number")) return "number";
    if (t === "date") return "date";
    if (t === "datetime" || t.includes("time")) return "timestamp";
    return "text";
  };

  return (mappings || []).map((mapping) => {
    const annotationTypeId = parseInt(
      util.types.toString((mapping as any).luminanceFields),
      10
    );

    // Parse hubspotField JSON to get fieldKey and type
    let fieldKey = "";
    let objectName = "";
    let hubspotFieldType = "text" as "text" | "number" | "currency" | "date" | "timestamp";
    const raw = (mapping as any).hubspotField as unknown;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        fieldKey = util.types.toString(parsed.fieldKey) || "";
        objectName = util.types.toString(parsed.objectName) || "";
        hubspotFieldType = normalizeHubSpotSourceType(
          util.types.toString(parsed.fieldType)
        );
      } catch {
        // ignore parse errors
      }
    }

    const sourceType = hubspotFieldType || "text";
    const luminanceFieldType = util.types.toString(
      (mapping as any).luminanceFieldType
    ) as "text" | "number" | "currency" | "timestamp" | undefined;

    let fieldValue: unknown = undefined;
    if (primaryData && Object.prototype.hasOwnProperty.call(primaryData, fieldKey)) {
      fieldValue = primaryData[fieldKey];
    } else if (secondaryData && Object.prototype.hasOwnProperty.call(secondaryData, fieldKey)) {
      fieldValue = secondaryData[fieldKey];
    }
    const alignedValue = alignFieldTypes(
      fieldValue,
      sourceType,
      luminanceFieldType || "text",
      defaultCurrency
    );

    let content: Record<string, unknown> = {};
    if (sourceType === "date" || sourceType === "timestamp") {
      content = { timestamp: (alignedValue as string) || new Date().toISOString() };
    } else {
      switch (luminanceFieldType) {
        case "currency":
          content = {
            value: (alignedValue as { value?: number }).value || 0,
            currency:
              (alignedValue as { currency?: string }).currency || defaultCurrency,
          };
          break;
        case "timestamp":
          content = {
            timestamp: (alignedValue as string) || new Date().toISOString(),
          };
          break;
        case "number":
          content = { value: (alignedValue as number) || 0 };
          break;
        default:
          content = { value: alignedValue != null ? alignedValue : "" };
      }
    }

    return {
      annotation_type_id: annotationTypeId,
      content,
    };
  });
};

const buildAnnotationsFromMapping = action({
  display: {
    label: "Map data between Salesforce and Luminance",
    description:
      "Map input data into Luminance matter tag content using the configured mapping",
  },
  perform: async (
    context,
    { mappings, primaryData, secondaryData, namePrefix, defaultCurrency }
  ) => {
    const currency = util.types.toString(defaultCurrency) || "USD";
    const mappingArray = toArray<MappingEntry>(mappings);
    if (!mappingArray.length) {
      throw new Error(
        "Mappings must be an array or contain a nested array (e.g., 'mymappings')."
      );
    }
    const annotations = mapToLuminanceAnnotations(
      mappingArray,
      (primaryData as Record<string, unknown>) || {},
      (secondaryData as Record<string, unknown>) || {},
      currency
    );

    const prefix = util.types.toString(namePrefix);
    const maybeName = prefix
      ? `${prefix} - ${Math.random().toString(36).substring(2, 10)}`
      : undefined;

    const payload: Record<string, unknown> = {
      required_matter_annotations: annotations,
    };
    if (maybeName) {
      payload.name = maybeName;
    }

    return { data: payload };
  },
  inputs: {
    mappings: input({
      label: "Mappings",
      type: "jsonForm",
      required: true,
      comments:
        "Array of mapping entries from the configuration variables",
    }),
    primaryData: input({
      label: "Primary Data",
      type: "jsonForm",
      required: true,
      comments: "Primary source object (e.g., Opportunity)",
    }),
    secondaryData: input({
      label: "Secondary Data",
      type: "jsonForm",
      required: false,
      comments: "Secondary source object (e.g., Account)",
    }),
    namePrefix: input({
      label: "Name Prefix",
      type: "string",
      required: false,
      comments:
        "Optional. If set, output includes a name with this prefix and a random suffix.",
      clean: (value): string | undefined =>
        value != null ? util.types.toString(value) : undefined,
    }),
    defaultCurrency: input({
      label: "Default Currency",
      type: "string",
      required: false,
      comments: "Default currency code used for currency mappings when unspecified.",
      default: "USD",
      clean: (value): string => util.types.toString(value, "USD"),
    }),
  },
});

export default {
  buildAnnotationsFromMapping,
  // HubSpot
  buildAnnotationsFromHubSpotMapping: action({
    display: {
      label: "Map data between HubSpot and Luminance",
      description:
        "Map HubSpot data into Luminance matter tag content using the configured mapping",
    },
    perform: async (
      _context,
      { mappings, primaryData, secondaryData, namePrefix, defaultCurrency }
    ) => {
      const currency = util.types.toString(defaultCurrency) || "USD";
      const mappingArray = toArray<Record<string, unknown>>(mappings);
      if (!mappingArray.length) {
        throw new Error(
          "Mappings must be an array or contain a nested array (e.g., 'mymappings')."
        );
      }
      const annotations = mapHubSpotToLuminanceAnnotations(
        mappingArray,
        (primaryData as Record<string, unknown>) || {},
        (secondaryData as Record<string, unknown>) || {},
        currency
      );

      const prefix = util.types.toString(namePrefix);
      const maybeName = prefix
        ? `${prefix} - ${Math.random().toString(36).substring(2, 10)}`
        : undefined;

      const payload: Record<string, unknown> = {
        required_matter_annotations: annotations,
      };
      if (maybeName) {
        payload.name = maybeName;
      }

      return { data: payload };
    },
    inputs: {
      mappings: input({
        label: "Mappings",
        type: "jsonForm",
        required: true,
        comments:
          "Array of mapping entries from the configuration variables (expects hubspotField + luminanceFields)",
      }),
      primaryData: input({
        label: "Primary Data (HubSpot properties)",
        type: "jsonForm",
        required: true,
        comments: "HubSpot properties object from a record",
      }),
      secondaryData: input({
        label: "Secondary Data (HubSpot properties)",
        type: "jsonForm",
        required: false,
        comments: "Optional secondary HubSpot properties object (e.g., associated Company)",
      }),
      namePrefix: input({
        label: "Name Prefix",
        type: "string",
        required: false,
        comments:
          "Optional. If set, output includes a name with this prefix and a random suffix.",
        clean: (value): string | undefined =>
          value != null ? util.types.toString(value) : undefined,
      }),
      defaultCurrency: input({
        label: "Default Currency",
        type: "string",
        required: false,
        comments: "Default currency code used for currency mappings when unspecified.",
        default: "USD",
        clean: (value): string => util.types.toString(value, "USD"),
      }),
    },
  }),
};

export const filterOutSpecificTags = action({
  display: {
    label: "Filter Tags",
    description:
      "Filter matter tags by a case-insensitive substring match on a chosen field",
  },
  perform: async (
    context,
    { items, fieldName, filterString }
  ) => {
    const array = toArray<Record<string, unknown>>(items);
    const field = util.types.toString(fieldName) || "name";
    const needles = (util.types.toString(filterString) || "sf_")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => Boolean(s));

    const filtered = array.filter((item) => {
      const value = item && (item as Record<string, unknown>)[field];
      if (value === undefined || value === null) return false;
      const haystack = String(value).toLowerCase();
      return needles.some((n) => haystack.includes(n));
    });

    return { data: filtered };
  },
  inputs: {
    items: input({
      label: "Items",
      type: "jsonForm",
      required: true,
      comments:
        "Array of objects to filter. Map previous step results here (e.g., results from 'Get Matters for Project').",
    }),
    fieldName: input({
      label: "Field Name",
      type: "string",
      required: false,
      default: "name",
      comments: "Field to test (default: name).",
      clean: (value): string => util.types.toString(value, "name"),
    }),
    filterString: input({
      label: "Filter(s)",
      type: "string",
      required: false,
      default: "sf_",
      comments: "Comma-separated substrings to match (case-insensitive). Example: sf_,client",
      clean: (value): string => util.types.toString(value, "sf_"),
    }),
  },
});

export const __debug = { toArray };

export const createLuminanceMatterTagPayload = action({
  display: {
    label: "Create Luminance Matter Tag Payload",
    description:
      "Merge mapped annotations with tag types and coerce values to Luminance formats",
  },
  perform: async (
    context,
    { tags, mappingResults, defaultCurrency }
  ) => {
    const currency = util.types.toString(defaultCurrency) || "USD";
    const tagArray = toArray<Record<string, unknown>>(tags);
    const mapping = toObject(mappingResults);

    const annotationTypeMap: Record<number, string> = {};
    tagArray.forEach((item) => {
      const id = util.types.toNumber((item as Record<string, unknown>)["id"]);
      const type = util.types.toString((item as Record<string, unknown>)["type"]);
      if (id != null && type) {
        annotationTypeMap[id] = type;
      }
    });

    const annotations = toArray<Record<string, unknown>>(
      (mapping as Record<string, unknown>)["required_matter_annotations"]
    );

    const transformed = annotations.map((annotation) => {
      const annotationTypeId = util.types.toNumber(
        (annotation as Record<string, unknown>)["annotation_type_id"]
      );
      const type = annotationTypeMap[annotationTypeId] || "";
      const contentObj = toObject(
        (annotation as Record<string, unknown>)["content"]
      );

      // datetime => move value -> timestamp (ISO)
      if (
        type.toLowerCase().includes("datetime") &&
        Object.prototype.hasOwnProperty.call(contentObj, "value")
      ) {
        const dateVal = util.types.toString(
          (contentObj as Record<string, unknown>)["value"]
        );
        const date = new Date(dateVal);
        (contentObj as Record<string, unknown>)["timestamp"] = isNaN(
          date.getTime()
        )
          ? new Date().toISOString()
          : date.toISOString();
        delete (contentObj as Record<string, unknown>)["value"];
      }

      // party => move value -> party
      if (
        type.toLowerCase().includes("party") &&
        Object.prototype.hasOwnProperty.call(contentObj, "value")
      ) {
        (contentObj as Record<string, unknown>)["party"] = (
          contentObj as Record<string, unknown>
        )["value"];
        delete (contentObj as Record<string, unknown>)["value"];
      }

      // money => ensure currency
      if (
        type.toLowerCase().includes("money") &&
        Object.prototype.hasOwnProperty.call(contentObj, "value")
      ) {
        if (!(contentObj as Record<string, unknown>)["currency"]) {
          (contentObj as Record<string, unknown>)["currency"] = currency;
        }
      }

      return {
        annotation_type_id: annotationTypeId,
        content: contentObj,
      } as Record<string, unknown>;
    });

    const out: Record<string, unknown> = {
      ...mapping,
      required_matter_annotations: transformed,
    };

    return { data: out };
  },
  inputs: {
    tags: input({
      label: "Tags",
      type: "jsonForm",
      required: true,
      comments:
        "Array of tag/type objects (e.g., results from 'Filter Tags'). Must include 'id' and 'type' fields.",
    }),
    mappingResults: input({
      label: "Mapped Annotations",
      type: "jsonForm",
      required: true,
      comments:
        "Output from 'Map data between Salesforce and Luminance' (contains required_matter_annotations)",
    }),
    defaultCurrency: input({
      label: "Default Currency",
      type: "string",
      required: false,
      default: "USD",
      comments: "Currency to apply to money types when missing.",
      clean: (value): string => util.types.toString(value, "USD"),
    }),
  },
});


export const createInitialMatterPayload = action({
  display: {
    label: "Create Initial Matter Payload",
    description: "Create a payload for the initial matter creation",
  },
  perform: async (context, { name, workflowId }) => {
    const matterName = util.types.toString(name);
    const wfId = util.types.toString(workflowId);
    const data = {
      name: matterName,
      workflow_id: wfId,
    } as Record<string, unknown>;
    return { data };
  },
  inputs: {
    name: input({
      label: "Name",
      type: "string",
      required: true,
      comments: "Name for the matter. It should be unique, so a guid is recommended",
      clean: (value): string => util.types.toString(value),
    }),
    workflowId: input({
      label: "Workflow ID",
      type: "string",
      required: true,
      comments: "Target workflow",
      clean: (value): string => util.types.toString(value),
    }),
  },
});


export const convertBinaryToBase64 = action({
  display: {
    label: "Convert Binary to Base64",
    description: "Convert binary data (Buffer/bytes/string) to a base64 string",
  },
  perform: async (context, { data, inputEncoding }) => {
    const encoding = util.types.toString(inputEncoding) as BufferEncoding | undefined;

    const toBuffer = (value: unknown): Buffer => {
      if (Buffer.isBuffer(value)) return value;
      if (value instanceof Uint8Array) return Buffer.from(value);
      if (value instanceof ArrayBuffer) return Buffer.from(new Uint8Array(value));
      if (Array.isArray(value) && (value as unknown[]).every((v) => typeof v === "number")) {
        return Buffer.from(value as number[]);
      }
      if (typeof value === "string") {
        // Handle data URI: data:<mime>;base64,<payload>
        const trimmed = value.trim();
        if (trimmed.startsWith("data:")) {
          const commaIdx = trimmed.indexOf(",");
          const meta = trimmed.substring(0, commaIdx).toLowerCase();
          const payload = trimmed.substring(commaIdx + 1);
          if (meta.includes(";base64")) {
            return Buffer.from(payload, "base64");
          }
          return Buffer.from(payload, "utf8");
        }

        // If explicit encoding provided, honor it
        if (encoding) {
          return Buffer.from(value, encoding);
        }

        // Auto-detect base64 / hex
        const compact = trimmed.replace(/\s+/g, "");
        const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(compact) && compact.length % 4 === 0;
        const looksHex = /^[0-9a-fA-F]+$/.test(compact) && compact.length % 2 === 0;
        if (looksBase64) return Buffer.from(compact, "base64");
        if (looksHex) return Buffer.from(compact, "hex");

        // Fallback to latin1 to preserve raw byte values for binary-like strings
        return Buffer.from(value, "latin1");
      }
      if (value && typeof value === "object") {
        const obj = value as Record<string, unknown> & { data?: unknown; encoding?: string };
        if (obj.data != null) {
          // If a nested encoding is specified, prefer that over the outer encoding
          const nestedEncoding = (obj.encoding as BufferEncoding | undefined) || encoding;
          return toBufferWithEncoding(obj.data, nestedEncoding);
        }
        // Node Buffer JSON shape: { type: 'Buffer', data: number[] }
        if ((obj as any).type === "Buffer" && Array.isArray((obj as any).data)) {
          return Buffer.from((obj as any).data as number[]);
        }
      }
      return Buffer.from([]);
    };

    const toBufferWithEncoding = (value: unknown, enc?: BufferEncoding): Buffer => {
      if (typeof value === "string") {
        if (enc) return Buffer.from(value, enc);
        // Apply same heuristics as above when no explicit encoding
        const trimmed = value.trim();
        const compact = trimmed.replace(/\s+/g, "");
        const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(compact) && compact.length % 4 === 0;
        const looksHex = /^[0-9a-fA-F]+$/.test(compact) && compact.length % 2 === 0;
        if (looksBase64) return Buffer.from(compact, "base64");
        if (looksHex) return Buffer.from(compact, "hex");
        return Buffer.from(value, "latin1");
      }
      if (Buffer.isBuffer(value)) return value;
      if (value instanceof Uint8Array) return Buffer.from(value);
      if (value instanceof ArrayBuffer) return Buffer.from(new Uint8Array(value));
      if (Array.isArray(value) && (value as unknown[]).every((v) => typeof v === "number")) {
        return Buffer.from(value as number[]);
      }
      return Buffer.from([]);
    };

    const buffer = toBuffer(data);
    const base64 = buffer.toString("base64");
    return { data: base64 };
  },
  inputs: {
    data: input({
      label: "Binary Data",
      type: "data",
      required: true,
      comments:
        "Binary payload to convert. Accepts Buffer, Uint8Array, number[] or string. Objects with a 'data' field are also supported.",
    }),
    inputEncoding: input({
      label: "Input Encoding (for strings)",
      type: "string",
      required: false,
      comments: "Encoding of string inputs (e.g., utf8, base64, hex). Ignored for byte arrays.",
      clean: (value): string | undefined =>
        value != null ? util.types.toString(value) : undefined,
    }),
  },
});

export const buildMultipartFromBase64 = action({
  display: {
    label: "Build multipart parts from Base64",
    description:
      "Convert a base64 string (or data URI) into a structure suitable for multipart/form-data",
  },
  perform: async (
    context,
    { fileBase64, filename, contentType, fieldName, additionalFields }
  ) => {
    const name = util.types.toString(filename) || "upload.bin";
    const mime = util.types.toString(contentType) || "application/octet-stream";
    const formField = util.types.toString(fieldName) || "file";

    const toBase64Payload = (value: unknown): string => {
      const str = util.types.toString(value);
      if (!str) return "";
      const trimmed = str.trim();
      if (trimmed.startsWith("data:")) {
        const commaIdx = trimmed.indexOf(",");
        return commaIdx >= 0 ? trimmed.substring(commaIdx + 1) : "";
      }
      return trimmed;
    };

    const payloadBase64 = toBase64Payload(fileBase64);
    if (!payloadBase64) {
      throw new Error("fileBase64 is required and must be a base64 string or data URI");
    }

    // Additional non-file fields (stringified)
    const fieldsObj = ((): Record<string, string> => {
      const obj = (additionalFields as Record<string, unknown>) || {};
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = v == null ? "" : String(v);
      }
      return out;
    })();

    const multipart = {
      fields: fieldsObj,
      files: [
        {
          fieldName: formField,
          filename: name,
          contentType: mime,
          dataBase64: payloadBase64,
        },
      ],
    } as const;

    return { data: { multipart } };
  },
  inputs: {
    fileBase64: input({
      label: "Base64 File",
      type: "data",
      required: true,
      comments:
        "Base64 payload or data URI (data:<mime>;base64,<payload>) for the file",
    }),
    filename: input({
      label: "Filename",
      type: "string",
      required: false,
      default: "upload.bin",
      comments: "Filename to include in the multipart part",
      clean: (value): string => util.types.toString(value, "upload.bin"),
    }),
    contentType: input({
      label: "Content Type",
      type: "string",
      required: false,
      default: "application/octet-stream",
      comments: "MIME type of the file",
      clean: (value): string =>
        util.types.toString(value, "application/octet-stream"),
    }),
    fieldName: input({
      label: "File Field Name",
      type: "string",
      required: false,
      default: "file",
      comments: "Form field name for the file part",
      clean: (value): string => util.types.toString(value, "file"),
    }),
    additionalFields: input({
      label: "Additional Fields",
      type: "jsonForm",
      required: false,
      comments: "Key-value pairs to include as additional form fields",
    }),
  },
});

export const normalizeConfigMappings = action({
  display: {
    label: "Normalize Config Mappings",
    description:
      "Parse nested JSON strings under 'mappings' into proper objects",
  },
  perform: async (context, { payload, selectedContractType }) => {
    const coerceToObject = (value: unknown): Record<string, unknown> => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
      }
      if (typeof value === "string") {
        try {
          return coerceToObject(JSON.parse(value));
        } catch (_err) {
          return {};
        }
      }
      return {};
    };

    const root = coerceToObject(payload);
    const mappings = coerceToObject((root as Record<string, unknown>)["mappings"]);

    // Build contract-type key helper
    const toKey = (ct: string) => ct.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
    const ctKey = toKey(util.types.toString(selectedContractType));

    if (!ctKey) {
      throw new Error("selectedContractType is required");
    }

    // Filter keys for selected contract type and strip suffix
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(mappings)) {
      const suffix = `_${ctKey}`;
      if (key.endsWith(suffix)) {
        const baseKey = key.slice(0, -suffix.length);
        // Parse JSON strings for field selections
        if (typeof value === "string") {
          try {
            filtered[baseKey] = JSON.parse(value);
          } catch (_err) {
            filtered[baseKey] = value;
          }
        } else {
          filtered[baseKey] = value;
        }
      }
    }

    // Validate required matterId present
    if (!Object.prototype.hasOwnProperty.call(filtered, "matterId")) {
      throw new Error(`Missing required mapping: matterId for contract type '${selectedContractType}'`);
    }

    // Ensure optional keys exist with null when not set
    const optionalKeys = [
      "luminanceDocumentLink",
      "luminanceStatus",
      "luminanceAssignee",
      "luminanceLastUpdated",
    ];
    for (const k of optionalKeys) {
      if (!Object.prototype.hasOwnProperty.call(filtered, k)) {
        (filtered as Record<string, unknown>)[k] = null;
      }
    }

    const normalized = {
      mappings: filtered,
      selectedContractType: util.types.toString(selectedContractType),
    } as Record<string, unknown>;

    return { data: normalized };
  },
  inputs: {
    payload: input({
      label: "Payload",
      type: "jsonForm",
      required: true,
      comments:
        "Object with a 'mappings' property where values may be JSON strings",
    }),
    selectedContractType: input({
      label: "Selected Contract Type",
      type: "string",
      required: true,
      comments: "Contract type to extract mappings for (matches config value).",
      clean: (value): string => util.types.toString(value),
    }),
  },
});

export const mapStatusUpdateToConfigVariables = action({
  display: {
    label: "Map Status Update to Config Variables",
    description:
      "Map document_link, assignee, contract_status to Luminance config variable keys",
  },
  perform: async (context, { payload }) => {
    const toObj = (value: unknown): Record<string, unknown> => {
      if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
      if (typeof value === "string") {
        try { return toObj(JSON.parse(value)); } catch { return {}; }
      }
      return {};
    };

    const source = toObj(payload);
    const documentLink = util.types.toString((source as Record<string, unknown>)["document_link"]);
    const assignee = util.types.toString((source as Record<string, unknown>)["assignee"]);
    const status = util.types.toString((source as Record<string, unknown>)["contract_status"]);

    const mapped = {
      luminanceDocumentLink: documentLink,
      luminanceAssignee: assignee,
      luminanceStatus: status,
    } as Record<string, unknown>;

    return { data: mapped };
  },
  inputs: {
    payload: input({
      label: "Status Update JSON",
      type: "jsonForm",
      required: true,
      comments:
        "Object with keys: document_link, assignee, contract_status",
    }),
  },
});

// Removed: buildPlatformDocumentLink. Use documents.createDocumentLink action instead.

