let database;

const quizStoreName = 'AssessmentalQuizStore525011614828926';

class Quiz {
    constructor(title, thumbnail, categories, questions) {
        this.title = title;
        this.thumbnail = thumbnail;
        this.categories = categories;
        this.questions = questions;
        this.score = 0;
        this.submissions = 0;
    }
}


function getQuizzesByCategory(category, success, error = defaultError) {
    let transaction = database.transaction([quizStoreName], "readonly");
    let quizStore = transaction.objectStore(quizStoreName);
    let request = quizStore.openCursor();

    request.onerror = error;
    let quizzes = []
    request.onsuccess = function (e) {
        let cursor = e.target.result;

        if (cursor) {
            let quiz = cursor.value;
            if (quiz.categories.includes(category)) {
                quizzes.push(quiz);
            }
            cursor.continue();
        } else { success(quizzes); }
    }
}


function getQuizById(id, success, error = defaultError) {
    let transaction = database.transaction([quizStoreName], 'readonly');
    let quizStore = transaction.objectStore(quizStoreName);
    let request;
    try {
        request = quizStore.get(id)
    } catch (e) { error(e); }

    request.onsuccess = function () {
        if (request.result) {
            success(request.result);
        } else { error('Quiz ID is invalid'); }
    }
    request.onerror = error;
}


function addQuiz(quiz, success, error = defaultError) {
    let transaction = database.transaction([quizStoreName], "readwrite");
    let quizStore = transaction.objectStore(quizStoreName);
    let request = quizStore.add(quiz);

    request.onerror = error;
    request.onsuccess = success || function () { };
}


function updateQuiz(quiz, id, success, error = defaultError) {
    quiz.id = id;
    let transaction = database.transaction([quizStoreName], 'readwrite');
    let quizStore = transaction.objectStore(quizStoreName);
    let request = quizStore.put(quiz)

    request.onerror = error;
    request.onsuccess = success || function () { };
}


function deleteQuiz(id, success, error = defaultError) {
    let transaction = database.transaction([quizStoreName], 'readwrite');
    let quizStore = transaction.objectStore(quizStoreName);
    let request = quizStore.delete(id)

    request.onerror = error;
    request.onsuccess = success || function () { };
}


function deleteAllQuizzes(success, error = defaultError) {
    let transaction = database.transaction([quizStoreName], 'readwrite');
    let quizStore = transaction.objectStore(quizStoreName);
    let request = quizStore.clear();

    request.onerror = error;
    request.onsuccess = success || function () { };
}


window.onload = function () {
    let req = window.indexedDB.open("AssessmentalDataBase", 1);

    req.onsuccess = function () {
        database = req.result;
        getOriginalData();
    }

    req.onerror = function (e) { alert('There was an error: ', e); }

    req.onupgradeneeded = function (e) {
        let db = req.result;
        let quizStore = db.createObjectStore(quizStoreName, { keyPath: 'id', autoIncrement: true });
    }
}


function getOriginalData() {
    let quizzes = [
        new Quiz(
            'Testing Quiz for checking all the manipulations',
            '../IMG/AssessMental.png',
            ['testing', 'assessmental', 'database'],
            [
                { title: 'How many hours do you sleep a day?', details: '', answers: ['3:6 hours', '7:9 hours', '9:11 hours', '12:14 hours'], correct: 1 },
                { title: 'How many hours do you eat a day?', details: '', answers: ['3:6 hours', '7:9 hours', '9:11 hours', '12:14 hours'], correct: 0 }
            ]
        )
    ];
    for (let i = 1; i < quizzes.length + 1; i++) {
        getQuizById(i, function () {
            if (i === quizzes.length) {
                document.body.style.visibility = 'visible';
                main();
            }
        }, function () {
            addQuiz(quizzes[i - 1], function () {
                console.log('Quiz Added');
                if (i === quizzes.length) {
                    document.body.style.visibility = 'visible';
                    main();
                }
            }, defaultError);
        })
    }
}


function defaultError(e) {
    console.log('There has been an error: ', e)
}