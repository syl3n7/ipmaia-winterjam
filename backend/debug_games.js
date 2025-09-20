require('dotenv').config();
const { pool } = require('./config/database');

async function checkGamesAndJams() {
    try {
        console.log('🔍 Checking games and game jams in database...\n');
        
        // Check game jams
        const jamsResult = await pool.query('SELECT id, name, is_active FROM game_jams ORDER BY id');
        console.log('=== GAME JAMS ===');
        jamsResult.rows.forEach(jam => {
            console.log(`ID: ${jam.id}, Name: "${jam.name}", Active: ${jam.is_active}`);
        });
        
        // Check games
        const gamesResult = await pool.query('SELECT id, title, team_name, game_jam_id FROM games ORDER BY id');
        console.log('\n=== GAMES ===');
        gamesResult.rows.forEach(game => {
            console.log(`ID: ${game.id}, Title: "${game.title}", Team: "${game.team_name}", Game Jam ID: ${game.game_jam_id}`);
        });
        
        // Test the join query that findAll() uses
        console.log('\n=== TESTING JOIN QUERY ===');
        const joinResult = await pool.query(`
            SELECT g.id, g.title, g.team_name, gj.name as game_jam_name, gj.is_active as jam_active
            FROM games g
            JOIN game_jams gj ON g.game_jam_id = gj.id
            ORDER BY g.created_at DESC
        `);
        
        console.log('Join query results:');
        joinResult.rows.forEach(row => {
            console.log(`Game: "${row.title}" | Jam: "${row.game_jam_name}" | Jam Active: ${row.jam_active}`);
        });
        
        console.log(`\nTotal: ${jamsResult.rows.length} game jams, ${gamesResult.rows.length} games, ${joinResult.rows.length} joined results`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

checkGamesAndJams();