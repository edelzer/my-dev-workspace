#!/usr/bin/env node

/**
 * Operation Tracking Script for Performance Monitoring
 * Called by hooks to track operation start/end times
 */

const fs = require('fs').promises;
const path = require('path');

const TRACKING_FILE = path.join(__dirname, 'data', 'active-operations.json');

async function main() {
    const [action, tool, targetFile, exitCode] = process.argv.slice(2);
    
    try {
        if (action === 'start') {
            await startOperation(tool, targetFile);
        } else if (action === 'end') {
            await endOperation(tool, targetFile, exitCode);
        }
    } catch (error) {
        // Silently fail to avoid interfering with Claude Code operations
        // Log to separate error file
        const errorLog = path.join(__dirname, 'data', 'tracking-errors.log');
        const timestamp = new Date().toISOString();
        await fs.appendFile(errorLog, 
            `${timestamp} - Error in ${action}: ${error.message}\n`
        ).catch(() => {}); // Ignore errors in error logging
    }
}

async function startOperation(tool, targetFile) {
    const operation = {
        id: `${tool}-${Date.now()}`,
        tool,
        targetFile,
        startTime: Date.now(),
        pid: process.pid
    };
    
    // Ensure data directory exists
    await fs.mkdir(path.dirname(TRACKING_FILE), { recursive: true });
    
    // Load existing operations
    const operations = await loadOperations();
    
    // Add new operation
    operations[operation.id] = operation;
    
    // Save operations
    await saveOperations(operations);
    
    // Log performance start
    console.log(`📊 Performance tracking started: ${tool}`);
}

async function endOperation(tool, targetFile, exitCode) {
    const operations = await loadOperations();
    
    // Find matching operation (most recent for this tool)
    const operationId = Object.keys(operations)
        .filter(id => operations[id].tool === tool && operations[id].targetFile === targetFile)
        .sort((a, b) => operations[b].startTime - operations[a].startTime)[0];
    
    if (!operationId) {
        return; // No matching operation found
    }
    
    const operation = operations[operationId];
    const endTime = Date.now();
    const duration = endTime - operation.startTime;
    const success = !exitCode || exitCode === '0';
    
    // Record completion
    const completedOperation = {
        ...operation,
        endTime,
        duration,
        success,
        exitCode
    };
    
    // Save to completed operations log
    await logCompletedOperation(completedOperation);
    
    // Remove from active operations
    delete operations[operationId];
    await saveOperations(operations);
    
    // Log performance result
    const status = success ? '✅' : '❌';
    console.log(`📊 Performance tracking ended: ${tool} ${status} (${duration}ms)`);
    
    // Check for performance issues
    if (duration > 30000) {
        console.log(`⚠️ Performance warning: ${tool} took ${(duration/1000).toFixed(1)}s`);
    }
    
    if (!success) {
        console.log(`❌ Operation failed: ${tool} (exit code: ${exitCode})`);
    }
}

async function loadOperations() {
    try {
        const content = await fs.readFile(TRACKING_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return {};
    }
}

async function saveOperations(operations) {
    await fs.writeFile(TRACKING_FILE, JSON.stringify(operations, null, 2));
}

async function logCompletedOperation(operation) {
    const logFile = path.join(__dirname, 'data', 'completed-operations.jsonl');
    const logEntry = JSON.stringify(operation) + '\n';
    
    try {
        await fs.appendFile(logFile, logEntry);
    } catch (error) {
        // Create file if it doesn't exist
        await fs.writeFile(logFile, logEntry);
    }
}

// Cleanup old operations (older than 1 hour)
async function cleanupOldOperations() {
    const operations = await loadOperations();
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    let cleaned = false;
    for (const [id, operation] of Object.entries(operations)) {
        if (operation.startTime < oneHourAgo) {
            delete operations[id];
            cleaned = true;
        }
    }
    
    if (cleaned) {
        await saveOperations(operations);
    }
}

// Run cleanup periodically
if (require.main === module) {
    main().then(() => {
        // Run cleanup on every 10th operation
        if (Math.random() < 0.1) {
            cleanupOldOperations().catch(() => {});
        }
    });
}