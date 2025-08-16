module.exports = async (context, { connection, contextValue }) => {
  // Configuration
  const BASE_URL = 'https://luminance-integrations-corporate.app.luminance.com';
  const CLIENT_ID = 'a18b730bb0e94e6e9d85a2730a6ef29b';
  const CLIENT_SECRET = 'ab242f41bbf247b8a68825b16661f751';

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
    const annotationsResponse = await fetch(`${BASE_URL}/api2/projects/${contextValue}/folders`, {
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
    throw new Error(`Error in annotation types lookup: ${contextValue}`);
  }
};
