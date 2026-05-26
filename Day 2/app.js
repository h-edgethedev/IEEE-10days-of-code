// =============================================
//  app.js — Taskr Task Manager
//  Vanilla JS only. No frameworks, no libraries.
// =============================================

// ── Constants ────────────────────────────────
const STORAGE_KEY = "taskr_tasks";

// ── State ────────────────────────────────────
let tasks = [];
let currentFilter = "all"; // "all" | "active" | "completed"

// ── DOM refs ─────────────────────────────────
const taskInput      = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const addBtn         = document.getElementById("add-btn");
const taskList       = document.getElementById("task-list");
const taskCounter    = document.getElementById("task-counter");
const errorMsg       = document.getElementById("error-msg");
const filterBtns     = document.querySelectorAll(".filter-btn");

// ── localStorage helpers ──────────────────────
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : [];
  } catch {
    tasks = [];
  }
}

// ── Task operations ───────────────────────────
function createTask(title, priority) {
  return {
    id:        Date.now().toString(),
    title:     title.trim(),
    priority:  priority,
    completed: false,
    createdAt: Date.now(),
  };
}

function addTask() {
  const title = taskInput.value;

  // Validate
  if (!title.trim()) {
    showError("Task title is required");
    return;
  }

  const task = createTask(title, prioritySelect.value);
  tasks.unshift(task); // prepend — newest at top within incomplete group
  saveTasks();

  // Reset form
  taskInput.value        = "";
  prioritySelect.value   = "medium";
  clearError();
  taskInput.focus();

  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

// ── Sorting ───────────────────────────────────
// Incomplete first (newest at top), completed below (newest at top)
function getSortedTasks() {
  const incomplete = tasks.filter((t) => !t.completed);
  const completed  = tasks.filter((t) =>  t.completed);
  return [...incomplete, ...completed];
}

// ── Filtering ─────────────────────────────────
function getFilteredTasks(sorted) {
  if (currentFilter === "active")    return sorted.filter((t) => !t.completed);
  if (currentFilter === "completed") return sorted.filter((t) =>  t.completed);
  return sorted;
}

// ── Validation UI ─────────────────────────────
function showError(message) {
  errorMsg.textContent = message;
  taskInput.classList.add("has-error");
}

function clearError() {
  errorMsg.textContent = "";
  taskInput.classList.remove("has-error");
}

// ── Rendering ─────────────────────────────────
function updateCounter() {
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  taskCounter.textContent = `${completed} of ${total} task${total !== 1 ? "s" : ""} completed`;
}

function renderEmptyState(message) {
  const li = document.createElement("li");
  li.className     = "empty-state";
  li.textContent   = message;
  taskList.appendChild(li);
}

function buildTaskCard(task) {
  const li = document.createElement("li");
  li.className    = `task-card${task.completed ? " is-completed" : ""}`;
  li.dataset.id   = task.id;

  // ── Complete toggle button
  const completeBtn = document.createElement("button");
  completeBtn.className  = `btn-complete${task.completed ? " done" : ""}`;
  completeBtn.setAttribute("aria-label", task.completed ? "Mark as incomplete" : "Mark as complete");

  const checkmark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  checkmark.setAttribute("viewBox", "0 0 12 12");
  checkmark.classList.add("checkmark");
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", "2,6 5,9 10,3");
  checkmark.appendChild(polyline);
  completeBtn.appendChild(checkmark);

  completeBtn.addEventListener("click", () => toggleTask(task.id));

  // ── Task body (title + badge)
  const taskBody = document.createElement("div");
  taskBody.className = "task-body";

  const titleEl = document.createElement("span");
  titleEl.className   = `task-title${task.completed ? " done" : ""}`;
  titleEl.textContent = task.title;

  const badge = document.createElement("span");
  badge.className   = `badge badge-${task.priority}`;
  badge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  taskBody.appendChild(titleEl);
  taskBody.appendChild(badge);

  // ── Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-delete";
  deleteBtn.setAttribute("aria-label", "Delete task");

  const trashIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  trashIcon.setAttribute("viewBox", "0 0 24 24");
  trashIcon.setAttribute("stroke-linecap", "round");
  trashIcon.setAttribute("stroke-linejoin", "round");
  trashIcon.innerHTML = `
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6l-1 14H6L5 6"></path>
    <path d="M10 11v6"></path>
    <path d="M14 11v6"></path>
    <path d="M9 6V4h6v2"></path>
  `;
  deleteBtn.appendChild(trashIcon);
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  // ── Assemble card
  li.appendChild(completeBtn);
  li.appendChild(taskBody);
  li.appendChild(deleteBtn);

  return li;
}

function render() {
  // Clear list
  taskList.innerHTML = "";

  const sorted   = getSortedTasks();
  const filtered = getFilteredTasks(sorted);

  if (filtered.length === 0) {
    if (currentFilter === "active") {
      renderEmptyState("No active tasks.");
    } else if (currentFilter === "completed") {
      renderEmptyState("No completed tasks.");
    } else {
      renderEmptyState("No tasks yet. Add one above to get started.");
    }
  } else {
    const fragment = document.createDocumentFragment();
    filtered.forEach((task) => fragment.appendChild(buildTaskCard(task)));
    taskList.appendChild(fragment);
  }

  updateCounter();
}

// ── Event listeners ───────────────────────────

// Add task on button click
addBtn.addEventListener("click", addTask);

// Add task on Enter key
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// Clear error as soon as user starts typing
taskInput.addEventListener("input", () => {
  if (taskInput.value.trim()) clearError();
});

// Filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;

    // Update active state
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    render();
  });
});

// ── Init ──────────────────────────────────────
loadTasks();
render();
