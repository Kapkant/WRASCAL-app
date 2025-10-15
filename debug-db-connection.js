const { Client } = require('pg');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
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
    idleTimeoutMillis: 30000,
    query_timeout: 10000
  };

  console.log('📋 Connection Config:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Database:', config.database);
  console.log('User:', config.user);
  console.log('SSL:', config.ssl);
  console.log('=====================================');

  const client = new Client(config);

  try {
    console.log('⏳ Attempting to connect...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    console.log('⏳ Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Query successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].postgres_version);
    
    console.log('⏳ Testing database info...');
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);
    console.log('✅ Database info retrieved:');
    console.log(JSON.stringify(dbInfo.rows[0], null, 2));
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    console.error('Error position:', error.position);
    console.error('Error internalPosition:', error.internalPosition);
    console.error('Error internalQuery:', error.internalQuery);
    console.error('Error where:', error.where);
    console.error('Error schema:', error.schema);
    console.error('Error table:', error.table);
    console.error('Error column:', error.column);
    console.error('Error dataType:', error.dataType);
    console.error('Error constraint:', error.constraint);
    console.error('Error file:', error.file);
    console.error('Error line:', error.line);
    console.error('Error routine:', error.routine);
    console.error('Full error:', error);
  } finally {
    try {
      await client.end();
      console.log('🔌 Connection closed');
    } catch (closeError) {
      console.error('Error closing connection:', closeError.message);
    }
  }
}

// Test with different SSL configurations
async function testDifferentSSLConfigs() {
  console.log('\n🔧 Testing different SSL configurations...');
  console.log('=====================================');
  
  const configs = [
    { name: 'No SSL', ssl: false },
    { name: 'SSL with rejectUnauthorized: false', ssl: { rejectUnauthorized: false } },
    { name: 'SSL with rejectUnauthorized: true', ssl: { rejectUnauthorized: true } },
    { name: 'SSL with require: true', ssl: { require: true, rejectUnauthorized: false } }
  ];

  for (const config of configs) {
    console.log(`\n🧪 Testing: ${config.name}`);
    const client = new Client({
      host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
      port: 5432,
      database: 'wrascal_db',
      user: 'wrascal_db_user',
      password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
      ssl: config.ssl,
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log(`✅ ${config.name} - SUCCESS`);
      await client.end();
    } catch (error) {
      console.log(`❌ ${config.name} - FAILED: ${error.message}`);
    }
  }
}

// Run the tests
async function runAllTests() {
  await testDatabaseConnection();
  await testDifferentSSLConfigs();
  
  console.log('\n🏁 All tests completed');
  console.log('=====================================');
  console.log('If all tests fail, the issue might be:');
  console.log('1. Database is not accessible from Render');
  console.log('2. IP restrictions on the database');
  console.log('3. Database is sleeping/dormant');
  console.log('4. Network connectivity issues');
  console.log('5. Database credentials are incorrect');
}

runAllTests().catch(console.error);
