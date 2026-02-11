async function testAuth() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test' + Math.random() + '@example.com',
        password: 'password123',
        name: 'Test Farmer',
        role: 'exploitant'
      })
    });
    const data = await response.json();
    console.log('API Response:', data);
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

testAuth();
