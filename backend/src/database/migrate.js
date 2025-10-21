import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeQuery, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed. Please check your configuration.');
      process.exit(1);
    }

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      const result = await executeQuery(statement);
      if (!result.success) {
        console.error(`❌ Error executing statement ${i + 1}:`, result.error);
        console.error('Statement:', statement);
        process.exit(1);
      }
    }

    console.log('✅ Database migration completed successfully!');
    console.log('🎉 Your FreelanceTN database is ready to use.');
    
    // Display some stats
    const stats = await getDatabaseStats();
    console.log('\n📊 Database Statistics:');
    console.log(`   Categories: ${stats.categories}`);
    console.log(`   Skills: ${stats.skills}`);
    console.log(`   Users: ${stats.users}`);
    console.log(`   Jobs: ${stats.jobs}`);
    console.log(`   Proposals: ${stats.proposals}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

const getDatabaseStats = async () => {
  try {
    const [categoriesResult, skillsResult, usersResult, jobsResult, proposalsResult] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM categories'),
      executeQuery('SELECT COUNT(*) as count FROM skills'),
      executeQuery('SELECT COUNT(*) as count FROM users'),
      executeQuery('SELECT COUNT(*) as count FROM jobs'),
      executeQuery('SELECT COUNT(*) as count FROM proposals')
    ]);

    return {
      categories: categoriesResult.data[0].count,
      skills: skillsResult.data[0].count,
      users: usersResult.data[0].count,
      jobs: jobsResult.data[0].count,
      proposals: proposalsResult.data[0].count
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      categories: 0,
      skills: 0,
      users: 0,
      jobs: 0,
      proposals: 0
    };
  }
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export default runMigrations;

