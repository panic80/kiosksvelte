import { writable, get, type Writable } from 'svelte/store';
import { api } from './api';

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

interface UndoState {
    personnel: Personnel[];
    shifts: Shift[];
}

const MAX_UNDO_STACK = 50;

function createPersistentStore<T extends { id: string }>(
    initialValue: T[] = [],
    fetchFn: () => Promise<T[]>
): Writable<T[]> & { error: Writable<string | null> } {
    const store = writable<T[]>(initialValue);
    const error = writable<string | null>(null);
    
    // Load initial data
    fetchFn().then(
        (data) => {
            if (data.length > 0) {
                store.set(data);
            }
            error.set(null);
        },
        (err: Error) => error.set(err.message)
    );

    const { subscribe, set, update } = store;

    return {
        subscribe,
        set,
        update,
        error
    };
}

// Create stores
export const personnel = createPersistentStore<Personnel>([], api.fetchPersonnel);
export const shifts = createPersistentStore<Shift>([], api.fetchShifts);
export const selectedPersonnel = writable<Personnel | null>(null);
export const isModalOpen = writable<boolean>(false);
export const undoStack = writable<UndoState[]>([]);

// Save current state for undo
export function saveState(): void {
    undoStack.update(stack => {
        const newState = {
            personnel: get(personnel),
            shifts: get(shifts)
        };
        
        // Maintain max stack size
        const newStack = [...stack, newState];
        return newStack.slice(-MAX_UNDO_STACK);
    });
}

// Handle undo operation
export function handleUndo(): void {
    undoStack.update(stack => {
        if (stack.length === 0) return stack;
        
        const previousState = stack[stack.length - 1];
        personnel.set(previousState.personnel);
        shifts.set(previousState.shifts);
        
        return stack.slice(0, -1);
    });
}

// API operations with error handling
export async function addPersonnel(newPersonnel: Personnel): Promise<void> {
    try {
        await api.addPersonnel(newPersonnel);
        personnel.update(current => [...current, newPersonnel]);
        saveState();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to add personnel: ${message}`);
    }
}

export async function addShift(newShift: Shift): Promise<void> {
    try {
        await api.addShift(newShift);
        shifts.update(current => [...current, newShift]);
        saveState();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to add shift: ${message}`);
    }
}

export async function deleteShift(shiftId: string): Promise<void> {
    try {
        // Save current state before attempting deletion
        saveState();
        
        // First update the store optimistically
        const currentShifts = get(shifts);
        shifts.update(current => current.filter(s => s.id !== shiftId));
        
        try {
            // Then attempt the API call
            await api.deleteShift(shiftId);
        } catch (error) {
            // If API call fails, revert to previous state
            shifts.set(currentShifts);
            throw error;
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to delete shift: ${message}`);
    }
}

export async function deletePersonnel(personnelId: string): Promise<void> {
    try {
        await api.deletePersonnel(personnelId);
        personnel.update(current => current.filter(p => p.id !== personnelId));
        shifts.update(current => current.filter(s => s.personnelId !== personnelId));
        saveState();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to delete personnel: ${message}`);
    }
}

// Helper to check if a personnel has any shifts
export function hasShifts(personnelId: string): boolean {
    const allShifts = get(shifts);
    return allShifts.some(shift => shift.personnelId === personnelId);
}
