const API_URL = "https://task-manager-1-ft8i.onrender.com";
let token = localStorage.getItem("token");

// --- TOAST ---
function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
        document.body.appendChild(container);
    }
    const colors = { success: "#2d6a4f", error: "#c0392b", info: "#1a6fa8", warning: "#b7791f" };
    const toast = document.createElement("div");
    toast.style.cssText = `background:${colors[type]||colors.info};color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.18);max-width:280px;`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.cssText += "opacity:0;transition:opacity .3s;"; setTimeout(() => toast.remove(), 350); }, 3000);
}

// --- DOM READY ---
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".theme-btn").forEach(btn =>
        btn.addEventListener("click", () => setTheme(btn.dataset.theme))
    );
    document.getElementById("login-btn").addEventListener("click", login);
    document.getElementById("register-btn").addEventListener("click", register);
    document.getElementById("logout-btn").addEventListener("click", logout);
    document.getElementById("open-modal-btn").addEventListener("click", openModal);
    document.getElementById("cancel-modal-btn").addEventListener("click", closeModal);
    document.getElementById("save-task-btn").addEventListener("click", createTask);

    setTheme(localStorage.getItem("theme") || "light");
    if (token) showTasks();
});

// --- MODAL ---
function openModal() {
    document.getElementById("taskModal").style.display = "flex";
    const now = new Date();
    document.getElementById("task-created-display").value = now.toLocaleString();
    const deadline = new Date(now);
    deadline.setHours(deadline.getHours() + 24);
    document.getElementById("task-deadline").value = deadline.toISOString().slice(0, 16);
}

function closeModal() {
    document.getElementById("taskModal").style.display = "none";
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-priority").value = "medium";
}

// --- AUTH ---
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const fd = new FormData();
    fd.append("username", email);
    fd.append("password", password);
    try {
        const res = await fetch(`${API_URL}/login`, { method: "POST", body: fd });
        if (res.ok) {
            const data = await res.json();
            token = data.access_token;
            localStorage.setItem("token", token);
            showTasks();
        } else {
            showToast("Login failed! Check your email and password.", "error");
        }
    } catch { showToast("Could not connect to server.", "error"); }
}

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!email || !password) { showToast("Please fill in both fields.", "warning"); return; }
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        res.ok
            ? showToast("Registered! You can now log in.", "success")
            : showToast("Registration failed: " + (data.detail || "Invalid data"), "error");
    } catch { showToast("Could not connect to server.", "error"); }
}

// SESSION EXPIRED — clears token and returns to login view
function handleUnauthorized() {
    showToast("Session expired. Please log in again.", "warning");
    localStorage.removeItem("token");
    token = null;
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("task-section").style.display = "none";
}

// --- SHOW TASKS ---
async function showTasks() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("task-section").style.display = "block";
    try {
        const res = await fetch(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // ✅ FIX 1: catch 401 before doing anything with the body
        if (res.status === 401) { handleUnauthorized(); return; }

        const tasks = await res.json();

        // ✅ FIX 2: guard against error objects (e.g. {"detail":"..."})
        if (!Array.isArray(tasks)) {
            showToast("Unexpected server response.", "error");
            console.error("Expected array, got:", tasks);
            return;
        }

        const list = document.getElementById("task-list");
        list.innerHTML = "";

        if (tasks.length === 0) {
            list.innerHTML = `<li class="empty-state"><span style="font-size:2rem;">📋</span><p>No tasks yet — create your first one!</p></li>`;
            return;
        }

        tasks.forEach((task, idx) => {
            const now = new Date();
            const deadline = new Date(task.deadline);
            const isOverdue = !task.completed && deadline < now;
            const priority = task.priority || "medium";
            const priorityLabel = { high: "High", medium: "Med", low: "Low" }[priority];
            const priorityClass = { high: "priority-high", medium: "priority-med", low: "priority-low" }[priority];

            // Checkbox: ✕ if overdue, ✓ if complete, empty otherwise
            let cbInner = "";
            let cbClass = "custom-checkbox";
            if (isOverdue)        { cbInner = "✕"; cbClass += " overdue"; }
            else if (task.completed) { cbInner = "✓"; cbClass += " checked"; }

            const li = document.createElement("li");
            li.className = `task-row${task.completed ? " completed" : ""}${isOverdue ? " is-overdue" : ""}`;
            li.innerHTML = `
                <span class="col-num">${idx + 1}</span>
                <span class="col-title task-title-cell">${escHtml(task.title)}</span>
                <button class="info-btn toggle-details col-info" data-id="${task.id}" title="Show details">i</button>
                <span class="col-desc task-desc-preview">${escHtml(truncate(task.description || "—", 30))}</span>
                <span class="col-created task-meta">${fmtDate(task.created_at)}</span>
                <span class="col-deadline${isOverdue ? " overdue-text" : ""}">${fmtDate(task.deadline)}</span>
                <span class="${priorityClass} priority-badge col-priority">${priorityLabel}</span>
                <button class="del-btn delete-task col-del" data-id="${task.id}" title="Delete">🗑</button>
                <div class="${cbClass} col-check"
                     data-id="${task.id}"
                     data-completed="${task.completed}"
                     data-title="${escAttr(task.title)}"
                     title="${isOverdue ? "Overdue — click to mark complete" : task.completed ? "Mark incomplete" : "Mark complete"}">${cbInner}</div>
                <div id="desc-${task.id}" class="task-detail-panel" style="display:none;">
                    <p>${escHtml(task.description || "No description provided.")}</p>
                    <div class="detail-meta-row">
                        <span>Created: ${fmtDate(task.created_at)}</span>
                        <span>Deadline: ${fmtDate(task.deadline)}</span>
                        <span>Status: ${task.completed ? "✓ Completed" : isOverdue ? "⚠ Overdue" : "⏳ Pending"}</span>
                    </div>
                </div>
            `;
            list.appendChild(li);
        });

        list.addEventListener("click", handleTaskClick);

    } catch (err) {
        showToast("Failed to load tasks.", "error");
        console.error("showTasks error:", err);
    }
}

function handleTaskClick(e) {
    const infoBtn  = e.target.closest(".toggle-details");
    const delBtn   = e.target.closest(".delete-task");
    const checkbox = e.target.closest(".custom-checkbox");

    if (infoBtn) {
        const panel = document.getElementById(`desc-${infoBtn.dataset.id}`);
        if (panel) panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
    if (delBtn) deleteTask(delBtn.dataset.id);
    if (checkbox) {
        const { id, completed, title } = checkbox.dataset;
        toggleComplete(id, completed === "true", title);
    }
}

// --- CRUD ---
async function createTask() {
    const title = document.getElementById("task-title").value.trim();
    const description = document.getElementById("task-desc").value.trim();
    const deadline = document.getElementById("task-deadline").value;
    const priority = document.getElementById("task-priority").value;
    if (!title) { showToast("Please enter a task title.", "warning"); return; }
    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, deadline, priority, completed: false })
        });
        if (res.status === 401) { handleUnauthorized(); return; }
        if (!res.ok) { showToast("Failed to create task.", "error"); return; }
        showToast("Task created!", "success");
        closeModal();
        showTasks();
    } catch { showToast("Failed to create task.", "error"); }
}

async function toggleComplete(id, currentStatus, title) {
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentStatus, title })
        });
        if (res.status === 401) { handleUnauthorized(); return; }
        showTasks();
    } catch { showToast("Failed to update task.", "error"); }
}

async function deleteTask(id) {
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) { handleUnauthorized(); return; }
        showToast("Task deleted.", "info");
        showTasks();
    } catch { showToast("Failed to delete task.", "error"); }
}

// --- THEME & LOGOUT ---
function setTheme(name) {
    document.documentElement.setAttribute("data-theme", name);
    localStorage.setItem("theme", name);
}
function logout() { localStorage.clear(); location.reload(); }

// --- HELPERS ---
function fmtDate(str) {
    if (!str) return "—";
    const d = new Date(str);
    return isNaN(d) ? "—" : d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function truncate(s, n) { return s.length > n ? s.slice(0, n) + "…" : s; }
function escHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function escAttr(s) { return String(s).replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
