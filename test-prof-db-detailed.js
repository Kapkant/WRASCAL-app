const { Client } = require('pg');

async function testProfessorDatabase() {
  console.log('🔍 DETAILED PROFESSOR DATABASE TEST');
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

  console.log('📋 Configuration:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Database:', config.database);
  console.log('User:', config.user);
  console.log('SSL:', config.ssl);
  console.log('');

  const client = new Client(config);

  try {
    console.log('⏳ Attempting connection...');
    await client.connect();
    console.log('✅ CONNECTION SUCCESSFUL!');
    
    // Test a simple query
    console.log('🔍 Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version);
    
    // Test if we can see tables
    console.log('🔍 Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✅ Tables found:', tablesResult.rows.length);
    if (tablesResult.rows.length > 0) {
      console.log('Table names:', tablesResult.rows.map(r => r.table_name).join(', '));
    }
    
  } catch (error) {
    console.log('❌ CONNECTION FAILED!');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Error detail:', error.detail);
    console.log('Error hint:', error.hint);
    console.log('Error position:', error.position);
    console.log('Error where:', error.where);
    console.log('Error schema:', error.schema);
    console.log('Error table:', error.table);
    console.log('Error column:', error.column);
    console.log('Error dataType:', error.dataType);
    console.log('Error constraint:', error.constraint);
    console.log('Error file:', error.file);
    console.log('Error line:', error.line);
    console.log('Error routine:', error.routine);
    console.log('Error severity:', error.severity);
    console.log('Full error object:', JSON.stringify(error, null, 2));
  } finally {
    try {
      await client.end();
      console.log('🔌 Connection closed');
    } catch (closeError) {
      console.log('⚠️ Error closing connection:', closeError.message);
    }
  }
}

// Test with different SSL configurations
async function testDifferentSSLConfigs() {
  console.log('\n🔍 TESTING DIFFERENT SSL CONFIGURATIONS');
  console.log('=========================================');
  
  const baseConfig = {
    host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
    port: 5432,
    database: 'wrascal_db',
    user: 'wrascal_db_user',
    password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
    connectionTimeoutMillis: 5000
  };

  const sslConfigs = [
    { name: 'No SSL', ssl: false },
    { name: 'SSL with rejectUnauthorized: false', ssl: { rejectUnauthorized: false } },
    { name: 'SSL with rejectUnauthorized: true', ssl: { rejectUnauthorized: true } },
    { name: 'SSL with require: true', ssl: { require: true, rejectUnauthorized: false } }
  ];

  for (const config of sslConfigs) {
    console.log(`\n🧪 Testing: ${config.name}`);
    const client = new Client({ ...baseConfig, ssl: config.ssl });
    
    try {
      await client.connect();
      console.log('✅ SUCCESS!');
      await client.end();
    } catch (error) {
      console.log('❌ FAILED:', error.message);
    }
  }
}

async function main() {
  await testProfessorDatabase();
  await testDifferentSSLConfigs();
}

main().catch(console.error);
