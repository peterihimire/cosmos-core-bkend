# Cosmos Core Assessment

## Introduction

This project is a lightweight SaaS Platform is designed to streamline task assignments and tracking for remote teams. It provides a centralized system where team admins can manage projects and tasks, while team members can claim and update tasks **status** to completed in real time. The platform ensures accountability, visibility, and efficiency across distributed teams by integrating automated features and audit logging.

## Features

- **Authentication**: User authentication and authorization
- **Project & Task Management**: Admins can manage projects and assign tasks with deadlines and descriptions.
- **Task Assignment & Automation**: Users can claim open tasks, and tasks are automatically expired or reassigned when needed.
- **Audit Logging**: All critical actions of task claim etc. are logged to maintain visibility and accountability.
- **Role-Based Access Control**: (ADMIN | USER) have access permissions tailored to their responsibilities.
- **Resilient & Reliable**: Handles access token and refresh token expiration securely and gracefully
- **Error Handling**: Comprehensive error handling
- **Rate Limit**: Rate Limit on the claim task API
- **Node Cron**: Atomic updates with conditions for expiring and re-assigning task

## Table of Contents

- [Setup](#setup)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Trade Offs](#trade-offs)
- [How Race Condition Was Handled](#how-race-condition-was-handled)
- [How Task Expiration Works](#how-task-expiration-works)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Images](#images)

## Setup

Follow these instructions to set up the project on your local machine.

## Tech Stack Dependencies

- node.js (>= 14.x)
- npm (>= 6.x) or yarn (>= 1.x)
- TypeScript
- Express
- mongoose
- JWT
- mongodb
- cookie parser
- cors
- bcrypt
- Express-validator
- dotenv
- Express-Rate-Limit
- Node Cron

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/peterihimire/cosmos-core-bkend.git
   ```

2. Change directory into the project folder:

   ```sh
   cd cosmos-core-bkend
   ```

3. Install dependencies:

   ```sh
   npm install
   ```

4. Set up the environment variables (See Environment Variables):

   Create a `.env` file in the root directory and copy contents of `.env.example` to your created `.env` file.

   ```sh
   cp .env.example .env
   ```

## Environment Variables

The project requires several environment variables to be configured. Here’s a brief overview of each:

- `MONGO_URI`: MongoDB connection string.
- `NODE_ENV`: Node environment either development or production
- `JWT_KEY`: Secret key for signing JWT tokens.
- `JWT_REFRESH_KEY`: Secret key for signing the refresh tokens.
- `PORT`: Port number where the server will run.

Ensure these variables are set in your `.env` file as specified in the [Installation](#installation) section.

## Running the Server

1. Start the server:

   ```sh
   npm run dev
   # or
   yarn run dev
   ```

## API Documentation

Visit the Postman documentation [Link](https://documenter.getpostman.com/view/12340633/2sBXVcjsQz) of this mini task management SaaS app.

## Design Decisions

**Layered Architecture (Controller → Service → Repository)**:

- Separates concerns: controllers handle request/response, services handle business logic, repositories handle DB access.
- Makes testing, maintenance, and future scaling easier.

**JWT Authentication with Refresh Tokens**:

- Access tokens expire quickly (e.g., 2 hours)
- Refresh tokens stored as HTTP-only cookies (e.g., 5 days)
- Automatic token refresh handled in frontend Axios interceptors.

**Audit Logs**:

- All critical actions (task create, update, claim, delete) are logged.

**Task Expiration & Reassignment**:

- Services automatically mark tasks as expired after expiresAt.
- Optionally reassign tasks to an unassigned pool.

**Centralized Error Handling**:

- Middleware returns consistent HTTP responses.
- Supports slice-level error reporting in frontend for partial API failures.

**Security Considerations**:

- HTTP-only refresh tokens prevent XSS & CSRF attacks.
- Role-based access control (ADMIN / USER).
- Passwords hashed before storing in DB.

**TypeScript**:

- Used typescript for type safety and bug prevention
- Helps in self documenting
- Helps for scalability and team collaboration

**DTO, Validations and User Role To Prevent OverPosting/Mass Assignment**:

- Used DTO types to prevent overposting non-essential data payload when creating Projects and Tasks. Will apply same for update and deletes if time permits
- Used the User role to control who creates updates deletes , only ADMIN can modify those endpoints.
- Integrated Rate Limit

**ENUM**:

- Used ENUM to prevent invalid state and database consistency

## Trade-Offs

**Layered architecture**:

- Adds more files/folders but improves maintainability and testability.

**Short-lived access token**:

- Improves security, but users may see frequent refresh requests.

**Refresh token in cookie**:

- Secure (HTTP-only) but harder to access in frontend code for testing.

**MongoDB vs PostgreSQL**:

- MongoDB allows faster prototyping; PostgreSQL could provide stricter relational constraints.

**Polling for task updates**:

- Simple, works for small apps; WebSockets would be real-time but more complex.

**Centralized error handling**:

- Some errors may need custom responses per route; handled with slice-level errors on frontend.

**Using Vanilla Node Express**:

- A more robust framework like NEST.JS or Adonis.JS would have been prefferable as they will provide better code structure and force user to follow an already established pattern, it opinionated though.

**No Testing**:

- Because of time, I was not able to write Unit and e2e test

**Database Transactions**:

- Using my mongoDB local instance, I was not able to implement transactions

## How Race Condition Was Handled

```ts
export const claimTask = async (
  taskId: string,
  userId: string
): Promise<ITask | null> => {
  const claimedTask = await TaskModel.findOneAndUpdate(
    {
      _id: taskId,
      assignedTo: null,
      status: "OPEN",
    },
    {
      $set: {
        assignedTo: userId,
        status: "IN_PROGRESS",
        claimedAt: new Date(),
      },
    },
    {
      new: true,
    }
  ).exec();
  return claimedTask;
};
```

- MongoDB's findOneAndUpdate() is atomic at the document level

- The query (assignedTo: null) and update happen in a single operation

- No other operation can intervene between the check and update

## How Task Expiration Works

**Expire after 24h**: Tasks become EXPIRED if status is OPEN and assignTo === null , uses createdAt time to confirm the actual time of task creation

**Node Cron**: I have a node cron setup, that runs every **10 mins** to check for Task to expire them

**Audit log**: Also is the Audit log that Log the status of the task to EXPIRED, however at this point the userId and the user email will by saved as **SYSTEM**

## Future Improvements

- Replace polling with WebSockets for real-time updates.
- Add email notifications for task assignments & expirations
- Implement more granular roles & permissions
- Add unit and integration tests for controllers, services, and repositories

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Create a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any questions or support, please reach out to:

- Email: peterihimire@gmail.com
- Github Issues: [Create an issue](https://github.com/peterihimire/cosmos-core-bkend/issues)

## Images

![admin](https://res.cloudinary.com/dymhdpka1/image/upload/v1767294223/Screenshot_2026-01-01_at_7.55.41_PM_jzxp9f.png)
![user](https://res.cloudinary.com/dymhdpka1/image/upload/v1767294739/Screenshot_2026-01-01_at_8.11.51_PM_knukmt.png)
