#!/usr/bin/env node

/**
 * Test script for soft delete functionality
 * Tests folder and resource soft delete, restore, and hard delete operations
 */

import axios from 'axios';

// Configuration - will auto-detect server port
let BASE_URL = 'http://localhost:3000/api';
const POSSIBLE_PORTS = [3000, 3001, 3002, 3003, 8000, 8080];

const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User'
};

let authToken = '';
let testFolderId = '';
let testResourceId = '';

// Auto-detect which port the server is running on
const detectServerPort = async () => {
  for (const port of POSSIBLE_PORTS) {
    try {
      const response = await axios.get(`http://localhost:${port}/health`, { timeout: 2000 });
      if (response.status === 200) {
        BASE_URL = `http://localhost:${port}/api`;
        console.log(`🔍 Detected server running on port ${port}`);
        return port;
      }
    } catch (error) {
      // Port not responding, try next one
      continue;
    }
  }
  throw new Error('❌ No server detected on any expected ports. Please start the server first.');
};

// Helper function to make authenticated requests
const apiRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      data
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`❌ ${method} ${url} failed:`, error.response.data);
      throw error;
    }
    throw error;
  }
};

// Test authentication
async function testAuth() {
  console.log('🔑 Testing authentication...');
  
  try {
    // Try to register (might fail if user exists)
    await apiRequest('POST', '/auth/register', TEST_USER);
    console.log('✅ User registered successfully');
  } catch (error) {
    // User might already exist, that's okay
    console.log('ℹ️ User might already exist, proceeding with login...');
  }
  
  // Login
  const loginResponse = await apiRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  authToken = loginResponse.data.token;
  console.log('✅ Authentication successful');
  return authToken;
}

// Create test folder and resource
async function createTestData() {
  console.log('📁 Creating test data...');
  
  // Create a test folder
  const folderResponse = await apiRequest('POST', '/folders', {
    name: 'Test Folder for Soft Delete',
    description: 'This folder will be used to test soft delete functionality',
    color: '#3B82F6',
    icon: '🧪',
    persona: 'professional'
  });
  
  testFolderId = folderResponse.data._id;
  console.log(`✅ Test folder created: ${testFolderId}`);
  
  // Create a test resource in the folder
  const resourceResponse = await apiRequest('POST', '/resources', {
    type: 'url',
    title: 'Test Resource for Soft Delete',
    description: 'This resource will be used to test soft delete functionality',
    url: 'https://example.com/test',
    folderId: testFolderId,
    persona: 'professional'
  });
  
  testResourceId = resourceResponse.data._id;
  console.log(`✅ Test resource created: ${testResourceId}`);
  
  return { testFolderId, testResourceId };
}

// Test folder soft delete
async function testFolderSoftDelete() {
  console.log('🗑️ Testing folder soft delete...');
  
  // Move folder to trash
  const trashResponse = await apiRequest('PATCH', `/folders/${testFolderId}/trash`);
  console.log('✅ Folder moved to trash');
  
  // Verify folder is trashed
  if (!trashResponse.data.isTrashed) {
    throw new Error('Folder should be marked as trashed');
  }
  
  if (!trashResponse.data.deletedAt) {
    throw new Error('Folder should have deletedAt timestamp');
  }
  
  // Check that resource is also trashed
  const resourceResponse = await apiRequest('GET', `/resources/${testResourceId}`);
  if (!resourceResponse.data.isTrashed) {
    throw new Error('Resource should be automatically trashed when folder is trashed');
  }
  
  console.log('✅ Folder soft delete working correctly - folder and resource both trashed');
  return trashResponse.data;
}

// Test folder restore
async function testFolderRestore() {
  console.log('♻️ Testing folder restore...');
  
  // Restore folder from trash
  const restoreResponse = await apiRequest('PATCH', `/folders/${testFolderId}/restore`);
  console.log('✅ Folder restored from trash');
  
  // Verify folder is no longer trashed
  if (restoreResponse.data.isTrashed) {
    throw new Error('Folder should not be marked as trashed after restore');
  }
  
  if (restoreResponse.data.deletedAt !== null) {
    throw new Error('Folder deletedAt should be null after restore');
  }
  
  // Check that resource is also restored
  const resourceResponse = await apiRequest('GET', `/resources/${testResourceId}`);
  if (resourceResponse.data.isTrashed) {
    throw new Error('Resource should be automatically restored when folder is restored');
  }
  
  console.log('✅ Folder restore working correctly - folder and resource both restored');
  return restoreResponse.data;
}

// Test selective resource restore
async function testSelectiveResourceRestore() {
  console.log('🔄 Testing selective resource restore...');
  
  // First, trash the folder again
  await apiRequest('PATCH', `/folders/${testFolderId}/trash`);
  console.log('✅ Folder trashed again for selective restore test');
  
  // Try to restore just the resource (should move to root)
  const resourceRestoreResponse = await apiRequest('PATCH', `/resources/${testResourceId}/restore`);
  console.log('✅ Resource restored while folder is trashed');
  
  // Verify resource is restored but moved to root
  if (resourceRestoreResponse.data.isTrashed) {
    throw new Error('Resource should be restored');
  }
  
  if (resourceRestoreResponse.data.folderId !== null) {
    throw new Error('Resource should be moved to root folder (folderId should be null)');
  }
  
  console.log('✅ Selective resource restore working correctly - resource moved to root');
  return resourceRestoreResponse.data;
}

// Test hard delete (should only work on trashed items)
async function testHardDelete() {
  console.log('💥 Testing hard delete functionality...');
  
  // Try to hard delete folder that is still trashed
  const folderResponse = await apiRequest('GET', `/folders/${testFolderId}`);
  if (!folderResponse.data.isTrashed) {
    throw new Error('Folder should still be trashed for hard delete test');
  }
  
  // Hard delete the folder (should work since it's trashed)
  const hardDeleteResponse = await apiRequest('DELETE', `/folders/${testFolderId}`);
  console.log('✅ Hard delete successful on trashed folder');
  
  // Try to get folder (should fail)
  try {
    await apiRequest('GET', `/folders/${testFolderId}`);
    throw new Error('Folder should no longer exist after hard delete');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Folder correctly deleted permanently');
    } else {
      throw error;
    }
  }
  
  return hardDeleteResponse.data;
}

// Test folder invariant in getAll
async function testFolderInvariant() {
  console.log('📊 Testing folder invariant in getAll methods...');
  
  // Create new test data for invariant test
  const newFolder = await apiRequest('POST', '/folders', {
    name: 'Invariant Test Folder',
    description: 'Testing folder invariant',
    persona: 'professional'
  });
  
  const newResource = await apiRequest('POST', '/resources', {
    type: 'url',
    title: 'Invariant Test Resource',
    url: 'https://example.com/invariant',
    folderId: newFolder.data._id,
    persona: 'professional'
  });
  
  // Get all resources (should show resource as not trashed)
  let allResources = await apiRequest('GET', '/resources');
  let testResource = allResources.data.find(r => r._id === newResource.data._id);
  
  if (testResource.effectivelyTrashed) {
    throw new Error('Resource should not be effectively trashed when folder is active');
  }
  
  // Trash the folder
  await apiRequest('PATCH', `/folders/${newFolder.data._id}/trash`);
  
  // Get all resources again (should show resource as effectively trashed)
  allResources = await apiRequest('GET', '/resources');
  testResource = allResources.data.find(r => r._id === newResource.data._id);
  
  if (!testResource.effectivelyTrashed) {
    throw new Error('Resource should be effectively trashed when folder is trashed');
  }
  
  console.log('✅ Folder invariant working correctly - resources treated as trashed when folder is trashed');
  
  // Clean up
  await apiRequest('DELETE', `/folders/${newFolder.data._id}`);
  
  return testResource;
}

// Main test function
async function runTests() {
  try {
    console.log('🧪 Starting Soft Delete API Tests...\n');
    
    // First, detect which port the server is running on
    await detectServerPort();
    console.log('');
    
    await testAuth();
    console.log('');
    
    await createTestData();
    console.log('');
    
    await testFolderSoftDelete();
    console.log('');
    
    await testFolderRestore();
    console.log('');
    
    await testSelectiveResourceRestore();
    console.log('');
    
    await testHardDelete();
    console.log('');
    
    await testFolderInvariant();
    console.log('');
    
    console.log('🎉 All tests passed! Soft delete functionality is working correctly.');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };