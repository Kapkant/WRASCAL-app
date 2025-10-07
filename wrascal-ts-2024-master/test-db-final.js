const { Client } = require('pg');

// Professor's database credentials
const PROFESSOR_DB = {
    host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
    port: 5432,
    user: 'wrascal_db_user',
    password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
    database: 'wrascal_db',
    ssl: { rejectUnauthorized: false }
};

// Test database credentials (if you have them)
const TEST_DB = {
    host: 'dpg-d3d1lrb7mgec73av1590-a.oregon-postgres.render.com',
    port: 5432,
    user: 'wrascal_test_db_user',
    password: 'YOUR_TEST_DB_PASSWORD', // Replace with actual password
    database: 'wrascal_test_db',
    ssl: { rejectUnauthorized: false }
};

async function testDatabase(dbConfig, dbName) {
    console.log(`\n🔍 TESTING ${dbName.toUpperCase()} DATABASE`);
    console.log('='.repeat(50));
    console.log(`Host: ${dbConfig.host}`);
    console.log(`Port: ${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`Username: ${dbConfig.user}`);
    console.log(`SSL: ${JSON.stringify(dbConfig.ssl)}`);

    const client = new Client(dbConfig);

    try {
        console.log('\n⏳ Attempting connection...');
        await client.connect();
        console.log('✅ Connection successful!');

        console.log('\n⏳ Testing basic query...');
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
        console.log('✅ Query successful!');
        console.log(`Current time: ${result.rows[0].current_time}`);
        console.log(`PostgreSQL version: ${result.rows[0].postgres_version}`);

        console.log('\n⏳ Testing database tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log('✅ Tables query successful!');
        console.log(`Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));

        console.log('\n⏳ Testing SSL connection...');
        if (client.ssl) {
            console.log('✅ SSL connection is active');
            console.log(`SSL details: ${JSON.stringify(client.ssl)}`);
        } else {
            console.log('❌ SSL connection is NOT active');
        }

        return true;

    } catch (error) {
        console.log('❌ CONNECTION FAILED!');
        console.log(`Error type: ${error.name}`);
        console.log(`Error message: ${error.message}`);
        console.log(`Error code: ${error.code}`);
        if (error.code === 'ENOTFOUND') {
            console.log('💡 This usually means the hostname is incorrect or the database is not accessible');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 This usually means the port is incorrect or the service is not running');
        } else if (error.code === '28P01') {
            console.log('💡 This usually means the username or password is incorrect');
        } else if (error.code === '3D000') {
            console.log('💡 This usually means the database name is incorrect');
        }
        return false;
    } finally {
        try {
            await client.end();
            console.log('Connection closed.');
        } catch (e) {
            // Ignore close errors
        }
    }
}

async function runAllTests() {
    console.log('🚀 COMPREHENSIVE DATABASE CONNECTION TEST');
    console.log('==========================================');
    
    // Test professor's database
    const professorSuccess = await testDatabase(PROFESSOR_DB, 'Professor');
    
    // Test your test database (if you have credentials)
    console.log('\n' + '='.repeat(60));
    console.log('NOTE: Test database requires actual password');
    console.log('If you have test DB credentials, update the script');
    
    console.log('\n📊 SUMMARY');
    console.log('==========');
    console.log(`Professor Database: ${professorSuccess ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Test Database: ⚠️  NEEDS CREDENTIALS`);
    
    if (professorSuccess) {
        console.log('\n🎉 SUCCESS! Your professor\'s database is accessible and working!');
        console.log('You can proceed with deployment using these credentials.');
    } else {
        console.log('\n❌ ISSUE FOUND! The professor\'s database is not accessible.');
        console.log('Please check the credentials or contact your professor.');
    }
}

runAllTests().catch(console.error);



