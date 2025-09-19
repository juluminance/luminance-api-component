import { dataSource, input, util } from "@prismatic-io/spectral";

/*
  HubSpot <> Luminance Matters Tag Mapper
  - Fetches HubSpot object properties and Luminance annotation types
  - Presents a JSON Form allowing users to map HubSpot properties to Luminance annotations
*/
export const hubspotFieldMapping = dataSource({
  dataSourceType: "jsonForm",
  display: {
    label: "HubSpot <> Luminance Matters Tag Mapper",
    description: "Map fields between HubSpot CRM Objects and Luminance Matters Tags",
  },
  inputs: {
    hubspotConnection: input({
      label: "HubSpot Connection",
      type: "connection",
      required: true,
    }),
    luminanceConnection: input({
      label: "Luminance Connection",
      type: "connection",
      required: true,
    }),
    hubspotObjects: input({
      label: "HubSpot Objects",
      type: "string",
      required: true,
      comments:
        "Comma-separated HubSpot object types (e.g., 'companies, contacts, deals' or custom object names)",
    }),
    filterHsOnly: input({
      label: "Filter Luminance Tags by hs_/HS_",
      type: "string",
      required: false,
      comments: "Only include Luminance annotation types whose names start with hs_ or HS_ (fallback to all if none)",
      default: "true",
    }),
    propertyFilter: input({
      label: "Property Filter (optional)",
      type: "string",
      required: false,
      comments: "Filter properties by name or label to reduce list size",
    }),
    maxOptions: input({
      label: "Max Options (optional)",
      type: "string",
      required: false,
      comments: "Maximum options to render per dropdown (default: 500)",
      default: "500",
    }),
  },
  perform: async (_context, params) => {
    try {
      // Prepare HubSpot API base and auth
      const hubspotToken = util.types.toString(params.hubspotConnection.token?.access_token);
      if (!hubspotToken) {
        throw new Error("HubSpot connection is missing an access token");
      }

      // Build list of object types to inspect
      const objectTypes = util.types
        .toString(params.hubspotObjects)
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      if (!objectTypes.length) {
        throw new Error("At least one HubSpot object must be specified");
      }

      // HubSpot CRM Properties API per object
      // GET https://api.hubapi.com/crm/v3/properties/{objectType}
      const allFields: Array<{
        objectName: string;
        name: string;
        label: string;
        type: string;
      }> = [];

      for (const objectName of objectTypes) {
        const propertiesRes = await fetch(
          `https://api.hubapi.com/crm/v3/properties/${encodeURIComponent(objectName)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${hubspotToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!propertiesRes.ok) {
          throw new Error(
            `Failed to fetch HubSpot properties for '${objectName}': ${propertiesRes.status} ${propertiesRes.statusText}`
          );
        }
        const propertiesJson: any = await propertiesRes.json();
        const properties = Array.isArray(propertiesJson?.results)
          ? propertiesJson.results
          : [];
        for (const prop of properties) {
          allFields.push({
            objectName,
            name: util.types.toString(prop.name),
            label: util.types.toString(prop.label || prop.name),
            type: util.types.toString(prop.type || prop.fieldType || "string"),
          });
        }
      }

      if (!allFields.length) {
        throw new Error("No accessible properties found for the specified HubSpot objects");
      }

      // Apply optional filter and cap size to avoid large JSONForm payloads
      const filterText = (util.types.toString(params.propertyFilter) || "").toLowerCase().trim();
      const maxOptions = util.types.toNumber(params.maxOptions) || 500;
      const filteredFields = filterText
        ? allFields.filter((f) =>
            f.name.toLowerCase().includes(filterText) ||
            f.label.toLowerCase().includes(filterText) ||
            f.objectName.toLowerCase().includes(filterText)
          )
        : allFields;
      // Sort for stable UX
      filteredFields.sort((a, b) =>
        a.objectName.localeCompare(b.objectName) || a.label.localeCompare(b.label)
      );
      const fieldsForForm = filteredFields.slice(0, Math.max(1, maxOptions));

      // Luminance annotation types
      const luminanceToken = params.luminanceConnection.token?.access_token;
      const extractBaseUrl = (fullUrl: string) => fullUrl.replace("/auth/oauth2/token", "");
      const baseUrl = extractBaseUrl(util.types.toString(params.luminanceConnection.fields?.tokenUrl));

      const annTypesRes = await fetch(`${baseUrl}/api2/annotation_types?limit=null`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${luminanceToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!annTypesRes.ok) {
        throw new Error(
          `Failed to fetch annotation types: ${annTypesRes.status} ${annTypesRes.statusText}`
        );
      }
      const annTypes = (await annTypesRes.json()) as any[];

      // Prefer hubspot-specific annotations if toggle enabled (strict: no fallback)
      const applyHsFilter = (util.types.toString(params.filterHsOnly) || "true").toLowerCase() !== "false";
      const filtered = annTypes.filter((a) => {
        const n = (a?.name ? String(a.name) : "").trim().toLowerCase();
        return n.startsWith("hs_");
      });
      const annotationTypesToUse = applyHsFilter ? filtered : annTypes;
      const luminanceTags = annotationTypesToUse.map((a) => ({
        label: a?.name || `Annotation Type ${a?.id}`,
        key: a?.id,
        type: a?.type || "unknown",
      }));
      const luminanceForForm = luminanceTags.slice(0, Math.max(1, maxOptions));

      // Build JSON Form schema matching Salesforce mapper shape: mymappings[{ hubspotField, luminanceFields }]
      const schema = {
        type: "object",
        properties: {
          mymappings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hubspotField: {
                  type: "string",
                  oneOf: fieldsForForm.map((field) => ({
                    title: `${field.label} (${field.objectName})`,
                    const: JSON.stringify({
                      fieldKey: field.name,
                      objectName: field.objectName,
                      fieldType: field.type,
                      isCustom: false,
                    }),
                  })),
                },
                luminanceFields: {
                  type: "string",
                  oneOf: luminanceForForm.map((t) => ({
                    title: `${util.types.toString(t.label)} (${util.types.toString(t.type)})`,
                    const: util.types.toString(t.key),
                  })),
                },
              },
            },
          },
        },
      } as const;

      const uiSchema = {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/mymappings",
            label: "HubSpot <> Luminance Field Mapper",
          },
        ],
      } as const;

      return { result: { schema, uiSchema } };
    } catch (err) {
      throw new Error(`Failed to load HubSpot field mapping configuration: ${err}`);
    }
  },
});

export const hubspotConfigFieldPicker = dataSource({
  dataSourceType: "jsonForm",
  display: {
    label: "HubSpot Field Picker for Status Updates",
    description:
      "Let users pick HubSpot properties for updates to Luminance Statuses",
  },
  inputs: {
    hubspotConnection: input({
      label: "HubSpot Connection",
      type: "connection",
      required: true,
    }),
    hubspotObjects: input({
      label: "HubSpot Objects",
      type: "string",
      required: true,
      comments: "Comma-separated HubSpot object types (e.g., 'contacts, companies, deals')",
    }),
    contractTypesConfig: input({
      label: "Contract Types (Config)",
      type: "string",
      required: false,
      comments: "Config-provided contract types; overrides manual input if present.",
    }),
  },
  perform: async (_context, params) => {
    // Optional tags to map per contract type (all treated as text)
    const optionalTags: Array<{ key: string; label: string }> = [
      { key: "luminanceDocumentLink", label: "Luminance Document Link" },
      { key: "luminanceStatus", label: "Luminance Status" },
      { key: "luminanceAssignee", label: "Luminance Assignee" },
      { key: "luminanceLastUpdated", label: "Luminance Last Updated" },
    ];

    const hubspotToken = util.types.toString(params.hubspotConnection.token?.access_token);
    if (!hubspotToken) {
      throw new Error("HubSpot connection is missing an access token");
    }

    // Collect properties across specified HubSpot objects
    const objectNames = util.types
      .toString(params.hubspotObjects)
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (!objectNames.length) {
      throw new Error("At least one HubSpot object must be specified");
    }

    // Parse contract types (prefer config-provided value)
    const contractTypesSource = util.types.toString(params.contractTypesConfig);
    const contractTypes = contractTypesSource
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (!contractTypes.length) {
      const schema: any = { type: "object", properties: {} };
      const uiSchema = {
        type: "VerticalLayout",
        elements: [
          { type: "Label", text: "Set the Contract Types config variable to configure per-contract mappings (e.g., 'NDA, MSA')." },
        ],
      };
      return { result: { schema, uiSchema } };
    }
    const toKey = (ct: string) =>
      ct.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();

    const allFields: Array<{ objectName: string; name: string; label: string; type: string }> = [];
    for (const objectName of objectNames) {
      try {
        const res = await fetch(
          `https://api.hubapi.com/crm/v3/properties/${encodeURIComponent(objectName)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${hubspotToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          continue;
        }
        const json: any = await res.json();
        const properties = Array.isArray(json?.results) ? json.results : [];
        for (const prop of properties) {
          allFields.push({
            objectName,
            name: util.types.toString(prop.name),
            label: util.types.toString(prop.label || prop.name),
            type: util.types.toString(prop.type || prop.fieldType || "string"),
          });
        }
      } catch {
        // Skip objects that aren't available
      }
    }

    if (!allFields.length) {
      throw new Error("No accessible properties found for the specified HubSpot objects");
    }

    // Build JSON Form schema with per-contract-type pickers
    const mappingProperties: Record<string, any> = {};
    const defaultMappings: Record<string, any> = {};
    const requiredMatterIds: string[] = [];

    for (const ct of contractTypes) {
      const ctKey = toKey(ct);
      const matterFieldKey = `matterId_${ctKey}`;

      // Required Matter ID per contract type
      mappingProperties[matterFieldKey] = {
        type: "string",
        title: `Matter ID (${ct})`,
        oneOf: allFields.map((field) => ({
          title: `${field.label} (${field.objectName})`,
          const: JSON.stringify({
            fieldKey: field.name,
            objectName: field.objectName,
            fieldType: field.type,
            isCustom: false,
          }),
        })),
      };
      requiredMatterIds.push(matterFieldKey);

      // Optional additional mappings per contract type
      for (const tag of optionalTags) {
        const tagKey = `${tag.key}_${ctKey}`;
        mappingProperties[tagKey] = {
          type: ["string", "null"],
          title: `${tag.label} (${ct})`,
          default: null,
          oneOf: allFields.map((field) => ({
            title: `${field.label} (${field.objectName})`,
            const: JSON.stringify({
              fieldKey: field.name,
              objectName: field.objectName,
              fieldType: field.type,
              isCustom: false,
            }),
          })),
        };
        // Ensure optional keys appear in payload as null when not selected
        defaultMappings[tagKey] = null;
      }
    }

    const schema: any = {
      type: "object",
      properties: {
        mappings: {
          type: "object",
          properties: mappingProperties,
          required: requiredMatterIds,
          default: defaultMappings,
        },
      },
    };

    const uiSchema = {
      type: "VerticalLayout",
      elements: contractTypes.map((ct) => {
        const ctKey = toKey(ct);
        return {
          type: "Group",
          label: `Mappings for ${ct}`,
          elements: [
            { type: "Control", scope: `#/properties/mappings/properties/matterId_${ctKey}`, label: `Matter ID (${ct})` },
            ...optionalTags.map((tag) => ({
              type: "Control",
              scope: `#/properties/mappings/properties/${tag.key}_${ctKey}`,
              label: `${tag.label} (${ct})`,
            })),
          ],
        };
      }),
    };

    return { result: { schema, uiSchema } };
  },
});

export default { hubspotFieldMapping, hubspotConfigFieldPicker };


