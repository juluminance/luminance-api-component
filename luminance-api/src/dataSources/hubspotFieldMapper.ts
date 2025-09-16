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

      // Prefer hubspot-specific annotations if present and toggle enabled
      const applyHsFilter = (util.types.toString(params.filterHsOnly) || "true").toLowerCase() !== "false";
      const filtered = annTypes.filter((a) => {
        const n = a?.name || "";
        return n.startsWith("hs_") || n.startsWith("HS_");
      });
      const annotationTypesToUse = applyHsFilter ? (filtered.length > 0 ? filtered : annTypes) : annTypes;
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
            type: "Label",
            text: `Showing ${fieldsForForm.length} of ${allFields.length} HubSpot properties${
              filterText ? ` (filtered by "${filterText}")` : ""
            }. Adjust 'Property Filter' or 'Max Options' to refine the list.`,
          },
          {
            type: "Label",
            text: `Showing ${luminanceForForm.length} Luminance annotation types${applyHsFilter ? " (filtered by hs_/HS_)" : ""}. Toggle 'Filter Luminance Tags by hs_/HS_' to change.`,
          },
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

export default { hubspotFieldMapping };


