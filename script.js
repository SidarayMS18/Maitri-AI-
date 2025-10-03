document.addEventListener("DOMContentLoaded", () => {
    // --- 3D BACKGROUND SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('bg-canvas'), 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x4f8dff, 0.6, 100);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Create dynamic orbiting asteroids with enhanced visuals
    const asteroids = new THREE.Group();
    const asteroidCount = 300;
    
    for (let i = 0; i < asteroidCount; i++) {
        const size = THREE.MathUtils.randFloat(0.5, 3);
        const geometry = new THREE.IcosahedronGeometry(size, 0);
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.3, Math.random() * 0.3 + 0.3),
            metalness: 0.2,
            roughness: 0.8
        });
        
        const asteroid = new THREE.Mesh(geometry, material);
        
        // Position in a spherical distribution
        const radius = THREE.MathUtils.randFloat(50, 300);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        asteroid.position.x = radius * Math.sin(phi) * Math.cos(theta);
        asteroid.position.y = radius * Math.sin(phi) * Math.sin(theta);
        asteroid.position.z = radius * Math.cos(phi);
        
        // Store orbital parameters
        asteroid.userData = {
            radius: radius,
            speed: THREE.MathUtils.randFloat(0.0001, 0.0005),
            angle: Math.random() * Math.PI * 2,
            inclination: Math.random() * Math.PI * 2,
            rotationSpeed: THREE.MathUtils.randFloat(0.01, 0.03)
        };
        
        asteroids.add(asteroid);
    }
    scene.add(asteroids);

    // Create multiple spaceships in different orbits
    const spaceships = new THREE.Group();
    const shipCount = 5;
    
    for (let i = 0; i < shipCount; i++) {
        const geometry = new THREE.ConeGeometry(1, 3, 4);
        const material = new THREE.MeshStandardMaterial({ 
            color: i % 2 === 0 ? 0x3b82f6 : 0x8b5cf6,
            metalness: 0.8,
            roughness: 0.2,
            emissive: new THREE.Color(0x1e40af).multiplyScalar(0.2)
        });
        
        const spaceship = new THREE.Mesh(geometry, material);
        
        const orbitRadius = 60 + i * 30;
        const angle = Math.random() * Math.PI * 2;
        
        spaceship.position.x = Math.cos(angle) * orbitRadius;
        spaceship.position.z = Math.sin(angle) * orbitRadius;
        spaceship.position.y = (Math.random() - 0.5) * 40;
        
        spaceship.rotation.x = Math.PI / 2;
        
        // Store orbital parameters
        spaceship.userData = {
            radius: orbitRadius,
            speed: 0.0003 + i * 0.0001,
            angle: angle,
            height: spaceship.position.y,
            heightVariation: 1 + Math.random() * 2
        };
        
        spaceships.add(spaceship);
    }
    scene.add(spaceships);
    
    // Add a central "planet" or station
    const stationGeometry = new THREE.OctahedronGeometry(8, 1);
    const stationMaterial = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.7,
        roughness: 0.3,
        emissive: new THREE.Color(0x065f46).multiplyScalar(0.3)
    });
    const station = new THREE.Mesh(stationGeometry, stationMaterial);
    station.rotation.y = Math.PI / 4;
    scene.add(station);
    
    camera.position.z = 120;
    
    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Animate asteroids in orbit
        asteroids.children.forEach(asteroid => {
            asteroid.userData.angle += asteroid.userData.speed;
            
            // Update position based on orbital parameters
            asteroid.position.x = Math.cos(asteroid.userData.angle) * asteroid.userData.radius;
            asteroid.position.z = Math.sin(asteroid.userData.angle) * asteroid.userData.radius;
            
            // Add slight vertical oscillation
            asteroid.position.y = Math.sin(asteroid.userData.angle + asteroid.userData.inclination) * 20;
            
            // Rotate asteroid
            asteroid.rotation.x += asteroid.userData.rotationSpeed;
            asteroid.rotation.y += asteroid.userData.rotationSpeed * 0.7;
        });

        // Animate spaceships in orbit
        spaceships.children.forEach((spaceship, index) => {
            spaceship.userData.angle += spaceship.userData.speed;
            
            // Update position
            spaceship.position.x = Math.cos(spaceship.userData.angle) * spaceship.userData.radius;
            spaceship.position.z = Math.sin(spaceship.userData.angle) * spaceship.userData.radius;
            
            // Add vertical movement
            spaceship.position.y = spaceship.userData.height + 
                Math.sin(Date.now() * 0.001 + index) * spaceship.userData.heightVariation;
            
            // Orient spaceship in direction of travel
            spaceship.rotation.y = -spaceship.userData.angle - Math.PI/2;
            
            // Add slight banking effect
            spaceship.rotation.z = Math.sin(spaceship.userData.angle * 2) * 0.2;
        });

        // Rotate central station
        station.rotation.y += 0.005;
        station.rotation.x += 0.002;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- APPLICATION LOGIC ---
    const pages = {
        login: document.getElementById('login-page'),
        appShell: document.getElementById('app-shell'),
        session: document.getElementById('session-page'),
        evaluation: document.getElementById('evaluation-page'),
        report: document.getElementById('report-page'),
    };

    const homeViews = document.querySelectorAll('.home-view');
    const navLinks = document.querySelectorAll('.sidebar nav li');

    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const shortcutStartSession = document.getElementById('shortcut-start-session');
    const shortcutViewReport = document.getElementById('shortcut-view-report');
    const shortcutCheckSchedule = document.getElementById('shortcut-check-schedule');
    const shortcutResources = document.getElementById('shortcut-resources');
    
    // Other buttons
    const finishBtn = document.getElementById('finish-btn');
    const cameraFeed = document.getElementById('camera-feed');
    const sessionCountdown = document.getElementById('session-countdown');
    let sessionInterval;

    const questionContainer = document.getElementById('question-container');
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const submitEvalBtn = document.getElementById('submit-eval-btn');
    const evalProgress = document.getElementById('eval-progress');
    let currentBatchIndex = 0;
    let userAnswers = {};

    function showPage(pageKey) {
        Object.values(pages).forEach(p => p.classList.remove('active'));
        if (pages[pageKey]) pages[pageKey].classList.add('active');
    }

    // --- LOGIN / LOGOUT ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (e.target.username.value === 'vyomanaut' && e.target.password.value === 'gagan2025') {
            document.getElementById('login-error').textContent = '';
            initializeHomePage();
            showPage('appShell');
        } else {
            document.getElementById('login-error').textContent = 'Invalid credentials. Please try again.';
        }
    });

    logoutBtn.addEventListener('click', () => {
        showPage('login');
    });

    // --- HOME PAGE & NAVIGATION ---
    function initializeHomePage() {
        // Mock data for past sessions (dashboard)
        const pastSessionsList = document.getElementById('past-sessions-list');
        pastSessionsList.innerHTML = `
            <li class="glass-pane">
                <span>Today, 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-normal">Normal</span></span>
            </li>
            <li class="glass-pane">
                <span>Oct 01, 2025 - 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-stressed">Stressed</span></span>
            </li>
            <li class="glass-pane">
                <span>Sep 29, 2025 - 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-normal">Normal</span></span>
            </li>
        `;

        // Mock data for full history
        const pastSessionsFullList = document.getElementById('past-sessions-full-list');
        pastSessionsFullList.innerHTML = `
            <li class="glass-pane">
                <span>Today, 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-normal">Normal</span></span>
            </li>
            <li class="glass-pane">
                <span>Oct 01, 2025 - 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-stressed">Stressed</span></span>
            </li>
            <li class="glass-pane">
                <span>Sep 29, 2025 - 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-normal">Normal</span></span>
            </li>
            <li class="glass-pane">
                <span>Sep 27, 2025 - 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-normal">Normal</span></span>
            </li>
            <li class="glass-pane">
                <span>Sep 25, 2025 - 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-risk">Mission Risk</span></span>
            </li>
            <li class="glass-pane">
                <span>Sep 23, 2025 - 08:00 UTC</span>
                <span class="session-time"><span class="status-badge status-normal">Normal</span></span>
            </li>
        `;

        // Mock data and timers for upcoming sessions
        const upcomingSessionsList = document.getElementById('upcoming-sessions-list');
        const now = new Date();
        const upcoming = [
            { name: 'Alpha Check-in', time: new Date(now.getTime() + 4 * 60 * 60 * 1000) },
            { name: 'Bravo Evaluation', time: new Date(now.getTime() + 28 * 60 * 60 * 1000) },
            { name: 'Charlie Debrief', time: new Date(now.getTime() + 52 * 60 * 60 * 1000) },
            { name: 'Delta Wellness', time: new Date(now.getTime() + 76 * 60 * 60 * 1000) }
        ];

        upcomingSessionsList.innerHTML = '';
        upcoming.forEach(session => {
            const sessionElement = document.createElement('li');
            sessionElement.className = 'glass-pane';
            const countdownId = `countdown-${session.name.replace(' ', '-')}`;
            sessionElement.innerHTML = `<span>${session.name}</span><span id="${countdownId}" class="session-time"></span>`;
            upcomingSessionsList.appendChild(sessionElement);
            startCountdown(session.time, countdownId);
        });
        
        // Set default view
        switchHomeView('dashboard-view');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => switchHomeView(link.dataset.view));
    });

    function switchHomeView(viewId) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.view === viewId));
        homeViews.forEach(v => v.classList.toggle('active', v.id === viewId));
    }

    function startCountdown(endTime, elementId) {
        const el = document.getElementById(elementId);
        setInterval(() => {
            const distance = endTime - new Date().getTime();
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            if (el) el.textContent = `in ${h}h ${m}m ${s}s`;
        }, 1000);
    }

    // --- SHORTCUT ACTIONS ---
    shortcutStartSession.addEventListener('click', startSession);
    shortcutViewReport.addEventListener('click', () => {
        // In a real app, this would load the latest report
        alert("Loading your latest psychological report...");
        generateReport();
        showPage('report');
    });
    shortcutCheckSchedule.addEventListener('click', () => {
        switchHomeView('upcoming-view');
    });
    shortcutResources.addEventListener('click', () => {
        switchHomeView('resources-view');
    });

    // --- SESSION MANAGEMENT ---
    async function startSession() {
        showPage('session');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            cameraFeed.srcObject = stream;
            let timeLeft = 45;
            sessionCountdown.textContent = timeLeft;
            sessionInterval = setInterval(() => {
                timeLeft--;
                sessionCountdown.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(sessionInterval);
                    stopSession();
                }
            }, 1000);
        } catch (error) {
            console.error("Error accessing media devices.", error);
            alert("Could not access camera/microphone. Please check permissions.");
            showPage('appShell');
        }
    }

    function stopSession() {
        if (cameraFeed.srcObject) {
            cameraFeed.srcObject.getTracks().forEach(track => track.stop());
        }
        initializeEvaluation();
        showPage('evaluation');
    }
    
    // --- EVALUATION LOGIC ---
    const questions = [
        { items: [
            { id: 'feel-emoji', type: 'emoji', text: 'Choose the emoji that best represents how you feel right now.', options: ['😊', '😐', '😔', '😠', '😟', '😴', '🤔'] },
            { id: 'stress-source', type: 'mcq', text: "What's your biggest source of stress right now?", options: ['Workload', 'Isolation', 'Team Dynamics', 'Missing Home', 'Sleep Issues', 'None'] },
            { id: 'rested-level', type: 'slider', text: 'How rested do you feel when you wake up? (1=Exhausted, 10=Fully Rested)', min: 1, max: 10, value: 5 },
        ] },
        { items: [
            { id: 'mood-color', type: 'color', text: 'Pick the color that represents your mood today.' },
            { id: 'overwhelmed', type: 'yes-no', text: 'Do you feel overwhelmed by daily responsibilities?' },
            { id: 'coping-style', type: 'choice', text: "When you're stressed, do you tend to withdraw or seek support?", options: ['Withdraw', 'Seek Support', 'Depends on Situation'] },
        ] },
        { items: [
            { id: 'sleep-hours', type: 'number', text: 'How many hours did you sleep last night?', min: 0, max: 16 },
            { id: 'sleep-quality', type: 'slider', text: 'Rate the quality of your sleep. (1=Poor, 10=Excellent)', min: 1, max: 10, value: 5},
            { id: 'energy-level', type: 'image', text: 'Select the image that matches your current energy level.', options: [
                'https://placehold.co/120x120/10b981/white?text=High', 
                'https://placehold.co/120x120/f59e0b/white?text=Medium', 
                'https://placehold.co/120x120/ef4444/white?text=Low'
            ] }
        ] },
        { items: [
            { id: 'emotional-weather', type: 'weather', text: 'Choose the weather that matches your emotional state.', options: ['☀️', '⛅', '☁️', '🌧️', '⛈️', '💨'] },
            { id: 'coping-effectiveness', type: 'scale', text: 'How effective are your current coping strategies?', options: ['Very Effective', 'Somewhat Effective', 'Neutral', 'Ineffective', 'Very Ineffective'] },
            { id: 'trouble-sleeping', type: 'yes-no', text: 'Do you have trouble falling asleep?' },
        ] }
    ];

    function initializeEvaluation() {
        currentBatchIndex = 0;
        userAnswers = {};
        renderQuestionBatch(currentBatchIndex);
    }

    function renderQuestionBatch(batchIndex) {
        questionContainer.innerHTML = '';
        questions[batchIndex].items.forEach(q => {
            const qDiv = document.createElement('div');
            qDiv.className = 'question';
            let inputHtml = '';
            switch (q.type) {
                case 'emoji': 
                    inputHtml = `<div class="emoji-picker" id="${q.id}">${q.options.map(o => `<span>${o}</span>`).join('')}</div>`; 
                    break;
                case 'mcq': 
                    inputHtml = `<select id="${q.id}" class="glass-pane">${q.options.map(o => `<option>${o}</option>`).join('')}</select>`; 
                    break;
                case 'slider': 
                    inputHtml = `<input type="range" id="${q.id}" min="${q.min}" max="${q.max}" value="${q.value}">`; 
                    break;
                case 'color': 
                    inputHtml = `<input type="color" id="${q.id}" value="#3b82f6">`; 
                    break;
                case 'yes-no': 
                    inputHtml = `<div class="choice-group" id="${q.id}"><button class="btn btn-secondary" value="Yes">Yes</button><button class="btn btn-secondary" value="No">No</button></div>`; 
                    break;
                case 'choice':
                case 'scale': 
                    inputHtml = `<div class="choice-group" id="${q.id}">${q.options.map(o => `<button class="btn btn-secondary" value="${o}">${o}</button>`).join('')}</div>`; 
                    break;
                case 'number': 
                    inputHtml = `<input type="number" id="${q.id}" min="${q.min}" max="${q.max}" class="glass-pane" style="padding: 0.75rem; width: 100%;">`; 
                    break;
                case 'image': 
                    inputHtml = `<div class="image-picker" id="${q.id}">${q.options.map(o => `<img src="${o}" alt="Energy level">`).join('')}</div>`; 
                    break;
                case 'weather': 
                    inputHtml = `<div class="weather-picker" id="${q.id}">${q.options.map(o => `<span>${o}</span>`).join('')}</div>`; 
                    break;
            }
            qDiv.innerHTML = `<label>${q.text}</label>${inputHtml}`;
            questionContainer.appendChild(qDiv);
        });
        addQuestionEventListeners();
        updateNavButtons();
        updateProgressBar();
    }

    function addQuestionEventListeners() {
        questionContainer.querySelectorAll('.emoji-picker, .image-picker, .weather-picker, .choice-group').forEach(picker => {
            picker.addEventListener('click', (e) => {
                if(e.target.tagName === 'SPAN' || e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON') {
                    [...e.currentTarget.children].forEach(child => child.classList.remove('selected'));
                    e.target.classList.add('selected');
                }
            });
        });
    }

    function s
