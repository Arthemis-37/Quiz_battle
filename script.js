// Affichage des chats décoratifs
function placeCatsRandomly() {
    const container = document.getElementById('cat-decoration');
    container.innerHTML = '';
    const emojis = ['🐱', '😺', '🐾', '🐈', '😹', '😻', '🐈‍⬛'];
    const catsCount = 20;
    const placedPositions = [];
    function isFarEnough(x, y, minDist = 60) {
        return placedPositions.every(pos => {
            const dx = pos.x - x;
            const dy = pos.y - y;
            return Math.sqrt(dx*dx + dy*dy) > minDist;
        });
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    for (let i = 0; i < catsCount; i++) {
        let x, y, tries = 0;
        do {
            x = Math.random() * (viewportWidth - 64);
            y = Math.random() * (viewportHeight - 64);
            tries++;
            if (tries > 100) break;
        } while (!isFarEnough(x, y));
        placedPositions.push({x, y});
        const span = document.createElement('span');
        span.classList.add('emoji-chat');
        span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        span.style.left = `${x}px`;
        span.style.top = `${y}px`;
        container.appendChild(span);
    }
}
window.onload = placeCatsRandomly;
window.onresize = placeCatsRandomly;


function lancerMusique() {
const audio = document.getElementById('audio');
audio.play()
    .then(() => {
        console.log("Musique du quiz lancée !");
    })
    .catch((err) => {
        console.error("Erreur lors de la lecture :", err);
    });
}

// Variables globales
let currentQuestion = 0;
let scores = [0, 0];
let currentPlayer = 0;
let questionTime = 15;
let timerInterval;
let allQuestions = [];
let selectedQuestions = [];
let playerNames = ["Joueur 1", "Joueur 2"];
let playerAvatars = ["😺", "😺"];

const startButtonPVP = document.getElementById("start-button-pvp");
const startButtonPVP2 = document.getElementById("start-button-pvp2");
const startButtonAI = document.getElementById("start-button-ai");
const welcomeScreen = document.getElementById("welcome-screen");
const setupScreen = document.getElementById("player-setup");
const quizSection = document.getElementById("quiz-section");
const quiz = document.getElementById("quiz");
const playerDisplay = document.getElementById("current-player");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");



// Charger les questions depuis le fichier JSON
fetch('questions.json')
    .then(response => {
    if (!response.ok) {
        throw new Error('Erreur lors du chargement des questions.');
    }
    return response.json();
    })
    .then(data => {
        allQuestions = data;
        console.log('Questions chargées :', allQuestions);
    })
    .catch(error => {
        console.error('Erreur de chargement des données :', error);
    });

// Démarrage du quiz
startButtonPVP.addEventListener("click", function () {
    welcomeScreen.style.display = "none";
    setupScreen.style.display = "block"
});

startButtonPVP2.addEventListener("click", function () {
    const name1 = document.getElementById("player1-name").value.trim();
    const name2 = document.getElementById("player2-name").value.trim();
    const avatar1 = document.getElementById("player1-avatar").value;
    const avatar2 = document.getElementById("player2-avatar").value;

    playerNames = [name1 || "Joueur 1", name2 || "Joueur 2"];
    playerAvatars = [avatar1, avatar2];

    setupScreen.style.display = "none";
    quizSection.style.display = "block";
    quiz.style.display = "block";
    startQuiz();
});

// Fonction de démarrage du quiz
function startQuiz() {
    selectedQuestions = shuffleArray(allQuestions).slice(0, 10);
    currentQuestion = 0;
    scores = [0, 0];
    currentPlayer = 0;
    updateScore();
    showQuestion();
}

// Afficher une question
function showQuestion() {
    clearInterval(timerInterval);
    const questionData = selectedQuestions[currentQuestion];
    quiz.innerHTML = '';

    const questionTitle = document.createElement('h3');
    questionTitle.textContent = String(currentQuestion+1) +questionData.enoncer;
    quiz.appendChild(questionTitle);

    const answersDiv = document.createElement('div');
    answersDiv.classList.add('answers');
    const shuffledAnswers = shuffleArray(
        questionData.reponses.map((rep, index) => ({ ...rep, index }))
    );

    for (const rep of shuffledAnswers) {
        const label = document.createElement('label');
        label.classList.add('answer-option');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = rep.index; // <- on stocke l’index original comme valeur

        label.appendChild(input);
        label.appendChild(document.createTextNode(rep.reponse));
        answersDiv.appendChild(label);
        answersDiv.appendChild(document.createElement('br'));
    }


    quiz.appendChild(answersDiv);

    const validateBtn = document.createElement("button");
    validateBtn.id = "next-btn";
    validateBtn.textContent = "Valider";
    quiz.appendChild(validateBtn);

    const explanationDiv = document.createElement('div');
    explanationDiv.classList.add('explanation');
    quiz.appendChild(explanationDiv);

    validateBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="answer"]:checked');
        if (!selected) {
            alert("Veuillez sélectionner une réponse !");
            return;
        }

        clearInterval(timerInterval);

        const answerKey = selected.value;
        const isCorrect = questionData.reponses[answerKey].vraifaux === true;
        const allLabels = document.querySelectorAll('.answer-option');
        allLabels.forEach(label => {
            const input = label.querySelector('input');
            const key = input.value;
            if (questionData.reponses[key].vraifaux === true) {
                label.classList.add('correct');
            }
            if (input.checked && !questionData.reponses[key].vraifaux) {
                label.classList.add('incorrect');
            }
            input.disabled = true;
        });

        if (isCorrect) {
            scores[currentPlayer]++;
        }

        explanationDiv.textContent = questionData.explication || "Pas d'explication disponible.";

        validateBtn.textContent = "Continuer";
        validateBtn.disabled = false;

        validateBtn.onclick = () => {
            if(isCorrect){
                scores[currentPlayer]--;
            }
            currentQuestion++;
            currentPlayer = currentPlayer === 0 ? 1 : 0;
            updateScore();
            if (currentQuestion < selectedQuestions.length) {
                showQuestion();
            } else {
                showResults();
                    const audio = document.getElementById('audio');
                    audio.pause();
                    const mus = document.getElementById('nya');
                    mus.play()
                        .then(() => {
                        console.log("Musique lancée !");
                        })
                        .catch((err) => {
                        console.error("Erreur lors de la lecture :", err);
                        });
                            }
                        };
                    });

    playerDisplay.textContent =`${playerAvatars[currentPlayer]} ${playerNames[currentPlayer]}`;
    startTimer();
}

// Met à jour les scores
function updateScore() {
    scoreDisplay.textContent = `${playerAvatars[0]} ${playerNames[0]} : ${scores[0]} | ${playerAvatars[1]} ${playerNames[1]} : ${scores[1]}`;
}

// Afficher les résultats finaux
function showResults() {
    quiz.innerHTML = '';
    const result = document.createElement('h2');
    const avatar = document.createElement('h1');
    if (scores[0] > scores[1]) {
        result.textContent = `🏆 ${playerNames[0]} gagne !`;
        avatar.textContent = `${playerAvatars[0]}`
    } else if (scores[1] > scores[0]) {
        result.textContent = `🏆 ${playerNames[1]} gagne !`;
        avatar.textContent = `${playerAvatars[1]}`
    } else {
        result.textContent = "🤝 Match nul !";
        
    }
    quiz.appendChild(result);


    localStorage.setItem("dernierScoreQuizBattle", JSON.stringify(scores));
}

// Timer
function startTimer() {
    let timeLeft = questionTime;
    timerDisplay.textContent = `⏱ ${timeLeft}s`;

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 10){
            timerDisplay.textContent = `⏱ 0 ${timeLeft}s`;
        }else{
            timerDisplay.textContent = `⏱ ${timeLeft}s`;  
        }


        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("⏰ Temps écoulé !");
            currentQuestion++;
            currentPlayer = currentPlayer === 0 ? 1 : 0;
            if (currentQuestion < selectedQuestions.length) {
                showQuestion();
            } else {
                showResults();
            }
        }
    }, 1000);
}

// Mélanger les questions & réponses
function shuffleArray(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}