let students = [];

function showMarksSection() {

  let name = document.getElementById("name").value.trim();
  let roll = document.getElementById("roll").value.trim();

  if (name === "" || roll === "") {
    alert("Please enter student name and roll number");
    return;
  }

  document.getElementById("studentSection").classList.add("hidden");
  document.getElementById("marksSection").classList.remove("hidden");
}

function addStudent() {

  let name = document.getElementById("name").value;
  let roll = document.getElementById("roll").value;

  let m1 = Number(document.getElementById("m1").value);
  let m2 = Number(document.getElementById("m2").value);
  let m3 = Number(document.getElementById("m3").value);
  let m4 = Number(document.getElementById("m4").value);
  let m5 = Number(document.getElementById("m5").value);

  let marks = [m1, m2, m3, m4, m5];

  for (let i = 0; i < marks.length; i++) {
    if (isNaN(marks[i]) || marks[i] < 0 || marks[i] > 100) {
      alert("Enter valid marks between 0 and 100");
      return;
    }
  }

  let total = m1 + m2 + m3 + m4 + m5;

  let percentage = (total / 500) * 100;

  let grade = "";

  if (percentage >= 90)
    grade = "A+";
  else if (percentage >= 80)
    grade = "A";
  else if (percentage >= 70)
    grade = "B";
  else if (percentage >= 60)
    grade = "C";
  else if (percentage >= 50)
    grade = "D";
  else
    grade = "F";

  let result = "Pass";

  if (m1 < 35 || m2 < 35 || m3 < 35 || m4 < 35 || m5 < 35) {
    result = "Fail";
    grade = "F";
  }

  students.push({
    roll,
    name,
    total,
    percentage,
    grade,
    result
  });

  displayStudents();

  clearFields();
}

function displayStudents() {

  let body = document.getElementById("tableBody");

  body.innerHTML = "";

  let highest = 0;
  let topper = "None";

  students.forEach((s) => {

    if (s.percentage > highest) {

      highest = s.percentage;
      topper = s.name;

    }

  });

  students.forEach((s, index) => {

    let row = body.insertRow();

    if (s.percentage === highest) {

      row.classList.add("topper");

    }

    row.innerHTML = `

      <td>${s.roll}</td>
      <td>${s.name}</td>
      <td>${s.total}</td>
      <td>${s.percentage.toFixed(2)}%</td>
      <td>${s.grade}</td>
      <td class="${s.result === "Pass" ? "pass" : "fail"}">${s.result}</td>
      <td>
        <button onclick="deleteStudent(${index})">Delete</button>
      </td>

    `;

  });

  document.getElementById("topper").innerHTML =
    "Topper : " + topper + " (" + highest.toFixed(2) + "%)";
}

function deleteStudent(index) {

  students.splice(index, 1);

  displayStudents();
}

function clearFields() {

  document.getElementById("name").value = "";
  document.getElementById("roll").value = "";

  document.getElementById("m1").value = "";
  document.getElementById("m2").value = "";
  document.getElementById("m3").value = "";
  document.getElementById("m4").value = "";
  document.getElementById("m5").value = "";

  document.getElementById("marksSection").classList.add("hidden");
  document.getElementById("studentSection").classList.remove("hidden");
}