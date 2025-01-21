import { writable, type Writable } from 'svelte/store';

export interface Personnel {
    id: string;
    name: string;
    unit: string;
    armoury: string;
}

export interface Shift {
    id: string;
    personnelId: string;
    day: string;
    startTime: number;
    duration: number;
}

function createLocalStorageStore<T>(key: string, initialValue: T): Writable<T> {
    // Get stored value on init
    const storedValue = (() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return initialValue;
        }
    })();

    const store = writable<T>(storedValue);
    
    // Subscribe to changes and update localStorage
    store.subscribe(value => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    });

    return store;
}

export const personnel = createLocalStorageStore<Personnel[]>('personnel', []);
export const shifts = createLocalStorageStore<Shift[]>('shifts', []);
export const selectedPersonnel = writable<Personnel | null>(null);
export const isModalOpen = writable<boolean>(false);
export const undoStack = writable<Array<{
    personnel: Personnel[];
    shifts: Shift[];
}>>([]);

// Helper function to save state for undo functionality
export function saveState(currentPersonnel: Personnel[], currentShifts: Shift[]): void {
    undoStack.update(stack => [...stack, { 
        personnel: currentPersonnel, 
        shifts: currentShifts 
    }]);
}

// Helper function to handle undo operation
export function handleUndo(): void {
    undoStack.update(stack => {
        if (stack.length === 0) return stack;
        
        const previousState = stack[stack.length - 1];
        personnel.set(previousState.personnel);
        shifts.set(previousState.shifts);
        
        return stack.slice(0, -1);
    });
}