import type { Personnel, Shift } from './stores';

const API_URL = 'http://localhost:3001/api';

interface ApiError extends Error {
    status?: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const error: ApiError = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
        });
        throw error;
    }
    return response.json();
}

export const api = {
    async fetchPersonnel(): Promise<Personnel[]> {
        const response = await fetch(`${API_URL}/personnel`);
        return handleResponse<Personnel[]>(response);
    },

    async fetchShifts(): Promise<Shift[]> {
        const response = await fetch(`${API_URL}/shifts`);
        return handleResponse<Shift[]>(response);
    },

    async addPersonnel(personnel: Personnel): Promise<Personnel> {
        const response = await fetch(`${API_URL}/personnel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personnel)
        });
        return handleResponse<Personnel>(response);
    },

    async addShift(shift: Shift): Promise<Shift> {
        const response = await fetch(`${API_URL}/shifts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shift)
        });
        return handleResponse<Shift>(response);
    },

    async deletePersonnel(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/personnel/${id}`, {
            method: 'DELETE'
        });
        await handleResponse<{ success: boolean }>(response);
    },

    async deleteShift(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/shifts/${id}`, {
            method: 'DELETE'
        });
        await handleResponse<{ success: boolean }>(response);
    }
};