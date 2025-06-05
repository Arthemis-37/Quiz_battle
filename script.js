// Variables globales
let currentQuestion = 0;
let scores = [0, 0];
let currentPlayer = 0;
let timeSpent = [0, 0];
let timerInterval;
const questions = document.querySelectorAll('.question');

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

// Démarrage du quiz
document.getElementById("start-button").addEventListener("click", function () {
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";
    document.getElementById("quiz").style.display = "block";
    startQuiz();
});

function startQuiz() {
    currentQuestion = 0;
    currentPlayer = 0;
    scores = [0, 0];
    timeSpent = [0, 0];
    document.getElementById('quiz').style.display = 'block';
    questions.forEach(q => q.style.display = 'none');
    document.getElementById("next-btn").disabled = false;
    Array.from(document.querySelectorAll('label')).forEach(label => {
        label.classList.remove('correct', 'incorrect');
    });
    showQuestion(0);
    updateScoreDisplay();
    updateTimerDisplay();
}

function showQuestion(index) {
    questions.forEach(q => q.style.display = 'none');
    questions[index].style.display = 'block';
    document.getElementById("current-player").textContent = `Joueur ${currentPlayer + 1}`;
    document.getElementById("player-timer").textContent = `⏱ ${timeSpent[currentPlayer]}s`;
    // Réinitialise les sélections
    const radios = questions[index].querySelectorAll('.answers input[type="radio"]');
    radios.forEach(radio => {
        radio.checked = false;
        radio.parentElement.classList.remove('correct', 'incorrect');
    });
    // Active le bouton
    document.getElementById("next-btn").disabled = false;
    // Démarre le chrono
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeSpent[currentPlayer]++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById("timer").textContent =
        `⏱️ Temps - Joueur 1 : ${timeSpent[0]}s | Joueur 2 : ${timeSpent[1]}s`;
    document.getElementById("player-timer").textContent = `⏱ ${timeSpent[currentPlayer]}s`;
}

function updateScoreDisplay() {
    document.getElementById("score").textContent =
        `👤 Joueur 1 : ${scores[0]} | 👤 Joueur 2 : ${scores[1]}`;
}

// Gestion du bouton "Valider la réponse"
document.getElementById("next-btn").addEventListener("click", function () {
    calculerScore();
});

function calculerScore() {
    const question = questions[currentQuestion];
    const selected = questions[currentQuestion].querySelector('.answers input[type="radio"]:checked');
    if (!selected) {
        alert("Veuillez sélectionner une réponse.");
        return;
    }
    // Désactive le bouton pour éviter double clic
    document.getElementById("next-btn").disabled = true;

    const correct = question.getAttribute('data-correct');
    if (selected.value === correct) {
        scores[currentPlayer]++;
        selected.parentElement.classList.add('correct');
    } else {
        selected.parentElement.classList.add('incorrect');
        const goodAnswer = question.querySelector(`input[value="${correct}"]`);
        if (goodAnswer) {
            goodAnswer.parentElement.classList.add('correct');
        }
    }
    clearInterval(timerInterval);

    updateScoreDisplay();

    currentQuestion++;
    if (currentQuestion < questions.length) {
        // Change de joueur après un court délai pour voir la correction
        setTimeout(() => {
            currentPlayer = 1 - currentPlayer;
            showQuestion(currentQuestion);
        }, 1000);
    } else {
        setTimeout(showRecap, 1200);
    }
}

function showRecap() {
    clearInterval(timerInterval);
    const container = document.querySelector('.quiz-container');
    container.innerHTML = "<h2>🎉 Résultats du Quiz 🎉</h2>";
    container.innerHTML += `<p>Joueur 1 : ${scores[0]} points (${timeSpent[0]}s)</p>`;
    container.innerHTML += `<p>Joueur 2 : ${scores[1]} points (${timeSpent[1]}s)</p>`;
    if (scores[0] > scores[1]) {
        container.innerHTML += `<p>🏆 Joueur 1 gagne !</p>`;
    } else if (scores[1] > scores[0]) {
        container.innerHTML += `<p>🏆 Joueur 2 gagne !</p>`;
    } else {
        container.innerHTML += `<p>🤝 Match nul !</p>`;
    }
    // Correction
    container.innerHTML += "<h3>🔍 Correction :</h3>";
    questions.forEach((q, i) => {
        const questionText = q.querySelector('p').textContent;
        const correctValue = q.getAttribute('data-correct');
        const correctLabel = q.querySelector(`input[value="${correctValue}"]`).parentElement.textContent;
        container.innerHTML += `<p><strong>Q${i + 1}:</strong> ${questionText}<br>✅ Réponse correcte : ${correctLabel}</p>`;
    });
    container.innerHTML += `<button onclick="location.reload()">Rejouer</button>`;
}