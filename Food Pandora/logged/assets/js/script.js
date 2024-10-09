document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission for demonstration
    alert('Login form submitted!'); // Placeholder action
});

document.getElementById("submit").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default form submission
    window.location.href = "index.html"; // Redirect to index.html
});

