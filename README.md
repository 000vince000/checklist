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

## Task Management

- Tasks are displayed in a heatmap, color-coded by priority
- Each task has attributes like name, type (debt, cost, revenue, happiness), effort, urgency, and more
- Tasks can have parent-child relationships, allowing for hierarchical organization
- Users can add, edit, delete, and complete tasks
- Task priority is calculated based on various factors, including rejection count

## User Interface

- Responsive design that adapts to different screen sizes
- Modal-based task creation and editing
- Search bar for finding tasks quickly
- Attribute and type filters for task list refinement
- "I'm Feeling Lucky" button for mood-based task suggestions

## Data Synchronization

- Tasks are automatically synced with Google Drive
- Changes are persisted across sessions and devices
- Force refresh functionality to ensure up-to-date data

## Tech Stack

- React 17.0.2
- TypeScript 4.1.2
- Styled Components 5.3.11
- React Spring 9.7.4 for animations
- Google Drive API for cloud storage
- Express.js 4.17.1 for server-side operations

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- npm (v6 or later)
- Google Cloud Console account for API credentials

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/collaborative-checklist.git
   cd collaborative-checklist
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

## Available Scripts

- `npm start`: Start the production server
- `npm run build`: Build the project for production
- `npm run dev`: Start the development server with hot reloading
- `npm run server`: Start the backend server
- `npm run dev:server`: Start both frontend and backend in development mode
- `npm run deploy`: Deploy the application to GitHub Pages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
