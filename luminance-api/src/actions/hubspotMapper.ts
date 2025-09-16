import { action, input, util } from "@prismatic-io/spectral";

/* Map HubSpot Record to Luminance Annotations */
export const mapHubSpotToLuminance = action({
  display: {
    label: "Map HubSpot to Luminance",
    description:
      "Map HubSpot record properties to Luminance annotations using field mappings",
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
    recordId: input({
      label: "Record ID",
      type: "string",
      required: true,
      comments:
        "The ID of the HubSpot record to map (e.g., dealId, companyId, contactId)",
    }),
    objectType: input({
      label: "Object Type",
      type: "string",
      required: true,
      comments:
        "HubSpot object type (e.g., 'deals', 'companies', 'contacts' or custom object name)",
    }),
    fieldMappings: input({
      label: "Field Mappings",
      type: "data",
      required: true,
      comments:
        "Select the HubSpot field mappings data source to use for mapping fields",
    }),
  },
  perform: async (
    _context,
    { hubspotConnection, luminanceConnection, recordId, objectType, fieldMappings }
  ) => {
    try {
      const hubspotToken = util.types.toString(
        hubspotConnection.token?.access_token
      );
      if (!hubspotToken) {
        throw new Error("HubSpot connection is missing an access token");
      }

      // Fetch HubSpot record
      // For standard objects: GET /crm/v3/objects/{objectType}/{recordId}
      const recordRes = await fetch(
        `https://api.hubapi.com/crm/v3/objects/${encodeURIComponent(
          util.types.toString(objectType)
        )}/${encodeURIComponent(util.types.toString(recordId))}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${hubspotToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!recordRes.ok) {
        throw new Error(
          `Failed to retrieve HubSpot record: ${recordRes.status} ${recordRes.statusText}`
        );
      }
      const recordJson: any = await recordRes.json();
      const properties: Record<string, unknown> = recordJson?.properties || {};

      // Luminance base URL and token
      const luminanceToken = luminanceConnection.token?.access_token;
      const getApiBaseUrl = (fullUrl: string) => {
        return fullUrl.replace("/auth/oauth2/token", "");
      };
      const baseUrl = getApiBaseUrl(
        util.types.toString(luminanceConnection.fields?.tokenUrl)
      );

      const mappingResults: Array<Record<string, unknown>> = [];
      for (const mapping of (fieldMappings as any).mymappings || []) {
        // Parse the structured field data from HubSpot mapper
        let fieldData: any;
        try {
          fieldData = JSON.parse(mapping.hubspotField);
        } catch (_err) {
          continue;
        }

        const { fieldKey, objectName, fieldType } = fieldData;
        const luminanceFieldId = mapping.luminanceFields;

        // Get value from HubSpot properties set
        const fieldValue = properties[fieldKey];

        const annotationResponse = await fetch(`${baseUrl}/api2/annotations`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${luminanceToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            annotation_type_id: luminanceFieldId,
            value: util.types.toString(fieldValue),
          }),
        });
        if (!annotationResponse.ok) {
          throw new Error(
            `Failed to create annotation: ${annotationResponse.status} ${annotationResponse.statusText}`
          );
        }
        const annotation = (await annotationResponse.json()) as any;

        mappingResults.push({
          objectName,
          fieldKey,
          fieldType,
          hubspotValue: fieldValue,
          luminanceFieldId,
          annotationId: annotation?.id,
        });
      }

      return {
        data: {
          recordId: util.types.toString(recordId),
          objectType: util.types.toString(objectType),
          mappings: mappingResults,
        },
      };
    } catch (error) {
      throw new Error(`Failed to map HubSpot to Luminance: ${error}`);
    }
  },
  examplePayload: {
    data: {
      recordId: "123",
      objectType: "deals",
      mappings: [
        {
          objectName: "deals",
          fieldKey: "dealname",
          fieldType: "string",
          hubspotValue: "Acme Renewal",
          luminanceFieldId: "2233",
          annotationId: "456",
        },
      ],
    },
  },
});

export default { mapHubSpotToLuminance };


