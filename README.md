# Collaborative Checklist

A modern, minimalist task management application built with React and TypeScript.

## Features

- Create and manage tasks with various attributes (urgency, importance, effort, type)
- Visual heatmap representation of tasks based on priority and effort
- "I'm Feeling Lucky" feature to suggest tasks based on user's mood
- Task timer with pause and abandon functionality
- Local storage persistence for tasks
- Completed tasks tracking

## Tech Stack

- React
- TypeScript
- Styled Components
- Local Storage for data persistence

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- npm (v6 or later)

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

3. Start the development server:
   ```
   npm run dev:server
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `app/components/`: React components
- `app/context/`: React context for state management
- `app/types/`: TypeScript type definitions
- `app/utils/`: Utility functions
- `dist/`: Distribution folder with index.html

## Available Scripts

- `npm start`: Start the production server
- `npm run build`: Build the project for production
- `npm run dev`: Start the development server with hot reloading
- `npm run server`: Start the backend server
- `npm run dev:server`: Start both frontend and backend in development mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.