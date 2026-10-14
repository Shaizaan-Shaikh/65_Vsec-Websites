// StudentDetails receives a student prop from App.jsx and displays the info
function StudentDetails({ student }) {
  return (
    <div className="details-section">
      <h2>Student Details</h2>

      <p>Name: <span>{student.name}</span></p>
      <p>Roll Number: <span>{student.rollNumber}</span></p>
      <p>Department: <span>{student.department}</span></p>
      <p>Marks: <span>{student.marks}</span></p>
    </div>
  )
}

export default StudentDetails
