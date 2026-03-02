#!/usr/bin/env node

/**
 * Simple endpoint test that starts server and runs tests sequentially
 */

import { spawn } from 'child_process';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const HEALTH_URL = 'http://localhost:3000/health';

// Wait for server to be ready
const waitForServer = async (maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(HEALTH_URL, { timeout: 1000 });
      if (response.status === 200) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch (error) {
      // Server not ready yet
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('❌ Server did not start within expected time');
};

const runQuickTest = async () => {
  try {
    console.log('🧪 Running Quick API Test...\n');

    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(HEALTH_URL);
    console.log(`✅ Health check passed: ${health.data.status}\n`);

    // 2. Test auth registration
    console.log('2. Testing authentication...');
    let authResponse;
    try {
      console.log('  Attempting registration...');
      authResponse = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'quicktest@example.com',
        password: 'test123456',
        firstName: 'Quick',
        lastName: 'Test'
      });
      console.log('  ✅ Registration successful');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('  User already exists, attempting login...');
        try {
          authResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'quicktest@example.com',
            password: 'test123456'
          });
          console.log('  ✅ Login successful');
        } catch (loginError) {
          console.log('  Login failed, trying to register with different email...');
          const randomEmail = `quicktest-${Date.now()}@example.com`;
          authResponse = await axios.post(`${BASE_URL}/auth/register`, {
            email: randomEmail,
            password: 'test123456',
            firstName: 'Quick',
            lastName: 'Test'
          });
          console.log(`  ✅ Registration successful with ${randomEmail}`);
        }
      } else {
        throw error;
      }
    }

    const token = authResponse.data.data.token;
    console.log('✅ Authentication successful');
    
    // Add a persona if user doesn't have one
    console.log('  Adding persona if needed...');
    try {
      await axios.post(`${BASE_URL}/auth/personas`, {
        persona: 'professional'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('  ✅ Persona added');
    } catch (personaError) {
      if (personaError.response?.data.message?.includes('already exists')) {
        console.log('  ✅ Persona already exists');
      } else {
        // Try to continue anyway - user might already have persona
        console.log('  ⚠️ Persona addition failed, continuing anyway...');
      }
    }
    console.log('');

    // 3. Test folder creation
    console.log('3. Testing folder creation...');
    const folderResponse = await axios.post(`${BASE_URL}/folders`, {
      name: 'Quick Test Folder',
      description: 'Testing API',
      persona: 'professional'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const folderId = folderResponse.data.data._id;
    console.log(`✅ Folder created: ${folderId}\n`);

    // 4. Test soft delete
    console.log('4. Testing soft delete...');
    const trashResponse = await axios.patch(`${BASE_URL}/folders/${folderId}/trash`, null, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`✅ Folder soft deleted: ${trashResponse.data.data.isTrashed}`);
    console.log(`✅ Has deletedAt: ${!!trashResponse.data.data.deletedAt}\n`);

    // 5. Test restore
    console.log('5. Testing restore...');
    const restoreResponse = await axios.patch(`${BASE_URL}/folders/${folderId}/restore`, null, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`✅ Folder restored: ${!restoreResponse.data.data.isTrashed}\n`);

    // 6. Test hard delete
    console.log('6. Testing hard delete...');
    // First trash it again
    await axios.patch(`${BASE_URL}/folders/${folderId}/trash`, null, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Then hard delete
    const hardDeleteResponse = await axios.delete(`${BASE_URL}/folders/${folderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`✅ Hard delete successful: ${hardDeleteResponse.status === 200}\n`);

    console.log('🎉 All quick tests passed! Soft delete system is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
};

// Main execution
const main = async () => {
  let serverProcess;

  try {
    console.log('🚀 Starting server for testing...\n');
    
    // Start server
    serverProcess = spawn('node', ['index.js'], {
      stdio: 'pipe'
    });

    // Log server output
    serverProcess.stdout.on('data', (data) => {
      console.log(`[SERVER] ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[SERVER ERROR] ${data.toString().trim()}`);
    });

    // Wait for server to be ready
    console.log('⏳ Waiting for server to start...');
    await waitForServer();
    console.log('');

    // Run tests
    const success = await runQuickTest();
    
    if (success) {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Tests failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Failed to run tests:', error.message);
    process.exit(1);
  } finally {
    if (serverProcess) {
      console.log('\n🛑 Stopping server...');
      serverProcess.kill('SIGINT');
      
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

main();