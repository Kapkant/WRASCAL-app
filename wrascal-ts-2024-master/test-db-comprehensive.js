const { Client } = require('pg');

async function testDatabaseComprehensive() {
  console.log('🔍 COMPREHENSIVE DATABASE TEST');
  console.log('================================');
  console.log('Hostname: dpg-coa67df79t8c73ed886g-9');
  console.log('Port: 5432');
  console.log('Database: wrascal_db');
  console.log('Username: wrascal_db_user');
  console.log('Password: d5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK');
  console.log('URL: dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com/wrascal_db');
  console.log('');

  // Test 1: Basic connection
  console.log('🧪 TEST 1: Basic Connection');
  console.log('---------------------------');
  const client1 = new Client({
    host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
    port: 5432,
    user: 'wrascal_db_user',
    password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
    database: 'wrascal_db',
    ssl: true,
    connectionTimeoutMillis: 30000
  });

  try {
    console.log('⏳ Attempting connection (30 second timeout)...');
    await client1.connect();
    console.log('✅ SUCCESS! Database is accessible and not sleeping!');
    
    // Test 2: Basic query
    console.log('\n🧪 TEST 2: Basic Query');
    console.log('----------------------');
    const result = await client1.query('SELECT NOW() as current_time');
    console.log('✅ Query successful! Current time:', result.rows[0].current_time);
    
    // Test 3: Check database info
    console.log('\n🧪 TEST 3: Database Information');
    console.log('-------------------------------');
    const dbInfo = await client1.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as postgres_version,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);
    console.log('Database name:', dbInfo.rows[0].database_name);
    console.log('Current user:', dbInfo.rows[0].current_user);
    console.log('PostgreSQL version:', dbInfo.rows[0].postgres_version);
    console.log('Server IP:', dbInfo.rows[0].server_ip);
    console.log('Server port:', dbInfo.rows[0].server_port);
    
    // Test 4: Check tables
    console.log('\n🧪 TEST 4: Check Existing Tables');
    console.log('---------------------------------');
    const tables = await client1.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Found tables:');
      tables.rows.forEach(row => console.log(`  - ${row.table_name} (${row.table_type})`));
    } else {
      console.log('⚠️  No tables found (database is empty)');
    }
    
    await client1.end();
    console.log('\n🎉 ALL TESTS PASSED! Database is working perfectly!');
    
  } catch (error) {
    console.log('❌ CONNECTION FAILED!');
    console.log('Error code:', error.code || 'No code');
    console.log('Error message:', error.message);
    
    // Analyze the error
    console.log('\n🔍 ERROR ANALYSIS:');
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Database is not running or sleeping');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Hostname does not exist or is incorrect');
    } else if (error.code === '28P01') {
      console.log('💡 Username or password is incorrect');
    } else if (error.code === '3D000') {
      console.log('💡 Database name is incorrect');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Connection timed out - database might be sleeping');
    } else if (error.message.includes('Connection terminated unexpectedly')) {
      console.log('💡 Database connection was terminated - likely sleeping or network issue');
    } else {
      console.log('💡 Unknown error - check credentials and network');
    }
    
    console.log('\nFull error details:');
    console.log(JSON.stringify(error, null, 2));
  }
}

testDatabaseComprehensive();
