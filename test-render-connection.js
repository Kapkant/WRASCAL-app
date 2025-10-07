const { Client } = require('pg');

async function testRenderConnection() {
  console.log('🔍 TESTING RENDER-TO-RENDER CONNECTION');
  console.log('=====================================');
  
  const config = {
    host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
    port: 5432,
    database: 'wrascal_db',
    user: 'wrascal_db_user',
    password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000
  };

  console.log('📋 Testing with different SSL configurations...\n');

  const sslConfigs = [
    { name: 'No SSL', ssl: false },
    { name: 'SSL rejectUnauthorized: false', ssl: { rejectUnauthorized: false } },
    { name: 'SSL require: true', ssl: { require: true, rejectUnauthorized: false } },
    { name: 'SSL with ca', ssl: { rejectUnauthorized: false, ca: false } }
  ];

  for (const sslConfig of sslConfigs) {
    console.log(`🧪 Testing: ${sslConfig.name}`);
    const client = new Client({ ...config, ssl: sslConfig.ssl });
    
    try {
      await client.connect();
      console.log('✅ SUCCESS!');
      
      // Test a simple query
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ Query successful:', result.rows[0].current_time);
      
      await client.end();
      return; // Exit on first success
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      console.log('   Error code:', error.code);
      console.log('   Error detail:', error.detail);
    }
  }
  
  console.log('\n❌ All connection attempts failed');
}

testRenderConnection().catch(console.error);
