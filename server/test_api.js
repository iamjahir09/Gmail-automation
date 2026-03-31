const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('http://localhost:5000/api/analytics/overview');
    console.log('--- API OVERVIEW RESPONSE ---');
    console.log(JSON.stringify(res.data, null, 2));
    console.log('-----------------------------');
  } catch (err) {
    console.error('API TEST ERROR:', err.message);
  }
}

testApi();
