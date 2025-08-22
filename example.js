module.exports = async (context, { connection, contextValue }) => {

    const accessToken = connection.token.access_token;
    const getApiBaseUrl = (fullUrl) => {
    return fullUrl.replace('/auth/oauth2/token', '');
  };

    const baseUrl = getApiBaseUrl(connection.fields.tokenUrl)

  try {

    const divisionsResponse = await fetch(`${baseUrl}/api2/projects`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Node.js/1.0.0'
      }
    });

    if (!divisionsResponse.ok) {
      const errorData = await divisionsResponse.text();
      throw new Error(`Failed to get divisions: ${divisionsResponse.status} - ${errorData}`);
    }

    const divisions = await divisionsResponse.json();

    // Format the response to match the required structure
    const options = divisions.map((item) => ({
      label: item.name,
      key: item.id
    }));

    return Promise.resolve({
      result: options,
    });

  } catch (error) {
    throw new Error(`Error in annotation types lookup: ${error} ${error.message}`);
  }
};
