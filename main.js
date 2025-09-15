import './style.css';
import { getAppData, saveAppData } from './js/api';
import { renderBoard, renderLabelsManager, renderTaskLabelsSelector, applyBackground } from './js/ui';
import { initTaskDragAndDrop, initListDragging } from './js/drag';

const main = () => {
    let appData = getAppData();

    const boardElement = document.getElementById('board');
    if (!boardElement) {
        console.error("Board element not found!");
        return;
    }

    // --- MODAL ELEMENTS ---
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const backgroundInput = document.getElementById('background-input');
    const backgroundFileInput = document.getElementById('background-file-input');
    const labelsManager = document.getElementById('labels-manager');
    const addLabelForm = document.getElementById('add-label-form');

    const taskModal = document.getElementById('task-editor-modal');
    const taskForm = document.getElementById('task-editor-form');
    const closeTaskModalBtn = document.getElementById('close-task-modal-btn');
    const taskModalTitle = document.getElementById('task-modal-title');
    const taskTitleInput = document.getElementById('task-title-input');
    const taskDescInput = document.getElementById('task-desc-input');
    const taskDeadlineInput = document.getElementById('task-deadline-input');
    const taskLabelsSelector = document.getElementById('task-labels-selector');
    const deleteTaskBtnModal = document.getElementById('delete-task-btn-modal');

    const rerender = () => {
        applyBackground(appData.settings.background);
        renderBoard(boardElement, appData);
        initTaskDragAndDrop(boardElement, appData);
    };

    // Initial render & setup
    rerender();
    initListDragging(boardElement, appData, rerender);

    // --- EVENT LISTENERS ---

    // Board-level event delegation
    boardElement.addEventListener('submit', (e) => {
        e.preventDefault();
        if (e.target.matches('#add-list-form')) {
            const input = e.target.querySelector('input');
            const listTitle = input.value.trim();
            if (listTitle) {
                const lastList = appData.lists[appData.lists.length - 1];
                const xPos = lastList ? lastList.position.x + 320 + 24 : 32;
                const yPos = lastList ? lastList.position.y : 32;

                const newList = {
                    id: `list-${Date.now()}`,
                    title: listTitle,
                    tasks: [],
                    position: { x: xPos, y: yPos }
                };
                appData.lists.push(newList);
                saveAppData(appData);
                rerender();
            }
        }
    });

    boardElement.addEventListener('click', (e) => {
        // Delete list
        const deleteListBtn = e.target.closest('.delete-list-btn');
        if (deleteListBtn) {
            const listElement = deleteListBtn.closest('.list');
            const listId = listElement.dataset.listId;
            appData.lists = appData.lists.filter(l => l.id !== listId);
            saveAppData(appData);
            rerender();
        }

        // Open Task Creation Modal
        const addTaskBtn = e.target.closest('.add-task-btn');
        if (addTaskBtn) {
            const listId = addTaskBtn.dataset.listId;
            openTaskModal(null, listId);
        }

        // Open Task Editor Modal
        const taskElement = e.target.closest('.task');
        if (taskElement) {
            const listElement = taskElement.closest('.list');
            const taskId = taskElement.dataset.taskId;
            const listId = listElement.dataset.listId;
            const list = appData.lists.find(l => l.id === listId);
            const task = list?.tasks.find(t => t.id === taskId);
            if (task) {
                openTaskModal(task, listId);
            }
        }
    });

    boardElement.addEventListener('focusout', (e) => {
        if (e.target.matches('.list-title')) {
            const listElement = e.target.closest('.list');
            const listId = listElement.dataset.listId;
            const list = appData.lists.find(l => l.id === listId);
            if (list && list.title !== e.target.value) {
                list.title = e.target.value;
                saveAppData(appData);
            }
        }
    });

    // --- MODAL HANDLING ---

    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        backgroundInput.value = appData.settings.background;
        renderLabelsManager(labelsManager, appData.labels);
        settingsModal.hidden = false;
    });
    closeSettingsModalBtn.addEventListener('click', () => settingsModal.hidden = true);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.hidden = true;
    });

    backgroundInput.addEventListener('change', (e) => {
        appData.settings.background = e.target.value;
        applyBackground(appData.settings.background);
        saveAppData(appData);
    });

    backgroundFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            appData.settings.background = dataUrl;
            applyBackground(appData.settings.background);
            saveAppData(appData);
            backgroundInput.value = 'Local Image'; // Update input for user feedback
        };
        reader.readAsDataURL(file);
    });

    addLabelForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textInput = document.getElementById('new-label-text');
        const colorInput = document.getElementById('new-label-color');
        const text = textInput.value.trim();
        if (text) {
            const newLabel = {
                id: `label-${Date.now()}`,
                text,
                color: colorInput.value
            };
            appData.labels.push(newLabel);
            saveAppData(appData);
            renderLabelsManager(labelsManager, appData.labels);
            textInput.value = '';
        }
    });

    labelsManager.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-label-btn');
        if (deleteBtn) {
            const item = deleteBtn.closest('.label-manager-item');
            const labelId = item.dataset.labelId;
            appData.labels = appData.labels.filter(l => l.id !== labelId);
            // Also remove from all tasks
            appData.lists.forEach(list => {
                list.tasks.forEach(task => {
                    task.labels = task.labels.filter(id => id !== labelId);
                });
            });
            saveAppData(appData);
            renderLabelsManager(labelsManager, appData.labels);
        }
    });

    // Task Editor Modal
    const openTaskModal = (task, listId) => {
        taskForm.reset();
        taskForm.dataset.listId = listId;
        if (task) { // Editing existing task
            taskForm.dataset.taskId = task.id;
            taskModalTitle.textContent = 'Edit Task';
            taskTitleInput.value = task.content;
            taskDescInput.value = task.description || '';
            taskDeadlineInput.value = task.deadline || '';
            renderTaskLabelsSelector(taskLabelsSelector, appData.labels, task.labels);
            deleteTaskBtnModal.hidden = false;
        } else { // Creating new task
            delete taskForm.dataset.taskId;
            taskModalTitle.textContent = 'Create Task';
            renderTaskLabelsSelector(taskLabelsSelector, appData.labels, []);
            deleteTaskBtnModal.hidden = true;
        }
        taskModal.hidden = false;
        taskTitleInput.focus();
    };

    taskLabelsSelector.addEventListener('click', (e) => {
        const item = e.target.closest('.label-selector-item');
        if (item) {
            item.classList.toggle('selected');
        }
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { taskId, listId } = taskForm.dataset;
        const list = appData.lists.find(l => l.id === listId);
        if (!list) return;

        const selectedLabelItems = taskLabelsSelector.querySelectorAll('.label-selector-item.selected');
        const selectedLabelIds = Array.from(selectedLabelItems).map(item => item.dataset.labelId);

        const taskData = {
            content: taskTitleInput.value.trim(),
            description: taskDescInput.value.trim(),
            deadline: taskDeadlineInput.value || null,
            labels: selectedLabelIds
        };

        if (taskId) { // Update existing task
            const task = list.tasks.find(t => t.id === taskId);
            if (task) {
                Object.assign(task, taskData);
            }
        } else { // Create new task
            const newTask = { id: `task-${Date.now()}`, ...taskData };
            list.tasks.push(newTask);
        }

        saveAppData(appData);
        rerender();
        taskModal.hidden = true;
    });

    deleteTaskBtnModal.addEventListener('click', () => {
        const { taskId, listId } = taskForm.dataset;
        const list = appData.lists.find(l => l.id === listId);
        if (list && taskId) {
            list.tasks = list.tasks.filter(t => t.id !== taskId);
            saveAppData(appData);
            rerender();
            taskModal.hidden = true;
        }
    });

    closeTaskModalBtn.addEventListener('click', () => taskModal.hidden = true);
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) taskModal.hidden = true;
    });
};

document.addEventListener('DOMContentLoaded', main);
