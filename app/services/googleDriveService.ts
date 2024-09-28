declare global {
  interface Window {
    gapi: any;
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          prompt: () => void;
          revoke: (token: string, callback: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: (options?: { prompt?: string }) => Promise<any>;
          };
        };
      };
    };
  }
}

let tokenClient: any = null;
let isInitialized = false;
let currentAccessToken: string | null = null;
let tokenExpirationTime: number | null = null;

export const initializeGoogleDriveAPI = () => {
  return new Promise<void>((resolve, reject) => {
    if (isInitialized) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = async () => {
      try {
        await new Promise<void>((resolveGapi) => {
          const gapiScript = document.createElement('script');
          gapiScript.src = 'https://apis.google.com/js/api.js';
          gapiScript.onload = () => {
            window.gapi.load('client', async () => {
              await window.gapi.client.init({
                apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
                discoveryDocs: [process.env.REACT_APP_GOOGLE_DISCOVERY_DOCS],
              });
              resolveGapi();
            });
          };
          document.body.appendChild(gapiScript);
        });

        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
          callback: '', // defined later
        });

        isInitialized = true;
        resolve();
      } catch (error) {
        console.error('Error initializing Google Drive API:', error);
        reject(error);
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google API script'));
    };
    document.body.appendChild(script);
  });
};

const getAccessToken = async () => {
  if (!isInitialized || !tokenClient) {
    await initializeGoogleDriveAPI();
  }

  if (currentAccessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return currentAccessToken;
  }

  return new Promise<string>((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client is not initialized'));
      return;
    }

    tokenClient.callback = (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      } else {
        currentAccessToken = resp.access_token;
        tokenExpirationTime = Date.now() + resp.expires_in * 1000;
        resolve(resp.access_token);
      }
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const loadFromGoogleDrive = async (fileName: string): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
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
    console.log('Saving to Google Drive:', fileName);
    const accessToken = await getAccessToken();
    console.log('Access token obtained');

    const file = new Blob([data], { type: 'application/json' });
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: ['root']
    };

    console.log('Checking for existing file');
    const existingFileResponse = await window.gapi.client.drive.files.list({
      q: `name='${fileName}' and 'root' in parents`,
      fields: 'files(id, name, webViewLink)',
    });

    const existingFiles = existingFileResponse.result.files;
    console.log('Existing files:', existingFiles);

    let method = 'POST';
    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

    if (existingFiles && existingFiles.length > 0) {
      console.log('Existing file found, attempting to update');
      const fileId = existingFiles[0].id;
      method = 'PATCH';
      url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,webViewLink`;
    } else {
      console.log('No existing file found, creating new file');
    }

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    console.log('Sending request to Google Drive API');
    let response = await fetch(url, {
      method: method,
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    });

    if (!response.ok) {
      if (response.status === 403 && method === 'PATCH') {
        console.log('Update failed, attempting to create a new file');
        method = 'POST';
        url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
        response = await fetch(url, {
          method: method,
          headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
          body: form,
        });
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const result = await response.json();
    console.log('File save response:', result);
    console.log('File web view link:', result.webViewLink);

    // Verify the file exists after saving
    const verifyResponse = await window.gapi.client.drive.files.list({
      q: `name='${fileName}' and 'root' in parents`,
      fields: 'files(id, name, webViewLink)',
    });
    console.log('Verify file exists:', verifyResponse.result.files);

  } catch (error) {
    console.error('Error saving to Google Drive:', error);
  }
};