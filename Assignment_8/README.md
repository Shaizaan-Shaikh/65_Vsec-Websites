# Assignment 8 – Node.js, Express.js and MongoDB CRUD API

## Browser preview

Open [Assignment 8 on GitHub Pages](https://shaizaan-shaikh.github.io/65_Vsec-Websites/Assignment_8/) for the sample preview. It uses temporary browser records, independently of MongoDB.

For local startup, open a terminal in `Assignment_8`, run `npm ci` once, then `npm start`. Open `http://127.0.0.1:5000` for the same sample preview. The real API is at `/students` and requires MongoDB. If no `.env` is present, it uses `mongodb://127.0.0.1:27017/studentDB`.

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
