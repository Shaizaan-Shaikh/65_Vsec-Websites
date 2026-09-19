// Get the form element from the HTML page
const form = document.getElementById('employeeForm');

// Listen for the submit event when the user clicks Register Employee
form.addEventListener('submit', function (event) {
  // Prevent page refresh on form submission
  event.preventDefault();

  // Read values entered by the user
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value.trim();
  const department = document.getElementById('department').value;

  // Get all error message elements
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const phoneError = document.getElementById('phoneError');
  const departmentError = document.getElementById('departmentError');
  const successMessage = document.getElementById('successMessage');

  // Clear previous messages before validation
  nameError.textContent = '';
  emailError.textContent = '';
  passwordError.textContent = '';
  phoneError.textContent = '';
  departmentError.textContent = '';
  successMessage.textContent = '';

  // Remove old validation styles from all inputs
  document.querySelectorAll('input, select').forEach((field) => {
    field.classList.remove('input-error', 'input-success');
  });

  // Track whether the form is valid
  let valid = true;

  // -------------------------
  // Name validation
  // -------------------------
  const namePattern = /^[A-Za-z ]{3,}$/;
  if (name === '') {
    nameError.textContent = 'Name is required.';
    document.getElementById('name').classList.add('input-error');
    valid = false;
  } else if (!namePattern.test(name)) {
    nameError.textContent = 'Name must contain only letters and spaces with at least 3 characters.';
    document.getElementById('name').classList.add('input-error');
    valid = false;
  } else {
    document.getElementById('name').classList.add('input-success');
  }

  // -------------------------
  // Email validation
  // -------------------------
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === '') {
    emailError.textContent = 'Email is required.';
    document.getElementById('email').classList.add('input-error');
    valid = false;
  } else if (!emailPattern.test(email)) {
    emailError.textContent = 'Please enter a valid email address.';
    document.getElementById('email').classList.add('input-error');
    valid = false;
  } else {
    document.getElementById('email').classList.add('input-success');
  }

  // -------------------------
  // Password validation
  // -------------------------
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (password === '') {
    passwordError.textContent = 'Password is required.';
    document.getElementById('password').classList.add('input-error');
    valid = false;
  } else if (!passwordPattern.test(password)) {
    passwordError.textContent = 'Password must be at least 8 characters with one uppercase, one number, and one special character.';
    document.getElementById('password').classList.add('input-error');
    valid = false;
  } else {
    document.getElementById('password').classList.add('input-success');
  }

  // -------------------------
  // Phone validation
  // -------------------------
  const phonePattern = /^[6-9]\d{9}$/;
  if (phone === '') {
    phoneError.textContent = 'Phone number is required.';
    document.getElementById('phone').classList.add('input-error');
    valid = false;
  } else if (!phonePattern.test(phone)) {
    phoneError.textContent = 'Enter a valid 10-digit Indian mobile number.';
    document.getElementById('phone').classList.add('input-error');
    valid = false;
  } else {
    document.getElementById('phone').classList.add('input-success');
  }

  // -------------------------
  // Department validation
  // -------------------------
  if (department === '') {
    departmentError.textContent = 'Please select a department.';
    document.getElementById('department').classList.add('input-error');
    valid = false;
  } else {
    document.getElementById('department').classList.add('input-success');
  }

  // -------------------------
  // Final result
  // -------------------------
  if (valid) {
    successMessage.textContent = 'Employee registered successfully!';
    form.reset();
  } else {
    const firstError = document.querySelector('.input-error');
    if (firstError) {
      firstError.focus();
    }
  }
});
