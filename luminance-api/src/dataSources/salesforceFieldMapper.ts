import jsforce from "jsforce";
import { dataSource, input, util } from "@prismatic-io/spectral";

export const salesforceFieldMappingExample = dataSource({
  dataSourceType: "jsonForm",
  display: {
    label: "Salesforce <> Luminance Matters Tag Mapper",
    description: "Map fields between Salesforce Objects and Luminance Matters Tags",
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
    salesforceObjects: input({
      label: "Salesforce Objects",
      type: "string",
      required: true,
      comments: "Enter comma-separated object names (e.g., 'Account', 'Account, Opportunity', 'Custom_Object__c')",
    }),
  },
  perform: async (context, params) => {
    let annotationTypesData: any[] = [];
    let luminanceTags: any[] = [];
    
    try {
      // Reference an existing SFDC OAuth access token
      const salesforceClient = new jsforce.Connection({
        instanceUrl: util.types.toString(params.sfConnection.token?.instance_url),
        version: "51.0",
        accessToken: util.types.toString(params.sfConnection.token?.access_token),
      });

      // Fetch all fields on a opportunity using https://jsforce.github.io/document/#describe
      // Parse comma-separated object names
      const objectNames = util.types.toString(params.salesforceObjects)
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      if (objectNames.length === 0) {
        throw new Error('At least one Salesforce object must be specified');
      }

      console.log(`Processing ${objectNames.length} Salesforce objects: ${objectNames.join(', ')}`);

      // Collect fields from all specified objects
      const allFields: any[] = [];
      const successfulObjects: string[] = [];
      const failedObjects: string[] = [];

      for (const objectName of objectNames) {
        try {
          console.log(`Processing Salesforce object: ${objectName}`);
          
          // Get object description from Salesforce (supports any object type)
          const objectDescription = await salesforceClient.sobject(objectName).describe();
          
          // Filter fields to only include accessible, non-deprecated fields
          // Include read-only fields that are commonly needed for mapping (Id, Name, etc.)
          const commonlyNeededFields = ['Id', 'Name', 'CreatedDate', 'LastModifiedDate', 'OwnerId'];
          const accessibleFields = objectDescription.fields.filter((field: any) => 
            field.deprecatedAndHidden !== true &&
            (field.updateable !== false || commonlyNeededFields.includes(field.name))
          );
          
          // Add object context to each field
          const fieldsWithContext = accessibleFields.map((field: any) => ({
            ...field,
            objectName: objectName,
            // Create a unique identifier for the field
            fieldKey: `${objectName}:${field.name}`,
            // Add field type information
            fieldType: field.type,
            isCustom: field.custom || false
          }));
          
          allFields.push(...fieldsWithContext);
          successfulObjects.push(objectName);
          
          console.log(`Successfully processed ${objectName}: ${accessibleFields.length} accessible fields`);
        } catch (error: any) {
          console.error(`Failed to process object ${objectName}:`, error);
          failedObjects.push(objectName);
          
          // Provide specific error messages for common issues
          if (error.errorCode === 'INVALID_TYPE') {
            console.error(`Object '${objectName}' does not exist in Salesforce`);
          } else if (error.errorCode === 'INSUFFICIENT_ACCESS') {
            console.error(`Insufficient access to object '${objectName}'`);
          }
        }
      }

      if (allFields.length === 0) {
        throw new Error(`No accessible fields found for any of the specified objects: ${objectNames.join(', ')}`);
      }

      console.log(`Total fields available: ${allFields.length} from ${successfulObjects.length} objects`);
      if (failedObjects.length > 0) {
        console.warn(`Failed to process objects: ${failedObjects.join(', ')}`);
      }

      const luminanceToken = params.luminanceConnection.token?.access_token;
      const getApiBaseUrl = (fullUrl: string) => {
        return fullUrl.replace('/auth/oauth2/token', '');
      };
      const baseUrl = getApiBaseUrl(util.types.toString(params.luminanceConnection.fields?.tokenUrl))

      // Fetch annotation types from Luminance API
      const annotationTypesResponse = await fetch(`${baseUrl}/api2/annotation_types?limit=null`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${luminanceToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!annotationTypesResponse.ok) {
        throw new Error(`Failed to fetch annotation types: ${annotationTypesResponse.status} ${annotationTypesResponse.statusText}`);
      }

      annotationTypesData = await annotationTypesResponse.json() as any[];

      // Filter annotation types to only include those with names starting with sf_ or SF_
      const filteredAnnotationTypes = annotationTypesData.filter((item) => {
        const name = item.name || '';
        return name.startsWith('sf_') || name.startsWith('SF_');
      });

      // If no filtered annotation types found, use all annotation types as fallback
      const annotationTypesToUse = filteredAnnotationTypes.length > 0 ? filteredAnnotationTypes : annotationTypesData;

      // Ensure annotationTypesData is an array and has the expected structure
       luminanceTags = annotationTypesToUse.map((item) => ({
        label: item.name || `Annotation Type ${item.id}`, // Fallback if name is null
        key: item.id,
        type: item.type || 'unknown' // Include the type field
      }));

      // Schema defines the shape of the object to be returned to the integration,
      // along with options for dropdown menus
      const schema = {
        type: "object",
        properties: {
          mymappings: {
            // Arrays allow users to make one or more mappings
            type: "array",
            items: {
              // Each object in the array should contain a salesforceField and an acmeField
              type: "object",
              properties: {
                salesforceField: {
                  type: "string",
                  // Have users select "one of" a dropdown of items
                  oneOf: allFields.map((field) => ({
                    // Display the pretty "label" with object context like "Account Id (Account)" to the user
                    title: `${field.label} (${field.objectName})`,
                    // Feed structured data with object context to the integration
                    const: JSON.stringify({
                      fieldKey: field.name,
                      objectName: field.objectName,
                      fieldType: field.fieldType,
                      isCustom: field.isCustom
                    }),
                  })),
                },
                luminanceFields: {
                  type: "string",
                  oneOf: luminanceTags.map((field: any) => ({
                    title: `${util.types.toString(field.label)} (${util.types.toString(field.type)})`, // Include type in the display
                    const: util.types.toString(field.key), // JSON Forms requires string values
                  })),
                },
              },
            },
          },
        },
      };

      // UI Schema defines how the schema should be displayed in the configuration wizard
      const uiSchema = {
        type: "VerticalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/mymappings",
            label: "Salesforce <> Luminance Field Mapper",
          },
        ],
      };

      return {
        result: { schema, uiSchema},
      };
    } catch (error) {
      console.error("Error in Salesforce field mapping data source:", error);
      throw new Error(`Failed to load Salesforce field mapping configuration: ${error}`);
    }
  },
});

export const salesforceConfigFieldPicker = dataSource({
  dataSourceType: "jsonForm",
  display: {
    label: "Salesforce Field Picker for Status Updates",
    description:
      "Let users pick Salesforce fields for updates to Salesforce Statuses",
  },
  inputs: {
    sfConnection: input({
      label: "Salesforce Connection",
      type: "connection",
      required: true,
    }),
    salesforceObjects: input({
      label: "Salesforce Objects",
      type: "string",
      required: true,
      comments: "Comma-separated object names (e.g., 'Account, Opportunity')",
    }),
  },
  perform: async (context, params) => {
    // Preset variables
    const variables: Array<{ key: string; label: string }> = [
      { key: "luminanceDocumentLink", label: "Luminance Document Link" },
      { key: "luminanceStatus", label: "Luminance Status" },
      { key: "luminanceAssignee", label: "Luminance Assignee" },
    ];

    // Create Salesforce client
    const salesforceClient = new jsforce.Connection({
      instanceUrl: util.types.toString(params.sfConnection.token?.instance_url),
      version: "51.0",
      accessToken: util.types.toString(params.sfConnection.token?.access_token),
    });

    // Collect fields across specified objects
    const objectNames = util.types
      .toString(params.salesforceObjects)
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (!objectNames.length) {
      throw new Error("At least one Salesforce object must be specified");
    }

    const allFields: any[] = [];
    for (const objectName of objectNames) {
      try {
        const description = await salesforceClient.sobject(objectName).describe();
        const commonlyNeededFields = ["Id", "Name", "CreatedDate", "LastModifiedDate", "OwnerId"];
        const accessibleFields = description.fields.filter(
          (field: any) => field.deprecatedAndHidden !== true && (field.updateable !== false || commonlyNeededFields.includes(field.name))
        );
        const fieldsWithContext = accessibleFields.map((field: any) => ({
          ...field,
          objectName,
          fieldKey: `${objectName}:${field.name}`,
          fieldType: field.type,
          isCustom: field.custom || false,
        }));
        allFields.push(...fieldsWithContext);
      } catch (_err) {
        // Skip objects that aren't available in the org
      }
    }

    if (!allFields.length) {
      throw new Error("No accessible fields found for the specified objects");
    }

    // Build JSON Form schema with one picker per variable
    const schema: any = {
      type: "object",
      properties: {
        mappings: {
          type: "object",
          properties: variables.reduce((acc, v) => {
            acc[v.key] = {
              type: "string",
              title: v.label,
              oneOf: allFields.map((field) => ({
                title: `${field.label} (${field.objectName})`,
                const: JSON.stringify({ fieldKey: field.name, objectName: field.objectName, fieldType: field.fieldType, isCustom: field.isCustom }),
              })),
            };
            return acc;
          }, {} as Record<string, any>),
        },
      },
    };

    const uiSchema = {
      type: "VerticalLayout",
      elements: [
        ...variables.map((v) => ({
          type: "Control",
          scope: `#/properties/mappings/properties/${v.key}`,
          label: v.label,
        })),
      ],
    };

    return { result: { schema, uiSchema } };
  },
});

export default { salesforceFieldMappingExample, salesforceConfigFieldPicker };
