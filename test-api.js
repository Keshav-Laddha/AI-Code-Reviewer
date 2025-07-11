const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://localhost:3001';

// Test user registration
async function testRegister() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword123',
        name: 'Test User'
      })
    });
    
    const data = await response.json();
    console.log('Registration test:', response.status, data);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
  }
}

// Test user login
async function testLogin() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword123'
      })
    });
    
    const data = await response.json();
    console.log('Login test:', response.status, data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Test profile update
async function testProfileUpdate(token) {
  try {
    const response = await fetch(`${API_BASE}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        preferences: {
          theme: 'dark',
          notifications: false
        }
      })
    });
    
    const data = await response.json();
    console.log('Profile update test:', response.status, data);
    return data;
  } catch (error) {
    console.error('Profile update error:', error);
  }
}

// Test session creation
async function testCreateSession(token) {
  try {
    const response = await fetch(`${API_BASE}/api/collaboration/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Session',
        description: 'Test description',
        language: 'javascript',
        isPublic: true
      })
    });
    
    const data = await response.json();
    console.log('Session creation test:', response.status, data);
    return data;
  } catch (error) {
    console.error('Session creation error:', error);
  }
}

// Test get sessions
async function testGetSessions(token) {
  try {
    const response = await fetch(`${API_BASE}/api/collaboration/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Get sessions test:', response.status, data);
    return data;
  } catch (error) {
    console.error('Get sessions error:', error);
  }
}

// Main test function
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test registration
  const registerResult = await testRegister();
  if (!registerResult || !registerResult.token) {
    console.log('Registration failed, trying login...');
    const loginResult = await testLogin();
    if (!loginResult || !loginResult.token) {
      console.log('Both registration and login failed. Stopping tests.');
      return;
    }
    token = loginResult.token;
  } else {
    token = registerResult.token;
  }
  
  console.log('\nUsing token:', token.substring(0, 20) + '...\n');
  
  // Test profile update
  await testProfileUpdate(token);
  
  // Test session creation
  const sessionResult = await testCreateSession(token);
  
  // Test get sessions
  await testGetSessions(token);
  
  console.log('\nTests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testRegister, testLogin, testProfileUpdate, testCreateSession, testGetSessions };
