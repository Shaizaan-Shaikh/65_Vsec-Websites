const samples = [
 { id: 'sample-1', name: 'Aarav Patil', rollNumber: '12', department: 'Information Technology', marks: 85 },
 { id: 'sample-2', name: 'Ananya Deshmukh', rollNumber: '24', department: 'Computer Engineering', marks: 92 },
 { id: 'sample-3', name: 'Rohan More', rollNumber: '38', department: 'Information Technology', marks: 78 },
];
let students = structuredClone(samples);
let editing = null;
const form = document.querySelector('#student-form');
const list = document.querySelector('#students');
const status = document.querySelector('#status');
function render() {
 list.replaceChildren();
 document.querySelector('#count').textContent = `(${students.length})`;
 if (!students.length) { list.textContent = 'No students yet. Add a student to begin.'; return; }
 for (const student of students) {
  const row = document.createElement('article'); row.className = 'student';
  const info = document.createElement('div');
  const title = document.createElement('h3'); title.textContent = student.name;
  const meta = document.createElement('p'); meta.textContent = `Roll ${student.rollNumber} · ${student.department} · Marks ${student.marks}/100`;
  info.append(title, meta);
  const actions = document.createElement('div'); actions.className = 'buttons';
  for (const action of ['Edit', 'Delete']) {
   const button = document.createElement('button'); button.type = 'button'; button.textContent = action;
   button.className = action === 'Edit' ? 'secondary' : 'delete';
   button.addEventListener('click', () => {
    if (action === 'Edit') {
     editing = student.id;
     for (const key of ['name', 'rollNumber', 'department', 'marks']) form.elements[key].value = student[key];
     document.querySelector('#form-title').textContent = 'Edit student';
     document.querySelector('#save').textContent = 'Save changes';
     document.querySelector('#cancel').hidden = false;
     form.elements.name.focus();
    } else {
     students = students.filter(item => item.id !== student.id);
     if (editing === student.id) resetForm();
     render(); status.textContent = 'Student removed from this preview.';
    }
   }); actions.append(button);
  }
  row.append(info, actions); list.append(row);
 }
}
function resetForm() {
 editing = null; form.reset();
 document.querySelector('#form-title').textContent = 'Add a student';
 document.querySelector('#save').textContent = 'Add student';
 document.querySelector('#cancel').hidden = true;
}
form.addEventListener('submit', event => {
 event.preventDefault();
 const values = Object.fromEntries(new FormData(form));
 for (const key of ['name', 'rollNumber', 'department']) {
  values[key] = values[key].trim();
  if (!values[key]) { status.textContent = 'Please fill in all student fields.'; form.elements[key].focus(); return; }
 }
 values.marks = Number(values.marks);
 if (editing) students = students.map(item => item.id === editing ? { ...item, ...values } : item);
 else students.push({ id: crypto.randomUUID(), ...values });
 status.textContent = editing ? 'Student updated in this preview.' : 'Student added to this preview.';
 resetForm(); render();
});
document.querySelector('#cancel').addEventListener('click', resetForm);
document.querySelector('#reset').addEventListener('click', () => {
 students = structuredClone(samples); resetForm(); render(); status.textContent = 'Sample records restored.';
});
render();
