# Assignment 8 – Node.js, Express.js and MongoDB CRUD API

## Description
A simple REST API built with Node.js, Express.js, and MongoDB (Mongoose) to manage student records. Supports all four CRUD operations.

## Project Structure
```
Assignment_8/
├── server.js              Main server file
├── models/
│   └── Student.js         Mongoose model
├── routes/
│   └── studentRoutes.js   API route handlers
├── package.json
├── .env.example           Sample environment variables
└── README.md
```

## Setup Instructions

### 1. Install dependencies
```
cd Assignment_8
npm install
```

### 2. Create a `.env` file
Copy `.env.example` to `.env`:
```
cp .env.example .env
```
The default values work if MongoDB is running locally on port 27017.

### 3. Start MongoDB
Make sure MongoDB is running on your machine:
```
mongod
```
Or if using a MongoDB service, it should start automatically.

### 4. Start the server
```
node server.js
```
The server starts on `http://localhost:5000`.

---

## API Endpoints

| Method | Endpoint            | Description            |
|--------|---------------------|------------------------|
| POST   | /students           | Create a student       |
| GET    | /students           | Get all students       |
| GET    | /students/:id       | Get student by ID      |
| PUT    | /students/:id       | Update a student       |
| DELETE | /students/:id       | Delete a student       |

---

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- cors

See `POSTMAN_TESTING.md` for how to test all endpoints.
