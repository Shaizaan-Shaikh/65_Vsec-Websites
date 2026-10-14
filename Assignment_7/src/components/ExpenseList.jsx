// ExpenseList displays expenses in a table with a delete button for each row
// It receives the expenses array and a onDelete function as props
function ExpenseList({ expenses, onDelete }) {
  return (
    <div className="list-section">
      <h2>Expense List</h2>

      <table>
        <thead>
          <tr>
            <th>Expense Name</th>
            <th>Amount (₹)</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={index}>
              <td>{expense.name}</td>
              <td>₹{expense.amount}</td>
              <td>{expense.category}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExpenseList
