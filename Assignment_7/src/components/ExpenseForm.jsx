import { useState } from 'react'

// ExpenseForm receives an onAdd prop from App.jsx
function ExpenseForm({ onAdd }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    // Validate – all fields required, amount must be positive
    if (!name || !amount || !category) {
      setError('Please fill in all fields.')
      return
    }

    if (Number(amount) <= 0) {
      setError('Amount must be greater than 0.')
      return
    }

    setError('')

    // Pass the new expense up to App.jsx
    onAdd({ name, amount, category })

    // Reset form
    setName('')
    setAmount('')
    setCategory('')
  }

  return (
    <div className="form-section">
      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Expense Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lunch, Bus ticket"
          />
        </div>

        <div className="form-group">
          <label>Amount (₹):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">-- Select Category --</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {error && <span className="error">{error}</span>}

        <button type="submit" className="add-btn">Add Expense</button>

      </form>
    </div>
  )
}

export default ExpenseForm
