declare global {
  interface Window {
    gapi: any;
  }
}

export const initializeGoogleDriveAPI = () => {
  return new Promise<void>((resolve, reject) => {
    window.gapi.load('client', () => {
      window.gapi.client.init({
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        discoveryDocs: [process.env.REACT_APP_GOOGLE_DISCOVERY_DOCS],
        scope: 'https://www.googleapis.com/auth/drive.file'
      }).then(() => {
        console.log('Google Drive API initialized');
        resolve();
      }).catch((error: any) => {
        console.error('Error initializing Google Drive API', error);
        reject(error);
      });
    });
  });
};

export const loadFromGoogleDrive = async (fileName: string): Promise<any> => {
  try {
    const response = await window.gapi.client.drive.files.list({
      q: `name='${fileName}'`,
      fields: 'files(id, name)',
    });

    const files = response.result.files;
    if (files && files.length > 0) {
      const fileId = files[0].id;
      const fileResponse = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });
      return JSON.parse(fileResponse.body);
    }
    return null;
  } catch (error) {
    console.error('Error loading from Google Drive:', error);
    return null;
  }
};

export const saveToGoogleDrive = async (data: string, fileName: string): Promise<void> => {
  try {
    const file = new Blob([data], { type: 'application/json' });
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
    };

    const accessToken = window.gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    });
  } catch (error) {
    console.error('Error saving to Google Drive:', error);
  }
};