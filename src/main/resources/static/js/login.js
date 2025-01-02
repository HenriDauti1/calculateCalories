const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*.])[A-Za-z\d!@#$%^&*.]{6,}$/;

    const identifierError = document.getElementById('identifier-error');
    const passwordError = document.getElementById('password-error');

    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    identifierError.style.display = 'none';
    passwordError.style.display = 'none';


    if (!identifier) {
        identifierError.textContent = 'Username or Email is required.';
        identifierError.style.display = 'block';
        return;
    }
    if (!usernameRegex.test(identifier) && !emailRegex.test(identifier)) {
        identifierError.textContent = 'Username or Email is invalid.';
        identifierError.style.display = 'block';
        return;
    }
    if (!password) {
        passwordError.textContent = 'Password is required.';
        passwordError.style.display = 'block';
        return;
    }
    if (!passwordRegex.test(password)) {
        passwordError.textContent = 'Password is invalid.';
        passwordError.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST', headers: {
                'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa("Admin" + ':' + "Test123!")
            }, body: JSON.stringify({identifier, password}),
        });

        if (response.ok) {
            const result = await response.json();
            const role = result.role;
            if (role === "ROLE_ADMIN") {
                window.location.href = "/admin";
            } else if (role === "ROLE_USER") {
                window.location.href = "/user";
            }
        } else {
            const result = await response.json();
            alert(result.message || 'Login failed.');
        }
    } catch (error) {
        alert('An unexpected error occurred.');
    }
});
