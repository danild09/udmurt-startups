const axios = require('axios');
axios.post('http://localhost:5000/api/auth/login', {
  email: 'admin@example.com',
  password: 'password123'
}).then(res => console.log('Login success:', res.data))
  .catch(err => console.error('Login failed:', err.response ? err.response.data : err.message));
