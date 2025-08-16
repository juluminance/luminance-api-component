module.exports = async (context, { connection, contextValue }) => {

  client_creds = JSON.parse(contextValue)
  // Configuration
  const BASE_URL = client_creds.baseurl;
  const CLIENT_ID = client_creds.clientid;
  const CLIENT_SECRET = client_creds.clientsecret;

  try {
    // Step 1: Get OAuth token
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    
    const authHeader = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`;
    
    const tokenResponse = await fetch(`${BASE_URL}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
        'User-Agent': 'Node.js/1.0.0'
      },
      body: formData
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`Failed to get token: ${tokenResponse.status} - ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Get annotation types
    const annotationsResponse = await fetch(`${BASE_URL}/api2/projects/${client_creds.division}/folders`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Node.js/1.0.0'
      }
    });

    if (!annotationsResponse.ok) {
      const errorData = await annotationsResponse.text();
      throw new Error(`Failed to get annotation types: ${annotationsResponse.status} - ${errorData}`);
    }

    const annotations = await annotationsResponse.json();

    // Format the response to match the required structure
    const options = annotations.map((item) => ({
      label: item.name,
      key: item.id
    }));

    return Promise.resolve({
      result: options,
    });

  } catch (error) {
    throw new Error(`Error in annotation types lookup: ${client_creds.baseurl} ${error.message}`);
  }
};
