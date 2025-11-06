// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
        let currentEditingGameJam = null;
        let currentEditingGame = null;
        let gameJams = [];
        let currentUser = null;

        // Authentication Functions
        async function checkAuthentication() {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'same-origin'
                });
                
                if (response.ok) {
                    currentUser = await response.json();
                    showAdminDashboard();
                    updateUserInfo();
                } else {
                    showAuthOverlay();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                showAuthOverlay();
            }
        }

        function showAuthOverlay() {
            document.getElementById('auth-overlay').style.display = 'flex';
            document.getElementById('admin-content').style.display = 'none';
        }

        function showAdminDashboard() {
            document.getElementById('auth-overlay').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
        }

        function updateUserInfo() {
            if (currentUser) {
                document.getElementById('user-info').innerHTML = `
                    👤 ${currentUser.username} (${currentUser.role}) 
                    <button onclick="logout()" class="btn btn-sm" style="margin-left: 10px;">Logout</button>
                `;
            }
        }

        function loginWithOIDC() {
            window.location.href = '/api/auth/oidc/login';
        }

        async function logout() {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'same-origin'
                });
                location.reload();
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }

        // Portuguese (Portugal) Date Formatting Utilities
        const PT_LOCALE = 'pt-PT';
        
        function formatDate(dateString) {
            if (!dateString) return '-';
            return new Date(dateString).toLocaleDateString(PT_LOCALE, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        
        function formatDateTime(dateString) {
            if (!dateString) return '-';
            return new Date(dateString).toLocaleString(PT_LOCALE, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        function formatCurrency(amount) {
            if (amount === null || amount === undefined) return '-';
            return new Intl.NumberFormat(PT_LOCALE, {
                style: 'currency',
                currency: 'EUR'
            }).format(amount);
        }
        
        function formatNumber(number) {
            if (number === null || number === undefined) return '-';
            return new Intl.NumberFormat(PT_LOCALE).format(number);
        }

        // API Helper Functions
        async function apiCall(endpoint, method = 'GET', data = null) {
            try {
                // Get CSRF token from meta tag
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                const options = { 
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'same-origin'
                };
                
                // Add CSRF token to headers for POST, PUT, DELETE requests
                if (csrfToken && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
                    options.headers['csrf-token'] = csrfToken;
                }
                
                if (data) {
                    options.body = JSON.stringify(data);
                }
                
                const response = await fetch(endpoint, options);
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || `HTTP ${response.status}`);
                }
                
                return result;
            } catch (error) {
                console.error('API call error:', error);
                throw error;
            }
        }

        function showStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            statusDiv.className = `status ${type}`;
            statusDiv.textContent = message;
        }

        // Navigation Functions
        function showSection(sectionName, buttonElement) {
            console.log('Switching to section:', sectionName);
            
            // Hide all sections
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Remove active class from nav buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected section
            const section = document.getElementById(sectionName + '-section');
            if (section) {
                section.classList.add('active');
            }
            
            // Add active class to the clicked button
            if (buttonElement) {
                buttonElement.classList.add('active');
            }
            
            // Load data for the section
            switch(sectionName) {
                case 'gamejams':
                    loadGameJams();
                    break;
                case 'games':
                    loadGames();
                    break;
                case 'frontpage':
                    loadFrontPageSettings();
                    loadBannerStatus();
                    break;
                case 'rules':
                    loadRules();
                    break;
                case 'system':
                    loadSystemInfo();
                    break;
            }
        }

        // Game Jams Functions
        async function loadGameJams() {
            console.log('Loading game jams...');
            const listDiv = document.getElementById('gamejams-list');
            listDiv.innerHTML = '<div class="loading">Loading game jams...</div>';
            
            try {
                gameJams = await apiCall('/api/admin/gamejams');
                console.log('Loaded game jams:', gameJams);
                renderGameJamsList(gameJams);
            } catch (error) {
                console.error('Error loading game jams:', error);
                listDiv.innerHTML = `<div class="error status">Error loading game jams: ${error.message}</div>`;
            }
        }

        function renderGameJamsList(jams) {
            const listDiv = document.getElementById('gamejams-list');
            
            if (jams.length === 0) {
                listDiv.innerHTML = `
                    <div class="empty-state">
                        <h3>No game jams found</h3>
                        <p>Click "Add New Game Jam" to create your first game jam.</p>
                    </div>
                `;
                return;
            }
            
            const table = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tema</th>
                            <th>Datas</th>
                            <th>Estado</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${jams.map(jam => `
                            <tr>
                                <td><strong>${jam.name}</strong></td>
                                <td>${jam.theme || '-'}</td>
                                <td>${formatDate(jam.start_date)} - ${formatDate(jam.end_date)}</td>
                                <td>
                                    <span class="badge ${jam.is_active ? 'badge-success' : 'badge-secondary'}">
                                        ${jam.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm" data-edit-jam="${jam.id}">✏️ Editar</button>
                                        <button class="btn btn-sm btn-primary" data-export-jam="${jam.id}">📥 Exportar</button>
                                        <button class="btn btn-danger btn-sm" data-delete-jam="${jam.id}">🗑️ Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            listDiv.innerHTML = table;
        }

        function showGameJamForm(isEditing = false) {
            console.log('Showing game jam form, isEditing:', isEditing);
            document.getElementById('gamejam-form').style.display = 'block';
            
            // Only reset form and currentEditingGameJam when creating new, not when editing
            if (!isEditing) {
                document.getElementById('gamejam-form-element').reset();
                currentEditingGameJam = null;
                console.log('🆕 Creating new game jam, reset currentEditingGameJam to null');
            } else {
                console.log('✏️ Editing existing game jam, keeping currentEditingGameJam:', currentEditingGameJam);
            }
        }

        function hideGameJamForm() {
            document.getElementById('gamejam-form').style.display = 'none';
            currentEditingGameJam = null;
        }

        async function editGameJam(id) {
            try {
                console.log('🔧 Editing game jam with ID:', id);
                const jam = await apiCall(`/api/admin/gamejams/${id}`);
                console.log('📋 Loaded game jam data:', jam);
                currentEditingGameJam = id;
                console.log('✅ Set currentEditingGameJam to:', currentEditingGameJam);
                
                // Fill the form
                console.log('🔍 Filling form fields with data:', jam);
                
                const nameField = document.getElementById('jam-name');
                console.log('📝 Name field found:', nameField, 'Setting to:', jam.name);
                if (nameField) nameField.value = jam.name;
                
                const themeField = document.getElementById('jam-theme');
                console.log('🎨 Theme field found:', themeField, 'Setting to:', jam.theme);
                if (themeField) themeField.value = jam.theme;
                
                const descField = document.getElementById('jam-description');
                console.log('📄 Description field found:', descField, 'Setting to:', jam.description || '');
                if (descField) descField.value = jam.description || '';
                
                const startField = document.getElementById('jam-start');
                const startValue = new Date(jam.start_date).toISOString().slice(0, 16);
                console.log('📅 Start field found:', startField, 'Setting to:', startValue);
                if (startField) startField.value = startValue;
                
                const endField = document.getElementById('jam-end');
                const endValue = new Date(jam.end_date).toISOString().slice(0, 16);
                console.log('📅 End field found:', endField, 'Setting to:', endValue);
                if (endField) endField.value = endValue;
                
                const regStartField = document.getElementById('jam-reg-start');
                const regStartValue = jam.registration_start_date ? new Date(jam.registration_start_date).toISOString().slice(0, 16) : '';
                console.log('📅 Reg start field found:', regStartField, 'Setting to:', regStartValue);
                if (regStartField) regStartField.value = regStartValue;
                
                const regEndField = document.getElementById('jam-reg-end');
                const regEndValue = jam.registration_end_date ? new Date(jam.registration_end_date).toISOString().slice(0, 16) : '';
                console.log('📅 Reg end field found:', regEndField, 'Setting to:', regEndValue);
                if (regEndField) regEndField.value = regEndValue;
                
                const regUrlField = document.getElementById('jam-reg-url');
                console.log('🔗 Reg URL field found:', regUrlField, 'Setting to:', jam.registration_url || '');
                if (regUrlField) regUrlField.value = jam.registration_url || '';
                
                const rulesPdfField = document.getElementById('jam-rules-pdf');
                console.log('📋 Rules PDF field found:', rulesPdfField, 'Setting to:', jam.rules_pdf_url || '');
                if (rulesPdfField) rulesPdfField.value = jam.rules_pdf_url || '';
                
                const bannerField = document.getElementById('jam-banner');
                console.log('🖼️ Banner field found:', bannerField, 'Setting to:', jam.banner_image_url || '');
                if (bannerField) bannerField.value = jam.banner_image_url || '';
                
                const activeField = document.getElementById('jam-active');
                console.log('✅ Active field found:', activeField, 'Setting to:', jam.is_active);
                if (activeField) activeField.checked = jam.is_active;
                
                // Homepage content fields
                const introductionField = document.getElementById('jam-introduction');
                console.log('📝 Introduction field found:', introductionField, 'Setting to:', jam.introduction || '');
                if (introductionField) introductionField.value = jam.introduction || '';
                
                const prizesField = document.getElementById('jam-prizes');
                console.log('🏆 Prizes field found:', prizesField, 'Setting to:', jam.prizes_content || '');
                if (prizesField) prizesField.value = jam.prizes_content || '';
                
                // Toggle fields
                const showThemeField = document.getElementById('show-theme');
                if (showThemeField) showThemeField.checked = jam.show_theme !== false;
                
                const showDescField = document.getElementById('show-description');
                if (showDescField) showDescField.checked = jam.show_description !== false;
                
                const showStartDateField = document.getElementById('show-start-date');
                if (showStartDateField) showStartDateField.checked = jam.show_start_date !== false;
                
                const showEndDateField = document.getElementById('show-end-date');
                if (showEndDateField) showEndDateField.checked = jam.show_end_date !== false;
                
                const dateFallbackField = document.getElementById('date-fallback');
                if (dateFallbackField) dateFallbackField.value = jam.date_fallback || 'TBD';
                
                const showRegDatesField = document.getElementById('show-registration-dates');
                if (showRegDatesField) showRegDatesField.checked = jam.show_registration_dates !== false;
                
                const regDateFallbackField = document.getElementById('registration-date-fallback');
                if (regDateFallbackField) regDateFallbackField.value = jam.registration_date_fallback || 'TBD';
                
                const showRegUrlField = document.getElementById('show-registration-url');
                if (showRegUrlField) showRegUrlField.checked = jam.show_registration_url !== false;
                
                const showRulesPdfField = document.getElementById('show-rules-pdf-url');
                if (showRulesPdfField) showRulesPdfField.checked = jam.show_rules_pdf_url !== false;
                
                const showBannerField = document.getElementById('show-banner-image');
                if (showBannerField) showBannerField.checked = jam.show_banner_image !== false;
                
                const bannerFallbackField = document.getElementById('banner-fallback');
                if (bannerFallbackField) bannerFallbackField.value = jam.banner_fallback || 'placeholder';
                
                console.log('🎯 Showing form first, then populating...');
                showGameJamForm(true); // Pass true to indicate this is an edit operation
                
                // Small delay to ensure form is visible before populating
                setTimeout(() => {
                    console.log('🔄 Re-populating fields after form is shown...');
                    if (nameField) nameField.value = jam.name;
                    if (themeField) themeField.value = jam.theme;
                    if (descField) descField.value = jam.description || '';
                    if (startField) startField.value = startValue;
                    if (endField) endField.value = endValue;
                    if (regStartField) regStartField.value = regStartValue;
                    if (regEndField) regEndField.value = regEndValue;
                    if (regUrlField) regUrlField.value = jam.registration_url || '';
                    if (rulesPdfField) rulesPdfField.value = jam.rules_pdf_url || '';
                    if (bannerField) bannerField.value = jam.banner_image_url || '';
                    if (activeField) activeField.checked = jam.is_active;
                    // Re-populate homepage content fields
                    if (introductionField) introductionField.value = jam.introduction || '';
                    if (prizesField) prizesField.value = jam.prizes_content || '';
                    // Re-populate toggle fields
                    if (showThemeField) showThemeField.checked = jam.show_theme !== false;
                    if (showDescField) showDescField.checked = jam.show_description !== false;
                    if (showStartDateField) showStartDateField.checked = jam.show_start_date !== false;
                    if (showEndDateField) showEndDateField.checked = jam.show_end_date !== false;
                    if (dateFallbackField) dateFallbackField.value = jam.date_fallback || 'TBD';
                    if (showRegDatesField) showRegDatesField.checked = jam.show_registration_dates !== false;
                    if (regDateFallbackField) regDateFallbackField.value = jam.registration_date_fallback || 'TBD';
                    if (showRegUrlField) showRegUrlField.checked = jam.show_registration_url !== false;
                    if (showRulesPdfField) showRulesPdfField.checked = jam.show_rules_pdf_url !== false;
                    if (showBannerField) showBannerField.checked = jam.show_banner_image !== false;
                    if (bannerFallbackField) bannerFallbackField.value = jam.banner_fallback || 'placeholder';
                    console.log('✅ All game jam form fields re-populated after showing form!');
                }, 100);
                
                console.log('✅ Initial form population completed, form shown');
            } catch (error) {
                showStatus(`Error loading game jam: ${error.message}`, 'error');
            }
        }

        async function deleteGameJam(id) {
            if (!confirm('Tem a certeza que deseja eliminar esta game jam? Esta ação não pode ser desfeita.')) {
                return;
            }
            
            try {
                showStatus('🗑️ A eliminar game jam...', 'info');
                await apiCall(`/api/admin/gamejams/${id}`, 'DELETE');
                showStatus('✅ Game jam eliminada com sucesso!', 'success');
                loadGameJams();
            } catch (error) {
                showStatus(`❌ Erro ao eliminar game jam: ${error.message}`, 'error');
            }
        }

        async function exportGameJam(id) {
            try {
                showStatus('📥 A preparar exportação da game jam...', 'info');
                
                // Trigger download by opening the export URL
                const exportUrl = `/api/admin/export/gamejam/${id}?format=json`;
                const link = document.createElement('a');
                link.href = exportUrl;
                link.download = `gamejam-${id}-export-${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showStatus('✅ Game jam exportada com sucesso!', 'success');
            } catch (error) {
                console.error('Error exporting game jam:', error);
                showStatus('❌ Falha ao exportar game jam', 'error');
            }
        }

        // Games Functions
        async function loadGames() {
            const listDiv = document.getElementById('games-list');
            listDiv.innerHTML = '<div class="loading">Loading games...</div>';
            
            try {
                const games = await apiCall('/api/admin/games');
                renderGamesList(games);
                
                // Load game jams for the dropdown
                if (gameJams.length === 0) {
                    gameJams = await apiCall('/api/admin/gamejams');
                }
                populateGameJamSelect();
            } catch (error) {
                listDiv.innerHTML = `<div class="error status">Error loading games: ${error.message}</div>`;
            }
        }

        function renderGamesList(games) {
            const listDiv = document.getElementById('games-list');
            
            if (games.length === 0) {
                listDiv.innerHTML = `
                    <div class="empty-state">
                        <h3>No games found</h3>
                        <p>Click "Add New Game" to create your first game entry.</p>
                    </div>
                `;
                return;
            }
            
            const table = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Team</th>
                            <th>Game Jam</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${games.map(game => `
                            <tr>
                                <td><strong>${game.title}</strong></td>
                                <td>${game.team_name}</td>
                                <td>${game.game_jam_name || 'N/A'}</td>
                                <td>
                                    <span class="badge ${game.is_featured ? 'badge-success' : 'badge-secondary'}">
                                        ${game.is_featured ? 'Featured' : 'Normal'}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm" data-edit-game="${game.id}">✏️ Edit</button>
                                        <button class="btn btn-danger btn-sm" data-delete-game="${game.id}">🗑️ Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            listDiv.innerHTML = table;
        }

        function populateGameJamSelect() {
            const select = document.getElementById('game-jam-select');
            select.innerHTML = '<option value="">Select a game jam...</option>';
            
            gameJams.forEach(jam => {
                const option = document.createElement('option');
                option.value = jam.id;
                option.textContent = jam.name;
                select.appendChild(option);
            });
        }

        function showGameForm(isEditing = false) {
            console.log('Showing game form, isEditing:', isEditing);
            document.getElementById('game-form').style.display = 'block';
            
            // Only reset form and currentEditingGame when creating new, not when editing
            if (!isEditing) {
                document.getElementById('game-form-element').reset();
                currentEditingGame = null;
                console.log('🆕 Creating new game, reset currentEditingGame to null');
            } else {
                console.log('✏️ Editing existing game, keeping currentEditingGame:', currentEditingGame);
            }
        }

        function hideGameForm() {
            document.getElementById('game-form').style.display = 'none';
            currentEditingGame = null;
        }

        async function editGame(id) {
            try {
                console.log('🔧 Editing game with ID:', id);
                const game = await apiCall(`/api/admin/games/${id}`);
                console.log('🎮 Loaded game data:', game);
                currentEditingGame = id;
                console.log('✅ Set currentEditingGame to:', currentEditingGame);
                
                console.log('🎯 Showing form first, then populating...');
                showGameForm(true); // Pass true to indicate this is an edit operation
                
                // Small delay to ensure form is visible before populating
                setTimeout(() => {
                    console.log('🔄 Populating game form fields...');
                    
                    const titleField = document.getElementById('game-title');
                    console.log('📝 Title field found:', titleField, 'Setting to:', game.title);
                    if (titleField) titleField.value = game.title;
                    
                    const jamSelectField = document.getElementById('game-jam-select');
                    console.log('🎮 Game jam select field found:', jamSelectField, 'Setting to:', game.game_jam_id);
                    if (jamSelectField) jamSelectField.value = game.game_jam_id;
                    
                    const descField = document.getElementById('game-description');
                    console.log('📄 Description field found:', descField, 'Setting to:', game.description || '');
                    if (descField) descField.value = game.description || '';
                    
                    const teamNameField = document.getElementById('game-team-name');
                    console.log('👥 Team name field found:', teamNameField, 'Setting to:', game.team_name);
                    if (teamNameField) teamNameField.value = game.team_name;
                    
                    // Handle team_members - could be JSON string or array
                    let teamMembersText = '';
                    if (game.team_members) {
                        if (typeof game.team_members === 'string') {
                            try {
                                const teamMembers = JSON.parse(game.team_members);
                                teamMembersText = teamMembers.map(m => `${m.name} (${m.role})`).join(', ');
                            } catch (e) {
                                teamMembersText = game.team_members;
                            }
                        } else if (Array.isArray(game.team_members)) {
                            teamMembersText = game.team_members.map(m => `${m.name} (${m.role})`).join(', ');
                        }
                    }
                    const teamMembersField = document.getElementById('game-team-members');
                    console.log('👤 Team members field found:', teamMembersField, 'Setting to:', teamMembersText);
                    if (teamMembersField) teamMembersField.value = teamMembersText;
                    
                    const githubField = document.getElementById('game-github');
                    console.log('🐙 GitHub field found:', githubField, 'Setting to:', game.github_url || '');
                    if (githubField) githubField.value = game.github_url || '';
                    
                    const itchField = document.getElementById('game-itch');
                    console.log('🎮 Itch field found:', itchField, 'Setting to:', game.itch_url || '');
                    if (itchField) itchField.value = game.itch_url || '';
                    
                    // Handle tags - could be JSON string or array
                    let tagsText = '';
                    if (game.tags) {
                        if (typeof game.tags === 'string') {
                            try {
                                const tags = JSON.parse(game.tags);
                                tagsText = Array.isArray(tags) ? tags.join(', ') : tags;
                            } catch (e) {
                                tagsText = game.tags;
                            }
                        } else if (Array.isArray(game.tags)) {
                            tagsText = game.tags.join(', ');
                        }
                    }
                    const tagsField = document.getElementById('game-tags');
                    console.log('🏷️ Tags field found:', tagsField, 'Setting to:', tagsText);
                    if (tagsField) tagsField.value = tagsText;
                    
                    const featuredField = document.getElementById('game-featured');
                    console.log('⭐ Featured field found:', featuredField, 'Setting to:', game.is_featured);
                    if (featuredField) featuredField.checked = game.is_featured;
                    
                    // Populate additional fields
                    const thumbnailField = document.getElementById('game-thumbnail');
                    if (thumbnailField) thumbnailField.value = game.thumbnail_url || '';
                    
                    const instructionsField = document.getElementById('game-instructions');
                    if (instructionsField) instructionsField.value = game.instructions || '';
                    
                    const loreField = document.getElementById('game-lore');
                    if (loreField) loreField.value = game.lore || '';
                    
                    const rankingField = document.getElementById('game-ranking');
                    if (rankingField) rankingField.value = game.ranking || '';
                    
                    // Populate toggle fields
                    const showTitleField = document.getElementById('show-title');
                    if (showTitleField) showTitleField.checked = game.show_title !== false;
                    
                    const showDescField = document.getElementById('show-description');
                    if (showDescField) showDescField.checked = game.show_description !== false;
                    
                    const showTeamNameField = document.getElementById('show-team-name');
                    if (showTeamNameField) showTeamNameField.checked = game.show_team_name !== false;
                    
                    const showTeamMembersField = document.getElementById('show-team-members');
                    if (showTeamMembersField) showTeamMembersField.checked = game.show_team_members !== false;
                    
                    const showGithubUrlField = document.getElementById('show-github-url');
                    if (showGithubUrlField) showGithubUrlField.checked = game.show_github_url !== false;
                    
                    const showItchUrlField = document.getElementById('show-itch-url');
                    if (showItchUrlField) showItchUrlField.checked = game.show_itch_url !== false;
                    
                    const showScreenshotsField = document.getElementById('show-screenshots');
                    if (showScreenshotsField) showScreenshotsField.checked = game.show_screenshots !== false;
                    
                    const screenshotFallbackField = document.getElementById('screenshot-fallback');
                    if (screenshotFallbackField) screenshotFallbackField.value = game.screenshot_fallback || 'placeholder';
                    
                    const showTagsField = document.getElementById('show-tags');
                    if (showTagsField) showTagsField.checked = game.show_tags !== false;
                    
                    const showThumbnailField = document.getElementById('show-thumbnail');
                    if (showThumbnailField) showThumbnailField.checked = game.show_thumbnail !== false;
                    
                    const thumbnailFallbackField = document.getElementById('thumbnail-fallback');
                    if (thumbnailFallbackField) thumbnailFallbackField.value = game.thumbnail_fallback || 'placeholder';
                    
                    const showInstructionsField = document.getElementById('show-instructions');
                    if (showInstructionsField) showInstructionsField.checked = game.show_instructions !== false;
                    
                    const showLoreField = document.getElementById('show-lore');
                    if (showLoreField) showLoreField.checked = game.show_lore !== false;
                    
                    const showRankingField = document.getElementById('show-ranking');
                    if (showRankingField) showRankingField.checked = game.show_ranking !== false;
                    
                    console.log('✅ All game form fields populated after showing form!');
                }, 100);
                
                console.log('✅ Initial form population completed, form shown');
            } catch (error) {
                showStatus(`Error loading game: ${error.message}`, 'error');
            }
        }

        async function deleteGame(id) {
            if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
                return;
            }
            
            try {
                showStatus('🗑️ Deleting game...', 'info');
                await apiCall(`/api/admin/games/${id}`, 'DELETE');
                showStatus('✅ Game deleted successfully!', 'success');
                loadGames();
            } catch (error) {
                showStatus(`❌ Error deleting game: ${error.message}`, 'error');
            }
        }

        // System Functions
        async function loadSystemInfo() {
            try {
                const stats = await Promise.all([
                    apiCall('/api/public/gamejams'),
                    apiCall('/api/public/games/featured'),
                    apiCall('/health')
                ]);
                
                document.getElementById('stats').innerHTML = `
                    <p><strong>Game Jams:</strong> ${stats[0].length}</p>
                    <p><strong>Games:</strong> ${stats[1].length}</p>
                    <p><strong>System Status:</strong> ${stats[2].status}</p>
                    <p><strong>Last Updated:</strong> ${new Date().toLocaleString('pt-PT', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                    })}</p>
                `;
            } catch (error) {
                document.getElementById('stats').innerHTML = `<p class="error">Error loading stats: ${error.message}</p>`;
            }
        }

        async function testHealth() {
            try {
                const result = await apiCall('/health');
                document.getElementById('response').textContent = JSON.stringify(result, null, 2);
                showStatus('✅ Health check successful', 'success');
            } catch (error) {
                document.getElementById('response').textContent = `Error: ${error.message}`;
                showStatus(`❌ Health check failed: ${error.message}`, 'error');
            }
        }

        async function testAPI() {
            try {
                const result = await apiCall('/api/public/gamejams');
                document.getElementById('response').textContent = JSON.stringify(result, null, 2);
                showStatus('✅ API test successful', 'success');
            } catch (error) {
                document.getElementById('response').textContent = `Error: ${error.message}`;
                showStatus(`❌ API test failed: ${error.message}`, 'error');
            }
        }

        function clearCache() {
            if (confirm('Are you sure you want to clear the cache?')) {
                showStatus('🧹 Cache cleared', 'success');
            }
        }

        // Rules Management Functions

        async function loadRules() {
            try {
                const response = await fetch('/api/rules/active', { credentials: 'include' });
                const container = document.getElementById('rules-status');
                
                if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
                    container.innerHTML = `
                        <p style="color: #999;">No rulebook uploaded yet.</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">
                            <strong>PDF URL:</strong> /WinterJam_Rulebook.pdf
                        </p>
                    `;
                    return;
                }
                
                const rules = await response.json();
                
                if (rules && rules.pdf_url) {
                    const uploadDate = new Date(rules.created_at).toLocaleString('en-GB');
                    const updateDate = new Date(rules.updated_at).toLocaleString('en-GB');
                    
                    container.innerHTML = `
                        <p style="color: #4caf50; font-weight: 600; margin-bottom: 10px;">✓ Rulebook Active</p>
                        <p style="font-size: 0.9rem; margin-bottom: 5px;">
                            <strong>PDF URL:</strong> <a href="${rules.pdf_url}" target="_blank" style="color: #667eea;">${rules.pdf_url}</a>
                        </p>
                        <p style="font-size: 0.85rem; color: #666;">
                            Uploaded: ${uploadDate}${rules.updated_at !== rules.created_at ? ` | Updated: ${updateDate}` : ''}
                        </p>
                    `;
                } else {
                    container.innerHTML = `
                        <p style="color: #999;">No rulebook uploaded yet.</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">
                            <strong>PDF URL:</strong> /WinterJam_Rulebook.pdf
                        </p>
                    `;
                }
            } catch (error) {
                console.error('Error loading rules:', error);
                document.getElementById('rules-status').innerHTML = '<p style="color: #999;">Unable to load rulebook status.</p>';
            }
        }

        // Rules functions removed - single rulebook only, no edit/delete needed

        // Banner Image Functions
        async function loadBannerStatus() {
            try {
                const response = await fetch('/api/frontpage/admin/settings');
                if (!response.ok) throw new Error('Failed to load settings');
                
                const settingsBySection = await response.json();
                const allSettings = Object.values(settingsBySection).flat();
                
                const backgroundImageSetting = allSettings.find(s => s.setting_key === 'hero_background_image');
                const backgroundFilenameSetting = allSettings.find(s => s.setting_key === 'hero_background_filename');
                
                const container = document.getElementById('banner-status');
                
                if (backgroundFilenameSetting && backgroundFilenameSetting.setting_value) {
                    const imageUrl = backgroundImageSetting?.setting_value || 'N/A';
                    const filename = backgroundFilenameSetting.setting_value;
                    const updateDate = new Date(backgroundFilenameSetting.updated_at).toLocaleString('pt-PT');
                    
                    container.innerHTML = `
                        <p style="color: #4caf50; font-weight: 600; margin-bottom: 10px;">✓ Imagem Carregada</p>
                        <p style="font-size: 0.9rem; margin-bottom: 5px;">
                            <strong>Ficheiro:</strong> ${filename}
                        </p>
                        <p style="font-size: 0.9rem; margin-bottom: 5px;">
                            <strong>URL:</strong> <a href="${imageUrl}" target="_blank" style="color: #667eea;">${imageUrl}</a>
                        </p>
                        <p style="font-size: 0.85rem; color: #666;">
                            Atualizado: ${updateDate}
                        </p>
                    `;
                } else {
                    container.innerHTML = `
                        <p style="color: #999;">Nenhuma imagem carregada ainda.</p>
                        <p style="font-size: 0.9rem; margin-top: 10px; color: #6c757d;">
                            Carregue uma imagem para usar como fundo da página inicial.
                        </p>
                    `;
                }
            } catch (error) {
                console.error('Error loading banner status:', error);
                document.getElementById('banner-status').innerHTML = '<p style="color: #999;">Não foi possível carregar o estado da imagem.</p>';
            }
        }

        // Front Page Settings Functions
        let frontPageSettings = {};

        async function loadFrontPageSettings() {
            try {
                const response = await fetch('/api/frontpage/admin/settings');
                if (!response.ok) throw new Error('Failed to load settings');
                
                const settingsBySection = await response.json();
                frontPageSettings = {};
                
                // Flatten settings for easier access
                Object.values(settingsBySection).flat().forEach(setting => {
                    frontPageSettings[setting.setting_key] = setting;
                });
                
                renderFrontPageSettings(settingsBySection);
            } catch (error) {
                console.error('Error loading front page settings:', error);
                // Even if settings fail to load, we can still show the image upload section
                console.log('Settings not available, but banner upload will still work');
            } finally {
                // Always hide loading and show content, even if there's an error
                document.getElementById('frontpage-loading').style.display = 'none';
                document.getElementById('frontpage-content').style.display = 'block';
            }
        }

        function renderFrontPageSettings(settingsBySection) {
            Object.entries(settingsBySection).forEach(([sectionName, settings]) => {
                const container = document.getElementById(`${sectionName}-settings`);
                if (!container) return;
                
                container.innerHTML = '';
                
                settings.forEach(setting => {
                    const fieldHtml = createSettingField(setting);
                    container.appendChild(fieldHtml);
                });
            });
        }

        function createSettingField(setting) {
            const div = document.createElement('div');
            div.className = 'form-group';
            
            const label = document.createElement('label');
            label.setAttribute('for', setting.setting_key);
            label.textContent = setting.display_name;
            if (setting.description) {
                label.title = setting.description;
            }
            
            let input;
            switch (setting.setting_type) {
                case 'textarea':
                    input = document.createElement('textarea');
                    input.rows = 3;
                    break;
                case 'boolean':
                    input = document.createElement('select');
                    input.innerHTML = '<option value="true">Yes</option><option value="false">No</option>';
                    break;
                case 'url':
                    input = document.createElement('input');
                    input.type = 'url';
                    break;
                case 'image':
                    input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = '/images/example.png';
                    break;
                default:
                    input = document.createElement('input');
                    input.type = 'text';
            }
            
            input.id = setting.setting_key;
            input.name = setting.setting_key;
            input.value = setting.setting_value;
            
            if (setting.description) {
                const desc = document.createElement('small');
                desc.textContent = setting.description;
                desc.style.color = '#6c757d';
                desc.style.fontSize = '0.875rem';
                div.appendChild(label);
                div.appendChild(input);
                div.appendChild(desc);
            } else {
                div.appendChild(label);
                div.appendChild(input);
            }
            
            return div;
        }

        async function saveFrontPageSettings() {
            try {
                const form = document.getElementById('frontpage-form');
                const formData = new FormData(form);
                const settings = {};
                
                for (const [key, value] of formData.entries()) {
                    settings[key] = value;
                }
                
                const response = await fetch('/api/frontpage/admin/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ settings })
                });
                
                if (!response.ok) throw new Error('Failed to save settings');
                
                const result = await response.json();
                showStatus(`✅ Updated ${result.updated} settings successfully`, 'success');
            } catch (error) {
                console.error('Error saving settings:', error);
                showStatus('❌ Failed to save settings', 'error');
            }
        }

        function previewFrontPage() {
            window.open('/', '_blank');
        }

        async function resetFrontPageSettings() {
            if (!confirm('Are you sure you want to reset all front page settings to defaults? This cannot be undone.')) {
                return;
            }
            
            try {
                const response = await fetch('/api/frontpage/admin/settings/reset', {
                    method: 'POST'
                });
                
                if (!response.ok) throw new Error('Failed to reset settings');
                
                showStatus('✅ Settings reset to defaults', 'success');
                loadFrontPageSettings(); // Reload settings
            } catch (error) {
                console.error('Error resetting settings:', error);
                showStatus('❌ Failed to reset settings', 'error');
            }
        }



        // Form Handlers
        document.addEventListener('DOMContentLoaded', function() {
            // Game Jam Form Handler
            document.getElementById('gamejam-form-element').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData.entries());
                
                // Convert team members string to array
                if (data.team_members) {
                    data.team_members = data.team_members.split(',').map(m => m.trim());
                }
                
                // Convert checkboxes to boolean
                data.is_active = formData.has('is_active');
                data.show_theme = formData.has('show_theme');
                data.show_description = formData.has('show_description');
                data.show_start_date = formData.has('show_start_date');
                data.show_end_date = formData.has('show_end_date');
                data.show_registration_dates = formData.has('show_registration_dates');
                data.show_registration_url = formData.has('show_registration_url');
                data.show_rules_pdf_url = formData.has('show_rules_pdf_url');
                data.show_banner_image = formData.has('show_banner_image');
                
                try {
                    console.log('💾 Saving game jam...');
                    console.log('🔍 currentEditingGameJam:', currentEditingGameJam);
                    console.log('📝 Form data:', data);
                    
                    showStatus('💾 Saving game jam...', 'info');
                    
                    const endpoint = currentEditingGameJam ? 
                        `/api/admin/gamejams/${currentEditingGameJam}` : 
                        '/api/admin/gamejams';
                    const method = currentEditingGameJam ? 'PUT' : 'POST';
                    
                    console.log('🌐 API call:', method, endpoint);
                    
                    await apiCall(endpoint, method, data);
                    
                    showStatus('✅ Game jam saved successfully!', 'success');
                    hideGameJamForm();
                    loadGameJams();
                } catch (error) {
                    showStatus(`❌ Error saving game jam: ${error.message}`, 'error');
                }
            });
            
            // Game Form Handler
            document.getElementById('game-form-element').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData.entries());
                
                // Convert strings to arrays
                if (data.team_members) {
                    data.team_members = data.team_members.split(',').map(m => m.trim());
                }
                if (data.tags) {
                    data.tags = data.tags.split(',').map(t => t.trim());
                }
                
                // Convert checkboxes to boolean
                data.is_featured = formData.has('is_featured');
                data.show_title = formData.has('show_title');
                data.show_description = formData.has('show_description');
                data.show_team_name = formData.has('show_team_name');
                data.show_team_members = formData.has('show_team_members');
                data.show_github_url = formData.has('show_github_url');
                data.show_itch_url = formData.has('show_itch_url');
                data.show_screenshots = formData.has('show_screenshots');
                data.show_tags = formData.has('show_tags');
                data.show_thumbnail = formData.has('show_thumbnail');
                data.show_instructions = formData.has('show_instructions');
                data.show_lore = formData.has('show_lore');
                data.show_ranking = formData.has('show_ranking');
                
                try {
                    showStatus('💾 Saving game...', 'info');
                    
                    const endpoint = currentEditingGame ? 
                        `/api/admin/games/${currentEditingGame}` : 
                        '/api/admin/games';
                    const method = currentEditingGame ? 'PUT' : 'POST';
                    
                    await apiCall(endpoint, method, data);
                    
                    showStatus('✅ Game saved successfully!', 'success');
                    hideGameForm();
                    loadGames();
                } catch (error) {
                    showStatus(`❌ Error saving game: ${error.message}`, 'error');
                }
            });

            // Navigation event listeners
            document.querySelectorAll('[data-section]').forEach(button => {
                button.addEventListener('click', function() {
                    const section = this.getAttribute('data-section');
                    showSection(section, this);
                });
            });

            // Add/Cancel button event listeners
            document.getElementById('add-gamejam-btn').addEventListener('click', showGameJamForm);
            document.getElementById('cancel-gamejam-btn').addEventListener('click', hideGameJamForm);
            document.getElementById('add-game-btn').addEventListener('click', showGameForm);
            document.getElementById('cancel-game-btn').addEventListener('click', hideGameForm);
            
            // Export button event listener
            document.getElementById('export-all-btn').addEventListener('click', async function() {
                try {
                    showStatus('📥 Preparing export...', 'info');
                    
                    // Trigger download by opening the export URL
                    const exportUrl = '/api/admin/export/all?format=json';
                    const link = document.createElement('a');
                    link.href = exportUrl;
                    link.download = `winterjam-export-${Date.now()}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showStatus('✅ Export downloaded successfully!', 'success');
                } catch (error) {
                    console.error('Error exporting data:', error);
                    showStatus('❌ Failed to export data', 'error');
                }
            });
            
            // Import button event listener
            document.getElementById('import-data-btn').addEventListener('click', function() {
                document.getElementById('import-file-input').click();
            });
            
            // File input change listener
            document.getElementById('import-file-input').addEventListener('change', async function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    showStatus('📤 Importing data...', 'info');
                    
                    const reader = new FileReader();
                    reader.onload = async function(event) {
                        try {
                            const data = JSON.parse(event.target.result);
                            
                            const response = await fetch('/api/admin/import', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                            
                            if (!response.ok) throw new Error('Import failed');
                            
                            const result = await response.json();
                            
                            let message = '✅ Importação concluída!\n';
                            message += `Game Jams: ${result.gamejams_imported}\n`;
                            message += `Jogos: ${result.games_imported}\n`;
                            message += `Configurações: ${result.frontpage_settings_imported}\n`;
                            message += `Regras: ${result.rules_content_imported}`;
                            
                            if (result.errors && result.errors.length > 0) {
                                message += `\n\n⚠️ Errors: ${result.errors.length}`;
                            }
                            
                            showStatus(message, 'success');
                            
                            // Reload current section data
                            const activeSection = document.querySelector('.card.active').id.replace('-section', '');
                            showSection(activeSection);
                        } catch (error) {
                            console.error('Error parsing import file:', error);
                            showStatus('❌ Failed to parse import file', 'error');
                        }
                    };
                    
                    reader.readAsText(file);
                } catch (error) {
                    console.error('Error importing data:', error);
                    showStatus('❌ Failed to import data', 'error');
                }
                
                // Reset file input
                e.target.value = '';
            });
            
            // Rules Form Handler
            document.getElementById('rules-form-element').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                
                // Check if PDF file is present
                const pdfFile = formData.get('pdf');
                if (!pdfFile || pdfFile.size === 0) {
                    showStatus('❌ Por favor selecione um ficheiro PDF', 'error');
                    return;
                }
                
                try {
                    showStatus('⏳ Uploading PDF e guardando conteúdo...', 'info');
                    
                    // Get CSRF token from meta tag
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    
                    // Use the upload endpoint
                    const headers = {};
                    if (csrfToken) {
                        headers['csrf-token'] = csrfToken;
                    }
                    
                    const response = await fetch('/api/rules/admin/upload-pdf', {
                        method: 'POST',
                        headers: headers,
                        body: formData,
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Erro ao fazer upload');
                    }
                    
                    const result = await response.json();
                    
                    showStatus('✅ PDF carregado e conteúdo guardado com sucesso!', 'success');
                    loadRules();
                    
                    // Reset form
                    this.reset();
                } catch (error) {
                    showStatus(`❌ Erro ao guardar: ${error.message}`, 'error');
                    console.error('Upload error:', error);
                }
            });
            
            // Banner Image Upload Form Handler
            document.getElementById('banner-upload-form').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                
                // Check if image file is present
                const imageFile = formData.get('image');
                if (!imageFile || imageFile.size === 0) {
                    showStatus('❌ Por favor selecione um ficheiro de imagem', 'error');
                    return;
                }
                
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(imageFile.type)) {
                    showStatus('❌ Apenas ficheiros JPG, PNG e WebP são permitidos', 'error');
                    return;
                }
                
                // Validate file size (5MB max)
                if (imageFile.size > 5 * 1024 * 1024) {
                    showStatus('❌ O ficheiro não pode exceder 5MB', 'error');
                    return;
                }
                
                try {
                    showStatus('⏳ A carregar imagem...', 'info');
                    
                    // Get CSRF token from meta tag
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    
                    // Use the upload endpoint
                    const headers = {};
                    if (csrfToken) {
                        headers['csrf-token'] = csrfToken;
                    }
                    
                    const response = await fetch('/api/frontpage/admin/upload-background', {
                        method: 'POST',
                        headers: headers,
                        body: formData,
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Erro ao fazer upload');
                    }
                    
                    const result = await response.json();
                    
                    showStatus('✅ Imagem carregada com sucesso!', 'success');
                    loadBannerStatus();
                    loadFrontPageSettings(); // Refresh settings to show new URL
                    
                    // Reset form
                    this.reset();
                } catch (error) {
                    showStatus(`❌ Erro ao carregar imagem: ${error.message}`, 'error');
                    console.error('Upload error:', error);
                }
            });
            
            // Front Page Settings event listeners (commented out - buttons removed from UI)
            // document.getElementById('frontpage-form').addEventListener('submit', function(e) {
            //     e.preventDefault();
            //     saveFrontPageSettings();
            // });
            // document.getElementById('preview-frontpage').addEventListener('click', previewFrontPage);
            // document.getElementById('reset-frontpage').addEventListener('click', resetFrontPageSettings);

            // Delegated event listeners for dynamic buttons (edit/delete)
            document.addEventListener('click', function(e) {
                console.log('🖱️ Click detected on:', e.target);
                console.log('🏷️ Attributes:', Array.from(e.target.attributes || []).map(attr => `${attr.name}="${attr.value}"`));
                
                // Check if the target or its parent button has the data attribute
                let target = e.target;
                if (target.tagName !== 'BUTTON') {
                    target = target.closest('button');
                }
                
                if (!target) return;
                
                console.log('🎯 Button found:', target);
                
                if (target.hasAttribute('data-edit-jam')) {
                    const id = target.getAttribute('data-edit-jam');
                    console.log('📝 Edit jam button clicked, ID:', id);
                    editGameJam(id);
                } else if (target.hasAttribute('data-export-jam')) {
                    const id = target.getAttribute('data-export-jam');
                    console.log('📥 Export jam button clicked, ID:', id);
                    exportGameJam(id);
                } else if (target.hasAttribute('data-delete-jam')) {
                    const id = target.getAttribute('data-delete-jam');
                    console.log('🗑️ Delete jam button clicked, ID:', id);
                    deleteGameJam(id);
                } else if (target.hasAttribute('data-edit-game')) {
                    const id = target.getAttribute('data-edit-game');
                    console.log('📝 Edit game button clicked, ID:', id);
                    editGame(id);
                } else if (target.hasAttribute('data-delete-game')) {
                    const id = target.getAttribute('data-delete-game');
                    deleteGame(id);
                }
            });
            
            // Initial load
            checkAuthentication();
            showStatus('🚀 System ready', 'success');
            loadGameJams();
        });
});
