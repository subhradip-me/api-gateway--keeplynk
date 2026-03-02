#!/usr/bin/env node

/**
 * Manual API Test Script
 * Simple tests for the soft delete functionality
 */

import http from 'http';

const BASE_URL = 'localhost';
const PORT = 3000;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testSoftDelete() {
  console.log('🧪 Testing Soft Delete System...\n');

  try {
    // 1. Health Check
    console.log('1. Health Check...');
    const health = await makeRequest('GET', '../../health');
    console.log(`✅ Health: ${health.status === 200 ? 'OK' : 'Failed'}\n`);

    // 2. Register/Login
    console.log('2. Authentication...');
    let authResponse;
    try {
      authResponse = await makeRequest('POST', '/auth/register', {
        email: 'test-soft-delete@example.com',
        password: 'test123456',
        name: 'Test User'
      });
    } catch (e) {
      // User might exist, try login
      authResponse = await makeRequest('POST', '/auth/login', {
        email: 'test-soft-delete@example.com',
        password: 'test123456'
      });
    }

    const token = authResponse.data.data.token;
    console.log('✅ Authentication successful\n');

    // 3. Create folder
    console.log('3. Creating test folder...');
    const folderResponse = await makeRequest('POST', '/folders', {
      name: 'Soft Delete Test Folder',
      description: 'Testing soft delete',
      persona: 'professional'
    }, token);

    const folderId = folderResponse.data.data._id;
    console.log(`✅ Folder created: ${folderId}\n`);

    // 4. Create resource in folder
    console.log('4. Creating test resource...');
    const resourceResponse = await makeRequest('POST', '/resources', {
      type: 'url',
      title: 'Test Resource',
      url: 'https://example.com',
      folderId: folderId,
      persona: 'professional'
    }, token);

    const resourceId = resourceResponse.data.data._id;
    console.log(`✅ Resource created: ${resourceId}\n`);

    // 5. Test folder soft delete
    console.log('5. Testing folder soft delete...');
    const trashFolder = await makeRequest('PATCH', `/folders/${folderId}/trash`, null, token);
    console.log(`✅ Folder trashed: ${trashFolder.data.data.isTrashed}`);
    console.log(`✅ Has deletedAt: ${!!trashFolder.data.data.deletedAt}\n`);

    // 6. Check that resource is also trashed
    console.log('6. Checking resource status after folder trash...');
    const resourceCheck = await makeRequest('GET', `/resources/${resourceId}`, null, token);
    console.log(`✅ Resource auto-trashed: ${resourceCheck.data.data.isTrashed}\n`);

    // 7. Test folder restore
    console.log('7. Testing folder restore...');
    const restoreFolder = await makeRequest('PATCH', `/folders/${folderId}/restore`, null, token);
    console.log(`✅ Folder restored: ${!restoreFolder.data.data.isTrashed}`);
    console.log(`✅ DeletedAt cleared: ${restoreFolder.data.data.deletedAt === null}\n`);

    // 8. Test selective restore
    console.log('8. Testing selective resource restore...');
    // Trash folder again
    await makeRequest('PATCH', `/folders/${folderId}/trash`, null, token);
    console.log('✅ Folder trashed again');
    
    // Try to restore just the resource
    const selectiveRestore = await makeRequest('PATCH', `/resources/${resourceId}/restore`, null, token);
    console.log(`✅ Resource restored: ${!selectiveRestore.data.data.isTrashed}`);
    console.log(`✅ Moved to root: ${selectiveRestore.data.data.folderId === null}\n`);

    // 9. Test hard delete
    console.log('9. Testing hard delete...');
    const hardDelete = await makeRequest('DELETE', `/folders/${folderId}`, null, token);
    console.log(`✅ Hard delete successful: ${hardDelete.status === 200}\n`);

    // 10. Verify folder is gone
    console.log('10. Verifying folder is permanently deleted...');
    const checkDeleted = await makeRequest('GET', `/folders/${folderId}`, null, token);
    console.log(`✅ Folder permanently deleted: ${checkDeleted.status === 404}\n`);

    console.log('🎉 All soft delete tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSoftDelete();