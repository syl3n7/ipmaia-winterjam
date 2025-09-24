require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { createTables } = require('./migrate');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Ensure tables exist
    await createTables();

    // Note: Admin users are now created automatically via OIDC authentication
    // No need to create legacy admin users
    console.log('� Admin users will be created automatically via OIDC authentication');

    // Create sample WinterJam 2025
    const gameJamResult = await pool.query(`
      INSERT INTO game_jams (
        name, theme, description, start_date, end_date,
        registration_start_date, registration_end_date, registration_url,
        is_active
      ) VALUES (
        'IPMAIA WinterJam 2025', 
        'Anomalia',
        'Uma game jam onde estudantes de desenvolvimento de jogos criam experiências únicas em 45 horas.',
        '2025-02-14 17:00:00',
        '2025-02-16 14:00:00',
        '2025-01-15 00:00:00',
        '2025-02-14 16:00:00',
        'https://forms.microsoft.com/r/example',
        true
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    if (gameJamResult.rows.length > 0) {
      const gameJamId = gameJamResult.rows[0].id;
      console.log('🎮 WinterJam 2025 created');

      // Create sample games
      const sampleGames = [
        {
          title: 'Arctic Escape',
          description: 'A thrilling adventure game set in the frozen wilderness.',
          team_name: 'Polar Bears',
          team_members: ['Alice Silva', 'Bob Santos'],
          github_url: 'https://github.com/example/arctic-escape',
          itch_url: 'https://polarbears.itch.io/arctic-escape',
          tags: ['adventure', 'puzzle', '2d'],
          is_featured: true
        },
        {
          title: 'Deep Anomaly',
          description: 'Explore the mysterious depths of an alien ocean.',
          team_name: 'Deep Dive Studios',
          team_members: ['Carol Costa', 'David Ferreira', 'Eva Lima'],
          github_url: 'https://github.com/example/deep-anomaly',
          itch_url: 'https://deepdive.itch.io/deep-anomaly',
          tags: ['exploration', '3d', 'underwater'],
          is_featured: true
        }
      ];

      for (const game of sampleGames) {
        await pool.query(`
          INSERT INTO games (
            game_jam_id, title, description, team_name, team_members,
            github_url, itch_url, tags, is_featured
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          gameJamId,
          game.title,
          game.description,
          game.team_name,
          JSON.stringify(game.team_members),
          game.github_url,
          game.itch_url,
          JSON.stringify(game.tags),
          game.is_featured
        ]);
      }

      console.log('🎯 Sample games created');
    }

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('🔐 Admin Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   URL: http://localhost:3001/admin');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

async function seed() {
  try {
    await seedDatabase();
    console.log('🎉 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seed();
}

module.exports = { seedDatabase };