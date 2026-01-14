const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  try {
    // Read the latest migration file
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }

    // Get the latest migration
    const latestMigration = files.sort().reverse()[0];
    const migrationPath = path.join(migrationsDir, latestMigration);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(`Applying migration: ${latestMigration}`);

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        // Use tagged template literal
        await sql`${sql.raw(statement)}`;
        console.log('✓ Statement executed successfully');
      } catch (error) {
        // Ignore table already exists errors
        if (error.message.includes('already exists')) {
          console.log(`⊘ Table already exists, skipping`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
