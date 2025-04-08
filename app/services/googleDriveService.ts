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

const ROOT_FOLDER_NAME = 'Collaborative Checklist App';
const TASKS_FILE_NAME = 'tasks.json';
const COMPLETED_TASKS_FILE_NAME = 'completed_tasks.json';
const DELETED_TASKS_FILE_NAME = 'deleted_tasks.json';
const WIP_TASKS_FILE_NAME = 'wip_tasks.json';
let initializationPromise: Promise<void> | null = null;

// Add these imports at the top of the file
import debounce from 'lodash/debounce';

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private tokenClient: TokenClient | null = null;
  private accessToken: string = '';
  private tokenExpirationTime: number = 0;
  private hasGivenConsent: boolean = false;
  private isInitialized: boolean = false;
  private rootFolderId: string | null = null;
  private domainFolderId: string | null = null;
  private userFolderId: string | null = null;
  private username: string | null = null;

  private readonly CLIENT_ID: string;
  private readonly SCOPES: string = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

  private debouncedSaveToGoogleDrive: (data: { tasks?: any[], completedTasks?: any[], deletedTasks?: any[], wipTasks?: any[], taskTypes?: any[] }) => void;

  private constructor() {
    this.CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
    if (!this.CLIENT_ID) {
      console.error('Google Client ID is not set. Please check your environment variables.');
    }
    this.loadAuthState();

    // Initialize the debounced function
    this.debouncedSaveToGoogleDrive = debounce(this.actualSaveToGoogleDrive.bind(this), 1000);
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
  // this function is critical. if any API call is wrong duplicate folder will be created.
  private async createFolderIfNotExists(folderName: string, parentId?: string): Promise<string> {
    const token = await this.getAccessToken();
    const query = parentId
      ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const response = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, token);
    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    const folder = await createResponse.json();
    return folder.id;
  }

  private async ensureUsername(): Promise<void> {
    console.log('Current username:', this.username); // Add this log
    if (!this.username) {
      throw new Error('Username is not set. Please call setUsername before performing any operations.');
    }
  }

  private async initializeFolders(): Promise<void> {
    await this.ensureUsername();

    if (this.rootFolderId && this.domainFolderId && this.userFolderId) {
      return;
    }

    try {
      if (!this.rootFolderId) {
        this.rootFolderId = await this.createFolderIfNotExists(ROOT_FOLDER_NAME);
      }
      if (!this.domainFolderId) {
        const domain = window.location.hostname;
        this.domainFolderId = await this.createFolderIfNotExists(domain, this.rootFolderId);
      }
      if (!this.userFolderId) {
        this.userFolderId = await this.createFolderIfNotExists(this.username!, this.domainFolderId);
      }
    } catch (error) {
      console.error('Error initializing folders:', error);
      throw error;
    }
  }

  private async actualSaveToGoogleDrive(data: { tasks?: any[], completedTasks?: any[], deletedTasks?: any[], wipTasks?: any[], taskTypes?: any[] }): Promise<void> {
    for (const key in data) {
      if (data[key]) {
        console.log(`Number of ${key}:`, data[key].length);
      }
    }

    await this.ensureUsername();
    await this.initializeFolders();

    try {
      const token = await this.getAccessToken();
      // IMPORTANT: Check each key in data, if it exists, save it. if a key is not passed in, it will not be saved.
      // this check prevents overwriting the file with an empty array, which has happened in the past.
      if (data.tasks) {
        console.log('Saving tasks');
        await this.saveFile(TASKS_FILE_NAME, data.tasks, token);
      }
      // for completion, both completedTasks and tasks must be passed in.
      if (data.completedTasks && data.tasks) {
        console.log('Saving completed tasks');
        await this.saveFile(COMPLETED_TASKS_FILE_NAME, data.completedTasks, token);
      }
      // for deletion, both deletedTasks and tasks must be passed in.
      if (data.deletedTasks && data.tasks) {
        console.log('Saving deleted tasks');
        await this.saveFile(DELETED_TASKS_FILE_NAME, data.deletedTasks, token);
      }
      // Save wipTasks when they are provided, regardless of whether tasks are present
      if (data.wipTasks) {
        console.log('Saving WIP tasks');
        await this.saveFile(WIP_TASKS_FILE_NAME, data.wipTasks, token);
      }
      if (data.taskTypes) {
        console.log('Saving task types');
        await this.saveFile('taskTypes.json', data.taskTypes, token);
      }
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  }

  private async saveFile(fileName: string, data: any, token: string): Promise<void> {
    const existingFiles = await this.findAllFiles(fileName);

    if (existingFiles.length > 1) {
      throw new Error(`Multiple files found with name ${fileName}. Please resolve this manually and try again.`);
    }

    const existingFile = existingFiles[0];
    const method = existingFile ? 'PATCH' : 'POST';
    const url = existingFile 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      ...(existingFile ? {} : { parents: [this.userFolderId!] })
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    const response = await fetch(url, {
      method: method,
      headers: { 'Authorization': `Bearer ${token}` },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Failed to ${existingFile ? 'update' : 'create'} file: ${response.statusText}`);
    }

    console.log(`File ${fileName} ${existingFile ? 'updated' : 'created'} successfully`);
  }

  public async loadFromGoogleDrive(): Promise<{ tasks: any[], completedTasks: any[], deletedTasks: any[], wipTasks: any[], taskTypes: any[] } | null> {
    console.log('loadFromGoogleDrive called, current username:', this.username); // Add this log
    await this.ensureUsername();

    try {
      await this.initializeFolders();
    } catch (error) {
      console.error('Error initializing folders:', error);
      throw error;
    }

    try {
      const token = await this.getAccessToken();
      
      const tasks = await this.loadFile(TASKS_FILE_NAME, token);
      const completedTasks = await this.loadFile(COMPLETED_TASKS_FILE_NAME, token);
      const deletedTasks = await this.loadFile(DELETED_TASKS_FILE_NAME, token);
      const wipTasks = await this.loadFile(WIP_TASKS_FILE_NAME, token);
      const taskTypes = await this.loadFile('taskTypes.json', token);
      if (tasks !== null || completedTasks !== null || deletedTasks !== null || wipTasks !== null) {
        return {
          tasks: tasks || [],
          completedTasks: completedTasks || [],
          deletedTasks: deletedTasks || [],
          wipTasks: wipTasks || [],
          taskTypes: taskTypes || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  private async loadFile(fileName: string, token: string): Promise<any | null> {
    const existingFiles = await this.findAllFiles(fileName);

    if (existingFiles.length > 1) {
      throw new Error(`Multiple files found with name ${fileName}. Please resolve this manually and try again.`);
    }

    const existingFile = existingFiles[0];

    if (existingFile) {
      const fileResponse = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, token);
      const fileContent = await fileResponse.text();

      try {
        const parsedContent = JSON.parse(fileContent);
        console.log(`Parsed ${fileName} content:`, parsedContent);
        return parsedContent;
      } catch (parseError) {
        console.error(`Error parsing ${fileName} content:`, parseError);
        return null;
      }
    } else {
      console.log(`No ${fileName} found in Google Drive`);
      return null;
    }
  }

  private async findFile(fileName: string): Promise<{ id: string } | null> {
    const token = await this.getAccessToken();
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${this.domainFolderId}' in parents and trashed=false`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    return data.files && data.files.length > 0 ? { id: data.files[0].id } : null;
  }

  private async findAllFiles(fileName: string): Promise<Array<{ id: string, name: string }>> {
    const token = await this.getAccessToken();
    const response = await this.fetchWithAuth(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${this.userFolderId}' in parents and trashed=false&fields=files(id,name)&orderBy=createdTime`,
      token
    );
    const data = await response.json();
    return data.files || [];
  }

  private async fetchWithAuth(url: string, token: string): Promise<Response> {
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  public setUsername(username: string) {
    this.username = username;
    console.log('Username set in GoogleDriveService:', username); // Add this log
  }

  public saveToGoogleDrive(data: { tasks?: any[], completedTasks?: any[], deletedTasks?: any[], wipTasks?: any[], taskTypes?: any[] }): void {
    // Remove debounce for now to ensure immediate saving
    this.actualSaveToGoogleDrive(data);
  }
}

export const googleDriveService = GoogleDriveService.getInstance();
