require('dotenv').config();
const { pool } = require('./config/database');

async function inspectData() {
    try {
        console.log('🔍 Inspecting current database data...\n');
        
        // Check game jams structure
        console.log('=== GAME JAMS ===');
        const jamsResult = await pool.query('SELECT * FROM game_jams LIMIT 1');
        if (jamsResult.rows.length > 0) {
            const jam = jamsResult.rows[0];
            console.log('Sample Game Jam:');
            console.log('ID:', jam.id);
            console.log('Name:', jam.name);
            console.log('Theme:', jam.theme);
            console.log('Description:', jam.description ? 'Present' : 'NULL');
            console.log('Start Date:', jam.start_date);
            console.log('End Date:', jam.end_date);
            console.log('Registration Start:', jam.registration_start_date || 'NULL');
            console.log('Registration End:', jam.registration_end_date || 'NULL');
            console.log('Registration URL:', jam.registration_url || 'NULL');
            console.log('Rules PDF URL:', jam.rules_pdf_url || 'NULL');
            console.log('Banner Image URL:', jam.banner_image_url || 'NULL');
            console.log('Is Active:', jam.is_active);
        } else {
            console.log('No game jams found!');
        }
        
        console.log('\n=== GAMES ===');
        const gamesResult = await pool.query('SELECT * FROM games LIMIT 1');
        if (gamesResult.rows.length > 0) {
            const game = gamesResult.rows[0];
            console.log('Sample Game:');
            console.log('ID:', game.id);
            console.log('Game Jam ID:', game.game_jam_id);
            console.log('Title:', game.title);
            console.log('Description:', game.description ? 'Present' : 'NULL');
            console.log('Team Name:', game.team_name);
            console.log('Team Members Type:', typeof game.team_members);
            console.log('Team Members:', game.team_members);
            console.log('GitHub URL:', game.github_url || 'NULL');
            console.log('Itch URL:', game.itch_url || 'NULL');
            console.log('Screenshot URLs Type:', typeof game.screenshot_urls);
            console.log('Screenshot URLs:', game.screenshot_urls);
            console.log('Tags Type:', typeof game.tags);
            console.log('Tags:', game.tags);
            console.log('Is Featured:', game.is_featured);
        } else {
            console.log('No games found!');
        }
        
        // Count totals
        const jamCountResult = await pool.query('SELECT COUNT(*) FROM game_jams');
        const gameCountResult = await pool.query('SELECT COUNT(*) FROM games');
        
        console.log(`\n📊 Total: ${jamCountResult.rows[0].count} game jams, ${gameCountResult.rows[0].count} games`);
        
    } catch (error) {
        console.error('❌ Error inspecting data:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

inspectData();