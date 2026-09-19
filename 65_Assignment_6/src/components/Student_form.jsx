// This component shows the form used to enter student information.
// It receives the current form values and handlers from the parent app.
export default function StudentForm({ formData, onChange, onSubmit, onReset }) {
  return (
    <section className="student-form-panel">
      <div className="panel-title">
        <h2>Add Student</h2>
        <span className="panel-tag">Student Form</span>
      </div>

      {/* Student input form */}
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

        {/* Buttons to submit or clear form values */}
        <div className="button-row">
          <button className="primary-button" type="submit">
            Submit Student
          </button>
          <button className="secondary-button" type="button" onClick={onReset}>
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}
