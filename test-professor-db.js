const { Client } = require('pg');

// Test the professor's database credentials
async function testProfessorDB() {
  const client = new Client({
    host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
    port: 5432,
    user: 'wrascal_db_user',
    password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
    database: 'wrascal_db',
    ssl: true
  });

  try {
    console.log('🔍 Testing professor\'s database credentials...');
    console.log('Host: dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com');
    console.log('Port: 5432');
    console.log('User: wrascal_db_user');
    console.log('Database: wrascal_db');
    console.log('SSL: true');
    console.log('');
    
    console.log('⏳ Attempting to connect...');
    await client.connect();
    console.log('✅ SUCCESS! Database connection established!');
    
    console.log('⏳ Testing database query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ SUCCESS! Database query worked!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].postgres_version);
    
    console.log('⏳ Checking if tables exist...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ SUCCESS! Found tables in database:');
      tablesResult.rows.forEach(row => console.log('  -', row.table_name));
    } else {
      console.log('⚠️  WARNING: No tables found in database (might be empty)');
    }
    
    await client.end();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ FAILED! Database connection error:');
    console.error('Error type:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 This usually means the database is sleeping or not accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 This usually means the hostname is incorrect');
    } else if (error.code === '28P01') {
      console.error('💡 This usually means the username or password is incorrect');
    } else if (error.code === '3D000') {
      console.error('💡 This usually means the database name is incorrect');
    }
    
    console.error('Full error details:', error);
  }
}

testProfessorDB();
