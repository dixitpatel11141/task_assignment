# Building a Task & Assignment Module with Node.js (Full Stack System)



The aim of this exercise is to design and implement a Task & Assignment Module for a multi-user system using Node.js, Express.js, database integration, file handling, and a minimal frontend. The module must support task ownership, assignment, role-based access, concurrency handling, caching, validation, authentication, file uploads, and error handling while ensuring data integrity and performance.



## Features

• CRUD operations for tasks
• Task assignment between users
• File upload & retrieval (task attachments)
• JWT authentication
• Password hashing
• Input validation & sanitization
• Role-based authorization
• Caching (with invalidation strategy)
• Async handling using async/await
• Centralized error handling
• Database integration using MongoDB (Mongoose) or MySQL (Sequelize)
• Basic frontend consuming APIs



## Tech Stack


- **Node.js** - Runtime environment

- **Express.js** - Web framework

- **MySQL** - Database

- **JWT** - Authentication

- **Multer** - File uploads


## Setup



### Prerequisites

- Node.js installed

- MySQL database



### Installation



```bash

npm install

```



### Database Setup



Create a MySQL database named `task_assignment`



### Environment Configuration



Create a `.env` file with the following variables:



```env

# Environment

STATUS=development



# Server Ports

DEV_PORT=3000

PORT=3000

PROD_PORT=8080



# Database Configuration

DB_HOST=localhost

DB_USER=your_username

DB_PORT=3306

DB_NAME=task_assignment

DB_PASS=your_password

DIALECT=mysql



# JWT Configuration

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=24h



# File Upload

UPLOAD_DIR=uploads/

```



## Development



```bash

npm run dev

```



## Testing



```bash

npm test

```



## API Endpoints



### Authentication



| Method | Endpoint | Description | Auth Required |

|--------|----------|-------------|---------------|

| POST | `/api/auth/register` | Register new user | ❌ |

| POST | `/api/auth/login` | User login (returns JWT) | ❌ |



### Task & Assignment



| Method | Endpoint | Description | Auth Required |

|--------|----------|-------------|---------------|

| POST | `/api/tasks` | Create Task | ✅ |

| GET | `/api/tasks` | Get all task | ✅ |

| GET | `/api/tasks/:id` | Get task by ID | ✅ |

| PUT | `/api/tasks/:id` | Update task | ✅ |

| DELETE | `/api/tasks/:id` | Delete task | ✅ |

| PATCH | `/api/tasks/:id/assign` | Assign task | ✅ |

| POST | `/api/tasks/:id/upload` | Upload attachment | ✅ |

| GET | `/api/tasks/:taskId/files/:fileId` | Get attachement by id | ✅ |

| DELETE | `/api/tasks/:taskId/files/:fileId` | Delete attachement by id | ✅ |



### Authentication



Use Bearer token authentication. Obtain token from the login endpoint:



```

Authorization: Bearer <your_jwt_token>

```
