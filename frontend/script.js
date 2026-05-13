// const API_URL = "https://task-manager-1-ft8i.onrender.com";
// let token = localStorage.getItem("token");

// // --- MODAL LOGIC ---
// function openModal() {
//     document.getElementById('taskModal').style.display = "block";
//     const now = new Date();
//     // Setting default deadline to tomorrow at the same time
//     now.setHours(now.getHours() + 24);
//     document.getElementById('task-deadline').value = now.toISOString().slice(0, 16);
// }

// function closeModal() {
//     document.getElementById('taskModal').style.display = "none";
// }

// // --- AUTHENTICATION ---
// async function login() {
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const formData = new FormData();
//     formData.append('username', email);
//     formData.append('password', password);

//     const response = await fetch(`${API_URL}/login`, { method: 'POST', body: formData });
//     if (response.ok) {
//         const data = await response.json();
//         token = data.access_token;
//         localStorage.setItem("token", token);
//         showTasks();
//     } else { alert("Login failed!"); }
// }
// async function register() {
//     const emailField = document.getElementById('email');
//     const passwordField = document.getElementById('password');

//     if (!emailField || !passwordField) {
//         alert("Frontend Error: Email or Password input fields missing in HTML.");
//         return;
//     }

//     const email = emailField.value;
//     const password = passwordField.value;

//     if (!email || !password) {
//         alert("Please fill in both fields");
//         return;
//     }

//     try {
//         console.log("Sending registration to:", `${API_URL}/register`);
//         const response = await fetch(`${API_URL}/register`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 email: email,
//                 password: password
//             })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             alert("Registration successful! You can now login.");
//             emailField.value = '';
//             passwordField.value = '';
//         } else {
//             // This shows you exactly why the backend rejected it (e.g., "User already exists")
//             alert("Registration failed: " + (data.detail || JSON.stringify(data)));
//         }
//     } catch (error) {
//         console.error("Connection Error:", error);
//         alert("Could not connect to the server. Please check your Render URL.");
//     }
// }
// // --- TASK CRUD ---
// async function showTasks() {
//     document.getElementById('auth-section').style.display = 'none';
//     document.getElementById('task-section').style.display = 'block';

//     const response = await fetch(`${API_URL}/tasks`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//     });
//     const tasks = await response.json();
//     const list = document.getElementById('task-list');
//     list.innerHTML = "";
    
//     tasks.forEach(task => {
//         const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline";
//         list.innerHTML += `
//             <li class="task-item ${task.completed ? 'completed' : ''}">
//                 <div class="task-main">
//                     <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} 
//                            onclick="toggleComplete(${task.id}, ${task.completed}, '${task.title}')">
//                     <div class="task-info" onclick="toggleDetails(${task.id})">
//                         <span class="task-title">${task.title}</span>
//                         <span class="task-date">Due: ${deadlineStr}</span>
//                     </div>
//                     <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
//                 </div>
//                 <div id="desc-${task.id}" class="task-description" style="display: none;">
//                     ${task.description || "<i>No details.</i>"}
//                 </div>
//             </li>`;
//     });
// }

// async function createTask() {
//     const title = document.getElementById('task-title').value;
//     const description = document.getElementById('task-desc').value;
//     const deadline = document.getElementById('task-deadline').value;

//     const response = await fetch(`${API_URL}/tasks`, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ title, description, deadline, completed: false })
//     });

//     if (response.ok) {
//         closeModal();
//         showTasks();
//     }
// }

// async function toggleComplete(id, currentStatus, title) {
//     // Note: We send title because TaskCreate schema usually requires it
//     await fetch(`${API_URL}/tasks/${id}`, {
//         method: 'PUT',
//         headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
//         body: JSON.stringify({ completed: !currentStatus, title: title })
//     });
//     showTasks();
// }

// function toggleDetails(id) {
//     const desc = document.getElementById(`desc-${id}`);
//     desc.style.display = (desc.style.display === "none") ? "block" : "none";
// }

// async function deleteTask(id) {
//     await fetch(`${API_URL}/tasks/${id}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//     });
//     showTasks();
// }

// function setTheme(themeName) {
//     document.documentElement.setAttribute('data-theme', themeName);
//     localStorage.setItem('theme', themeName);
// }

// function logout() { localStorage.clear(); location.reload(); }

// const savedTheme = localStorage.getItem('theme') || 'light';
// setTheme(savedTheme);
// if (token) showTasks();



// // THIS IS THE MOST IMPORTANT LINE:
// window.register = register;
// window.login = login;

const API_URL = "https://task-manager-1-ft8i.onrender.com";
let token = localStorage.getItem("token");

// Cache frequently used DOM elements
const elements = {
    authSection: document.getElementById('auth-section'),
    taskSection: document.getElementById('task-section'),
    taskList: document.getElementById('task-list'),
    taskModal: document.getElementById('taskModal'),
    email: document.getElementById('email'),
    password: document.getElementById('password')
};

// --- MODAL LOGIC ---
function openModal() {
    elements.taskModal.style.display = "block";
    const now = new Date();
    now.setHours(now.getHours() + 24);
    document.getElementById('task-deadline').value = now.toISOString().slice(0, 16);
}

function closeModal() {
    elements.taskModal.style.display = "none";
}

// --- AUTHENTICATION ---
async function login() {
    const formData = new FormData();
    formData.append('username', elements.email.value);
    formData.append('password', elements.password.value);

    try {
        const response = await fetch(`${API_URL}/login`, { method: 'POST', body: formData });
        if (response.ok) {
            const data = await response.json();
            token = data.access_token;
            localStorage.setItem("token", token);
            showTasks();
        } else { alert("Login failed!"); }
    } catch (err) { console.error(err); }
}

async function register() {
    const email = elements.email?.value;
    const password = elements.password?.value;

    if (!email || !password) {
        alert("Please fill in both email and password fields.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registration successful! You can now login.");
            elements.email.value = '';
            elements.password.value = '';
        } else {
            alert(`Registration failed: ${data.detail || "Unknown error"}`);
        }
    } catch (error) {
        alert("Could not connect to the server.");
    }
}

// --- TASK CRUD ---
async function showTasks() {
    elements.authSection.style.display = 'none';
    elements.taskSection.style.display = 'block';

    const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const tasks = await response.json();
    
    // Performance: Build string first, then update DOM once
    const htmlContent = tasks.map(task => {
        const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline";
        return `
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
    }).join('');
    
    elements.taskList.innerHTML = htmlContent;
}

async function createTask() {
    const body = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        deadline: document.getElementById('task-deadline').value,
        completed: false
    };

    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        closeModal();
        showTasks();
    }
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

// Initialize
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);
if (token) showTasks();

// Expose functions globally for HTML button access
window.register = register;
window.login = login;
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;
window.createTask = createTask;
window.deleteTask = deleteTask;
window.toggleComplete = toggleComplete;
window.toggleDetails = toggleDetails;
