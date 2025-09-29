const { Client } = require('pg');

async function testVariations() {
  const variations = [
    {
      name: 'Original with SSL',
      config: {
        host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
        port: 5432,
        user: 'wrascal_db_user',
        password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
        database: 'wrascal_db',
        ssl: true
      }
    },
    {
      name: 'Without SSL',
      config: {
        host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
        port: 5432,
        user: 'wrascal_db_user',
        password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
        database: 'wrascal_db',
        ssl: false
      }
    },
    {
      name: 'With connection timeout',
      config: {
        host: 'dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com',
        port: 5432,
        user: 'wrascal_db_user',
        password: 'd5x7Xjm4cj4Ryfu7yBhqpL2bhKXqF1tK',
        database: 'wrascal_db',
        ssl: true,
        connectionTimeoutMillis: 10000
      }
    }
  ];

  for (const test of variations) {
    console.log(`\n🔍 Testing: ${test.name}`);
    const client = new Client(test.config);
    
    try {
      await client.connect();
      console.log('✅ SUCCESS!');
      await client.end();
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      if (error.code) {
        console.log('   Error code:', error.code);
      }
    }
  }
}

testVariations();
