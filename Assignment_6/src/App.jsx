import { useState } from 'react'
import StudentForm from './components/StudentForm'
import StudentDetails from './components/StudentDetails'
import './App.css'

function App() {
  // studentData holds the submitted student info, null means nothing submitted yet
  const [studentData, setStudentData] = useState(null)

  // This function is called by StudentForm when the user submits
  function handleSubmit(data) {
    setStudentData(data)
  }

  return (
    <div className="app-container">
      <h1>Student Information App</h1>

      {/* Form component – passes handleSubmit as a prop */}
      <StudentForm onSubmit={handleSubmit} />

      {/* Details component – only shows after a student is submitted */}
      {studentData && <StudentDetails student={studentData} />}
    </div>
  )
}

export default App
