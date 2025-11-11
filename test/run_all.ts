#!/usr/bin/env bun
// Run all tests in test3/ organized by groups

import { readdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const testDir = __dirname;

const groups = [
  'basic',
  'character',
  'skills',
  'spells',
  'movement',
  'targeting',
  'items',
  'journal',
  'utilities',
  'debug'
];

async function runGroup(groupName: string) {
  const groupPath = join(testDir, groupName);
  try {
    const files = await readdir(groupPath);
    const testFiles = files.filter(f => f.endsWith('.ts') && !f.startsWith('_'));
    
    if (testFiles.length === 0) {
      console.log(`  ⚠ No test files in ${groupName}/`);
      return;
    }
    
    console.log(`\n=== Running ${groupName} tests ===`);
    for (const file of testFiles) {
      const filePath = join(groupPath, file);
      console.log(`\nRunning: ${file}...`);
      try {
        const { stdout, stderr } = await execAsync(`bun "${filePath}"`, {
          cwd: testDir,
          timeout: 60000
        });
        if (stdout) console.log(stdout);
        if (stderr && !stderr.includes('Connected')) console.error(stderr);
      } catch (error: any) {
        console.error(`  ✗ ${file} failed:`, error.message);
      }
    }
  } catch (error) {
    console.error(`  ✗ Error reading ${groupName}/:`, error);
  }
}

async function runAll() {
  console.log('=== Running All Test Groups ===\n');
  
  for (const group of groups) {
    await runGroup(group);
  }
  
  console.log('\n=== All Tests Complete ===');
}

runAll();

