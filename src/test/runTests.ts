#!/usr/bin/env bun
import { spawn } from 'child_process';
import { promisify } from 'util';

const exec = promisify(require('child_process').exec);

console.log('🚀 Starting Backend Test Suite\n');
console.log('================================\n');

async function startServices() {
  console.log('📦 Starting backend services...');
  
  // Start the backend services in the background
  const backend = spawn('bun', ['run', 'start'], {
    cwd: process.cwd(),
    detached: false,
    stdio: 'pipe'
  });

  // Wait for services to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('✅ Services started\n');
  
  return backend;
}

async function runTests() {
  console.log('🧪 Running tests...\n');
  
  try {
    // Run unit tests
    console.log('📝 Running Unit Tests...');
    console.log('------------------------');
    const { stdout: unitOutput } = await exec('bun test --testNamePattern="Unit"');
    console.log(unitOutput);
    
    // Run integration tests
    console.log('\n📝 Running Integration Tests...');
    console.log('--------------------------------');
    const { stdout: integrationOutput } = await exec('bun test --testNamePattern="Integration"');
    console.log(integrationOutput);
    
    // Run all tests with coverage
    console.log('\n📊 Running All Tests with Coverage...');
    console.log('--------------------------------------');
    const { stdout: coverageOutput } = await exec('bun test --coverage');
    console.log(coverageOutput);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

async function main() {
  let backend: any = null;
  
  try {
    // Start services
    backend = await startServices();
    
    // Run tests
    await runTests();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    // Clean up
    if (backend) {
      console.log('\n🧹 Cleaning up...');
      backend.kill();
    }
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Tests interrupted by user');
  process.exit(0);
});

main();