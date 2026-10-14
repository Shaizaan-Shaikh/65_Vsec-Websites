# Assignment 7 – React Personal Expense Tracker

## Description
A simple React app to record and track personal expenses. Uses useState and basic component structure.

## Project Structure
```
Assignment_7/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    └── components/
        ├── ExpenseForm.jsx
        └── ExpenseList.jsx
```

## How to Run

```bash
cd Assignment_7
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## To Build for Production

```bash
npm run build
```

## Features
- Add an expense with name, amount, and category
- View all expenses in a table
- See the running total at the top
- Delete individual expenses

## Key Concepts
- **useState** – for managing the expenses array
- **map()** – to render the list of expenses
- **Props** – passing data and functions between components
- **Form handling** – controlled inputs with onChange
