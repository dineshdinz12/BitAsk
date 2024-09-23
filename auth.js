const { GoogleAuth } = require('google-auth-library');
const path = require('path');

// If you are using a JSON file, you can load it like this
const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'config', 'gcp-service-account.json');

async function getAccessToken() {
  try {
    const auth = new GoogleAuth({
      keyFile: keyFilePath, // Path to the service account key file
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    return accessToken.token;
  } catch (error) {
    console.error("Error getting access token: ", error);
    throw error;
  }
}

module.exports = getAccessToken;
