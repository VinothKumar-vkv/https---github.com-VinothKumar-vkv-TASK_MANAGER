const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchTask = document.getElementById('searchTask');
const currentDateDisplay = document.getElementById('currentDate');
const dueDateInput = document.getElementById('taskDate'); // Select the date input element

// Insert the current date display at the top of the task section
const today = new Date();
currentDateDisplay.textContent = `Today's Date: ${today.toDateString()}`;

// Load tasks from local storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Render tasks initially
renderTasks();

// Add a new task
addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();

    if (!taskText) {
        alert('Please enter a task!');
        return;
    }

    const priorityLevels = ['Low', 'Medium', 'High'];
    const priority = prompt('Select task priority (Low, Medium, High):', 'Medium');

    if (!priorityLevels.includes(priority)) {
        alert('Invalid priority!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDateInput.value || null,
        priority: priority,
    };

    if (newTask.dueDate && isNaN(new Date(newTask.dueDate))) {
        alert('Invalid due date format!');
        return;
    }

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    dueDateInput.value = ''; // Reset the due date input
});

// Filter tasks
filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        renderTasks(filter);
    });
});

// Search tasks
searchTask.addEventListener('input', () => {
    const query = searchTask.value.toLowerCase();
    renderTasks('all', query);
});

// Render tasks
function renderTasks(filter = 'all', query = '') {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter((task) => {
        if (filter === 'completed') return task.completed;
        if (filter === 'pending') return !task.completed;
        return true;
    });

    const searchedTasks = filteredTasks.filter(task =>
        task.text.toLowerCase().includes(query)
    );

    searchedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    searchedTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <input type="checkbox" class="task-item-checkbox" ${task.completed ? 'checked' : ''}>
            <span>${task.text}</span>
            <small>Priority: ${task.priority}</small>
            <small>${task.dueDate ? `Due: ${task.dueDate}` : 'No due date'}</small>
            <small>Added: ${timeElapsed(new Date(task.createdAt))}</small>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
            <button class="mark-completed-btn">${task.completed ? 'Undo' : 'Complete'}</button>
        `;
        taskList.appendChild(li);

        // Mark task as completed or undo
        li.querySelector('.mark-completed-btn').addEventListener('click', () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        // Delete task
        li.querySelector('.delete-btn').addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });
    });

    updateTaskCounter();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update task counter
function updateTaskCounter() {
    taskCounter.textContent = `${tasks.filter(task => !task.completed).length} tasks remaining`;
}

// Time elapsed since task was added
function timeElapsed(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 3600 * 24));
    if (days === 0) {
        return 'Today';
    } else if (days === 1) {
        return '1 day ago';
    } else {
        return `${days} days ago`;
    }
}
