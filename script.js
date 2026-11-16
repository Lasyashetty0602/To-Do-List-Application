
// Get HTML elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyMessage = document.getElementById("emptyMessage");
const submitBtn = document.getElementById("submitBtn");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

// Load tasks from Local Storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";
let editingId = null;

// Save tasks to Local Storage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// READ: Display tasks
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        li.dataset.id = task.id;

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Complete ${task.text}`);

        // Task text
        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        editBtn.dataset.action = "edit";

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.action = "delete";

        li.append(checkbox, span, editBtn, deleteBtn);
        taskList.appendChild(li);
    });

    const remaining = tasks.filter(task => !task.completed).length;

    taskCount.textContent =
        `${remaining} task${remaining !== 1 ? "s" : ""} remaining`;

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    clearCompleted.style.display =
        tasks.some(task => task.completed) ? "block" : "none";
}

// CREATE: Add a new task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    if (editingId !== null) {
        // UPDATE: Save edited task
        tasks = tasks.map(task =>
            task.id === editingId
                ? { ...task, text: text }
                : task
        );

        editingId = null;
        submitBtn.textContent = "Add Task";

    } else {
        const newTask = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            text: text,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();
    taskInput.value = "";
    renderTasks();
});

// EVENT DELEGATION: Handle task actions
taskList.addEventListener("click", function(event) {
    const li = event.target.closest(".task-item");

    if (!li) return;

    const id = li.dataset.id;

    // EDIT task
    if (event.target.dataset.action === "edit") {
        const task = tasks.find(task => task.id === id);

        if (!task) return;

        taskInput.value = task.text;
        editingId = id;
        submitBtn.textContent = "Update Task";
        taskInput.focus();
    }

    // DELETE task
    if (event.target.dataset.action === "delete") {
        tasks = tasks.filter(task => task.id !== id);

        if (editingId === id) {
            editingId = null;
            taskInput.value = "";
            submitBtn.textContent = "Add Task";
        }

        saveTasks();
        renderTasks();
    }
});

// UPDATE: Mark task as completed or active
taskList.addEventListener("change", function(event) {
    if (event.target.type !== "checkbox") return;

    const li = event.target.closest(".task-item");

    if (!li) return;

    const id = li.dataset.id;

    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: event.target.checked }
            : task
    );

    saveTasks();
    renderTasks();
});

// FILTER: All, Active and Completed
filterButtons.forEach(button => {
    button.addEventListener("click", function() {
        currentFilter = this.dataset.filter;

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        renderTasks();
    });
});

// DELETE all completed tasks
clearCompleted.addEventListener("click", function() {
    tasks = tasks.filter(task => !task.completed);

    if (editingId !== null &&
        !tasks.some(task => task.id === editingId)) {
        editingId = null;
        taskInput.value = "";
        submitBtn.textContent = "Add Task";
    }

    saveTasks();
    renderTasks();
});

// Initial display when page loads
renderTasks();
