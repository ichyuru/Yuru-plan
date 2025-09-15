const createDeleteIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
`;

const createCalendarIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
`;

const createTaskElement = (task, allLabels) => {
    const taskEl = document.createElement('div');
    taskEl.className = 'task';
    taskEl.dataset.taskId = task.id;

    const labelsHtml = `
        <div class="labels-container">
            ${task.labels.map(labelId => {
                const label = allLabels.find(l => l.id === labelId);
                return label ? `<div class="label-pill" style="background-color: ${label.color};" title="${label.text}"></div>` : '';
            }).join('')}
        </div>
    `;

    const deadlineBadge = task.deadline
        ? `
        <div class="deadline-badge">
            ${createCalendarIcon()}
            <span>${new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
        `
        : '';

    taskEl.innerHTML = `
        ${labelsHtml}
        <div class="task-header">
            <span class="task-content">${task.content}</span>
        </div>
        <div class="task-meta">
            ${deadlineBadge}
        </div>
    `;
    return taskEl;
};

const createListElement = (list, allLabels) => {
    const listEl = document.createElement('div');
    listEl.className = 'list';
    listEl.dataset.listId = list.id;
    listEl.style.left = `${list.position.x}px`;
    listEl.style.top = `${list.position.y}px`;

    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    tasksContainer.dataset.listId = list.id;

    list.tasks.forEach(task => {
        tasksContainer.appendChild(createTaskElement(task, allLabels));
    });

    listEl.innerHTML = `
        <div class="list-header">
            <input type="text" class="list-title" value="${list.title}">
            <button class="icon-btn delete-list-btn" aria-label="Delete list">
                ${createDeleteIcon()}
            </button>
        </div>
    `;
    listEl.appendChild(tasksContainer);
    listEl.innerHTML += `
        <button class="add-task-btn" data-list-id="${list.id}">+ Add a card</button>
    `;

    return listEl;
};

const createAddListForm = (appData) => {
    const formContainer = document.createElement('div');
    formContainer.className = 'add-list-container';
    
    // Position the "Add list" form next to the last list
    const lastList = appData.lists[appData.lists.length - 1];
    const xPos = lastList ? lastList.position.x + 320 + 24 : 32;
    const yPos = lastList ? lastList.position.y : 32;
    formContainer.style.left = `${xPos}px`;
    formContainer.style.top = `${yPos}px`;

    formContainer.innerHTML = `
        <form id="add-list-form">
            <input type="text" name="listTitle" placeholder="+ Add another list" required />
        </form>
    `;
    return formContainer;
};

export const renderBoard = (boardElement, appData) => {
    boardElement.innerHTML = ''; // Clear the board

    appData.lists.forEach(list => {
        boardElement.appendChild(createListElement(list, appData.labels));
    });

    boardElement.appendChild(createAddListForm(appData));
};

export const renderLabelsManager = (container, labels) => {
    container.innerHTML = labels.map(label => `
        <div class="label-manager-item" data-label-id="${label.id}">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="label-pill" style="background-color: ${label.color};"></div>
                <span>${label.text}</span>
            </div>
            <button class="icon-btn delete-label-btn" aria-label="Delete label">${createDeleteIcon()}</button>
        </div>
    `).join('');
};

export const renderTaskLabelsSelector = (container, allLabels, selectedLabelIds = []) => {
    container.innerHTML = allLabels.map(label => `
        <div class="label-selector-item ${selectedLabelIds.includes(label.id) ? 'selected' : ''}" data-label-id="${label.id}">
            <div class="label-pill" style="background-color: ${label.color};"></div>
            <span>${label.text}</span>
        </div>
    `).join('');
};

export const applyBackground = (backgroundValue) => {
    if (!backgroundValue) {
        backgroundValue = 'var(--background)'; // Fallback
    }

    // Check for image-like values (URL, data URI)
    if (backgroundValue.startsWith('url(') || backgroundValue.startsWith('http') || backgroundValue.startsWith('data:image') || backgroundValue === 'Local Image') {
        const imageUrl = backgroundValue.replace(/url\(['"]?|['"]?\)/g, '');
        // Don't try to make a URL out of 'Local Image'
        if (imageUrl !== 'Local Image') {
            document.body.style.backgroundImage = `url('${imageUrl}')`;
        }
        document.body.style.backgroundColor = 'var(--background)'; // Fallback color
    } else { // Assume it's a color
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = backgroundValue;
    }
};
