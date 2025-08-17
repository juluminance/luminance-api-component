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
            const luminanceFieldType = mapping.luminanceFieldType || 'text';
            
            // Get the actual value from the Salesforce opportunity data
            let fieldValue = opportunityData[mapping.salesforceopportunityField];
            
            // Align types between Salesforce and Luminance
            const alignedValue = alignFieldTypes(fieldValue, salesforceFieldType, luminanceFieldType);
            
            // Create content object based on aligned type
            let content = {};
            
            // If Salesforce field is date or timestamp, always use timestamp content type
            if (salesforceFieldType === 'date' || salesforceFieldType === 'timestamp') {
                content = {
                    timestamp: alignedValue || new Date().toISOString()
                };
            } else {
                switch(luminanceFieldType) {
                    case 'currency':
                        content = {
                            value: alignedValue.value || 0,
                            currency: alignedValue.currency || "USD"
                        };
                        break;
                    case 'timestamp':
                        content = {
                            timestamp: alignedValue || new Date().toISOString()
                        };
                        break;
                    case 'number':
                        content = {
                            value: alignedValue || 0
                        };
                        break;
                    default: // text and other types
                        content = {
                            value: alignedValue || ""
                        };
                        break;
                }
            }
            
            // Create the annotation structure based on the schema
            const annotation = {
                annotation_type_id: annotationTypeId,
                content: content
            };
            
            return annotation;
        });
    };
    
    // Function to align field types between Salesforce and Luminance
    const alignFieldTypes = (value, salesforceType, luminanceType) => {
        // If types are the same, return value as is
        if (salesforceType === luminanceType) {
            return value;
        }
        
        // Handle type conversions
        switch(salesforceType) {
            case 'currency':
                if (luminanceType === 'number') {
                    return value || 0;
                } else if (luminanceType === 'text') {
                    return value ? value.toString() : "";
                }
                break;
            case 'number':
                if (luminanceType === 'currency') {
                    return {
                        value: value || 0,
                        currency: "USD"
                    };
                } else if (luminanceType === 'text') {
                    return value ? value.toString() : "";
                }
                break;
            case 'date':
                // Convert Salesforce date to ISO timestamp for Luminance
                if (value) {
                    return new Date(value).toISOString();
                }
                return new Date().toISOString();
            case 'timestamp':
                if (luminanceType === 'text') {
                    return value || new Date().toISOString();
                }
                break;
            case 'text':
                if (luminanceType === 'number') {
                    const numValue = parseFloat(value);
                    return isNaN(numValue) ? 0 : numValue;
                } else if (luminanceType === 'currency') {
                    const numValue = parseFloat(value);
                    return {
                        value: isNaN(numValue) ? 0 : numValue,
                        currency: "USD"
                    };
                }
                break;
        }
        
        // Default fallback
        return value;
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
  