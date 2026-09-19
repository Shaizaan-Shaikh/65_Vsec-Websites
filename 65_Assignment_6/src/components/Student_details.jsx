// This component shows a detailed preview of the selected student.
// If no student is selected yet, it displays a friendly empty state.
export default function StudentDetails({ student }) {
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

  // Marks 35 and above are considered a pass
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
