const { GameJam, Game } = require('./models');

async function checkCurrentData() {
    try {
        console.log('=== CURRENT GAME JAMS ===');
        const gameJams = await GameJam.findAll({
            include: [Game]
        });
        
        gameJams.forEach(jam => {
            console.log(`\nGame Jam: ${jam.name} (${jam.season} ${jam.year})`);
            console.log(`Games count: ${jam.Games.length}`);
            jam.Games.forEach(game => {
                console.log(`  - ${game.name} by ${game.author}`);
            });
        });

        console.log('\n=== ALL GAMES ===');
        const allGames = await Game.findAll();
        console.log(`Total games in database: ${allGames.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCurrentData();