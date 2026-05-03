const axios = require('axios');

async function test() {
  try {
    const url = 'https://saas-project-6mre.vercel.app/api/auth/login';
    console.log('Testing login at:', url);
    
    const response = await axios.post(url, {
      email: 'ansariasif5413@gmail.com',
      password: 'Faculty@123'
    });
    
    console.log('Login Success!');
    console.log('Data:', response.data);
  } catch (err) {
    console.error('Login Failed!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Message:', err.response.data.message);
    } else {
      console.error('Error:', err.message);
    }
  }
}

test();
