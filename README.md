# Task Manager Backend

This project is a backend for a task management application built using Node.js, Express, and MongoDB. It allows users to manage their tasks and daily subtasks with specific time-based rules.

## Features

- User authentication via unique email (no password required).
- Task creation with a specified duration.
- Automatic generation of daily task entries.
- Time-based locking for editing and checkbox toggling.
- Dashboard for user statistics, task progress, and reports.

## Project Structure

```
task-manager-backend
├── src
│   ├── controllers          # Contains controller logic for handling requests
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   └── taskController.js
│   ├── middleware           # Contains middleware for authentication and error handling
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── timezoneMiddleware.js
│   ├── models               # Contains Mongoose models for MongoDB
│   │   ├── Task.js
│   │   ├── TaskDay.js
│   │   └── User.js
│   ├── routes               # Contains route definitions for the API
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── taskRoutes.js
│   ├── utils                # Contains utility functions and cron jobs
│   │   ├── cronJobs.js
│   │   ├── jwt.js
│   │   └── streakUtils.js
│   ├── config               # Configuration files
│   │   └── db.js
│   ├── app.js               # Main application file
│   └── server.js            # Entry point for the application
├── .env                     # Environment variables
├── package.json             # NPM configuration file
└── README.md                # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd task-manager-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

4. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user.
- **POST** `/api/auth/login` - Log in an existing user.

### Tasks

- **POST** `/api/tasks` - Create a new task.
- **GET** `/api/tasks/my` - Retrieve all tasks for the user.
- **DELETE** `/api/tasks/:taskId` - Delete a task.

### Daily Tasks

- **GET** `/api/tasks/:taskId/days` - Retrieve daily task entries.
- **POST** `/api/tasks/days/:dayId/subtasks` - Add subtasks for a specific day.
- **PUT** `/api/tasks/days/:dayId/subtasks/:subtaskIndex` - Update a subtask's completion status.
- **DELETE** `/api/tasks/days/:dayId/subtasks/:subtaskIndex` - Delete a subtask.

### Dashboard

- **GET** `/api/dashboard/stats` - Retrieve user statistics.
- **GET** `/api/dashboard/task-progress/:taskId` - Get progress for a specific task.
- **GET** `/api/dashboard/daily-report?days=30` - Get a report for the last 30 days.
- **GET** `/api/dashboard/upcoming-deadlines` - Get tasks ending in 3 days or less.

## Time Rules

- Users can add/edit tasks between 12 AM to 8 AM IST.
- Checkbox toggling is allowed from 8 AM to 1 AM the next day.
- Tasks from previous days are locked after 1 AM.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.