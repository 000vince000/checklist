// Add these type definitions at the top of the file
interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback?: (response: TokenResponse) => void;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
  callback: (response: TokenResponse) => void;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private tokenClient: TokenClient | null = null;
  private accessToken: string = '';
  private tokenExpirationTime: number = 0;
  private hasGivenConsent: boolean = false;
  private isInitialized: boolean = false;

  private readonly CLIENT_ID: string;
  private readonly SCOPES: string = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

  private constructor() {
    this.CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
    if (!this.CLIENT_ID) {
      console.error('Google Client ID is not set. Please check your environment variables.');
    }
    this.loadAuthState();
  }

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  public async initializeGoogleDriveAPI(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (!this.CLIENT_ID) return false;

    if (!window.google?.accounts?.oauth2) {
      console.error('Google Accounts OAuth2 not loaded');
      return false;
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: (resp: TokenResponse) => {
        this.handleTokenResponse(resp);
      },
    });

    this.isInitialized = true;
    console.log('Google Drive API initialized successfully');
    return true;
  }

  private handleTokenResponse(resp: TokenResponse) {
    if (resp.error !== undefined) {
      console.error(`Error getting access token: ${resp.error}`);
    } else if (resp.access_token) {
      this.accessToken = resp.access_token;
      this.tokenExpirationTime = Date.now() + 3600 * 1000; // Token expires in 1 hour
      this.hasGivenConsent = true;
      this.saveAuthState();
    }
  }

  private saveAuthState() {
    localStorage.setItem('googleDriveAuthState', JSON.stringify({
      accessToken: this.accessToken,
      tokenExpirationTime: this.tokenExpirationTime,
      hasGivenConsent: this.hasGivenConsent,
    }));
  }

  private loadAuthState() {
    const authState = localStorage.getItem('googleDriveAuthState');
    if (authState) {
      const { accessToken, tokenExpirationTime, hasGivenConsent } = JSON.parse(authState);
      this.accessToken = accessToken;
      this.tokenExpirationTime = tokenExpirationTime;
      this.hasGivenConsent = hasGivenConsent;
    }
  }

  public async getAccessToken(): Promise<string> {
    if (!this.isInitialized) {
      const initialized = await this.initializeGoogleDriveAPI();
      if (!initialized) {
        throw new Error('Failed to initialize Google Drive API');
      }
    }

    if (this.accessToken && Date.now() < this.tokenExpirationTime) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client is not initialized. Please call initializeGoogleDriveAPI first.'));
        return;
      }

      this.tokenClient.callback = (resp: TokenResponse) => {
        this.handleTokenResponse(resp);
        if (resp.access_token) {
          resolve(resp.access_token);
        } else {
          reject(new Error('Failed to get access token: No token received'));
        }
      };

      try {
        this.tokenClient.requestAccessToken({ prompt: this.hasGivenConsent ? '' : 'consent' });
      } catch (error) {
        console.error('Error in requestAccessToken:', error);
        reject(new Error(`Error requesting access token: ${error}`));
      }
    });
  }

  public async loadFromGoogleDrive(fileName: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const response = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&fields=files(id,name,mimeType,modifiedTime)`, token);
      const data = await response.json();
      console.log('Files found in Google Drive:', data.files);

      const files = data.files;
      if (files && files.length > 0) {
        const fileId = files[0].id;
        console.log(`Retrieving file content for: ${files[0].name} (ID: ${fileId})`);
        const fileResponse = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, token);
        const fileContent = await fileResponse.text();
        console.log('File content retrieved:', fileContent.substring(0, 200) + '...'); // Log first 200 characters

        try {
          const parsedContent = JSON.parse(fileContent);
          console.log('Parsed file content:', parsedContent);
          return parsedContent;
        } catch (parseError) {
          console.error('Error parsing file content:', parseError);
          return fileContent;
        }
      } else {
        console.log('No files found with the specified name:', fileName);
      }
      return null;
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      return null;
    }
  }

  public async saveToGoogleDrive(data: any, fileName: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      const jsonData = JSON.stringify(data);
      const file = new Blob([jsonData], {type: 'application/json'});
      const metadata = {
        name: fileName,
        mimeType: 'application/json',
      };

      const searchResponse = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'`, token);
      const searchData = await searchResponse.json();

      const { method, url } = this.getSaveRequestDetails(searchData);

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Drive API error: ${response.status} ${response.statusText}, ${JSON.stringify(errorData)}`);
      }

      console.log(`File ${method === 'POST' ? 'saved' : 'updated'} successfully:`, await response.json());
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  }

  private async fetchWithAuth(url: string, token: string): Promise<Response> {
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  private getSaveRequestDetails(searchData: any): { method: string; url: string } {
    let method = 'POST';
    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    if (searchData.files && searchData.files.length > 0) {
      const fileId = searchData.files[0].id;
      method = 'PATCH';
      url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
    }

    return { method, url };
  }
}

export const googleDriveService = GoogleDriveService.getInstance();