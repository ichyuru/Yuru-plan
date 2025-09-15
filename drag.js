import Sortable from 'sortablejs';
import { saveAppData } from './api';

export const initTaskDragAndDrop = (boardElement, appData) => {
    const taskContainers = boardElement.querySelectorAll('.tasks-container');
    taskContainers.forEach(container => {
        new Sortable(container, {
            group: 'tasks',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: (evt) => {
                const taskId = evt.item.dataset.taskId;
                const fromListId = evt.from.dataset.listId;
                const toListId = evt.to.dataset.listId;

                const fromList = appData.lists.find(l => l.id === fromListId);
                const toList = appData.lists.find(l => l.id === toListId);
                
                if (!fromList || !toList) return;

                const taskIndex = fromList.tasks.findIndex(t => t.id === taskId);
                if (taskIndex === -1) return;

                const [task] = fromList.tasks.splice(taskIndex, 1);
                toList.tasks.splice(evt.newIndex, 0, task);

                saveAppData(appData);
            }
        });
    });
};

export const initListDragging = (boardElement, appData, rerender) => {
    let draggedList = null;
    let offsetX = 0;
    let offsetY = 0;

    boardElement.addEventListener('mousedown', (e) => {
        const listHeader = e.target.closest('.list-header');
        if (!listHeader || e.target.matches('input, button, .icon-btn')) {
            return;
        }
        
        e.preventDefault();

        draggedList = listHeader.closest('.list');
        draggedList.classList.add('is-dragging');

        const rect = draggedList.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });

    boardElement.addEventListener('mousemove', (e) => {
        if (!draggedList) return;

        e.preventDefault();

        const boardRect = boardElement.getBoundingClientRect();
        
        let x = e.clientX - boardRect.left - offsetX + boardElement.scrollLeft;
        let y = e.clientY - boardRect.top - offsetY + boardElement.scrollTop;

        // Constrain to board
        x = Math.max(0, x);
        y = Math.max(0, y);

        draggedList.style.left = `${x}px`;
        draggedList.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', (e) => {
        if (!draggedList) return;

        draggedList.classList.remove('is-dragging');
        const listId = draggedList.dataset.listId;
        const list = appData.lists.find(l => l.id === listId);

        if (list) {
            list.position.x = parseInt(draggedList.style.left, 10);
            list.position.y = parseInt(draggedList.style.top, 10);
            saveAppData(appData);
        }
        
        draggedList = null;
    });
};
