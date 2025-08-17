module.exports = async (context, { connection, contextValue }) => {

    const accessToken = connection.token.access_token;
    const getApiBaseUrl = (fullUrl) => {
    return fullUrl.replace('/auth/oauth2/token', '');
  };
    const baseUrl = getApiBaseUrl(connection.fields.tokenUrl)

  try {


    const folderResponse = await fetch(`${baseUrl}/api2/projects/${contextValue}/folders`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Node.js/1.0.0'
      }
    });

    if (!folderResponse.ok) {
      const errorData = await folderResponse.text();
      throw new Error(`Failed to get folders: ${folderResponse.status} - ${errorData}`);
    }

    const folders = await folderResponse.json();

    // Format the response to match the required structure
    const options = folders.map((item) => ({
      label: item.name,
      key: item.id
    }));

    return Promise.resolve({
      result: options,
    });

  } catch (error) {
    throw new Error(`Error in folder lookup: ${error} ${error.message}`);
  }
};
