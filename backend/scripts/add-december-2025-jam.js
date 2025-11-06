require('dotenv').config();
const { pool } = require('../config/database');

async function addDecember2025Jam() {
    console.log('📝 Adding December 2025 WinterJam...');
    
    try {
        // Check if it already exists
        const existingCheck = await pool.query(
            `SELECT id FROM game_jams WHERE name = $1`,
            ['2ª edição WinterJam IPMaia']
        );
        
        if (existingCheck.rows.length > 0) {
            console.log('ℹ️  December 2025 jam already exists, updating...');
            
            const result = await pool.query(`
                UPDATE game_jams SET
                    theme = $1,
                    description = $2,
                    start_date = $3,
                    end_date = $4,
                    registration_start_date = $5,
                    registration_end_date = $6,
                    registration_url = $7,
                    rules_pdf_url = $8,
                    is_active = $9,
                    banner_image_url = $10,
                    show_theme = $11,
                    show_description = $12,
                    show_start_date = $13,
                    show_end_date = $14,
                    date_fallback = $15,
                    show_registration_dates = $16,
                    registration_date_fallback = $17,
                    show_registration_url = $18,
                    show_rules_pdf_url = $19,
                    show_banner_image = $20,
                    banner_fallback = $21,
                    updated_at = NOW()
                WHERE name = $22
                RETURNING *
            `, [
                'TBD',
                'A WinterJam voltará a reunir estudantes de desenvolvimento de jogos numa intensa maratona criativa do dia 5 a dia 7 de dezembro de 2025, fica atento para mais informações.',
                '2025-12-05T00:00:00.000Z',
                '2025-12-07T18:00:00.000Z',
                '2025-11-01T00:00:00.000Z',
                '2025-12-04T23:59:00.000Z',
                'https://example.com',
                '/WinterJam_Rulebook.pdf',
                true,
                '/images/IPMAIA_SiteBanner.png',
                false,
                true,
                true,
                true,
                'Coming Soon',
                false,
                'Coming Soon',
                false,
                true,
                true,
                'default',
                '2ª edição WinterJam IPMaia'
            ]);
            
            console.log('✅ Updated December 2025 jam:', result.rows[0].name);
            return result.rows[0];
        }
        
        // Create new
        const result = await pool.query(`
            INSERT INTO game_jams (
                name, theme, description, start_date, end_date,
                registration_start_date, registration_end_date, registration_url,
                rules_pdf_url, is_active, banner_image_url,
                show_theme, show_description, show_start_date, show_end_date, date_fallback,
                show_registration_dates, registration_date_fallback,
                show_registration_url, show_rules_pdf_url, show_banner_image, banner_fallback
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
            )
            RETURNING *
        `, [
            '2ª edição WinterJam IPMaia',
            'TBD',
            'A WinterJam voltará a reunir estudantes de desenvolvimento de jogos numa intensa maratona criativa do dia 5 a dia 7 de dezembro de 2025, fica atento para mais informações.',
            '2025-12-05T00:00:00.000Z',
            '2025-12-07T18:00:00.000Z',
            '2025-11-01T00:00:00.000Z',
            '2025-12-04T23:59:00.000Z',
            'https://example.com',
            '/WinterJam_Rulebook.pdf',
            true, // is_active
            '/images/IPMAIA_SiteBanner.png',
            false, // show_theme (TBD)
            true,  // show_description
            true,  // show_start_date
            true,  // show_end_date
            'Coming Soon',
            false, // show_registration_dates
            'Coming Soon',
            false, // show_registration_url (example.com)
            true,  // show_rules_pdf_url
            true,  // show_banner_image
            'default'
        ]);
        
        console.log('✅ Created December 2025 jam:', result.rows[0].name);
        
        // Deactivate February 2025 jam
        await pool.query(`
            UPDATE game_jams 
            SET is_active = false 
            WHERE name = 'WinterJam 2025' AND id != $1
        `, [result.rows[0].id]);
        
        console.log('✅ Deactivated February 2025 jam');
        
        return result.rows[0];
        
    } catch (error) {
        console.error('❌ Error adding December 2025 jam:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    addDecember2025Jam()
        .then(() => {
            console.log('✅ December 2025 jam added successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Failed to add jam:', error);
            process.exit(1);
        });
}

module.exports = addDecember2025Jam;
