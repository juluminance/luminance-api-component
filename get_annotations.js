// Configuration
const BASE_URL = 'https://luminance-integrations-corporate.app.luminance.com';
const CLIENT_ID = 'a18b730bb0e94e6e9d85a2730a6ef29b';
const CLIENT_SECRET = 'ab242f41bbf247b8a68825b16661f751';

// Function to get OAuth token
async function getToken() {
  console.log('Getting OAuth token...');
  
  const formData = new URLSearchParams();
  formData.append('grant_type', 'client_credentials');
  
  const authHeader = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`;
  
  try {
    const response = await fetch(`${BASE_URL}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
        'User-Agent': 'Node.js/1.0.0'
      },
      body: formData
    });
    
    console.log('Token response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Token obtained successfully');
      return data.access_token;
    } else {
      const errorData = await response.text();
      throw new Error(`Failed to get token: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.error('Error getting token:', error.message);
    throw error;
  }
}

// Function to get annotation types
async function getAnnotationTypes(accessToken) {
  console.log('Getting annotation types...');
  
  try {
    const response = await fetch(`${BASE_URL}/api2/annotation_types?limit=null`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Node.js/1.0.0'
      }
    });
    
    console.log('Annotation types response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Annotation types retrieved successfully');
      
      // Format the response to match the required structure
      const formattedOptions = data.map(item => ({
        object: {
          label: item.name,
          key: item.id
        }
      }));
      
      return formattedOptions;
    } else {
      const errorData = await response.text();
      throw new Error(`Failed to get annotation types: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.error('Error getting annotation types:', error.message);
    throw error;
  }
}

// Main function to orchestrate the API calls
async function main() {
  try {
    // Step 1: Get OAuth token
    const accessToken = await getToken();
    console.log('Access token:', accessToken);
    
    // Step 2: Get annotation types using the token
    const annotationTypes = await getAnnotationTypes(accessToken);
    console.log('Annotation types:', JSON.stringify(annotationTypes, null, 2));
    
  } catch (error) {
    console.error('Error in main function:', error.message);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  getToken,
  getAnnotationTypes,
  main
};