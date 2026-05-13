const API_URL = "https://task-manager-1-ft8i.onrender.com";
let token = localStorage.getItem("token");

// --- DOM READY: wire up all event listeners here ---
document.addEventListener("DOMContentLoaded", () => {

    // Theme buttons
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.addEventListener("click", () => setTheme(btn.dataset.theme));
    });

    // Auth buttons
    document.getElementById("login-btn").addEventListener("click", login);
    document.getElementById("register-btn").addEventListener("click", register);
    document.getElementById("logout-btn").addEventListener("click", logout);

    // Modal buttons
    document.getElementById("open-modal-btn").addEventListener("click", openModal);
    document.getElementById("cancel-modal-btn").addEventListener("click", closeModal);
    document.getElementById("save-task-btn").addEventListener("click", createTask);

    // Apply saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    // Auto-login if token exists
    if (token) showTasks();
});

// --- MODAL LOGIC ---
function openModal() {
    document.getElementById("taskModal").style.display = "block";
    const now = new Date();
    now.setHours(now.getHours() + 24);
    document.getElementById("task-deadline").value = now.toISOString().slice(0, 16);
}

function closeModal() {
    document.getElementById("taskModal").style.display = "none";
}

// --- AUTHENTICATION ---
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // FastAPI OAuth2 expects 'username' and 'password' in FormData
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            token = data.access_token;
            localStorage.setItem("token", token);
            showTasks();
        } else {
            alert("Login failed! Check your email and password.");
        }
    } catch (error) {
        alert("Could not connect to server.");
    }
}

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill in both fields");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
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
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("task-section").style.display = "block";

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const tasks = await response.json();
        const list = document.getElementById("task-list");
        list.innerHTML = "";

        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = "task-item";
            li.innerHTML = `
                <div class="task-main">
                    <input type="checkbox" ${task.completed ? "checked" : ""}
                        data-id="${task.id}" data-completed="${task.completed}" data-title="${task.title}" class="toggle-complete">
                    <span style="${task.completed ? "text-decoration: line-through;" : ""}">${task.title}</span>
                    <button data-id="${task.id}" class="info-btn toggle-details">i</button>
                    <button data-id="${task.id}" class="del-btn delete-task">🗑️</button>
                </div>
                <div id="desc-${task.id}" class="task-details" style="display:none;">
                    <p>${task.description || "No description"}</p>
                    <small>Deadline: ${new Date(task.deadline).toLocaleString()}</small>
                </div>
            `;
            list.appendChild(li);
        });

        // Delegate task list events — avoids inline onclick in dynamic HTML too
        list.addEventListener("click", handleTaskListClick);
    } catch (error) {
        console.error("Failed to load tasks:", error);
    }
}

function handleTaskListClick(e) {
    const toggleBtn = e.target.closest(".toggle-details");
    const deleteBtn = e.target.closest(".delete-task");
    const checkbox  = e.target.closest(".toggle-complete");

    if (toggleBtn) {
        const id = toggleBtn.dataset.id;
        const desc = document.getElementById(`desc-${id}`);
        desc.style.display = desc.style.display === "none" ? "block" : "none";
    }

    if (deleteBtn) {
        deleteTask(deleteBtn.dataset.id);
    }

    if (checkbox) {
        const { id, completed, title } = checkbox.dataset;
        toggleComplete(id, completed === "true", title);
    }
}

async function createTask() {
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-desc").value;
    const deadline = document.getElementById("task-deadline").value;

    try {
        await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, description, deadline, completed: false })
        });
        closeModal();
        showTasks();
    } catch (error) {
        alert("Failed to create task.");
    }
}

async function toggleComplete(id, currentStatus, title) {
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ completed: !currentStatus, title })
        });
        showTasks();
    } catch (error) {
        console.error("Failed to update task:", error);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        showTasks();
    } catch (error) {
        console.error("Failed to delete task:", error);
    }
}

function setTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("theme", themeName);
}

function logout() {
    localStorage.clear();
    location.reload();
}
