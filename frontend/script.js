const API_URL = "http://127.0.0.1:8000";
let token = localStorage.getItem("token");

// --- MODAL LOGIC ---
function openModal() {
    document.getElementById('taskModal').style.display = "block";
    const now = new Date();
    // Setting default deadline to tomorrow at the same time
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

    const response = await fetch(`${API_URL}/login`, { method: 'POST', body: formData });
    if (response.ok) {
        const data = await response.json();
        token = data.access_token;
        localStorage.setItem("token", token);
        showTasks();
    } else { alert("Login failed!"); }
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
    list.innerHTML = "";
    
    tasks.forEach(task => {
        const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline";
        list.innerHTML += `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-main">
                    <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} 
                           onclick="toggleComplete(${task.id}, ${task.completed}, '${task.title}')">
                    <div class="task-info" onclick="toggleDetails(${task.id})">
                        <span class="task-title">${task.title}</span>
                        <span class="task-date">Due: ${deadlineStr}</span>
                    </div>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </div>
                <div id="desc-${task.id}" class="task-description" style="display: none;">
                    ${task.description || "<i>No details.</i>"}
                </div>
            </li>`;
    });
}

async function createTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const deadline = document.getElementById('task-deadline').value;

    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, deadline, completed: false })
    });

    if (response.ok) {
        closeModal();
        showTasks();
    }
}

async function toggleComplete(id, currentStatus, title) {
    // Note: We send title because TaskCreate schema usually requires it
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus, title: title })
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

function logout() { localStorage.clear(); location.reload(); }

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);
if (token) showTasks();