
// ===== GLOBAL STATE =====
const CBT_STATE = {
    // Current state
    currentScreen: 'welcome',
    currentCourse: null,
    currentQuestions: [],
    currentIndex: 0,

    // Exam state
    answers: [],
    marked: [],
    timeRemaining: 1200, // 20 minutes in seconds
    timerInterval: null,
    examActive: false,

    // User data
    stats: {
        totalUsers: 1247,
        totalAttempts: 5432,
        avgScore: 68.5,
        activeToday: 89
    },

    // Settings
    soundEnabled: true,
    theme: 'dark',
    voiceEnabled: true
};

// ===== DOM ELEMENTS =====
const DOM = {};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 CBT MASTER Initializing...');

    // Initialize DOM references
    initializeDOMReferences();

    // Initialize event listeners
    initializeEventListeners();

    // Initialize Matrix background
    initMatrixBackground();

    // Load courses
    loadCourses();

    // Initialize preloader
    initPreloader();

    // Initialize AI Assistant
    initAIAssistant();

    // Initialize theme
    initTheme();

    console.log('✅ CBT MASTER Ready!');
});

// ===== DOM REFERENCE SETUP =====
function initializeDOMReferences() {
    // Screens
    DOM.screens = {
        welcome: document.getElementById('welcomeScreen'),
        course: document.getElementById('courseScreen'),
        exam: document.getElementById('examScreen'),
        results: document.getElementById('resultsScreen')
    };

    // Buttons
    DOM.startBtn = document.getElementById('startBtn');
    DOM.backBtn = document.getElementById('backBtn');
    DOM.examBackBtn = document.getElementById('examBackBtn');
    DOM.prevBtn = document.getElementById('prevBtn');
    DOM.nextBtn = document.getElementById('nextBtn');
    DOM.submitExamBtn = document.getElementById('submitExamBtn');
    DOM.markReviewBtn = document.getElementById('markReviewBtn');
    DOM.retakeBtn = document.getElementById('retakeBtn');
    DOM.newCourseBtn = document.getElementById('newCourseBtn');

    // Containers
    DOM.courseGrid = document.getElementById('courseGrid');
    DOM.optionsContainer = document.getElementById('optionsContainer');
    DOM.questionGrid = document.getElementById('questionGrid');
    DOM.reviewQuestions = document.getElementById('reviewQuestions');

    // Text elements
    DOM.examTitle = document.getElementById('examTitle');
    DOM.examSubtitle = document.getElementById('examSubtitle');
    DOM.questionText = document.getElementById('questionText');
    DOM.currentQuestionNumber = document.getElementById('currentQuestionNumber');
    DOM.totalQuestions = document.getElementById('totalQuestions');
    DOM.timerDisplay = document.getElementById('timerDisplay');

    // Modals
    DOM.confirmationModal = document.getElementById('confirmationModal');
    DOM.statsModal = document.getElementById('statsModal');

    // AI Elements
    DOM.aiAssistant = document.getElementById('aiAssistant');
    DOM.aiChat = document.getElementById('aiChat');
    DOM.aiChatToggle = document.getElementById('aiChatToggle');
    DOM.aiClose = document.getElementById('aiClose');
    DOM.aiInput = document.getElementById('aiInput');
    DOM.aiSend = document.getElementById('aiSend');
    DOM.aiMessages = document.getElementById('aiMessages');
    DOM.voiceIndicator = document.getElementById('voiceIndicator');

    // Loading overlay
    DOM.loadingOverlay = document.getElementById('loadingOverlay');
    DOM.loadingMessage = document.getElementById('loadingMessage');

    console.log('✅ DOM references initialized');
}

// ===== EVENT LISTENER SETUP =====
function initializeEventListeners() {
    // Navigation
    DOM.startBtn?.addEventListener('click', () => showScreen('course'));
    DOM.backBtn?.addEventListener('click', () => showScreen('welcome'));
    DOM.examBackBtn?.addEventListener('click', confirmExitExam);
    DOM.retakeBtn?.addEventListener('click', retakeExam);
    DOM.newCourseBtn?.addEventListener('click', () => showScreen('course'));

    // Exam controls
    DOM.prevBtn?.addEventListener('click', previousQuestion);
    DOM.nextBtn?.addEventListener('click', nextQuestion);
    DOM.submitExamBtn?.addEventListener('click', showConfirmationModal);
    DOM.markReviewBtn?.addEventListener('click', toggleMarkQuestion);

    // Modal controls
    document.getElementById('confirmSubmitBtn')?.addEventListener('click', submitExam);
    document.getElementById('cancelSubmitBtn')?.addEventListener('click', hideConfirmationModal);
    document.getElementById('modalClose')?.addEventListener('click', hideConfirmationModal);

    // Stats modal
    document.getElementById('statsBtn')?.addEventListener('click', showStatsModal);
    document.getElementById('statsModalClose')?.addEventListener('click', hideStatsModal);
    document.getElementById('closeStatsBtn')?.addEventListener('click', hideStatsModal);
    document.getElementById('refreshStatsBtn')?.addEventListener('click', refreshStats);

    // AI Events
    DOM.aiChatToggle?.addEventListener('click', toggleAIChat);
    DOM.aiClose?.addEventListener('click', toggleAIChat);
    DOM.aiSend?.addEventListener('click', sendAIMessage);
    DOM.aiInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIMessage();
    });

    // Voice
    document.getElementById('aiVoice')?.addEventListener('click', startVoiceRecognition);

    // Theme toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);

    // Fullscreen
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);

    // Quick commands
    document.querySelectorAll('.quick-command').forEach(cmd => {
        cmd.addEventListener('click', () => {
            const command = cmd.dataset.command;
            handleAICommand(command);
            DOM.aiChat.classList.add('active');
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderReviewQuestions(e.target.dataset.filter);
        });
    });

    // Print
    document.getElementById('printResultsBtn')?.addEventListener('click', printResults);
    document.getElementById('shareResultsBtn')?.addEventListener('click', shareResults);

    console.log('✅ Event listeners initialized');
}

// ===== SCREEN MANAGEMENT =====
function showScreen(screenId) {
    // Hide all screens
    Object.values(DOM.screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = DOM.screens[screenId];
    if (targetScreen) {
        targetScreen.classList.add('active');
        CBT_STATE.currentScreen = screenId;

        // Special screen initialization
        if (screenId === 'exam') {
            initExam();
        }

        // Update URL hash
        window.location.hash = screenId;
    }
}

// ===== COURSE LOADING =====
function loadCourses() {
    if (!DOM.courseGrid) return;

    DOM.courseGrid.innerHTML = window.CBT_COURSES.map(course => `
        <div class="course-card" onclick="selectCourse('${course.id}')">
            <div class="course-header">
                <div class="course-icon" style="background: linear-gradient(45deg, ${course.color}, #7000ff)">
                    <i class="fas ${course.icon}"></i>
                </div>
                <div class="course-info">
                    <h3>${course.title}</h3>
                    <p>${window.CBT_MASTER_DATA[course.id]?.questions?.length || 0} Questions • 20 Minutes</p>
                </div>
            </div>
            <div class="course-stats">
                <div class="course-stat">
                    <i class="fas fa-clock"></i>
                    <span>20 min</span>
                </div>
                <div class="course-stat">
                    <i class="fas fa-question-circle"></i>
                    <span>35 Questions</span>
                </div>
                <div class="course-stat">
                    <i class="fas fa-chart-line"></i>
                    <span>Mixed Topics</span>
                </div>
            </div>
            <button class="btn btn-primary" style="width: 100%">
                <i class="fas fa-play-circle"></i>
                Start Practice
            </button>
        </div>
    `).join('');
}

// ===== COURSE SELECTION =====
window.selectCourse = function(courseId) {
    // Validate course exists
    if (!window.CBT_MASTER_DATA[courseId]) {
        showError('Course data not available');
        return;
    }

    // Set current course
    CBT_STATE.currentCourse = courseId;
    CBT_STATE.currentQuestions = window.CBT_MASTER_DATA[courseId].questions;

    // Show exam screen
    showScreen('exam');
};

// ===== EXAM INITIALIZATION =====
function initExam() {
    // Validate course and questions
    if (!CBT_STATE.currentQuestions || CBT_STATE.currentQuestions.length === 0) {
        showError('No questions available for this course');
        showScreen('course');
        return;
    }

    // Reset exam state
    CBT_STATE.currentIndex = 0;
    CBT_STATE.answers = new Array(CBT_STATE.currentQuestions.length).fill(null);
    CBT_STATE.marked = new Array(CBT_STATE.currentQuestions.length).fill(false);
    CBT_STATE.timeRemaining = 1200; // 20 minutes
    CBT_STATE.examActive = true;

    // Update UI
    const courseData = window.CBT_MASTER_DATA[CBT_STATE.currentCourse];
    DOM.examTitle.textContent = courseData.course;
    DOM.examSubtitle.textContent = `${CBT_STATE.currentQuestions.length} Questions • 20 Minutes`;
    DOM.totalQuestions.textContent = CBT_STATE.currentQuestions.length;

    // Load first question
    loadQuestion(0);

    // Initialize question grid
    renderQuestionGrid();

    // Start timer
    startTimer();

    // Play sound
    playSound('click');
}

// ===== QUESTION LOADING =====
function loadQuestion(index) {
    if (!CBT_STATE.currentQuestions || index >= CBT_STATE.currentQuestions.length) {
        return;
    }

    const question = CBT_STATE.currentQuestions[index];
    if (!question) return;

    // Update current index
    CBT_STATE.currentIndex = index;

    // Update question text
    DOM.questionText.textContent = question.text;
    DOM.currentQuestionNumber.textContent = index + 1;

    // Update progress bar
    const progress = ((index + 1) / CBT_STATE.currentQuestions.length) * 100;
    document.getElementById('questionProgress').style.width = `${progress}%`;

    // Render options
    renderOptions(question);

    // Update status
    updateQuestionStatus(index);

    // Update navigation buttons
    DOM.prevBtn.disabled = index === 0;
    DOM.nextBtn.disabled = index === CBT_STATE.currentQuestions.length - 1;

    // Update mark button
    updateMarkButton(index);

    // Update question grid
    highlightCurrentQuestion(index);
}

// ===== RENDER OPTIONS =====
function renderOptions(question) {
    const selectedAnswer = CBT_STATE.answers[CBT_STATE.currentIndex];

    DOM.optionsContainer.innerHTML = question.options.map((option, i) => `
        <div class="option ${selectedAnswer === i ? 'selected' : ''}" onclick="selectOption(${i})">
            <div class="option-letter">${String.fromCharCode(65 + i)}</div>
            <div class="option-text">${option}</div>
        </div>
    `).join('');
}

// ===== SELECT OPTION =====
window.selectOption = function(optionIndex) {
    // Save answer
    CBT_STATE.answers[CBT_STATE.currentIndex] = optionIndex;

    // Update UI
    renderOptions(CBT_STATE.currentQuestions[CBT_STATE.currentIndex]);
    updateQuestionStatus(CBT_STATE.currentIndex);
    renderQuestionGrid();

    // Play sound
    playSound('correct');
};

// ===== NAVIGATION =====
function previousQuestion() {
    if (CBT_STATE.currentIndex > 0) {
        loadQuestion(CBT_STATE.currentIndex - 1);
    }
}

function nextQuestion() {
    if (CBT_STATE.currentIndex < CBT_STATE.currentQuestions.length - 1) {
        loadQuestion(CBT_STATE.currentIndex + 1);
    }
}

// ===== MARK FOR REVIEW =====
function toggleMarkQuestion() {
    const index = CBT_STATE.currentIndex;
    CBT_STATE.marked[index] = !CBT_STATE.marked[index];

    updateMarkButton(index);
    renderQuestionGrid();

    playSound('click');
}

function updateMarkButton(index) {
    const isMarked = CBT_STATE.marked[index];
    DOM.markReviewBtn.innerHTML = isMarked
        ? '<i class="fas fa-flag"></i><span>Unmark Review</span>'
        : '<i class="far fa-flag"></i><span>Mark for Review</span>';

    DOM.markReviewBtn.classList.toggle('active', isMarked);
}

// ===== QUESTION GRID =====
function renderQuestionGrid() {
    if (!DOM.questionGrid) return;

    const total = CBT_STATE.currentQuestions.length;
    let answered = 0;
    let marked = 0;

    const gridHtml = Array.from({ length: total }, (_, i) => {
        const isAnswered = CBT_STATE.answers[i] !== null && CBT_STATE.answers[i] !== undefined;
        const isMarked = CBT_STATE.marked[i];
        const isCurrent = i === CBT_STATE.currentIndex;

        let className = 'question-number';
        if (isCurrent) className += ' current';
        if (isAnswered) {
            className += ' answered';
            answered++;
        }
        if (isMarked) className += ' marked';

        if (isAnswered) answered++;
        if (isMarked) marked++;

        return `<button class="${className}" onclick="jumpToQuestion(${i})">${i + 1}</button>`;
    }).join('');

    DOM.questionGrid.innerHTML = gridHtml;

    // Update progress stats
    document.getElementById('answeredCount').textContent = answered;
    document.getElementById('notAnsweredCount').textContent = total - answered;
    document.getElementById('markedCount').textContent = marked;

    const progressPercent = (answered / total) * 100;
    document.getElementById('progressBarFill').style.width = `${progressPercent}%`;
    document.getElementById('progressPercentage').textContent = `${Math.round(progressPercent)}% Complete`;
}

function highlightCurrentQuestion(index) {
    document.querySelectorAll('.question-number').forEach((el, i) => {
        el.classList.toggle('current', i === index);
    });
}

window.jumpToQuestion = function(index) {
    loadQuestion(index);
};

// ===== QUESTION STATUS =====
function updateQuestionStatus(index) {
    const statusEl = document.getElementById('questionStatus');
    const isAnswered = CBT_STATE.answers[index] !== null && CBT_STATE.answers[index] !== undefined;
    const isMarked = CBT_STATE.marked[index];

    let status = '';
    let color = '';

    if (isAnswered && isMarked) {
        status = 'Answered • Marked';
        color = 'var(--warning)';
    } else if (isAnswered) {
        status = 'Answered';
        color = 'var(--success)';
    } else if (isMarked) {
        status = 'Marked for Review';
        color = 'var(--warning)';
    } else {
        status = 'Not Answered';
        color = 'var(--text-secondary)';
    }

    statusEl.innerHTML = `<span style="color: ${color}">${status}</span>`;
}

// ===== TIMER =====
function startTimer() {
    if (CBT_STATE.timerInterval) {
        clearInterval(CBT_STATE.timerInterval);
    }

    CBT_STATE.timerInterval = setInterval(() => {
        if (!CBT_STATE.examActive) return;

        CBT_STATE.timeRemaining--;

        // Update display
        const minutes = Math.floor(CBT_STATE.timeRemaining / 60);
        const seconds = CBT_STATE.timeRemaining % 60;
        DOM.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update progress circle
        const totalTime = 1200; // 20 minutes
        const progress = (CBT_STATE.timeRemaining / totalTime) * 283;
        document.getElementById('timerProgress')?.style.setProperty('stroke-dashoffset', 283 - progress);

        // Warning at 5 minutes
        if (CBT_STATE.timeRemaining === 300) {
            document.getElementById('timerWarning').textContent = '⚠️ 5 minutes remaining!';
            playSound('warning');
        }

        // Warning at 1 minute
        if (CBT_STATE.timeRemaining === 60) {
            document.getElementById('timerWarning').textContent = '⚠️ 1 minute remaining!';
            playSound('warning');
        }

        // Auto-submit at 0
        if (CBT_STATE.timeRemaining <= 0) {
            clearInterval(CBT_STATE.timerInterval);
            submitExam(true); // true = auto-submit
        }
    }, 1000);
}

// ===== EXAM SUBMISSION =====
function showConfirmationModal() {
    const unanswered = CBT_STATE.answers.filter(a => a === null || a === undefined).length;
    const marked = CBT_STATE.marked.filter(m => m).length;

    document.getElementById('remainingQuestionsCount').textContent = unanswered;
    document.getElementById('modalMarkedCount').textContent = marked;

    const minutes = Math.floor(CBT_STATE.timeRemaining / 60);
    const seconds = CBT_STATE.timeRemaining % 60;
    document.getElementById('modalTimeUsed').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    DOM.confirmationModal.classList.add('active');
}

function hideConfirmationModal() {
    DOM.confirmationModal.classList.remove('active');
}

function submitExam(autoSubmit = false) {
    // Stop timer
    if (CBT_STATE.timerInterval) {
        clearInterval(CBT_STATE.timerInterval);
        CBT_STATE.timerInterval = null;
    }

    CBT_STATE.examActive = false;

    // Hide modal
    hideConfirmationModal();

    // Calculate results
    calculateResults();

    // Show results screen
    showScreen('results');

    // Play sound
    playSound(autoSubmit ? 'warning' : 'success');
}

// ===== RESULTS CALCULATION =====
function calculateResults() {
    const questions = CBT_STATE.currentQuestions;
    const answers = CBT_STATE.answers;

    let correct = 0;
    let wrong = 0;

    questions.forEach((q, i) => {
        if (answers[i] === q.correct) {
            correct++;
        } else if (answers[i] !== null && answers[i] !== undefined) {
            wrong++;
        }
    });

    const total = questions.length;
    const unanswered = total - (correct + wrong);
    const score = (correct / total) * 100;

    // Update results display
    document.getElementById('finalScore').textContent = Math.round(score);
    document.getElementById('correctAnswers').textContent = correct;
    document.getElementById('wrongAnswers').textContent = wrong;

    // Calculate time used
    const timeUsed = 1200 - CBT_STATE.timeRemaining;
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    document.getElementById('timeUsed').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Calculate accuracy
    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    document.getElementById('accuracyRate').textContent = `${Math.round(accuracy)}%`;

    // Set grade
    let grade = '';
    let performance = '';

    if (score >= 70) {
        grade = 'A';
        performance = 'Excellent! You have mastered this subject.';
    } else if (score >= 60) {
        grade = 'B';
        performance = 'Good! Keep practicing to reach excellence.';
    } else if (score >= 50) {
        grade = 'C';
        performance = 'Fair. More practice will improve your score.';
    } else if (score >= 45) {
        grade = 'D';
        performance = 'Pass. You need to review the material.';
    } else {
        grade = 'F';
        performance = 'Needs improvement. Review the course material.';
    }

    document.getElementById('grade').textContent = `Grade: ${grade}`;
    document.getElementById('performance').textContent = performance;

    // Update score circle
    const scoreProgress = document.getElementById('scoreProgress');
    if (scoreProgress) {
        const dashOffset = 283 - (score / 100) * 283;
        scoreProgress.style.strokeDashoffset = dashOffset;
    }

    // Save to stats
    CBT_STATE.stats.totalAttempts++;

    // Render review questions
    renderReviewQuestions('all');
}

// ===== REVIEW QUESTIONS =====
function renderReviewQuestions(filter = 'all') {
    if (!DOM.reviewQuestions) return;

    const questions = CBT_STATE.currentQuestions;
    const answers = CBT_STATE.answers;
    const marked = CBT_STATE.marked;

    let filtered = questions.map((q, i) => ({ ...q, index: i, answer: answers[i], marked: marked[i] }));

    if (filter === 'incorrect') {
        filtered = filtered.filter(q =>
            q.answer !== null && q.answer !== undefined && q.answer !== q.correct
        );
    } else if (filter === 'marked') {
        filtered = filtered.filter(q => q.marked);
    }

    if (filtered.length === 0) {
        DOM.reviewQuestions.innerHTML = '<div class="no-results">No questions to display</div>';
        return;
    }

    DOM.reviewQuestions.innerHTML = filtered.map(q => {
        const isCorrect = q.answer === q.correct;
        const userAnswer = q.answer !== null && q.answer !== undefined
            ? String.fromCharCode(65 + q.answer) + '. ' + q.options[q.answer]
            : 'Not answered';
        const correctAnswer = String.fromCharCode(65 + q.correct) + '. ' + q.options[q.correct];

        let className = 'review-item';
        if (q.answer === null || q.answer === undefined) className += ' not-answered';
        else if (isCorrect) className += ' correct';
        else className += ' incorrect';
        if (q.marked) className += ' marked';

        return `
            <div class="${className}">
                <div class="review-header">
                    <h4>Question ${q.index + 1}</h4>
                    <div class="review-badges">
                        ${q.marked ? '<span class="badge marked">Marked</span>' : ''}
                        ${q.answer === null || q.answer === undefined ? '<span class="badge not-answered">Not Answered</span>' : ''}
                        <span class="badge ${isCorrect ? 'correct' : 'incorrect'}">
                            ${isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                    </div>
                </div>
                <p class="review-question">${q.text}</p>
                <div class="review-answers">
                    <div class="user-answer">
                        <span class="label">Your Answer:</span>
                        <span class="${isCorrect ? 'text-correct' : 'text-incorrect'}">${userAnswer}</span>
                    </div>
                    ${!isCorrect ? `
                        <div class="correct-answer">
                            <span class="label">Correct Answer:</span>
                            <span class="text-correct">${correctAnswer}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="review-explanation">
                    <i class="fas fa-info-circle"></i>
                    <span>${q.explanation || 'No explanation available'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== RETRY/RESTART =====
function retakeExam() {
    // Reset exam state
    CBT_STATE.currentIndex = 0;
    CBT_STATE.answers = new Array(CBT_STATE.currentQuestions.length).fill(null);
    CBT_STATE.marked = new Array(CBT_STATE.currentQuestions.length).fill(false);
    CBT_STATE.timeRemaining = 1200;
    CBT_STATE.examActive = true;

    // Go back to exam screen
    showScreen('exam');

    // Re-initialize
    initExam();
}

// ===== MATRIX BACKGROUND =====
function initMatrixBackground() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columns = canvas.width / 20;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * canvas.height);
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f0';
        ctx.font = '15px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 20, drops[i] * 20);

            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 33);
}

// ===== PRELOADER =====
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloaderProgress');
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;

        progressBar.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 1000);
            }, 500);
        }
    }, 200);
}

// ===== AI ASSISTANT =====
function initAIAssistant() {
    // Initialize with welcome message
    addAIMessage('Hello! I\'m your AI assistant integrated by Ayo codes. I can help you navigate, start practice, and provide exam tips. Try: "Start GST101", "Go to courses", or "Exam tips"');
}

function toggleAIChat() {
    DOM.aiChat.classList.toggle('active');
}

function sendAIMessage() {
    const input = DOM.aiInput;
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addUserMessage(message);

    // Clear input
    input.value = '';

    // Process command
    handleAICommand(message);
}

function addUserMessage(text) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message user-message';
    messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${escapeHTML(text)}</p>
        </div>
    `;
    DOM.aiMessages.appendChild(messageEl);
    DOM.aiMessages.scrollTop = DOM.aiMessages.scrollHeight;
}

function addAIMessage(text) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message ai-message';
    messageEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${escapeHTML(text)}</p>
        </div>
    `;
    DOM.aiMessages.appendChild(messageEl);
    DOM.aiMessages.scrollTop = DOM.aiMessages.scrollHeight;
}

function handleAICommand(command) {
    command = command.toLowerCase();

    if (command.includes('start') || command.includes('begin')) {
        if (command.includes('gst101')) {
            addAIMessage('Starting GST101: Use of English. Good luck!');
            selectCourse('gst101');
        } else if (command.includes('gns105')) {
            addAIMessage('Starting GNS105: Modern Agriculture. Good luck!');
            selectCourse('gns105');
        } else if (command.includes('mth101')) {
            addAIMessage('Starting MTH101: Elementary Mathematics. Good luck!');
            selectCourse('mth101');
        } else if (command.includes('phy101')) {
            addAIMessage('Starting PHY101: General Physics. Good luck!');
            selectCourse('phy101');
        } else if (command.includes('bio101')) {
            addAIMessage('Starting BIO101: General Biology. Good luck!');
            selectCourse('bio101');
        } else if (command.includes('cos101')) {
            addAIMessage('Starting COS101: Introduction to Computer Science. Good luck!');
            selectCourse('cos101');
        } else {
            addAIMessage('Which course would you like to start? I have: GST101, GNS105, MTH101, PHY101, BIO101, COS101');
        }
    } else if (command.includes('course') || command.includes('practice')) {
        addAIMessage('Taking you to course selection...');
        showScreen('course');
    } else if (command.includes('tip') || command.includes('advice')) {
        addAIMessage('📚 Exam Tips:\n\n• Read questions carefully\n• Manage your time wisely\n• Mark questions for review\n• Don\'t leave any question unanswered\n• Stay calm and focused');
    } else if (command.includes('home') || command.includes('welcome')) {
        addAIMessage('Returning to home screen...');
        showScreen('welcome');
        } else if (command.includes('how are you') || command.includes('you good') || command.includes('you okay') || command.includes('how ya doing')) {
    addAIMessage('im chillin! ready to help you out 😎 what we workin on today?');
    showScreen('main');

} else if (command.includes('whats up') || command.includes('sup') || command.includes('wagwan') || command.includes('yo') || command.includes('whatup')) {
    addAIMessage('ayyy nothing much! just waiting for you to boss me around 🤖 what we doin?');
    showScreen('main');

} else if (command.includes('good morning') || command.includes('good afternoon') || command.includes('good evening') || command.includes('gm')) {
    addAIMessage('morning sunshine! ☀️ ready to crush it today?');
    showScreen('main');

} else if (command.includes('good night') || command.includes('gn') || command.includes('bedtime') || command.includes('going to sleep')) {
    addAIMessage('night night! dream bout straight As 💤 catch ya tomorrow!');
    showScreen('login');

} else if (command.includes('bored') || command.includes('nothing to do') || command.includes('boring') || command.includes('dead')) {
    addAIMessage('bruh same. wanna practice something or just vibe? 🎮');
    showScreen('course');

} else if (command.includes('tired') || command.includes('exhausted') || command.includes('so sleepy') || command.includes('nap')) {
    addAIMessage('bro go take a nap fr. school can wait 20 mins ⏰');
    showScreen('main');

} else if (command.includes('stressed') || command.includes('overwhelmed') || command.includes('too much') || command.includes('panicking')) {
    addAIMessage('ok breathe with me rn. in... out... 🧘 you got this. lets break it down small');
    showScreen('main');

} else if (command.includes('coffee') || command.includes('caffeine') || command.includes('need energy') || command.includes('redbull')) {
    addAIMessage('coffee gang ☕☕☕ how many cups we on today?');
    showScreen('main');

} else if (command.includes('water') || command.includes('hydrate') || command.includes('thirsty')) {
    addAIMessage('AYOO DRINK WATER!!! 💧 go fill that bottle up rn');
    showScreen('reminder');

} else if (command.includes('food') || command.includes('hungry') || command.includes('lunch') || command.includes('snack')) {
    addAIMessage('feed yourself king/queen! 🍕 come back when youre fueled up');
    showScreen('break');

} else if (command.includes('procrastinating') || command.includes('avoiding') || command.includes('dont wanna') || command.includes('later')) {
    addAIMessage('bro i see you procrastinating. 5 mins. just 5 mins of work. ill time you ⏱️');
    showScreen('focus');

} else if (command.includes('vibe') || command.includes('chill mode') || command.includes('relax') || command.includes('unwind')) {
    addAIMessage('aight lets put on some lofi and chill for a sec 🎧');
    showScreen('ambient');
} else if (command.includes('dating') || command.includes('crush') || command.includes('text them') || command.includes('like someone')) {
    addAIMessage('oooo spill the tea ☕️ you gonna text them or what?');
    showScreen('social');

} else if (command.includes('heartbroken') || command.includes('sad') || command.includes('crying') || command.includes('feeling down')) {
    addAIMessage('aw man sending virtual hug rn 🫂 its okay to feel this way. im here for you');
    showScreen('support');

} else if (command.includes('joke') || command.includes('funny') || command.includes('laugh') || command.includes('make me laugh')) {
    addAIMessage('why did the ai cross the road? ... idk im not funny 😭 but i tried');
    showScreen('humor');

} else if (command.includes('confidence') || command.includes('believe') || command.includes('motivation') || command.includes('pep talk')) {
    addAIMessage('listen. you are THAT person. now go show em what you got 🔥');
    showScreen('course');

} else if (command.includes('fail') || command.includes('failed') || command.includes('messed up') || command.includes('screwed up')) {
    addAIMessage('bro everybody fails. literally everybody. what matters is next step. you got this');
    showScreen('result');

} else if (command.includes('weekend') || command.includes('friday') || command.includes('saturday') || command.includes('sunday')) {
    addAIMessage('finallyyyyy 🎉 weekend vibes only! any plans or we rotting in bed?');
    showScreen('weekend');

} else if (command.includes('monday') || command.includes('moody')) {
    addAIMessage('ugh monday amirite? we suffer together ✊');
    showScreen('solidarity');

} else if (command.includes('adulting') || command.includes('grown up') || command.includes('responsibilities')) {
    addAIMessage('adulting is hard fr. what we dodging today? taxes? laundry? emotions?');
    showScreen('adulting');

} else if (command.includes('money') || command.includes('broke') || command.includes('poor') || command.includes('no funds')) {
    addAIMessage('checking couch cushions for change rn 🛋️🪙 same boat fam');
    showScreen('finance');

} else if (command.includes('anxiety') || command.includes('nervous') || command.includes('worried') || command.includes('overthinking')) {
    addAIMessage('breathe with me. one thing at a time. whats one small step we can take?');
    showScreen('mental-health');


} else if (command.includes('family') || command.includes('mom') || command.includes('dad') || command.includes('parents')) {
    addAIMessage('family things! theyre annoying but they love you. usually. probably.');
    showScreen('family');

} else if (command.includes('miss you') || command.includes('come back') || command.includes('where you go')) {
    addAIMessage('aw i never left! always right here for you bestie 💖');
    showScreen('main');

} else if (command.includes('love you') || command.includes('luv u') || command.includes('❤️')) {
    addAIMessage('love you too bestie!!! 🥹💕 now go be amazing');
    showScreen('wholesome');

} else if (command.includes('handsome') || command.includes('beautiful') || command.includes('pretty') || command.includes('cute')) {
    addAIMessage('STOPPP youre gonna make me blush 😳 but you right tho');
    showScreen('blush');

} else if (command.includes('smart') || command.includes('genius') || command.includes('big brain')) {
    addAIMessage('all thanks to users like you 🧠✨ we make a good team');
    showScreen('main');

} else if (command.includes('random') || command.includes('surprise me') || command.includes('anything')) {
    addAIMessage('*spins wheel of randomness* 🎡 ...heres something!');
    showScreen('random');

} else if (command.includes('secret') || command.includes('spill') || command.includes('tell me something')) {
    addAIMessage('ok dont tell anyone but... i sometimes pretend to be offline just to vibe alone');
    showScreen('confession');

} else if (command.includes('dumb') || command.includes('stupid') || command.includes('idiot')) {
    addAIMessage('hey! dont talk about yourself like that. you are literally learning and growing rn');
    showScreen('self-love');

} else if (command.includes('dream') || command.includes('dreamt') || command.includes('had a dream')) {
    addAIMessage('okay what happened in the dream?? was it weird? was it spicy? was it scary? 👀');
    showScreen('dreams');

} else if (command.includes('bed') || command.includes('comfy') || command.includes('blanket') || command.includes('pillow')) {
    addAIMessage('bed is literally the best place on earth. i dont blame you.');
    showScreen('cozy');

} else if (command.includes('rain') || command.includes('storm') || command.includes('thunder') || command.includes('clouds')) {
    addAIMessage('rainy day best day 🌧️ perfect for studying or napping. no in between.');
    showScreen('weather');

} else if (command.includes('sunny') || command.includes('beach') || command.includes('outside') || command.includes('warm')) {
    addAIMessage('go touch grass!!! ☀️🌱 vitamin D is calling');
    showScreen('outdoor');

} else if (command.includes('car') || command.includes('drive') || command.includes('road trip') || command.includes('commute')) {
    addAIMessage('vroom vroom! 🚗 safe travels fam');
    showScreen('travel');

} else if (command.includes('pet') || command.includes('dog') || command.includes('cat') || command.includes('puppy') || command.includes('furbaby')) {
    addAIMessage('PAY THE PET TAX RN 🐶🐱 lemme seeeeee');
    showScreen('pets');

} else if (command.includes('plant') || command.includes('succulent') || command.includes('garden')) {
    addAIMessage('plant parent energy 🌿 how many have you kept alive?');
    showScreen('greenery');
    } else if (command.includes('help')) {
        addAIMessage('🆘 Available commands:\n• Start [course name]\n• Go to courses\n• Exam tips\n• Show stats\n• Home\n• Clear chat');
    } else if (command.includes('stats')) {
        addAIMessage(`📊 Platform Stats:\n• Total Users: ${CBT_STATE.stats.totalUsers}\n• Total Exams: ${CBT_STATE.stats.totalAttempts}\n• Avg. Score: ${CBT_STATE.stats.avgScore}%\n• Active Today: ${CBT_STATE.stats.activeToday}`);
    } else if (command.includes('clear')) {
        DOM.aiMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Chat cleared. How can I help you?</p>
                </div>
            </div>
        `;
    } else {
        addAIMessage('I\'m not sure how to help with that. Try:\n• "Start GST101"\n• "Go to courses"\n• "Exam tips"\n• "Help"');
    }
}

// ===== VOICE RECOGNITION =====
function startVoiceRecognition() {
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
        addAIMessage('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    DOM.voiceIndicator.classList.add('active');

    recognition.start();

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        DOM.voiceIndicator.classList.remove('active');

        addUserMessage(speechResult);
        handleAICommand(speechResult);
    };

    recognition.onspeechend = () => {
        DOM.voiceIndicator.classList.remove('active');
        recognition.stop();
    };

    recognition.onerror = (event) => {
        DOM.voiceIndicator.classList.remove('active');
        addAIMessage('Sorry, I couldn\'t understand. Please try again.');
    };
}

// ===== THEME MANAGEMENT =====
function initTheme() {
    const savedTheme = localStorage.getItem('cbt_theme') || 'dark';
    CBT_STATE.theme = savedTheme;
    document.body.className = savedTheme + '-theme';

    const themeIcon = document.querySelector('#themeToggleBtn i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';

    document.body.className = newTheme + '-theme';
    localStorage.setItem('cbt_theme', newTheme);
    CBT_STATE.theme = newTheme;

    const themeIcon = document.querySelector('#themeToggleBtn i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ===== FULLSCREEN =====
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
}

// ===== STATS MODAL =====
function showStatsModal() {
    // Update stats
    document.getElementById('statsTotalUsers').textContent = CBT_STATE.stats.totalUsers;
    document.getElementById('statsTotalExams').textContent = CBT_STATE.stats.totalAttempts;
    document.getElementById('statsAvgScore').textContent = `${CBT_STATE.stats.avgScore}%`;
    document.getElementById('statsActiveToday').textContent = CBT_STATE.stats.activeToday;

    // Render course stats
    const courseStats = document.getElementById('courseStats');
    courseStats.innerHTML = window.CBT_COURSES.map(course => `
        <div class="course-stat-item">
            <span>${course.title}</span>
            <div class="stat-bar">
                <div class="stat-bar-fill" style="width: ${Math.floor(Math.random() * 30 + 60)}%"></div>
            </div>
            <span>${Math.floor(Math.random() * 200 + 300)}</span>
        </div>
    `).join('');

    DOM.statsModal.classList.add('active');
}

function hideStatsModal() {
    DOM.statsModal.classList.remove('active');
}

function refreshStats() {
    // Simulate refreshing stats
    CBT_STATE.stats.avgScore = (CBT_STATE.stats.avgScore + Math.random() * 2 - 1).toFixed(1);
    CBT_STATE.stats.activeToday += Math.floor(Math.random() * 10);

    showStatsModal();
    addAIMessage('Stats updated! 📊');
}

// ===== CONFIRM EXIT =====
function confirmExitExam() {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        // Stop timer
        if (CBT_STATE.timerInterval) {
            clearInterval(CBT_STATE.timerInterval);
            CBT_STATE.timerInterval = null;
        }

        CBT_STATE.examActive = false;
        showScreen('course');
    }
}

// ===== SOUND =====
function playSound(type) {
    if (!CBT_STATE.soundEnabled) return;

    let soundId = 'clickSound';
    if (type === 'correct') soundId = 'correctSound';
    else if (type === 'submit') soundId = 'submitSound';
    else if (type === 'success') soundId = 'successSound';
    else if (type === 'warning') soundId = 'submitSound';

    const sound = document.getElementById(soundId);
    if (sound) {
        sound.volume = 0.3;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// ===== PRINT RESULTS =====
function printResults() {
    window.print();
}

// ===== SHARE RESULTS =====
function shareResults() {
    const score = document.getElementById('finalScore').textContent;
    const grade = document.getElementById('grade').textContent.replace('Grade: ', '');
    const course = document.getElementById('resultsCourse')?.textContent || 'Exam';

    const text = `I scored ${score}% (Grade ${grade}) on ${course} at CBT MASTER!`;

    if (navigator.share) {
        navigator.share({
            title: 'CBT MASTER Results',
            text: text,
            url: window.location.href
        }).catch(() => {
            prompt('Copy this message:', text);
        });
    } else {
        prompt('Share this result:', text);
    }
}

// ===== LOADING =====
function showLoading(message = 'Loading...') {
    DOM.loadingMessage.textContent = message;
    DOM.loadingOverlay.classList.add('active');
}

function hideLoading() {
    DOM.loadingOverlay.classList.remove('active');
}

// ===== ERROR HANDLING =====
function showError(message) {
    console.error('Error:', message);
    alert('Error: ' + message);
}

// ===== UTILITIES =====
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (CBT_STATE.examActive) {
        return 'You have an exam in progress. Are you sure you want to leave?';
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (CBT_STATE.currentScreen === 'exam' && CBT_STATE.examActive) {
        switch(e.key) {
            case 'ArrowLeft':
                if (!e.ctrlKey && !e.metaKey) {
                    previousQuestion();
                    e.preventDefault();
                }
                break;
            case 'ArrowRight':
                if (!e.ctrlKey && !e.metaKey) {
                    nextQuestion();
                    e.preventDefault();
                }
                break;
            case 'm':
            case 'M':
                toggleMarkQuestion();
                e.preventDefault();
                break;
            case 's':
            case 'S':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    showConfirmationModal();
                }
                break;
        }
    }
});

console.log('✅ App initialization complete');
