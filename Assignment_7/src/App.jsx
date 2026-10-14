import { useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import './App.css'

function App() {
  // expenses is an array of { name, amount, category } objects
  const [expenses, setExpenses] = useState([])

  // Called by ExpenseForm when the user adds an expense
  function addExpense(expense) {
    setExpenses([...expenses, expense])
  }

  // Delete an expense by its index in the array
  function deleteExpense(index) {
    const updated = expenses.filter((_, i) => i !== index)
    setExpenses(updated)
  }

  // Calculate total by summing all amounts
  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  return (
    <div className="app-container">
      <h1>Personal Expense Tracker</h1>

      <ExpenseForm onAdd={addExpense} />

      {/* Show total and list only if there are expenses */}
      {expenses.length > 0 && (
        <>
          <p className="total">Total Expenses: ₹{total}</p>
          <ExpenseList expenses={expenses} onDelete={deleteExpense} />
        </>
      )}

      {expenses.length === 0 && (
        <p className="no-expenses">No expenses added yet.</p>
      )}
    </div>
  )
}

export default App
