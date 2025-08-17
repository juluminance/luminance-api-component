/*
  Access config variables by name through the configVars object. e.g.
    const apiEndpoint = `${configVars["App Base URL"]}/api`;

  Access previous steps' results through the stepResults object. Trigger
  and step names are camelCased. If the step "Get Data from API" returned
  {"foo": "bar", "baz": 123}, you could destructure that data with:
    const { foo, baz } = stepResults.getDataFromApi.results;

  You can return string, number or complex object data. e.g.
    return { data: { foo: "Hello", bar: 123.45, baz: true } };
*/

module.exports = async ({ logger, configVars }, stepResults) => {

    tags = configVars["Salesforce for Luminance Mapping"].mymappings

    // Function to map Salesforce fields to Luminance annotation structure
    
    const mapToLuminanceAnnotations = (mappings, opportunityData) => {
        return mappings.map(mapping => {
            const annotationTypeId = parseInt(mapping.luminanceFields);
            const salesforceFieldType = mapping.salesforceFieldType || 'text';
            
            // Get the actual value from the Salesforce opportunity data
            const fieldValue = opportunityData[mapping.salesforceopportunityField];
            
            // Create content object based on Salesforce field type
            let content = {};
            
            switch(salesforceFieldType) {
                case 'currency':
                    content = {
                        value: fieldValue || 0,
                        currency: "USD"
                    };
                    break;
                case 'timestamp':
                    content = {
                        timestamp: fieldValue || new Date().toISOString()
                    };
                    break;
                case 'number':
                    content = {
                        value: fieldValue || 0
                    };
                    break;
                default: // text and other types
                    content = {
                        value: fieldValue || ""
                    };
                    break;
            }
            
            // Create the annotation structure based on the schema
            const annotation = {
                annotation_type_id: annotationTypeId,
                content: content
            };
            
            return annotation;
        });
    };
    
    // Get the Salesforce opportunity data from stepResults
    const opportunityData = stepResults.findOpportunity.results;
    
    // Create the Luminance annotations structure
    const luminanceAnnotations = mapToLuminanceAnnotations(tags, opportunityData);

    // Generate a short GUID (8 characters)
    const shortGuid = Math.random().toString(36).substring(2, 10);
    
    const requestPayload = {
        "name": `Contract Mapping NDA Test - ${shortGuid}`,
        "required_matter_annotations": luminanceAnnotations
    }

    logger.info("configVars", configVars);
    logger.info("payload", luminanceAnnotations);

    return requestPayload;
  };
  