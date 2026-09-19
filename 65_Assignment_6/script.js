// Import React hook used for state management
const { useState } = React;

// Default empty values for the form
const initialForm = {
  name: '',
  roll: '',
  department: '',
  marks: ''
};

// -------------------------------------------------------------------
// StudentForm component
// This section contains the input form for student details.
// -------------------------------------------------------------------
function StudentForm({ formData, onChange, onSubmit, onReset }) {
  return (
    <section className="student-form-panel">
      <div className="panel-title">
        <h2>Add Student</h2>
        <span className="panel-tag">Student Form</span>
      </div>

      <form className="student-form" onSubmit={onSubmit}>
        <div className="form-row">
          <label htmlFor="name">Student Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            placeholder="Enter name"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="roll">Roll Number</label>
          <input
            id="roll"
            name="roll"
            type="text"
            value={formData.roll}
            onChange={onChange}
            placeholder="Enter roll number"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="department">Department</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={onChange}
            required
          >
            <option value="">Select Department</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="marks">Marks</label>
          <input
            id="marks"
            name="marks"
            type="number"
            min="0"
            max="100"
            value={formData.marks}
            onChange={onChange}
            placeholder="Enter marks"
            required
          />
        </div>

        <div className="button-row">
          <button className="primary-button" type="submit">Submit Student</button>
          <button className="secondary-button" type="button" onClick={onReset}>Clear</button>
        </div>
      </form>
    </section>
  );
}

// -------------------------------------------------------------------
// StudentDetails component
// This section shows the selected student record preview.
// -------------------------------------------------------------------
function StudentDetails({ student }) {
  if (!student) {
    return (
      <section className="student-details-panel">
        <div className="panel-title">
          <h2>Student Details</h2>
          <span className="panel-tag">Preview</span>
        </div>
        <div className="student-card empty-card">No student record selected yet.</div>
      </section>
    );
  }

  // Student passes if marks are 35 or above
  const isPass = Number(student.marks) >= 35;

  return (
    <section className="student-details-panel">
      <div className="panel-title">
        <h2>Student Details</h2>
        <span className="panel-tag">Preview</span>
      </div>

      <div className="student-card">
        <div className="student-card-header">
          <span className="avatar">S</span>
          <div>
            <h3>{student.name}</h3>
            <span className="dept-label">{student.department}</span>
          </div>
        </div>

        <div className="student-stats">
          <div>
            <span className="stat-label">Roll Number</span>
            <span className="stat-value">{student.roll}</span>
          </div>
          <div>
            <span className="stat-label">Marks</span>
            <span className="stat-value">{student.marks}</span>
          </div>
        </div>

        <div className="student-status">
          <span className={`result-badge ${isPass ? 'pass' : 'fail'}`}>
            {isPass ? 'Pass' : 'Fail'}
          </span>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// App component
// This contains the main page structure and state logic.
// -------------------------------------------------------------------
function App() {
  // Holds current input values from the form
  const [formData, setFormData] = useState(initialForm);

  // Holds all stored student objects
  const [students, setStudents] = useState([]);

  // Holds the last selected student for preview card
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Update form values when user types in input fields
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Add a new student when form is submitted
  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const roll = formData.roll.trim();
    const department = formData.department.trim();
    const marks = Number(formData.marks);

    if (!name || !roll || !department || Number.isNaN(marks)) return;
    if (marks < 0 || marks > 100) return;

    const student = { name, roll, department, marks };
    const updatedStudents = [...students, student];

    setStudents(updatedStudents);
    setSelectedStudent(student);
    setFormData(initialForm);
  }

  // Reset form fields to blank values
  function handleReset() {
    setFormData(initialForm);
  }

  return (
    <div className="student-page">
      {/* Header with logo and nav links */}
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

        <section className="content-grid">
          <StudentForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
          <StudentDetails student={selectedStudent} />
        </section>

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

      {/* Footer section */}
      <footer className="app-footer">
        <p>Student Information System • React App</p>
      </footer>
    </div>
  );
}

// Render the complete App into the root element
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
