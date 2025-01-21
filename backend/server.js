const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Data files paths
const PERSONNEL_FILE = path.join(__dirname, 'data', 'personnel.json');
const SHIFTS_FILE = path.join(__dirname, 'data', 'shifts.json');

// Ensure data files exist
async function initDataFiles() {
    try {
        await fs.access(path.join(__dirname, 'data'));
    } catch {
        await fs.mkdir(path.join(__dirname, 'data'));
    }
    
    for (const file of [PERSONNEL_FILE, SHIFTS_FILE]) {
        try {
            await fs.access(file);
        } catch {
            await fs.writeFile(file, '[]');
        }
    }
}

// Helper function to read JSON file
async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        throw error;
    }
}

// API Routes
app.get('/api/personnel', async (req, res) => {
    try {
        const data = await readJsonFile(PERSONNEL_FILE);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error reading personnel data' });
    }
});

app.post('/api/personnel', async (req, res) => {
    try {
        const currentData = await readJsonFile(PERSONNEL_FILE);
        const newPersonnel = req.body;
        currentData.push(newPersonnel);
        await writeJsonFile(PERSONNEL_FILE, currentData);
        res.json(newPersonnel);
    } catch (error) {
        res.status(500).json({ error: 'Error saving personnel data' });
    }
});

app.get('/api/shifts', async (req, res) => {
    try {
        const data = await readJsonFile(SHIFTS_FILE);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error reading shifts data' });
    }
});

app.post('/api/shifts', async (req, res) => {
    try {
        const currentData = await readJsonFile(SHIFTS_FILE);
        const newShift = req.body;
        currentData.push(newShift);
        await writeJsonFile(SHIFTS_FILE, currentData);
        res.json(newShift);
    } catch (error) {
        res.status(500).json({ error: 'Error saving shifts data' });
    }
});

app.delete('/api/shifts/:id', async (req, res) => {
    try {
        console.log('Attempting to delete shift with ID:', req.params.id);
        const data = await readJsonFile(SHIFTS_FILE);
        console.log('Current shifts:', data);
        const filtered = data.filter(s => s.id !== req.params.id);
        console.log('Filtered shifts:', filtered);
        if (data.length === filtered.length) {
            console.log('No shift found with ID:', req.params.id);
            return res.status(404).json({ error: 'Shift not found' });
        }
        await writeJsonFile(SHIFTS_FILE, filtered);
        console.log('Successfully deleted shift');
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting shift:', error);
        res.status(500).json({ error: `Error deleting shift: ${error.message}` });
    }
});

app.delete('/api/personnel/:id', async (req, res) => {
    try {
        const data = await readJsonFile(PERSONNEL_FILE);
        const filtered = data.filter(p => p.id !== req.params.id);
        await writeJsonFile(PERSONNEL_FILE, filtered);
        
        // Also delete associated shifts
        const shiftsData = await readJsonFile(SHIFTS_FILE);
        const filteredShifts = shiftsData.filter(s => s.personnelId !== req.params.id);
        await writeJsonFile(SHIFTS_FILE, filteredShifts);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting personnel and associated shifts' });
    }
});

// Initialize and start server
initDataFiles().then(() => {
    app.listen(3001, () => {
        console.log('Server running on port 3001');
    });
});