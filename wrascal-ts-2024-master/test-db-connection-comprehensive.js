const { Client } = require('pg');

// Test configurations
const configs = {
  professor: {
    host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
    port: 5432,
    database: 'wrascal_db',
    username: 'wrascal_db_user',
    password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
    ssl: { rejectUnauthorized: false }
  },
  test: {
    host: 'dpg-d3d1lrb7mgec73av1590-a.oregon-postgres.render.com',
    port: 5432,
    database: 'wrascal_test_db',
    username: 'wrascal_test_db_user',
    password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
    ssl: { rejectUnauthorized: false }
  }
};

async function testConnection(config, name) {
  console.log(`\n🔍 Testing ${name} database connection...`);
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`Database: ${config.database}`);
  console.log(`Username: ${config.username}`);
  console.log(`SSL: ${JSON.stringify(config.ssl)}`);
  
  const client = new Client(config);
  
  try {
    console.log('⏳ Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test basic query
    console.log('⏳ Testing basic query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Query successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].postgres_version);
    
    // Test if we can see tables
    console.log('⏳ Checking for tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('✅ Tables found:', tablesResult.rows.map(row => row.table_name));
    
    // Test if we can see schemas
    console.log('⏳ Checking schemas...');
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    console.log('✅ Schemas found:', schemasResult.rows.map(row => row.schema_name));
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  } finally {
    try {
      await client.end();
      console.log('🔌 Connection closed');
    } catch (closeError) {
      console.error('⚠️ Error closing connection:', closeError.message);
    }
  }
}

async function testWithConnectionString(config, name) {
  console.log(`\n🔍 Testing ${name} with connection string...`);
  
  const connectionString = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?sslmode=require`;
  console.log('Connection string:', connectionString.replace(config.password, '***'));
  
  const client = new Client({ connectionString });
  
  try {
    console.log('⏳ Connecting with connection string...');
    await client.connect();
    console.log('✅ Connected successfully with connection string!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful!', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Connection string failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
  } finally {
    try {
      await client.end();
      console.log('🔌 Connection closed');
    } catch (closeError) {
      console.error('⚠️ Error closing connection:', closeError.message);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive database connection tests...\n');
  
  // Test professor's database
  await testConnection(configs.professor, 'Professor');
  await testWithConnectionString(configs.professor, 'Professor');
  
  // Test your test database
  await testConnection(configs.test, 'Test');
  await testWithConnectionString(configs.test, 'Test');
  
  console.log('\n🏁 All tests completed!');
}

runTests().catch(console.error);




