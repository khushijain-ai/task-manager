const API_URL = "https://task-manager-1-ft8i.onrender.com";
let token = localStorage.getItem("token");

// --- MODAL LOGIC ---
function openModal() {
    document.getElementById('taskModal').style.display = "block";
    const now = new Date();
    now.setHours(now.getHours() + 24);
    document.getElementById('task-deadline').value = now.toISOString().slice(0, 16);
}

function closeModal() {
    document.getElementById('taskModal').style.display = "none";
}

// --- AUTHENTICATION ---
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
        const response = await fetch(`${API_URL}/login`, { method: 'POST', body: formData });
        if (response.ok) {
            const data = await response.json();
            token = data.access_token;
            localStorage.setItem("token", token);
            showTasks();
        } else {
            alert("Login failed! Check credentials.");
        }
    } catch (e) { console.error(e); }
}

async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("Please fill in both fields");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registration successful! You can now login.");
        } else {
            alert("Registration failed: " + (data.detail || "Invalid data"));
        }
    } catch (error) {
        alert("Could not connect to server.");
    }
}

// --- TASK CRUD ---
async function showTasks() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';

    const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const tasks = await response.json();
    const list = document.getElementById('task-list');
    list.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div class="task-main">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onclick="toggleComplete(${task.id}, ${task.completed}, '${task.title}')">
                <span style="${task.completed ? 'text-decoration: line-through;' : ''}">${task.title}</span>
                <button onclick="toggleDetails(${task.id})" class="info-btn">i</button>
                <button onclick="deleteTask(${task.id})" class="del-btn">🗑️</button>
            </div>
            <div id="desc-${task.id}" class="task-details" style="display:none;">
                <p>${task.description || 'No description'}</p>
                <small>Deadline: ${new Date(task.deadline).toLocaleString()}</small>
            </div>
        `;
        list.appendChild(li);
    });
}

async function createTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const deadline = document.getElementById('task-deadline').value;

    await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, deadline, completed: false })
    });
    closeModal();
    showTasks();
}

async function toggleComplete(id, currentStatus, title) {
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus, title })
    });
    showTasks();
}

function toggleDetails(id) {
    const desc = document.getElementById(`desc-${id}`);
    desc.style.display = (desc.style.display === "none") ? "block" : "none";
}

async function deleteTask(id) {
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    showTasks();
}

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
}

function logout() { 
    localStorage.clear(); 
    location.reload(); 
}

// Initializing
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);
if (token) showTasks();

// EXPOSE TO HTML (Fixes "is not defined")
window.register = register;
window.login = login;
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;
window.createTask = createTask;
window.toggleComplete = toggleComplete;
window.toggleDetails = toggleDetails;
window.deleteTask = deleteTask;
window.setTheme = setTheme;