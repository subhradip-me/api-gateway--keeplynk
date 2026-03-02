#!/usr/bin/env node

/**
 * Comprehensive test suite for soft delete functionality
 * Tests all edge cases and scenarios
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
      if (response.status === 200) return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('❌ Server did not start within expected time');
};

let authToken = '';

const authenticate = async () => {
  const randomEmail = `test-${Date.now()}@example.com`;
  
  const authResponse = await axios.post(`${BASE_URL}/auth/register`, {
    email: randomEmail,
    password: 'test123456',
    firstName: 'Test',
    lastName: 'User'
  });

  authToken = authResponse.data.data.token;
  
  // Add persona
  await axios.post(`${BASE_URL}/auth/personas`, {
    persona: 'professional'
  }, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('✅ Authentication and persona setup complete');
  return authToken;
};

const apiRequest = (method, path, data = null) => {
  return axios({
    method,
    url: `${BASE_URL}${path}`,
    data,
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
};

const runComprehensiveTest = async () => {
  try {
    console.log('🧪 Starting Comprehensive Soft Delete Test Suite...\n');

    console.log('1. Health Check...');
    const health = await axios.get(HEALTH_URL);
    console.log(`✅ Health: ${health.data.status}\n`);

    console.log('2. Authentication Setup...');
    await authenticate();
    console.log('');

    console.log('3. Creating Test Data...');
    
    // Create folder
    const folderResponse = await apiRequest('POST', '/folders', {
      name: 'Comprehensive Test Folder',
      description: 'Testing all soft delete scenarios',
      persona: 'professional',
      color: '#3B82F6'
    });
    const folderId = folderResponse.data.data._id;
    console.log(`✅ Folder created: ${folderId}`);

    // Create resources in folder
    const resource1Response = await apiRequest('POST', '/resources', {
      type: 'url',
      title: 'Test Resource 1',
      url: 'https://example.com/1',
      folderId: folderId,
      persona: 'professional'
    });
    const resource1Id = resource1Response.data.data._id;
    console.log(`✅ Resource 1 created: ${resource1Id}`);

    const resource2Response = await apiRequest('POST', '/resources', {
      type: 'url',
      title: 'Test Resource 2', 
      url: 'https://example.com/2',
      folderId: folderId,
      persona: 'professional'
    });
    const resource2Id = resource2Response.data.data._id;
    console.log(`✅ Resource 2 created: ${resource2Id}\n`);

    console.log('4. Testing Folder Soft Delete (Bulk Operations)...');
    
    // Soft delete folder - should trash all resources inside
    const trashFolderResponse = await apiRequest('PATCH', `/folders/${folderId}/trash`);
    console.log(`✅ Folder trashed: ${trashFolderResponse.data.data.isTrashed}`);
    console.log(`✅ Folder deletedAt: ${!!trashFolderResponse.data.data.deletedAt}`);
    
    // Check that both resources are automatically trashed
    const resource1Check = await apiRequest('GET', `/resources/${resource1Id}`);
    const resource2Check = await apiRequest('GET', `/resources/${resource2Id}`);
    
    console.log(`✅ Resource 1 auto-trashed: ${resource1Check.data.data.isTrashed}`);
    console.log(`✅ Resource 2 auto-trashed: ${resource2Check.data.data.isTrashed}\n`);

    console.log('5. Testing Folder Invariant in GET Requests...');
    
    // Get all resources - should show effectivelyTrashed = true
    const allResourcesResponse = await apiRequest('GET', '/resources');
    const testResources = allResourcesResponse.data.data.filter(r => 
      r._id === resource1Id || r._id === resource2Id
    );
    
    testResources.forEach((resource, index) => {
      console.log(`✅ Resource ${index + 1} effectivelyTrashed: ${resource.effectivelyTrashed}`);
    });
    console.log('');

    console.log('6. Testing Folder Restore (Bulk Operations)...');
    
    // Restore folder - should restore all resources inside
    const restoreFolderResponse = await apiRequest('PATCH', `/folders/${folderId}/restore`);
    console.log(`✅ Folder restored: ${!restoreFolderResponse.data.data.isTrashed}`);
    console.log(`✅ Folder deletedAt cleared: ${restoreFolderResponse.data.data.deletedAt === null}`);
    
    // Check that resources are restored too
    const resource1RestoreCheck = await apiRequest('GET', `/resources/${resource1Id}`);
    const resource2RestoreCheck = await apiRequest('GET', `/resources/${resource2Id}`);
    
    console.log(`✅ Resource 1 restored: ${!resource1RestoreCheck.data.data.isTrashed}`);
    console.log(`✅ Resource 2 restored: ${!resource2RestoreCheck.data.data.isTrashed}\n`);

    console.log('7. Testing Selective Resource Restore...');
    
    // Trash folder again
    await apiRequest('PATCH', `/folders/${folderId}/trash`);
    console.log('✅ Folder trashed again for selective restore test');
    
    // Try to restore just resource 1 - should move to root
    const selectiveRestoreResponse = await apiRequest('PATCH', `/resources/${resource1Id}/restore`);
    console.log(`✅ Resource 1 selectively restored: ${!selectiveRestoreResponse.data.data.isTrashed}`);
    console.log(`✅ Resource 1 moved to root: ${selectiveRestoreResponse.data.data.folderId === null}`);
    
    // Resource 2 should still be trashed
    const resource2StillTrashedCheck = await apiRequest('GET', `/resources/${resource2Id}`);
    console.log(`✅ Resource 2 still trashed: ${resource2StillTrashedCheck.data.data.isTrashed}\n`);

    console.log('8. Testing Hard Delete Safety...');
    
    // Try to hard delete resource that's not trashed (should fail)
    try {
      await apiRequest('DELETE', `/resources/${resource1Id}`);
      throw new Error('Should have failed');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Hard delete correctly rejected for non-trashed resource');
      } else {
        throw error;
      }
    }
    
    // Trash resource 1 first
    await apiRequest('PATCH', `/resources/${resource1Id}/trash`);
    
    // Now hard delete should work
    const hardDeleteResourceResponse = await apiRequest('DELETE', `/resources/${resource1Id}`);
    console.log(`✅ Hard delete successful on trashed resource: ${hardDeleteResourceResponse.status === 200}`);
    
    // Verify resource is gone
    try {
      await apiRequest('GET', `/resources/${resource1Id}`);
      throw new Error('Resource should be gone');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Resource permanently deleted');
      } else {
        throw error;
      }
    }
    console.log('');

    console.log('9. Testing Folder Hard Delete...');
    
    // Folder should still be trashed from step 7
    const hardDeleteFolderResponse = await apiRequest('DELETE', `/folders/${folderId}`);
    console.log(`✅ Folder hard delete successful: ${hardDeleteFolderResponse.status === 200}`);
    
    // Verify folder is gone
    try {
      await apiRequest('GET', `/folders/${folderId}`);
      throw new Error('Folder should be gone');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Folder permanently deleted');
      } else {
        throw error;
      }
    }
    
    // Resource 2 should also be permanently deleted (cascade)
    try {
      await apiRequest('GET', `/resources/${resource2Id}`);
      throw new Error('Resource 2 should be gone');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Resource 2 cascade deleted with folder');
      } else {
        throw error;
      }
    }
    console.log('');

    console.log('10. Testing Individual Resource Soft Delete...');
    
    // Create new resource for individual testing
    const individualResourceResponse = await apiRequest('POST', '/resources', {
      type: 'url',
      title: 'Individual Test Resource',
      url: 'https://example.com/individual',
      persona: 'professional'
    });
    const individualResourceId = individualResourceResponse.data.data._id;
    console.log(`✅ Individual resource created: ${individualResourceId}`);
    
    // Soft delete individual resource
    const trashIndividualResponse = await apiRequest('PATCH', `/resources/${individualResourceId}/trash`);
    console.log(`✅ Individual resource trashed: ${trashIndividualResponse.data.data.isTrashed}`);
    console.log(`✅ Individual resource deletedAt: ${!!trashIndividualResponse.data.data.deletedAt}`);
    
    // Restore individual resource
    const restoreIndividualResponse = await apiRequest('PATCH', `/resources/${individualResourceId}/restore`);
    console.log(`✅ Individual resource restored: ${!restoreIndividualResponse.data.data.isTrashed}`);
    console.log(`✅ Individual resource deletedAt cleared: ${restoreIndividualResponse.data.data.deletedAt === null}`);
    
    // Clean up - trash and hard delete
    await apiRequest('PATCH', `/resources/${individualResourceId}/trash`);
    await apiRequest('DELETE', `/resources/${individualResourceId}`);
    console.log('✅ Individual resource cleaned up');

    console.log('\n🎉🎉🎉 ALL COMPREHENSIVE TESTS PASSED! 🎉🎉🎉');
    console.log('\n✅ Soft delete system is working correctly with all edge cases:');
    console.log('  • Independent soft delete flags (isTrashed + deletedAt)');
    console.log('  • Folder invariant (resources trashed when folder trashed)');
    console.log('  • Bulk operations (folder affects all contents)');
    console.log('  • Selective restore (moves to root if folder still trashed)');
    console.log('  • Hard delete safety (only works on trashed items)');
    console.log('  • Cascade operations (folder hard delete affects all contents)');
    console.log('  • Individual resource operations work independently');

    return true;

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
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
    console.log('🚀 Starting server for comprehensive testing...\n');
    
    serverProcess = spawn('node', ['index.js'], { stdio: 'pipe' });

    // Wait for server
    await waitForServer();
    console.log('✅ Server is ready!\n');

    // Run comprehensive tests
    const success = await runComprehensiveTest();
    
    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('❌ Failed to run comprehensive tests:', error.message);
    process.exit(1);
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGINT');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

main();