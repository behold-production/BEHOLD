require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const mongoose = require('mongoose');

console.log('[Test] Starting backend validation test with database connection...');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/behold_aspire';

console.log('[Test] Connecting to MongoDB:', MONGODB_URI);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[Test] MongoDB Connected successfully.');

    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      console.log(`[Test] Server successfully booted on temporary port ${port}`);

      http.get(`http://localhost:${port}/api/health`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('[Test] Received Response:', data);
          try {
            const parsed = JSON.parse(data);
            if (parsed.success && parsed.message.includes('healthy')) {
              console.log('[Test] SUCCESS: Backend boot, DB connect & health check API test passed!');
              server.close(async () => {
                await mongoose.connection.close();
                console.log('[Test] Server and DB connections closed. Exiting successfully.');
                process.exit(0);
              });
            } else {
              console.error('[Test] FAIL: Health check response did not return success!');
              server.close(async () => {
                await mongoose.connection.close();
                process.exit(1);
              });
            }
          } catch (err) {
            console.error('[Test] FAIL: Could not parse response JSON:', err);
            server.close(async () => {
              await mongoose.connection.close();
              process.exit(1);
            });
          }
        });
      }).on('error', (err) => {
        console.error('[Test] FAIL: HTTP request encountered an error:', err);
        server.close(async () => {
          await mongoose.connection.close();
          process.exit(1);
        });
      });
    });
  })
  .catch(err => {
    console.error('[Test] FAIL: Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
