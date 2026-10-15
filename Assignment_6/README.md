# Assignment 6 – React Student Information Application

## Description
A simple React application that uses two components to accept and display student information. Demonstrates React components, props, and useState.

## Project Structure
```
Assignment_6/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    └── components/
        ├── StudentForm.jsx
        └── StudentDetails.jsx
```

## How to Run

```bash
cd Assignment_6
npm install
npm start
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## To Build for Production

```bash
npm run build
```

## Key Concepts Demonstrated
- **React Components** – StudentForm and StudentDetails are separate reusable components
- **Props** – Data is passed from App.jsx to StudentDetails via props
- **useState** – State is managed in App.jsx and passed down
- **Form Handling** – Controlled inputs with onChange handlers
