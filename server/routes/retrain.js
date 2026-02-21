const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const mlClient = require('../ml/mlClient');

/**
 * POST /api/retrain
 * Trigger ML model retraining via Python script
 */
router.post('/', async (req, res) => {
    const pythonPath = 'python'; // or full path if needed
    const scriptPath = path.join(__dirname, '..', 'ml', 'python', 'train.py');

    console.log('Starting ML Retraining...');

    const process = spawn(pythonPath, [scriptPath], {
        cwd: path.join(__dirname, '..', 'ml', 'python')
    });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
        output += data.toString();
    });

    process.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    process.on('close', async (code) => {
        if (code === 0) {
            console.log('Retraining complete!');
            // After training, we might need a way to tell the model server to reload
            // Currently, model_server.py loads once. Let's assume we can trigger a reload
            // or the user restarts it. For a robust implementation, we'd add a /reload to the python server.
            res.json({
                success: true,
                message: 'Retraining complete. Model updated.',
                output: output.split('\n').filter(line => line.trim())
            });
        } else {
            console.error('Retraining failed:', errorOutput);
            res.status(500).json({
                success: false,
                error: 'Retraining failed',
                details: errorOutput
            });
        }
    });
});

module.exports = router;
