const DEFAULT_DATA = {
    settings: {
        background: '#171717' // Default background color
    },
    labels: [
        { id: 'label-1', text: 'Feature', color: '#38bdf8' },
        { id: 'label-2', text: 'Bug', color: '#ef4444' },
        { id: 'label-3', text: 'Docs', color: '#10b981' },
    ],
    lists: [
        {
            id: 'list-1',
            title: 'To Do',
            position: { x: 32, y: 32 },
            tasks: [
                { id: 'task-1', content: 'Implement user authentication', description: 'Use Supabase for auth.', deadline: '2025-08-15', labels: ['label-1'] },
                { id: 'task-2', content: 'Design landing page', description: '', deadline: null, labels: [] },
            ]
        },
        {
            id: 'list-2',
            title: 'In Progress',
            position: { x: 384, y: 32 },
            tasks: [
                { id: 'task-3', content: 'Develop Kanban board UI', description: 'Core drag and drop functionality.', deadline: '2025-08-10', labels: ['label-1'] }
            ]
        },
        {
            id: 'list-3',
            title: 'Done',
            position: { x: 736, y: 32 },
            tasks: [
                { id: 'task-4', content: 'Setup project structure', description: 'Vite + JS', deadline: null, labels: ['label-3'] }
            ]
        }
    ]
};

const APP_STORAGE_KEY = 'kanbanflow_data';

export const getAppData = () => {
    try {
        const data = localStorage.getItem(APP_STORAGE_KEY);
        return data ? JSON.parse(data) : JSON.parse(JSON.stringify(DEFAULT_DATA)); // Deep copy
    } catch (error) {
        console.error("Failed to load data from localStorage:", error);
        return JSON.parse(JSON.stringify(DEFAULT_DATA)); // Deep copy
    }
};

export const saveAppData = (data) => {
    try {
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save data to localStorage:", error);
    }
};
