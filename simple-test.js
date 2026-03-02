#!/usr/bin/env node

/**
 * Simple API test script using fetch
 */

const BASE_URL = 'http://localhost:3000/api';

async function simpleTest() {
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.text();
    console.log('Health check:', healthData);
    
    // Test auth
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpass123',
        name: 'Test User'
      })
    });
    
    let authResult;
    if (registerResponse.ok) {
      authResult = await registerResponse.json();
      console.log('Registration successful');
    } else {
      // Try login if registration fails
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'testpass123'
        })
      });
      authResult = await loginResponse.json();
      console.log('Login successful');
    }
    
    const token = authResult.data.token;
    console.log('Got auth token');
    
    // Test creating a folder
    const folderResponse = await fetch(`${BASE_URL}/folders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Soft Delete Folder',
        description: 'Testing soft delete',
        persona: 'professional'
      })
    });
    
    const folderResult = await folderResponse.json();
    console.log('Folder created:', folderResult.data.name);
    const folderId = folderResult.data._id;
    
    // Test soft delete
    const trashResponse = await fetch(`${BASE_URL}/folders/${folderId}/trash`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const trashResult = await trashResponse.json();
    console.log('Folder trashed:', trashResult.data.isTrashed);
    console.log('Has deletedAt:', !!trashResult.data.deletedAt);
    
    // Test restore
    const restoreResponse = await fetch(`${BASE_URL}/folders/${folderId}/restore`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const restoreResult = await restoreResponse.json();
    console.log('Folder restored:', !restoreResult.data.isTrashed);
    
    console.log('✅ Basic soft delete tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest();