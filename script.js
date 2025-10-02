document.addEventListener("DOMContentLoaded", () => {
    // Page Elements
    const pages = document.querySelectorAll('.page');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const startSessionBtn = document.getElementById('start-session-btn');
    const finishBtn = document.getElementById('finish-btn');
    
    // Session Elements
    const cameraFeed = document.getElementById('camera-feed');
    const sessionCountdown = document.getElementById('session-countdown');
    let sessionInterval;

    // Evaluation Elements
    const questionContainer = document.getElementById('question-container');
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const submitEvalBtn = document.getElementById('submit-eval-btn');
    let currentBatchIndex = 0;
    let userAnswers = {};

    // --- UTILITY FUNCTIONS ---

    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    // --- LOGIN AND LOGOUT ---

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        
        // Proof-of-concept credentials
        if (username === 'vyomanaut' && password === 'gagan2025') {
            loginError.textContent = '';
            initializeHomePage();
            showPage('home-page');
        } else {
            loginError.textContent = 'Invalid credentials. Please try again.';
        }
    });

    logoutBtn.addEventListener('click', () => {
        // Clear any session data if necessary
        showPage('login-page');
    });

    // --- HOME PAGE ---

    function initializeHomePage() {
        // Mock data for past sessions
        const pastSessionsList = document.getElementById('past-sessions-list');
        pastSessionsList.innerHTML = `
            <li><span>Oct 01, 2025 - 08:00 UTC</span><span class="session-time">Risk Level: Normal</span></li>
            <li><span>Sep 29, 2025 - 08:00 UTC</span><span class="session-time">Risk Level: Stressed</span></li>
            <li><span>Sep 27, 2025 - 08:00 UTC</span><span class="session-time">Risk Level: Normal</span></li>
        `;

        // Mock data and timers for upcoming sessions
        const upcomingSessionsList = document.getElementById('upcoming-sessions-list');
        const now = new Date();
        const upcoming = [
            { name: 'Alpha Check-in', time: new Date(now.getTime() + 4 * 60 * 60 * 1000) },
            { name: 'Bravo Evaluation', time: new Date(now.getTime() + 28 * 60 * 60 * 1000) }
        ];

        upcomingSessionsList.innerHTML = '';
        upcoming.forEach(session => {
            const sessionElement = document.createElement('div');
            sessionElement.className = 'session-item';
            const countdownId = `countdown-${session.name.replace(' ', '-')}`;
            sessionElement.innerHTML = `<span>${session.name}</span><span id="${countdownId}"></span>`;
            upcomingSessionsList.appendChild(sessionElement);
            startCountdown(session.time, countdownId);
        });
    }

    function startCountdown(endTime, elementId) {
        const countdownElement = document.getElementById(elementId);
        setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdownElement.textContent = `in ${hours}h ${minutes}m ${seconds}s`;
        }, 1000);
    }
    
    // --- SESSION MANAGEMENT ---
    
    startSessionBtn.addEventListener('click', async () => {
        showPage('session-page');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            cameraFeed.srcObject = stream;
            
            // Start countdown timer for the session
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
            alert("Could not access camera and microphone. Please check permissions.");
            showPage('home-page');
        }
    });

    function stopSession() {
        if (cameraFeed.srcObject) {
            cameraFeed.srcObject.getTracks().forEach(track => track.stop());
        }
        // Move to evaluation
        initializeEvaluation();
        showPage('evaluation-page');
    }

    // --- PSYCHOLOGICAL EVALUATION ---
    
    const questions = [
        {
            batch: 1,
            items: [
                { id: 'feel-emoji', type: 'emoji', text: 'Choose the emoji that best represents how you feel right now.', options: ['😊', '😐', '😔', '😠', '😟'] },
                { id: 'stress-source', type: 'mcq', text: "What's your biggest source of stress right now?", options: ['Workload', 'Isolation', 'Team Dynamics', 'Missing Home', 'None'] },
                { id: 'rested-level', type: 'slider', text: 'How rested do you feel when you wake up? (1=Exhausted, 10=Fully Rested)', min: 1, max: 10, value: 5 },
            ]
        },
        {
            batch: 2,
            items: [
                { id: 'mood-color', type: 'color', text: 'Pick the color that represents your mood today.' },
                { id: 'overwhelmed', type: 'yes-no', text: 'Do you feel overwhelmed by daily responsibilities?' },
                { id: 'coping-style', type: 'choice', text: "When you're stressed, do you tend to withdraw or seek support?", options: ['Withdraw', 'Seek Support'] },
            ]
        },
        {
            batch: 3,
            items: [
                { id: 'sleep-hours', type: 'number', text: 'How many hours did you sleep last night?', min: 0, max: 16 },
                { id: 'sleep-quality', type: 'slider', text: 'Rate the quality of your sleep. (1=Poor, 10=Excellent)', min: 1, max: 10, value: 5},
                { id: 'energy-level', type: 'image', text: 'Select the image that matches your current energy level.', options: ['https://via.placeholder.com/100/3fb950?text=High', 'https://via.placeholder.com/100/d29922?text=Medium', 'https://via.placeholder.com/100/f85149?text=Low'] }
            ]
        },
        {
            batch: 4,
            items: [
                { id: 'emotional-weather', type: 'weather', text: 'Choose the weather that matches your emotional state.', options: ['☀️', '☁️', '🌧️', '⛈️', '💨'] },
                { id: 'coping-effectiveness', type: 'scale', text: 'How effective are your current coping strategies?', options: ['Very Effective', 'Somewhat Effective', 'Neutral', 'Ineffective'] },
                { id: 'trouble-sleeping', type: 'yes-no', text: 'Do you have trouble falling asleep?' },
            ]
        }
    ];

    function initializeEvaluation() {
        currentBatchIndex = 0;
        userAnswers = {};
        renderQuestionBatch(currentBatchIndex);
    }

    function renderQuestionBatch(batchIndex) {
        const batch = questions[batchIndex];
        questionContainer.innerHTML = '';
        const group = document.createElement('div');
        group.className = 'question-group';

        batch.items.forEach(q => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            let inputHtml = '';
            
            switch (q.type) {
                case 'emoji':
                    inputHtml = `<div class="emoji-picker" id="${q.id}">${q.options.map(o => `<span>${o}</span>`).join('')}</div>`;
                    break;
                case 'mcq':
                    inputHtml = `<select id="${q.id}">${q.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
                    break;
                case 'slider':
                     inputHtml = `<input type="range" id="${q.id}" min="${q.min}" max="${q.max}" value="${q.value}">`;
                     break;
                case 'color':
                    inputHtml = `<input type="color" id="${q.id}">`;
                    break;
                case 'yes-no':
                     inputHtml = `<div class="choice-group" id="${q.id}"><button class="btn-secondary" value="Yes">Yes</button><button class="btn-secondary" value="No">No</button></div>`;
                     break;
                case 'choice':
                     inputHtml = `<div class="choice-group" id="${q.id}">${q.options.map(o => `<button class="btn-secondary" value="${o}">${o}</button>`).join('')}</div>`;
                    break;
                case 'number':
                    inputHtml = `<input type="number" id="${q.id}" min="${q.min}" max="${q.max}">`;
                    break;
                case 'image':
                    inputHtml = `<div class="image-picker" id="${q.id}">${q.options.map(o => `<img src="${o}" alt="${o}">`).join('')}</div>`;
                    break;
                case 'weather':
                    inputHtml = `<div class="weather-picker" id="${q.id}">${q.options.map(o => `<span>${o}</span>`).join('')}</div>`;
                    break;
                case 'scale':
                    inputHtml = `<div class="choice-group" id="${q.id}">${q.options.map(o => `<button class="btn-secondary" value="${o}">${o}</button>`).join('')}</div>`;
                    break;
            }
            questionDiv.innerHTML = `<label for="${q.id}">${q.text}</label>${inputHtml}`;
            group.appendChild(questionDiv);
        });
        
        questionContainer.appendChild(group);
        addQuestionEventListeners();
        updateNavButtons();
    }
    
    function addQuestionEventListeners() {
        // Event delegation for selectable items
        document.querySelectorAll('.emoji-picker, .image-picker, .weather-picker, .choice-group').forEach(picker => {
            picker.addEventListener('click', (e) => {
                if(e.target.tagName === 'SPAN' || e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON') {
                    // Remove selected from siblings
                    [...e.currentTarget.children].forEach(child => child.classList.remove('selected'));
                    // Add selected to clicked item
                    e.target.classList.add('selected');
                }
            });
        });
    }

    function saveAnswers() {
        const batch = questions[currentBatchIndex];
        batch.items.forEach(q => {
            const element = document.getElementById(q.id);
            if(q.type === 'emoji' || q.type === 'image' || q.type === 'weather' || q.type === 'yes-no' || q.type === 'choice' || q.type === 'scale') {
                 userAnswers[q.id] = element.querySelector('.selected')?.textContent || element.querySelector('.selected')?.alt || null;
            } else {
                userAnswers[q.id] = element.value;
            }
        });
        console.log("Current Answers:", userAnswers);
    }
    
    function updateNavButtons() {
        backBtn.style.display = currentBatchIndex > 0 ? 'inline-block' : 'none';
        nextBtn.style.display = currentBatchIndex < questions.length - 1 ? 'inline-block' : 'none';
        submitEvalBtn.style.display = currentBatchIndex === questions.length - 1 ? 'inline-block' : 'none';
    }

    nextBtn.addEventListener('click', () => {
        saveAnswers();
        if (currentBatchIndex < questions.length - 1) {
            currentBatchIndex++;
            renderQuestionBatch(currentBatchIndex);
        }
    });

    backBtn.addEventListener('click', () => {
        saveAnswers();
        if (currentBatchIndex > 0) {
            currentBatchIndex--;
            renderQuestionBatch(currentBatchIndex);
        }
    });
    
    submitEvalBtn.addEventListener('click', () => {
        saveAnswers();
        generateReport();
        showPage('report-page');
    });

    // --- REPORT GENERATION ---
    
    function generateReport() {
        // *** This is the mocked AI analysis section ***
        const emotions = ["Calm", "Happy", "Anxious", "Fatigued", "Stressed", "Irritated"];
        const risks = ["Normal", "Stressed", "Mission Risk"];
        
        const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        let riskLevel;

        if (['Anxious', 'Stressed', 'Irritated'].includes(detectedEmotion) || userAnswers['overwhelmed'] === 'Yes' || userAnswers['sleep-quality'] < 4) {
             riskLevel = risks[Math.random() > 0.5 ? 1 : 2]; // 50/50 Stressed or Mission Risk
        } else {
             riskLevel = "Normal";
        }
        
        let recommendation = "";
        const calmingMusicSection = document.getElementById('calming-music-section');
        
        calmingMusicSection.style.display = 'none'; // Hide by default

        document.getElementById('report-emotion').textContent = detectedEmotion;
        const riskElement = document.getElementById('report-risk');
        riskElement.textContent = riskLevel;
        riskElement.className = riskLevel.toLowerCase().replace(' ', '-');

        switch (riskLevel) {
            case "Normal":
                recommendation = "All psychological markers are within normal parameters. Keep up the great work.";
                break;
            case "Stressed":
                recommendation = "Signs of elevated stress detected. Consider utilizing onboard relaxation techniques or mindfulness exercises. The ground team has been notified for monitoring.";
                calmingMusicSection.style.display = 'block';
                break;
            case "Mission Risk":
                recommendation = "Critical stress levels detected, which may pose a mission risk. This report has been automatically sent to Mission Control for immediate consultation. Please standby for communication.";
                calmingMusicSection.style.display = 'block';
                break;
        }
        document.getElementById('report-recommendation').textContent = recommendation;
    }

    finishBtn.addEventListener('click', () => {
        initializeHomePage(); // Refresh home page data
        showPage('home-page');
    });

    // Initial load
    showPage('login-page');
});
          
