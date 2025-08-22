import { action, input, util } from "@prismatic-io/spectral";
import jsforce from "jsforce";

/* Map Salesforce Record to Luminance Annotations */
export const mapSalesforceToLuminance = action({
  display: {
    label: "Map Salesforce to Luminance",
    description: "Map Salesforce record fields to Luminance annotations using field mappings",
  },
  inputs: {
    sfConnection: input({
      label: "Salesforce Connection",
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
      comments: "The ID of the Salesforce record to map (e.g., Opportunity ID, Account ID, etc.)",
    }),
    objectType: input({
      label: "Object Type",
      type: "string",
      required: true,
      comments: "The Salesforce object type (e.g., 'Opportunity', 'Account', 'Custom_Object__c')",
    }),
    fieldMappings: input({
      label: "Field Mappings",
      type: "data",
      required: true,
      comments: "Select the field mappings data source to use for mapping fields",
    }),
  },
  perform: async (context, { sfConnection, luminanceConnection, recordId, objectType, fieldMappings }) => {
    try {
      // Initialize Salesforce client
      const salesforceClient = new jsforce.Connection({
        instanceUrl: util.types.toString(sfConnection.token?.instance_url),
        version: "51.0",
        accessToken: util.types.toString(sfConnection.token?.access_token),
      });

      // Get the record with all its field values
      const record = await salesforceClient.sobject(util.types.toString(objectType)).retrieve(util.types.toString(recordId));
      
      // Initialize Luminance client
      const luminanceToken = luminanceConnection.token?.access_token;
      const getApiBaseUrl = (fullUrl: string) => {
        return fullUrl.replace('/auth/oauth2/token', '');
      };
      const baseUrl = getApiBaseUrl(util.types.toString(luminanceConnection.fields?.tokenUrl));

      // Process each mapping
      const mappingResults = [];
      
      for (const mapping of (fieldMappings as any).mymappings) {
        // Parse the structured field data
        let fieldData: any;
        try {
          fieldData = JSON.parse(mapping.salesforceField);
        } catch (error) {
          console.error('Failed to parse field data:', error);
          continue;
        }

        const { fieldKey, objectName, fieldType, isCustom } = fieldData;
        
        // Get the Luminance annotation type ID from the mapping (e.g., "2233")
        const luminanceFieldId = mapping.luminanceFields;
        
        // THIS IS THE KEY PART: Use the field key to get the actual value from the record
        // If fieldKey = "Id", then fieldValue = "006gK000000MkfYQAS" (the actual record ID)
        // If fieldKey = "Name", then fieldValue = "Acme Corp Deal" (the actual record name)
        const fieldValue = record[fieldKey];
        
        console.log(`Object: ${objectName}, Field: ${fieldKey}, Type: ${fieldType}, Custom: ${isCustom}, Value: ${fieldValue}`);
        
        // Create annotation in Luminance using the actual field value
        const annotationResponse = await fetch(`${baseUrl}/api2/annotations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${luminanceToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            annotation_type_id: luminanceFieldId, // This is the actual annotation type ID (e.g., "2233")
            value: util.types.toString(fieldValue), // This is the actual field value (e.g., "006gK000000MkfYQAS")
          }),
        });

        if (!annotationResponse.ok) {
          throw new Error(`Failed to create annotation: ${annotationResponse.status} ${annotationResponse.statusText}`);
        }

        const annotation = await annotationResponse.json() as any;
        
        mappingResults.push({
          objectName: objectName, // Object name (e.g., "Account", "Opportunity")
          fieldKey: fieldKey, // Field name (e.g., "Id", "Name")
          fieldType: fieldType, // Field type (e.g., "string", "picklist")
          isCustom: isCustom, // Whether it's a custom field
          salesforceValue: fieldValue, // Actual value (e.g., "006gK000000MkfYQAS")
          luminanceFieldId: luminanceFieldId, // Annotation type ID (e.g., "2233")
          annotationId: annotation.id,
        });
      }

      return { 
        data: {
          recordId: util.types.toString(recordId),
          objectType: util.types.toString(objectType),
          mappings: mappingResults,
        }
      };
    } catch (error) {
      console.error("Error mapping opportunity to Luminance:", error);
      throw new Error(`Failed to map opportunity to Luminance: ${error}`);
    }
  },
  examplePayload: {
    data: {
      recordId: "006gK000000MkfYQAS",
      objectType: "Opportunity",
      mappings: [
        {
          objectName: "Opportunity", // Object name for context
          fieldKey: "Id", // Field name
          fieldType: "id", // Field type
          isCustom: false, // Standard field
          salesforceValue: "006gK000000MkfYQAS", // This is the actual record ID value
          luminanceFieldId: "2233", // This is the actual annotation type ID
          annotationId: "456",
        },
        {
          objectName: "Opportunity", // Object name for context
          fieldKey: "Name", // Field name
          fieldType: "string", // Field type
          isCustom: false, // Standard field
          salesforceValue: "Acme Corp Deal", // This is the actual record name
          luminanceFieldId: "789", // This is the actual annotation type ID
          annotationId: "012",
        },
      ],
    },
  },
});

export default { mapSalesforceToLuminance };
