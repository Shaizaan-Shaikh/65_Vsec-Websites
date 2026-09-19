// Import React hook and child components used in this app
import { useState } from 'react';
import StudentForm from '../components/Student_form';
import StudentDetails from '../components/Student_details';
import './App.css';

// Default empty values for the student form
const initialForm = {
  name: '',
  roll: '',
  department: '',
  marks: ''
};

// Main application component
export default function App() {
  // Stores the current values typed by the user in the form
  const [formData, setFormData] = useState(initialForm);

  // Stores all saved student records in the table
  const [students, setStudents] = useState([]);

  // Stores the currently selected student for the detail preview card
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Updates the specific field value whenever the user types
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Adds a new student to the list after validation
  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const roll = formData.roll.trim();
    const department = formData.department.trim();
    const marks = Number(formData.marks);

    // Basic validation before saving data
    if (!name || !roll || !department || Number.isNaN(marks)) return;
    if (marks < 0 || marks > 100) return;

    const student = { name, roll, department, marks };
    const updatedStudents = [...students, student];

    setStudents(updatedStudents);
    setSelectedStudent(student);
    setFormData(initialForm);
  }

  // Clears the form without changing the student list
  function handleReset() {
    setFormData(initialForm);
  }

  return (
    <div className="student-page">
      {/* Header section with app name and navigation links */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-mark">S</span>
          <span className="logo-text">StudentInfo</span>
        </div>

        <nav className="app-nav">
          <a href="#">Students</a>
          <a href="#">Departments</a>
          <a href="#">Results</a>
          <a href="#">Reports</a>
        </nav>
      </header>

      {/* Main page content */}
      <main className="app-main">
        <section className="dashboard-title">
          <div>
            <h1>Student Information Application</h1>
          </div>
          <button
            className="top-action"
            type="button"
            onClick={() => setSelectedStudent(students[students.length - 1] || null)}
          >
            Refresh
          </button>
        </section>

        {/* Form and preview sections are shown side by side */}
        <section className="content-grid">
          <StudentForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
          <StudentDetails student={selectedStudent} />
        </section>

        {/* Student records table section */}
        <section className="records-section">
          <div className="records-title">
            <h2>Student Records</h2>
            <span className="record-count">
              {students.length} Student{students.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Marks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">No student records yet</td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={`${student.roll}-${index}`}>
                      <td>{student.name}</td>
                      <td>{student.roll}</td>
                      <td>{student.department}</td>
                      <td>{student.marks}</td>
                      <td>
                        <span className={`result-badge ${student.marks >= 35 ? 'pass' : 'fail'}`}>
                          {student.marks >= 35 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer area */}
      <footer className="app-footer">
        <p>Student Information System • React App</p>
      </footer>
    </div>
  );
}
