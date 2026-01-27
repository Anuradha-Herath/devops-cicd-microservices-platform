const http = require('http');

// Simple health check test
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✓ Health check passed');
        resolve(true);
      } else {
        console.log('✗ Health check failed with status:', res.statusCode);
        reject(new Error(`Health check failed: ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      console.log('✗ Health check connection error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run test if called directly
if (require.main === module) {
  testHealthEndpoint()
    .then(() => {
      console.log('All tests passed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Tests failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testHealthEndpoint };
