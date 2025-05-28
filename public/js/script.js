document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const toggleButtons = document.querySelectorAll('.toggle-password');

  // Handle password visibility toggle
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        button.classList.add('showing');
      } else {
        input.type = 'password';
        button.classList.remove('showing');
      }
    });
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Here you would typically send the data to your server
    console.log('Form submitted:', { username, email, password });
    
    // Clear form
    form.reset();
  });
});