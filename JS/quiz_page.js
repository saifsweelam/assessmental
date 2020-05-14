const urlParams = new URLSearchParams(window.location.search);
const quizID = parseInt(urlParams.get('id'));

const quizModel = {
    title: document.querySelector('#quiz-title'),
    categories: document.querySelector('#quiz-categories'),
    submissions: document.querySelector('#quiz-submissions'),
    thumbnail: document.querySelector('#quiz-thumbnail'),
    content: document.querySelector('#quiz-content'),
    startBtn: document.querySelector('#start-quiz')
}


function main() {
    getQuizById(quizID, function (quiz) { parseQuizData(quiz); }, throwNotFound);

}


function throwNotFound(error) {
    console.error(error);
    alert(`The quiz you're trying to access doesn't exist or the URL you entered isn't valid.`);
    window.location.href = '../index.html';
}


function parseQuizData(quiz) {
    quizModel.title.textContent = quiz.title;
    quizModel.thumbnail.src = quiz.thumbnail;
    quizModel.submissions.textContent = quiz.submissions;
    quiz.categories.forEach(function (category) {
        quizModel.categories.insertAdjacentHTML('beforeend', `<div class="category">${category}</div>`);
    })
    quizModel.startBtn.addEventListener('click', function () { addNavigateButtons(); parseQuestion(0, quiz); })
}


function parseQuestion(index, quiz) {
    let question = quiz.questions[index];
    quizModel.content.innerHTML = `
    <h3 id="question-title">${question.title}</h3>
    <p id="question-details">${question.details}</p>
    <div id="choices"></div>
    <div id="quiz-progress"><div id="progress-bar"></div></div>
    `;
    const choicesModel = document.querySelector('#choices');
    for (let i = 0; i < question.answers.length; i++) {
        choicesModel.insertAdjacentHTML('beforeend', `<div class="answer" id="answer${i}" data-id="${i}">${question.answers[i]}</div>`);
    }
    setNavigateButtons(question, index, quiz);
    for (let i = 0; i < question.answers.length; i++) {
        document.querySelector(`#answer${i}`).addEventListener('click', function (e) {
            question.answer = parseInt(e.target.dataset.id);
            quiz.questions[index] = question;
            setNavigateButtons(question, index, quiz);
        })
    }
}


function setNavigateButtons(question, i, quiz) {
    removeNavigateButtons();
    addNavigateButtons();
    const nextBtn = document.querySelector('#next-btn');
    const backBtn = document.querySelector('#back-btn');
    const progressBar = document.querySelector('#progress-bar');
    const progressWidth = (1 / quiz.questions.length) * 100 * (i + 1);
    progressBar.style.width = `${progressWidth}%`;
    if (i == quiz.questions.length - 1) { nextBtn.textContent = 'Submit Quiz'; }
    if (question.answer || question.answer == 0) {
        nextBtn.disabled = false;
        nextBtn.addEventListener('click', function () {
            if (i < quiz.questions.length - 1) {
                parseQuestion(i + 1, quiz);
            } else { removeNavigateButtons(); submitQuiz(quiz); }
        })
        document.querySelectorAll('.answer').forEach(function (answer) {
            if (answer.classList.contains('chosen')) {
                answer.classList.remove('chosen')
            }
        })
        document.querySelector(`#answer${question.answer}`).classList.add('chosen')
    }
    if (i == 0) { backBtn.disabled = true; }
    backBtn.addEventListener('click', function () { parseQuestion(i - 1, quiz) })
}


function removeNavigateButtons() {
    let slider = document.querySelector('#nav-slider');
    slider.remove();
}

function addNavigateButtons() {
    quizModel.content.insertAdjacentHTML('afterend', `
    <div id="nav-slider">
        <button id="back-btn">&lt;&lt; Back</button>
        <button id="next-btn" disabled>Next >></button>
    </div>`)
}

function submitQuiz(quiz) {
    const questionScore = 100 / quiz.questions.length;
    let totalScore = 0;
    let correct = 0;
    let wrong = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
        let question = quiz.questions[i];
        if (question.answer == question.correct) { totalScore += questionScore; correct += 1; }
        else { wrong += 1; }
    }
    let level = totalScore > 50 ? 'GOOD' : 'NEEDS PRACTICE';
    
    getQuizById(quizID, function(originalQuiz) {
        updateLocalStorage(originalQuiz, totalScore);
        if (totalScore > originalQuiz.score) { originalQuiz.score = totalScore; }
        originalQuiz.submissions += 1;
        updateQuiz(originalQuiz, quizID, function() {
            quizModel.submissions.textContent = originalQuiz.submissions;
            quizModel.content.innerHTML = `
            <div id="quiz-results">
                <h3 id="score-cong">Nice Performance!</h3>
                <div id="score-main">
                    <h4 id="score-heading">Your Score Is</h4>
                    <p id="score-total">${totalScore}</p>
                </div>
                <div id="score-details">
                    <div id="score-correct">
                        <h4 id="score-correct-heading">Correct Answers</h4>
                        <p id="score-correct-count">${correct}</p>
                    </div>
                    <div id="score-level">
                        <h4 id="score-level-heading">Level</h4>
                        <p id="score-level-value">${level}</p>
                    </div>
                    <div id="score-wrong">
                        <h4 id="score-wrong-heading">Wrong Answers</h4>
                        <p id="score-wrong-count">${wrong}</p>
                    </div>
                </div>
            </div>
            `;
        });
    })
}

function updateLocalStorage(quiz, score) {
    let data = operator.getData();
    if (data.quizzes.includes(quizID)) {
        if (quiz.score < score) {
            data.score -= quiz.score;
            data.score += score;
        }
    } else {
        data.quizzes.push(quizID);
        data.score += score;
    }
    operator.updateData(data);
}