function init() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify({}));
    }
    if (!localStorage.getItem('quizzes')) {
        localStorage.setItem('quizzes', JSON.stringify([]));
    }
    if (!localStorage.getItem('scores')) {
        localStorage.setItem('scores', JSON.stringify({}));
    }
}

// Show login form
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

// Show register form
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Handle user login
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
   
    const users = JSON.parse(localStorage.getItem('users'));
   
    if (users[username] && users[username] === password) {
        localStorage.setItem('currentUser', username);
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid username or password');
    }
}

// Handle user registration
function register() {
    const username = document.getElementById('register-username').value;
	 const username = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
   
    if (username && password) {
        const users = JSON.parse(localStorage.getItem('users'));
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Please login.');
        showLogin();
    } else {
        alert('Please enter a username and password.');
    }
}

// Handle user logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Add a new question field to the quiz form
function addQuestion() {
    const container = document.getElementById('questions-container');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
        <input type="text" placeholder="Question" required>
        <select class="question-type" onchange="updateQuestionType(this)">
            <option value="text">Text Answer</option>
            <option value="multiple-choice">Multiple Choice</option>
        </select>
        <div class="options-container" style="display: none;">
            <input type="text" placeholder="Option 1">
            <input type="text" placeholder="Option 2">
            <input type="text" placeholder="Option 3">
            <input type="text" placeholder="Option 4">
            <select class="correct-option">
                <option value="">Select Correct Option</option>
            </select>
        </div>
    `;
    container.appendChild(questionDiv);
}

// Update the visibility of options for multiple-choice questions
function updateQuestionType(select) {
    const container = select.parentElement.querySelector('.options-container');
    container.style.display = select.value === 'multiple-choice' ? 'block' : 'none';
   
    if (select.value === 'multiple-choice') {
        const options = container.querySelectorAll('input[type=text]');
        const correctOptionSelect = container.querySelector('.correct-option');
        correctOptionSelect.innerHTML = '<option value="">Select Correct Option</option>';
        options.forEach((option, index) => {
            if (option.value.trim()) {
                correctOptionSelect.innerHTML += `<option value="${index}">${option.value}</option>`;
            }
        });
    }
}

// Create a new quiz
function createQuiz() {
    const title = document.getElementById('quiz-title').value;
    const questions = Array.from(document.querySelectorAll('#questions-container .question')).map(questionDiv => {
        const questionText = questionDiv.querySelector('input[type=text]').value;
        const type = questionDiv.querySelector('.question-type').value;
        let options = [];
        if (type === 'multiple-choice') {
            const optionInputs = questionDiv.querySelectorAll('.options-container input[type=text]');
            const correctOptionIndex = questionDiv.querySelector('.correct-option').value;
            options = Array.from(optionInputs).map((input, index) => ({
                text: input.value,
                isCorrect: index == correctOptionIndex
            }));
        }
        return {
            question: questionText,
            type,
            options
        };
    });
   
    if (title && questions.length > 0) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes'));
        const quizId = Date.now(); // Unique ID based on timestamp
        quizzes.push({ id: quizId, title, questions });
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        alert('Quiz created successfully!');
        document.getElementById('quiz-form').reset();
        document.getElementById('questions-container').innerHTML = `
            <div class="question">
                <input type="text" placeholder="Question" required>
                <select class="question-type" onchange="updateQuestionType(this)">
                    <option value="text">Text Answer</option>
                    <option value="multiple-choice">Multiple Choice</option>
                </select>
                <div class="options-container" style="display: none;">
                    <input type="text" placeholder="Option 1">
                    <input type="text" placeholder="Option 2">
                    <input type="text" placeholder="Option 3">
                    <input type="text" placeholder="Option 4">
                    <select class="correct-option">
                        <option value="">Select Correct Option</option>
                    </select>
                </div>
            </div>
        `;
        loadQuizLinks();
    } else {
        alert('Please fill out the quiz title and at least one question.');
    }
}

// Load quiz links into the dashboard
function loadQuizLinks() {
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    const quizLinksList = document.getElementById('quiz-links-list');
    quizLinksList.innerHTML = quizzes.map(quiz =>
        `<a href="quiz.html?id=${quiz.id}">${quiz.title}</a>`
    ).join('<br>');
}

// View quiz scores
function viewScores() {
    const username = localStorage.getItem('currentUser');
    const scores = JSON.parse(localStorage.getItem('scores'))[username] || [];
    const scoresList = document.getElementById('scores-list');
   
    if (scores.length > 0) {
        scoresList.innerHTML = '<ul>' + scores.map(score => `<li>${score}</li>`).join('') + '</ul>';
        scoresList.style.display = 'block';
    } else {
        scoresList.innerHTML = 'No scores available.';
        scoresList.style.display = 'block';
    }
}

// Load quiz data for taking the quiz
function loadQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = parseInt(urlParams.get('id'), 10);
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    const quiz = quizzes.find(q => q.id === quizId);

    if (quiz) {
        document.getElementById('quiz-title').textContent = quiz.title;
        const questionsContainer = document.getElementById('quiz-questions');
        questionsContainer.innerHTML = quiz.questions.map(q => `
            <div class="question">
                <p>${q.question}</p>
                ${q.type === 'text' ? `
                    <input type="text" placeholder="Your Answer">
                ` : `
                    ${q.options.map((option, index) => `
                        <div>
                            <input type="radio" name="${q.question}" value="${index}">
                            <label>${option.text}</label>
                        </div>
                    `).join('')}
                `}
            </div>
        `).join('');
    } else {
        document.getElementById('quiz').innerHTML = 'Quiz not found.';
    }
}

// Submit the quiz and show results
function submitQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = parseInt(urlParams.get('id'), 10);
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    const quiz = quizzes.find(q => q.id === quizId);

    if (quiz) {
        let score = 0;
        const answers = document.querySelectorAll('#quiz-questions .question');
        answers.forEach((questionDiv, index) => {
            const question = quiz.questions[index];
            if (question.type === 'text') {
                const userAnswer = questionDiv.querySelector('input').value.trim();
                const correctAnswer = questionDiv.querySelector('input').dataset.answer;
                if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                    score++;
                }
            } else {
                const selectedOption = questionDiv.querySelector('input:checked');
                if (selectedOption) {
                    const selectedIndex = parseInt(selectedOption.value, 10);
                    if (question.options[selectedIndex] && question.options[selectedIndex].isCorrect) {
                        score++;
                    }
                }
            }
        });
        const result = document.getElementById('result');
        result.innerHTML = `Your score: ${score} / ${quiz.questions.length}`;
        result.style.display = 'block';

        const username = localStorage.getItem('currentUser');
        const scores = JSON.parse(localStorage.getItem('scores'));
        if (!scores[username]) {
            scores[username] = [];
        }
        scores[username].push(`Quiz ${quiz.title}: ${score} / ${quiz.questions.length}`);
        localStorage.setItem('scores', JSON.stringify(scores));
    } else {
        alert('Quiz not found.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    init();
    if (window.location.pathname.endsWith('quiz.html')) {
        loadQuiz();
    } else if (window.location.pathname.endsWith('dashboard.html')) {
        loadQuizLinks();
    }
});
// Load quiz data for taking the quiz
function loadQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = parseInt(urlParams.get('id'), 10);
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    const quiz = quizzes.find(q => q.id === quizId);

    if (quiz) {
        document.getElementById('quiz-title').textContent = quiz.title;
        const questionsContainer = document.getElementById('quiz-questions');
        questionsContainer.innerHTML = quiz.questions.map(q => `
            <div class="question">
                <p>${q.question}</p>
                ${q.type === 'text' ? `
                    <input type="text" placeholder="Your Answer" data-answer="${q.answer}">
                ` : `
                    ${q.options.map((option, index) => `
                        <div>
                            <input type="radio" name="${q.question}" value="${index}">
                            <label>${option.text}</label>
                        </div>
                    `).join('')}
                `}
            </div>
        `).join('');
    } else {
        document.getElementById('quiz').innerHTML = 'Quiz not found.';
    }
}

// Submit the quiz and show results
function submitQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = parseInt(urlParams.get('id'), 10);
    const quizzes = JSON.parse(localStorage.getItem('quizzes'));
    const quiz = quizzes.find(q => q.id === quizId);

    if (quiz) {
        let score = 0;
        const answers = document.querySelectorAll('#quiz-questions .question');
        answers.forEach((questionDiv, index) => {
            const question = quiz.questions[index];
            if (question.type === 'text') {
                const userAnswer = questionDiv.querySelector('input').value.trim();
                if (userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
                    score++;
                }
            } else {
                const selectedOption = questionDiv.querySelector('input:checked');
                if (selectedOption) {
                    const selectedIndex = parseInt(selectedOption.value, 10);
                    if (question.options[selectedIndex] && question.options[selectedIndex].isCorrect) {
                        score++;
                    }
                }
            }
        });

        const result = document.getElementById('result');
        result.innerHTML = `Your score: ${score} / ${quiz.questions.length}`;
        result.style.display = 'block';

        const username = localStorage.getItem('currentUser');
        const scores = JSON.parse(localStorage.getItem('scores')) || {};
        if (!scores[quizId]) {
            scores[quizId] = [];
        }
        scores[quizId].push({ username, score });
        localStorage.setItem('scores', JSON.stringify(scores));
    } else {
        alert('Quiz not found.');
    }
}
// Load and display all scores for quizzes created by the current user
function loadAllScores() {
    const username = localStorage.getItem('currentUser');
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const scores = JSON.parse(localStorage.getItem('scores')) || {};

    const allScoresList = document.getElementById('all-scores-list');
    allScoresList.innerHTML = '';

    quizzes.forEach(quiz => {
        if (scores[quiz.id]) {
            allScoresList.innerHTML += `<h3>${quiz.title}</h3><ul>`;
            scores[quiz.id].forEach(scoreEntry => {
                allScoresList.innerHTML += `<li>${scoreEntry.username}: ${scoreEntry.score} / ${quiz.questions.length}</li>`;
            });
            allScoresList.innerHTML += `</ul>`;
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    init();
    if (window.location.pathname.endsWith('quiz.html')) {
        loadQuiz();
    } else if (window.location.pathname.endsWith('dashboard.html')) {
        loadQuizLinks();
        loadAllScores(); // Load all scores on dashboard page
    }
});