#!/usr/bin/env node

/**
 * MCP Server Setup and Integration Script
 * Installs dependencies, builds servers, and configures Claude Code integration
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const servers = [
  'task-queue',
  'load-balancer', 
  'sequential-thinking'
];

console.log('🚀 Setting up Custom MCP Servers...\n');

// Build each server
for (const server of servers) {
  console.log(`📦 Building ${server} server...`);
  try {
    const serverPath = join(__dirname, server);
    
    // Install dependencies
    execSync('npm install', { cwd: serverPath, stdio: 'inherit' });
    
    // Build TypeScript
    execSync('npm run build', { cwd: serverPath, stdio: 'inherit' });
    
    console.log(`✅ ${server} server built successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to build ${server} server:`, error.message);
    process.exit(1);
  }
}

// Update Claude Code settings
console.log('⚙️ Updating Claude Code configuration...');

const settingsPath = join(__dirname, '..', '.claude', 'settings.local.json');
let settings;

try {
  settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
} catch (error) {
  console.error('❌ Could not read Claude Code settings:', error.message);
  process.exit(1);
}

// Add MCP servers to configuration
const newServers = {
  'task-queue-server': {
    command: 'node',
    args: [join(__dirname, 'task-queue', 'dist', 'index.js')]
  },
  'load-balancer-server': {
    command: 'node', 
    args: [join(__dirname, 'load-balancer', 'dist', 'index.js')]
  },
  'sequential-thinking-server': {
    command: 'node',
    args: [join(__dirname, 'sequential-thinking', 'dist', 'index.js')]
  }
};

// Merge with existing servers
settings.mcpServers = { ...settings.mcpServers, ...newServers };

// Add tool permissions
const newPermissions = [
  'mcp__task-queue__*',
  'mcp__load-balancer__*', 
  'mcp__sequential-thinking__*'
];

settings.permissions.allow = [...settings.permissions.allow, ...newPermissions];

try {
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log('✅ Claude Code configuration updated successfully\n');
} catch (error) {
  console.error('❌ Failed to update settings:', error.message);
  process.exit(1);
}

console.log('🎉 MCP Server setup completed successfully!\n');

console.log('📋 Available Tools:');
console.log('');
console.log('📋 Task Queue Server:');
console.log('  • add_task_to_queue - Submit tasks for AI agent processing');
console.log('  • get_next_task - Get next task for an agent');
console.log('  • update_task_progress - Report task progress');
console.log('  • get_queue_status - View queue metrics');
console.log('  • register_agent - Register AI agents');
console.log('  • reassign_failed_task - Handle task failures');
console.log('');
console.log('⚖️ Load Balancer Server:');
console.log('  • register_development_agent - Register agents with load balancer');
console.log('  • get_optimal_agent - Find best agent for tasks');
console.log('  • distribute_task_load - Balance workload across agents');
console.log('  • monitor_agent_health - Check agent health status');
console.log('  • handle_agent_failover - Manage agent failures');
console.log('  • get_load_metrics - System performance overview');
console.log('');
console.log('🧠 Sequential Thinking Server:');
console.log('  • start_complex_reasoning - Begin structured reasoning sessions');
console.log('  • add_reasoning_step - Add thoughts to reasoning chain');
console.log('  • explore_alternative_path - Branch reasoning exploration');
console.log('  • evaluate_solution_hypothesis - Test reasoning assumptions');
console.log('  • rank_potential_solutions - Compare solution options');
console.log('  • export_reasoning_chain - Export reasoning for documentation');
console.log('');
console.log('🔄 Restart Claude Code to activate the new MCP servers.');