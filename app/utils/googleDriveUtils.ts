export const saveToGoogleDrive = async (data: string, fileName: string) => {
  try {
    const file = new Blob([data], { type: 'application/json' });
    const metadata = {
      'name': fileName,
      'mimeType': 'application/json',
    };

    const accessToken = gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    });

    const result = await response.json();
    console.log('File saved to Google Drive:', result);
  } catch (error) {
    console.error('Error saving to Google Drive:', error);
  }
};

export const loadFromGoogleDrive = async (fileName: string) => {
  try {
    const response = await gapi.client.drive.files.list({
      q: `name='${fileName}'`,
      fields: 'files(id, name)',
    });

    const files = response.result.files;
    if (files && files.length > 0) {
      const fileId = files[0].id;
      const fileResponse = await gapi.client.drive.files.get({
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