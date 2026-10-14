import { useState } from 'react'

// StudentForm accepts an onSubmit prop from App.jsx
function StudentForm({ onSubmit }) {
  // Local state for each form field
  const [name, setName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [marks, setMarks] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    // Basic validation – all fields must be filled
    if (!name || !rollNumber || !department || !marks) {
      setError('Please fill in all fields.')
      return
    }

    setError('')

    // Pass data up to App.jsx via the onSubmit prop
    onSubmit({
      name,
      rollNumber,
      department,
      marks
    })

    // Clear the form after submission
    setName('')
    setRollNumber('')
    setDepartment('')
    setMarks('')
  }

  return (
    <div className="form-section">
      <h2>Enter Student Details</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Student Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter student name"
          />
        </div>

        <div className="form-group">
          <label>Roll Number:</label>
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Enter roll number"
          />
        </div>

        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. IT, Computer Science"
          />
        </div>

        <div className="form-group">
          <label>Marks:</label>
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="Enter marks"
          />
        </div>

        {/* Show error if validation fails */}
        {error && <span className="error">{error}</span>}

        <button type="submit">Submit</button>

      </form>
    </div>
  )
}

export default StudentForm
