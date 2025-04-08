# Collaborative Checklist

A modern, minimalist task management application built with React and TypeScript, featuring Google Drive integration for seamless task synchronization across devices.

## Features

- Create and manage tasks with various attributes (urgency, importance, effort, type)
- Visual heatmap representation of tasks based on priority and effort
- "I'm Feeling Lucky" feature to suggest tasks based on user's mood
- Task timer with pause and abandon functionality
- Google Drive integration for task persistence and synchronization
- Hierarchical task structure with parent-child relationships
- Task search and filtering capabilities
- Top words analysis for quick task insights
- Completed tasks tracking
- Automatic data refresh when the page becomes visible
- Action history heatmap for visualizing task activity over time
- URL support for tasks, allowing quick access to related resources
- Custom task types with emoji support

## Task Management

- Tasks are displayed in a heatmap, color-coded by priority
- Each task has attributes like name, type, effort, urgency, and more
- Tasks can have parent-child relationships, allowing for hierarchical organization
- Users can add, edit, delete, and complete tasks
- Task priority is calculated based on various factors, including rejection count
- Tasks can be marked as completed, paused, or abandoned
- Completed tasks are tracked separately and can be viewed in a dedicated section
- Custom task types can be created, edited, and deleted with emoji support

## Task States and Persistence

- Tasks exist in several states throughout their lifecycle:
  - **In Progress**: Tasks that are currently being worked on with the timer running
  - **Completed**: Tasks that have been successfully finished
  - **Deleted**: Tasks that have been removed from the active task list

- Task state persistence:
  - All task states are automatically synced to Google Drive
  - Active tasks are stored in the primary task file
  - In Progress tasks are stored in a dedicated "wipTasks" file
  - Completed tasks are moved to a separate completed tasks file
  - Deleted tasks are stored in a trash file for potential recovery
  - Each state transition triggers a sync operation to ensure data integrity
  - Local storage provides fallback when offline
  - Task state changes are tracked in the action history for analytics
  - Task rejection count influences priority calculations

- Data preservation:
  - Task state history is preserved for analytics purposes
  - Completed tasks maintain their metadata (completion time, duration, etc.)
  - Abandoned tasks record reason for abandonment when provided
  - All state transitions are timestamped for accurate history tracking

## User Interface

- Responsive design that adapts to different screen sizes
- Modal-based task creation and editing
- Search bar for finding tasks quickly
- Attribute and type filters for task list refinement
- "I'm Feeling Lucky" button for mood-based task suggestions
- Top words analysis for quick insights into frequently used terms in tasks
- Expandable sections for viewing completed tasks and action history
- Custom type management modal for creating and organizing task types

## Data Synchronization

- Tasks are automatically synced with Google Drive
- Changes are persisted across sessions and devices
- Force refresh functionality to ensure up-to-date data
- Separate storage for active tasks, completed tasks, and deleted tasks
- Custom task types have special handling:
  - Stored in localStorage for immediate access
  - Synced to Google Drive independently from tasks
  - Not tied to task validation requirements
  - Can be updated without requiring task data
  - Loaded during initial sync and stored locally

## Task Types Management

- Custom task types can be created with emoji icons
- Each task type includes:
  - Name: Unique identifier for the type
  - Emoji: Visual representation
- Task type changes are:
  - Immediately saved to localStorage
  - Independently synced to Google Drive
  - Not dependent on task validation
  - Preserved across sessions
  - Loaded during initial sync
- Task type data is stored separately from task data for:
  - Faster local access
  - Independent updates
  - Reduced sync complexity

## Tech Stack

- React 17.0.2
- TypeScript 4.1.2
- Styled Components 5.3.11
- React Spring 9.7.4 for animations
- Google Drive API for cloud storage
- Express.js 4.17.1 for server-side operations
- Emoji Picker React for custom task type emojis

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- npm (v6 or later)
- Google Cloud Console account for API credentials

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/000vince000/checklist.git
   cd checklist
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Google API credentials:
   ```
   REACT_APP_GOOGLE_API_KEY=your_api_key
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id
   REACT_APP_GOOGLE_DISCOVERY_DOCS=https://www.googleapis.com/discovery/v1/apis/drive/v3/rest
   ```

4. Start the development server:
   ```
   npm run dev:server
   ```

5. Open your browser and navigate to `http://localhost:3000`
6. Deploy to Github Pages via actions
   ```
   npm run deploy
   ```

## Available Scripts

- `npm start`: Start the production server
- `npm run build`: Build the project for production
- `npm run dev`: Start the development server with hot reloading
- `npm run server`: Start the backend server
- `npm run dev:server`: Start both frontend and backend in development mode
- `npm run deploy`: Deploy the application to GitHub Pages

## Project Structure

- `app/`: Contains the main application code
  - `components/`: React components (e.g., App, TaskHeatmap, TaskModal, CustomTypeModal)
  - `context/`: React context for managing global state (TaskContext)
  - `hooks/`: Custom React hooks (e.g., useTaskAnimation)
  - `services/`: Services for external integrations (e.g., googleDriveService)
  - `styles/`: Styled components and global styles
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions for task management and calculations
- `public/`: Public assets and HTML template
- `scripts/`: Deployment and build scripts
- `server.js`: Express server for production
- `webpack.config.js`: Webpack configuration

## Components

### Core Components

- **App**: The main application component that manages authentication state and renders different views based on user login status. It provides the overall application structure including the header, search functionality, filters, and expandable sections.

- **TaskHeatmap**: Displays tasks in a visual grid layout where each task is represented as a box with color coding based on priority. It handles opening task details, processing mood-based task selection, and manages task timers for tracking completion time.

- **TaskInput**: Provides the form interface for creating new tasks, including fields for task name, attributes (urgency, importance), effort level, type, and optional URL. It also manages parent-child task relationships.

- **TaskModal**: Detailed view for viewing and editing tasks. It provides functionality for accepting, rejecting, completing, abandoning, or deleting tasks. It also shows parent and child relationships and allows users to navigate between related tasks.

- **CustomTypeModal**: Allows users to create and manage custom task types with emoji icons. Users can add, delete, and reorder task types, with changes being stored both locally and in Google Drive.

### Authentication Components

- **GoogleAuthButton**: Handles Google authentication integration, loading the Google API, rendering the sign-in button, and managing the authentication state. It also dispatches events to notify other components of authentication state changes.

- **LoginView**: The initial view shown to unauthenticated users, displaying the application title and Google authentication button.

### Utility Components

- **TaskList**: A simple component that renders a list of tasks, typically used within other components.

- **CommitHistoryHeatmap**: Visualizes task activity over time, showing when tasks were created, updated, or completed in a calendar-style heatmap.

## Instruction to LLMs 

Adhere to the behaviors described in this doc unless otherwise instructed. When instructed to change the code, don't be overeager to change what's not instructed. If you are tempted to change the code beyond what's instructed, ask for permission. When asked a question instead of an instruction, answer it without changing the code. 

## License

This project is licensed under the MIT License.
