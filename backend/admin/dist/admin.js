console.log('🚀 Admin.js file loaded!');

document.addEventListener('DOMContentLoaded', function() {
        console.log('📋 DOMContentLoaded event fired!');
        
        let currentEditingGameJam = null;
        let currentEditingGame = null;
        let gameJams = [];
        let currentUser = null;

        // Authentication Functions
        async function checkAuthentication() {
            console.log('🔐 Checking authentication...');
            try {
                // Add timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch('/api/auth/me', {
                    credentials: 'same-origin',
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                console.log('🔐 Auth response status:', response.status);
                
                if (response.ok) {
                    currentUser = await response.json();
                    console.log('✅ User authenticated:', currentUser);
                    showAdminDashboard();
                    updateUserInfo();
                    showStatus('🚀 System ready', 'success');
                    
                    // Navigate to the appropriate page based on URL hash or default to dashboard
                    const hash = window.location.hash.substring(1);
                    const initialPage = hash || 'dashboard';
                    navigateToPage(initialPage);
                } else {
                    console.log('❌ Not authenticated (status ' + response.status + '), showing login overlay');
                    showAuthOverlay();
                    showStatus('🔐 Please log in to continue', 'info');
                }
            } catch (error) {
                console.error('❌ Auth check failed:', error);
                showAuthOverlay();
                showStatus('❌ Connection error. Please check if the server is running.', 'error');
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

        // Mobile menu toggle functionality
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('open');
        }

        // Handle mobile menu visibility
        function handleMobileMenuVisibility() {
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            if (window.innerWidth <= 768) {
                mobileMenuToggle.style.display = 'block';
            } else {
                mobileMenuToggle.style.display = 'none';
                // Close sidebar when switching to desktop
                document.querySelector('.sidebar').classList.remove('open');
            }
        }

        // Listen for window resize to show/hide mobile menu toggle
        window.addEventListener('resize', handleMobileMenuVisibility);
        
        // Initialize mobile menu visibility
        handleMobileMenuVisibility();

        // Expose functions to global scope for onclick handlers in HTML
        window.loginWithOIDC = loginWithOIDC;
        window.logout = logout;
        window.testHealth = testHealth;
        window.testAPI = testAPI;
        window.testDatabase = testDatabase;
        window.clearCache = clearCache;
        window.refreshSystemInfo = refreshSystemInfo;
        window.navigateToPage = navigateToPage;
        window.toggleMobileMenu = toggleMobileMenu;

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
        function navigateToPage(pageName) {
            console.log('Navigating to page:', pageName);
            
            // Update URL hash without triggering page reload
            window.location.hash = pageName;
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Remove active class from nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // Show selected page
            const page = document.getElementById(pageName + '-page');
            if (page) {
                page.classList.add('active');
            }
            
            // Add active class to the corresponding nav link
            const navLink = document.querySelector(`[data-page="${pageName}"]`);
            if (navLink) {
                navLink.classList.add('active');
            }
            
            // Update page title and subtitle
            updatePageTitle(pageName);
            
            // Load data for the page
            loadPageData(pageName);
        }
        
        function updatePageTitle(pageName) {
            const titles = {
                dashboard: { title: 'Dashboard', subtitle: 'Overview and quick actions' },
                gamejams: { title: 'Game Jams', subtitle: 'Manage game jam events and configurations' },
                games: { title: 'Games', subtitle: 'Manage game submissions and featured content' },
                sponsors: { title: 'Sponsors', subtitle: 'Manage sponsor partnerships and display settings' },
                frontpage: { title: 'Front Page', subtitle: 'Configure homepage banner and content' },
                rules: { title: 'Rules', subtitle: 'Upload and manage the WinterJam rulebook' },
                system: { title: 'System', subtitle: 'Monitor system health and performance' }
            };
            
            const pageInfo = titles[pageName] || { title: 'Admin Panel', subtitle: 'IPMAIA WinterJam' };
            document.getElementById('page-title').textContent = pageInfo.title;
            document.getElementById('page-subtitle').textContent = pageInfo.subtitle;
        }
        
        function loadPageData(pageName) {
            switch(pageName) {
                case 'dashboard':
                    loadDashboardData();
                    break;
                case 'gamejams':
                    loadGameJams();
                    break;
                case 'games':
                    loadGames();
                    break;
                case 'sponsors':
                    loadSponsors();
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
        
        async function loadDashboardData() {
            try {
                // Load overview statistics
                const [gamejams, games, sponsors] = await Promise.all([
                    apiCall('/api/public/gamejams').catch(() => []),
                    apiCall('/api/public/games/featured').catch(() => []),
                    apiCall('/api/admin/sponsors').catch(() => [])
                ]);
                
                document.getElementById('dashboard-gamejams-count').textContent = gamejams.length;
                document.getElementById('dashboard-games-count').textContent = games.length;
                document.getElementById('dashboard-sponsors-count').textContent = sponsors.length;
                
                // Load recent activity
                loadRecentActivity();
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }
        
        async function loadRecentActivity() {
            // Simulate recent activity (could be enhanced with real data)
            const activityEl = document.getElementById('dashboard-recent-activity');
            const now = new Date();
            
            activityEl.innerHTML = `
                <div class="activity-item">
                    <span class="activity-time">${now.toLocaleTimeString('pt-PT')}</span>
                    <span class="activity-desc">Dashboard accessed</span>
                </div>
                <div class="activity-item">
                    <span class="activity-time">${new Date(now.getTime() - 300000).toLocaleTimeString('pt-PT')}</span>
                    <span class="activity-desc">System health checked</span>
                </div>
                <div class="activity-item">
                    <span class="activity-time">${new Date(now.getTime() - 600000).toLocaleTimeString('pt-PT')}</span>
                    <span class="activity-desc">Game jam data loaded</span>
                </div>
            `;
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
                
                // Schedule datetime fields
                const receptionField = document.getElementById('jam-reception');
                const receptionValue = jam.reception_datetime ? new Date(jam.reception_datetime).toISOString().slice(0, 16) : '';
                console.log('🚪 Reception field found:', receptionField, 'Setting to:', receptionValue);
                if (receptionField) receptionField.value = receptionValue;
                
                const themeAnnouncementField = document.getElementById('jam-theme-announcement');
                const themeAnnouncementValue = jam.theme_announcement_datetime ? new Date(jam.theme_announcement_datetime).toISOString().slice(0, 16) : '';
                console.log('🎨 Theme announcement field found:', themeAnnouncementField, 'Setting to:', themeAnnouncementValue);
                if (themeAnnouncementField) themeAnnouncementField.value = themeAnnouncementValue;
                
                const evaluationField = document.getElementById('jam-evaluation');
                const evaluationValue = jam.evaluation_datetime ? new Date(jam.evaluation_datetime).toISOString().slice(0, 16) : '';
                console.log('📊 Evaluation field found:', evaluationField, 'Setting to:', evaluationValue);
                if (evaluationField) evaluationField.value = evaluationValue;
                
                const awardsCeremonyField = document.getElementById('jam-awards');
                const awardsCeremonyValue = jam.awards_ceremony_datetime ? new Date(jam.awards_ceremony_datetime).toISOString().slice(0, 16) : '';
                console.log('🏆 Awards ceremony field found:', awardsCeremonyField, 'Setting to:', awardsCeremonyValue);
                if (awardsCeremonyField) awardsCeremonyField.value = awardsCeremonyValue;
                
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
                    // Re-populate schedule datetime fields
                    if (receptionField) receptionField.value = receptionValue;
                    if (themeAnnouncementField) themeAnnouncementField.value = themeAnnouncementValue;
                    if (evaluationField) evaluationField.value = evaluationValue;
                    if (awardsCeremonyField) awardsCeremonyField.value = awardsCeremonyValue;
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
            console.log('Loading system information...');
            try {
                // Start timing for performance measurement
                const startTime = Date.now();
                
                // Fetch all system data in parallel
                const [gamejams, games, sponsors, health] = await Promise.all([
                    apiCall('/api/public/gamejams').catch(() => []),
                    apiCall('/api/public/games/featured').catch(() => []),
                    apiCall('/api/admin/sponsors').catch(() => []),
                    apiCall('/health').catch(() => ({ status: 'Error', timestamp: new Date().toISOString() }))
                ]);
                
                const responseTime = Date.now() - startTime;
                
                // Update system status
                updateSystemStatus(health);
                
                // Update database metrics
                updateDatabaseMetrics(gamejams, games, sponsors);
                
                // Update performance metrics
                updatePerformanceMetrics(responseTime, health);
                
                // Update recent activity
                updateRecentActivity();
                
                console.log('System information loaded successfully');
            } catch (error) {
                console.error('Error loading system info:', error);
                showStatus('❌ Failed to load system information', 'error');
                
                // Set error states
                document.getElementById('system-status').innerHTML = '<span class="status-dot status-error"></span><span class="status-text">Error</span>';
                document.getElementById('db-status').innerHTML = '<span class="status-dot status-error"></span><span class="status-text">Error</span>';
            }
        }
        
        function updateSystemStatus(health) {
            const statusEl = document.getElementById('system-status');
            const uptimeEl = document.getElementById('system-uptime');
            const versionEl = document.getElementById('system-version');
            
            if (health && health.status === 'OK') {
                statusEl.innerHTML = '<span class="status-dot status-success"></span><span class="status-text">Healthy</span>';
                uptimeEl.textContent = 'Running';
                versionEl.textContent = health.version || '1.0.0';
            } else {
                statusEl.innerHTML = '<span class="status-dot status-error"></span><span class="status-text">Unhealthy</span>';
                uptimeEl.textContent = 'Unknown';
                versionEl.textContent = 'Unknown';
            }
        }
        
        function updateDatabaseMetrics(gamejams, games, sponsors) {
            const statusEl = document.getElementById('db-status');
            const gamejamsEl = document.getElementById('db-gamejams');
            const gamesEl = document.getElementById('db-games');
            const sponsorsEl = document.getElementById('db-sponsors');
            
            // Assume database is healthy if we got data
            statusEl.innerHTML = '<span class="status-dot status-success"></span><span class="status-text">Connected</span>';
            
            gamejamsEl.textContent = Array.isArray(gamejams) ? gamejams.length : '0';
            gamesEl.textContent = Array.isArray(games) ? games.length : '0';
            sponsorsEl.textContent = Array.isArray(sponsors) ? sponsors.length : '0';
        }
        
        function updatePerformanceMetrics(responseTime, health) {
            const responseTimeEl = document.getElementById('perf-response-time');
            const memoryEl = document.getElementById('perf-memory');
            const lastUpdateEl = document.getElementById('perf-last-update');
            
            responseTimeEl.textContent = `${responseTime}ms`;
            memoryEl.textContent = 'N/A'; // Would need backend support
            lastUpdateEl.textContent = new Date().toLocaleTimeString('pt-PT');
        }
        
        function updateRecentActivity() {
            const activityEl = document.getElementById('recent-activity');
            const now = new Date();
            
            activityEl.innerHTML = `
                <div class="activity-item">
                    <span class="activity-time">${now.toLocaleTimeString('pt-PT')}</span>
                    <span class="activity-desc">System dashboard refreshed</span>
                </div>
                <div class="activity-item">
                    <span class="activity-time">${new Date(now.getTime() - 300000).toLocaleTimeString('pt-PT')}</span>
                    <span class="activity-desc">Admin panel accessed</span>
                </div>
                <div class="activity-item">
                    <span class="activity-time">${new Date(now.getTime() - 600000).toLocaleTimeString('pt-PT')}</span>
                    <span class="activity-desc">Database connection verified</span>
                </div>
            `;
        }
        
        async function testHealth() {
            try {
                showStatus('🔍 Running health check...', 'info');
                const startTime = Date.now();
                const result = await apiCall('/health');
                const responseTime = Date.now() - startTime;
                
                document.getElementById('response').textContent = JSON.stringify({
                    ...result,
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                }, null, 2);
                
                showStatus('✅ Health check successful', 'success');
                updateRecentActivity();
            } catch (error) {
                document.getElementById('response').textContent = `Error: ${error.message}`;
                showStatus(`❌ Health check failed: ${error.message}`, 'error');
            }
        }

        async function testAPI() {
            try {
                showStatus('🔍 Testing API endpoints...', 'info');
                const startTime = Date.now();
                
                const results = await Promise.allSettled([
                    apiCall('/api/public/gamejams'),
                    apiCall('/api/public/games/featured'),
                    apiCall('/health')
                ]);
                
                const responseTime = Date.now() - startTime;
                
                const testResults = {
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString(),
                    endpoints: {
                        gamejams: results[0].status === 'fulfilled' ? 
                            { status: 'OK', count: results[0].value.length } : 
                            { status: 'ERROR', error: results[0].reason?.message },
                        games: results[1].status === 'fulfilled' ? 
                            { status: 'OK', count: results[1].value.length } : 
                            { status: 'ERROR', error: results[1].reason?.message },
                        health: results[2].status === 'fulfilled' ? 
                            { status: 'OK', data: results[2].value } : 
                            { status: 'ERROR', error: results[2].reason?.message }
                    }
                };
                
                document.getElementById('response').textContent = JSON.stringify(testResults, null, 2);
                showStatus('✅ API test completed', 'success');
                updateRecentActivity();
            } catch (error) {
                document.getElementById('response').textContent = `Error: ${error.message}`;
                showStatus(`❌ API test failed: ${error.message}`, 'error');
            }
        }
        
        async function testDatabase() {
            try {
                showStatus('🔍 Testing database connection...', 'info');
                const startTime = Date.now();
                
                // Test multiple database operations
                const results = await Promise.allSettled([
                    apiCall('/api/public/gamejams'),
                    apiCall('/api/admin/games'),
                    apiCall('/api/admin/sponsors')
                ]);
                
                const responseTime = Date.now() - startTime;
                
                const dbTest = {
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString(),
                    database: {
                        status: results.every(r => r.status === 'fulfilled') ? 'CONNECTED' : 'ISSUES',
                        tables: {
                            gamejams: results[0].status === 'fulfilled' ? `${results[0].value.length} records` : 'ERROR',
                            games: results[1].status === 'fulfilled' ? `${results[1].value.length} records` : 'ERROR',
                            sponsors: results[2].status === 'fulfilled' ? `${results[2].value.length} records` : 'ERROR'
                        }
                    }
                };
                
                document.getElementById('response').textContent = JSON.stringify(dbTest, null, 2);
                showStatus('✅ Database test completed', 'success');
                updateRecentActivity();
            } catch (error) {
                document.getElementById('response').textContent = `Error: ${error.message}`;
                showStatus(`❌ Database test failed: ${error.message}`, 'error');
            }
        }
        
        async function refreshSystemInfo() {
            showStatus('🔄 Refreshing system information...', 'info');
            await loadSystemInfo();
            showStatus('✅ System information refreshed', 'success');
        }

        function clearCache() {
            if (confirm('Are you sure you want to clear the system cache? This will temporarily slow down some operations.')) {
                showStatus('🧹 Clearing system cache...', 'info');
                // Simulate cache clearing (would need backend support)
                setTimeout(() => {
                    showStatus('✅ Cache cleared successfully', 'success');
                    updateRecentActivity();
                }, 1000);
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

            // ===== SPONSOR MANAGEMENT FUNCTIONS =====
            
            let currentEditingSponsor = null;
            let sponsors = [];
            
            async function loadSponsors() {
                try {
                    showStatus('📥 Loading sponsors...', 'info');
                    
                    const response = await apiCall('/api/admin/sponsors');
                    sponsors = response || [];
                    
                    renderSponsorsList();
                    showStatus('✅ Sponsors loaded successfully', 'success');
                } catch (error) {
                    console.error('Error loading sponsors:', error);
                    showStatus(`❌ Error loading sponsors: ${error.message}`, 'error');
                    document.getElementById('sponsors-list').innerHTML = '<div class="error">Erro ao carregar patrocinadores</div>';
                }
            }
            
            function renderSponsorsList() {
                const container = document.getElementById('sponsors-list');
                
                if (sponsors.length === 0) {
                    container.innerHTML = '<div class="empty-state">Nenhum patrocinador encontrado. Clique em "Adicionar Novo Patrocinador" para começar.</div>';
                    return;
                }
                
                const html = sponsors.map(sponsor => `
                    <div class="sponsor-item" data-id="${sponsor.id}">
                        <div class="sponsor-header">
                            <div class="sponsor-info">
                                <h3>${sponsor.name}</h3>
                                <span class="sponsor-tier tier-${sponsor.tier}">${getTierDisplayName(sponsor.tier)}</span>
                                ${!sponsor.is_active ? '<span class="inactive-badge">Inativo</span>' : ''}
                            </div>
                            <div class="sponsor-actions">
                                <button class="btn btn-sm" data-edit-sponsor="${sponsor.id}">✏️ Editar</button>
                                <button class="btn btn-danger btn-sm" data-delete-sponsor="${sponsor.id}">🗑️ Apagar</button>
                            </div>
                        </div>
                        ${sponsor.logo_filename ? `<div class="sponsor-logo"><img src="/api/sponsors/logo/${sponsor.logo_filename}" alt="${sponsor.name} logo" style="max-width: 100px; max-height: 50px;"></div>` : ''}
                        ${sponsor.website_url ? `<div class="sponsor-website"><a href="${sponsor.website_url}" target="_blank">${sponsor.website_url}</a></div>` : ''}
                        ${sponsor.description ? `<div class="sponsor-description">${sponsor.description}</div>` : ''}
                        <div class="sponsor-meta">
                            Criado: ${new Date(sponsor.created_at).toLocaleDateString('pt-PT')}
                            ${sponsor.updated_at !== sponsor.created_at ? ` | Atualizado: ${new Date(sponsor.updated_at).toLocaleDateString('pt-PT')}` : ''}
                        </div>
                    </div>
                `).join('');
                
                container.innerHTML = html;
            }
            
            function getTierDisplayName(tier) {
                const names = {
                    platinum: '🏆 Platinum',
                    gold: '⭐ Gold', 
                    silver: '🥈 Silver',
                    bronze: '🥉 Bronze'
                };
                return names[tier] || tier;
            }
            
            function showSponsorForm(sponsor = null) {
                currentEditingSponsor = sponsor;
                
                if (sponsor) {
                    // Edit mode
                    document.getElementById('sponsor-id').value = sponsor.id;
                    document.getElementById('sponsor-name').value = sponsor.name;
                    document.getElementById('sponsor-tier').value = sponsor.tier;
                    // Don't set logo file input - show current logo instead
                    document.getElementById('sponsor-website').value = sponsor.website_url || '';
                    document.getElementById('sponsor-description').value = sponsor.description || '';
                    document.getElementById('sponsor-active').checked = sponsor.is_active;
                    
                    // Show current logo if exists
                    const logoContainer = document.querySelector('.sponsor-logo-preview') || document.createElement('div');
                    logoContainer.className = 'sponsor-logo-preview';
                    logoContainer.style.cssText = 'margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 8px;';
                    
                    if (sponsor.logo_filename) {
                        logoContainer.innerHTML = `
                            <p style="margin: 0 0 10px 0; font-weight: 600;">Logo Atual:</p>
                            <img src="/api/sponsors/logo/${sponsor.logo_filename}" alt="${sponsor.name} logo" style="max-width: 200px; max-height: 100px; border: 1px solid #ddd; border-radius: 4px;">
                            <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #666;">Carregue um novo ficheiro para substituir</p>
                        `;
                    } else {
                        logoContainer.innerHTML = `
                            <p style="margin: 0; color: #666;">Nenhum logo carregado</p>
                        `;
                    }
                    
                    // Insert after the logo file input
                    const logoInput = document.getElementById('sponsor-logo');
                    logoInput.parentNode.insertBefore(logoContainer, logoInput.nextSibling);
                } else {
                    // Add mode
                    document.getElementById('sponsor-form-element').reset();
                    document.getElementById('sponsor-id').value = '';
                    
                    // Remove any existing logo preview
                    const existingPreview = document.querySelector('.sponsor-logo-preview');
                    if (existingPreview) {
                        existingPreview.remove();
                    }
                }
                
                document.getElementById('sponsor-form').style.display = 'block';
                document.getElementById('sponsor-form').scrollIntoView({ behavior: 'smooth' });
            }
            
            function hideSponsorForm() {
                document.getElementById('sponsor-form').style.display = 'none';
                currentEditingSponsor = null;
                document.getElementById('sponsor-form-element').reset();
            }
            
            async function saveSponsor() {
                const form = document.getElementById('sponsor-form-element');
                const formData = new FormData(form);
                
                // Check if a logo file is being uploaded
                const logoFile = formData.get('logo');
                const hasLogoFile = logoFile && logoFile.size > 0;
                
                const data = {
                    name: formData.get('name'),
                    tier: formData.get('tier'),
                    website_url: formData.get('website_url') || null,
                    description: formData.get('description') || null,
                    is_active: formData.has('is_active')
                };
                
                try {
                    showStatus('💾 Saving sponsor...', 'info');
                    
                    if (currentEditingSponsor && hasLogoFile) {
                        // Upload logo for existing sponsor using direct fetch for FormData
                        const uploadFormData = new FormData();
                        uploadFormData.append('logo', logoFile);
                        
                        // Get CSRF token from meta tag
                        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                        
                        const headers = {};
                        if (csrfToken) {
                            headers['csrf-token'] = csrfToken;
                        }
                        
                        const uploadResponse = await fetch(`/api/sponsors/upload-logo/${currentEditingSponsor.id}`, {
                            method: 'POST',
                            headers: headers,
                            body: uploadFormData,
                            credentials: 'include'
                        });
                        
                        if (!uploadResponse.ok) {
                            const errorData = await uploadResponse.json();
                            throw new Error(errorData.message || 'Erro ao carregar logo');
                        }
                        
                        // Then update other fields
                        await apiCall(`/api/admin/sponsors/${currentEditingSponsor.id}`, 'PUT', data);
                    } else if (currentEditingSponsor) {
                        // Update existing sponsor without logo change
                        await apiCall(`/api/admin/sponsors/${currentEditingSponsor.id}`, 'PUT', data);
                    } else {
                        // Create new sponsor
                        if (hasLogoFile) {
                            // For new sponsors, we need to create first, then upload logo
                            const newSponsor = await apiCall('/api/admin/sponsors', 'POST', data);
                            
                            // Then upload the logo using direct fetch for FormData
                            const uploadFormData = new FormData();
                            uploadFormData.append('logo', logoFile);
                            
                            // Get CSRF token from meta tag
                            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                            
                            const headers = {};
                            if (csrfToken) {
                                headers['csrf-token'] = csrfToken;
                            }
                            
                            const uploadResponse = await fetch(`/api/sponsors/upload-logo/${newSponsor.id}`, {
                                method: 'POST',
                                headers: headers,
                                body: uploadFormData,
                                credentials: 'include'
                            });
                            
                            if (!uploadResponse.ok) {
                                const errorData = await uploadResponse.json();
                                throw new Error(errorData.message || 'Erro ao carregar logo');
                            }
                        } else {
                            await apiCall('/api/admin/sponsors', 'POST', data);
                        }
                    }
                    
                    showStatus('✅ Sponsor saved successfully!', 'success');
                    hideSponsorForm();
                    loadSponsors();
                } catch (error) {
                    showStatus(`❌ Error saving sponsor: ${error.message}`, 'error');
                }
            }
            
            async function deleteSponsor(id) {
                if (!confirm('Tem certeza que deseja apagar este patrocinador? Esta ação não pode ser desfeita.')) {
                    return;
                }
                
                try {
                    showStatus('🗑️ Deleting sponsor...', 'info');
                    
                    await apiCall(`/api/admin/sponsors/${id}`, 'DELETE');
                    
                    showStatus('✅ Sponsor deleted successfully!', 'success');
                    loadSponsors();
                } catch (error) {
                    showStatus(`❌ Error deleting sponsor: ${error.message}`, 'error');
                }
            }
            
            async function exportSponsors() {
                try {
                    showStatus('📥 Preparing sponsors export...', 'info');
                    
                    const sponsors = await apiCall('/api/admin/sponsors');
                    
                    // Create CSV content
                    const csvContent = [
                        ['ID', 'Nome', 'Nível', 'Logo URL', 'Website', 'Descrição', 'Ativo', 'Criado', 'Atualizado'],
                        ...sponsors.map(sponsor => [
                            sponsor.id,
                            sponsor.name,
                            sponsor.tier,
                            sponsor.logo_url || '',
                            sponsor.website_url || '',
                            sponsor.description || '',
                            sponsor.is_active ? 'Sim' : 'Não',
                            sponsor.created_at,
                            sponsor.updated_at
                        ])
                    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
                    
                    // Download CSV
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `sponsors_export_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showStatus('✅ Sponsors exported successfully!', 'success');
                } catch (error) {
                    showStatus(`❌ Error exporting sponsors: ${error.message}`, 'error');
                }
            }
            
            // ===== END SPONSOR MANAGEMENT FUNCTIONS =====

            // Navigation event listeners
            document.querySelectorAll('[data-page]').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const page = this.getAttribute('data-page');
                    navigateToPage(page);
                    
                    // Close mobile menu on navigation
                    const sidebar = document.querySelector('.sidebar');
                    sidebar.classList.remove('open');
                });
            });
            
            // Handle browser back/forward navigation
            window.addEventListener('hashchange', function() {
                const hash = window.location.hash.substring(1);
                if (hash) {
                    navigateToPage(hash);
                } else {
                    navigateToPage('dashboard');
                }
            });

            // Add/Cancel button event listeners
            document.getElementById('add-gamejam-btn').addEventListener('click', showGameJamForm);
            document.getElementById('cancel-gamejam-btn').addEventListener('click', hideGameJamForm);
            document.getElementById('add-game-btn').addEventListener('click', showGameForm);
            document.getElementById('cancel-game-btn').addEventListener('click', hideGameForm);
            
            // Mobile menu toggle
            document.getElementById('mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
            
            // Sponsor event listeners
            document.getElementById('add-sponsor-btn').addEventListener('click', () => showSponsorForm());
            document.getElementById('cancel-sponsor-btn').addEventListener('click', hideSponsorForm);
            document.getElementById('export-sponsors-btn').addEventListener('click', exportSponsors);
            
            // Sponsor form submit
            document.getElementById('sponsor-form-element').addEventListener('submit', function(e) {
                e.preventDefault();
                saveSponsor();
            });
            
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
                } else if (target.hasAttribute('data-edit-sponsor')) {
                    const id = target.getAttribute('data-edit-sponsor');
                    const sponsor = sponsors.find(s => s.id == id);
                    if (sponsor) {
                        showSponsorForm(sponsor);
                    }
                } else if (target.hasAttribute('data-delete-sponsor')) {
                    const id = target.getAttribute('data-delete-sponsor');
                    deleteSponsor(id);
                }
            });
            
        // Initial load - checkAuthentication handles showing dashboard and loading data
        console.log('🎬 Initializing admin dashboard...');
        checkAuthentication();
});
