# Postman Testing Guide – Assignment 8

## Base URL
```
http://localhost:5000
```

Make sure the server is running (`node server.js`) and MongoDB is running before testing.

---

## 1. Create a Student – POST /students

- **Method:** POST
- **URL:** `http://localhost:5000/students`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "name": "Rahul Patil",
  "rollNumber": "101",
  "department": "IT",
  "marks": 85
}
```
- **Expected Response (201 Created):**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Rahul Patil",
  "rollNumber": "101",
  "department": "IT",
  "marks": 85,
  "__v": 0
}
```

---

## 2. Get All Students – GET /students

- **Method:** GET
- **URL:** `http://localhost:5000/students`
- **No body required**
- **Expected Response (200 OK):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Rahul Patil",
    "rollNumber": "101",
    "department": "IT",
    "marks": 85,
    "__v": 0
  }
]
```

---

## 3. Get Student by ID – GET /students/:id

- **Method:** GET
- **URL:** `http://localhost:5000/students/64a1b2c3d4e5f6a7b8c9d0e1`
  *(Replace with the actual `_id` from the POST response)*
- **No body required**
- **Expected Response (200 OK):** Returns the single student object

---

## 4. Update a Student – PUT /students/:id

- **Method:** PUT
- **URL:** `http://localhost:5000/students/64a1b2c3d4e5f6a7b8c9d0e1`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "marks": 92
}
```
- **Expected Response (200 OK):** Returns the updated student object with marks = 92

---

## 5. Delete a Student – DELETE /students/:id

- **Method:** DELETE
- **URL:** `http://localhost:5000/students/64a1b2c3d4e5f6a7b8c9d0e1`
- **No body required**
- **Expected Response (200 OK):**
```json
{
  "message": "Student deleted successfully"
}
```

---

## Tips
- Always copy the `_id` from the POST response to use in GET/:id, PUT, and DELETE requests.
- If you get a connection error, make sure MongoDB is running (`mongod` command).
- If port 5000 is in use, change `PORT` in your `.env` file.
