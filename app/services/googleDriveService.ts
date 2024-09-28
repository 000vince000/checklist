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

export const getAccessToken = async (): Promise<string> => {
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

    if (localStorage.getItem('google_auth_token')) {
      // If we have a token in localStorage, try to get a new access token without prompting
      tokenClient.requestAccessToken({ prompt: '' });
    } else {
      // If no token in localStorage, we need to prompt for consent
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
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
    };

    console.log('Checking for existing file');
    const existingFileResponse = await window.gapi.client.drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name, webViewLink)',
    });

    const existingFiles = existingFileResponse.result.files;
    console.log('Existing files:', existingFiles);

    let fileId: string | null = null;
    if (existingFiles && existingFiles.length > 0) {
      console.log('Existing file found, updating');
      fileId = existingFiles[0].id;
    } else {
      console.log('No existing file found, creating new file');
    }

    let response;
    if (fileId) {
      // Update existing file
      response = await window.gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': 'multipart/related; boundary=foo_bar_baz'
        },
        body: `
--foo_bar_baz
Content-Type: application/json; charset=UTF-8

${JSON.stringify(metadata)}

--foo_bar_baz
Content-Type: application/json

${data}
--foo_bar_baz--`
      });
    } else {
      // Create new file
      response = await window.gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': 'multipart/related; boundary=foo_bar_baz'
        },
        body: `
--foo_bar_baz
Content-Type: application/json; charset=UTF-8

${JSON.stringify(metadata)}

--foo_bar_baz
Content-Type: application/json

${data}
--foo_bar_baz--`
      });
    }

    console.log('File save response:', response);

    // Verify the file exists after saving
    const verifyResponse = await window.gapi.client.drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name, webViewLink)',
    });
    console.log('Verify file exists:', verifyResponse.result.files);

  } catch (error) {
    console.error('Error saving to Google Drive:', error);
  }
};