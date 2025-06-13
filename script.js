// Variables globales
const avatarOptions = [
  'static/avatar1.png', 'static/avatar2.png', 'static/avatar3.png',
  'static/avatar4.png', 'static/avatar5.png', 'static/avatar6.png',
  'static/avatar7.png', 'static/avatar8.png', 'static/avatar9.png'
];

let allQuestions = [];
let selectedQuestions = [];
let playerNames = ["Joueur 1", "Joueur 2"];
let playerAvatars = ["😺", "😺"];
let scores = [0, 0];
let currentQuestion = 0;
let currentPlayer = 0;
let timerInterval;
const questionTime = 15;

let iaEnabled = false;
let iaDifficulty = 1;
const iaName = "CatGPT";
const iaAvatar = "static/ia-cat.jpg";

// DOM Elements
const welcomeScreen = document.getElementById("welcome-screen");
const setupScreen = document.getElementById("player-setup");
const quizSection = document.getElementById("quiz-section");
const quiz = document.getElementById("quiz");
const scoreDisplay = document.getElementById("score");
const playerDisplay = document.getElementById("current-player");
const timerDisplay = document.getElementById("timer");

// Initialisation
window.onload = () => {
  placeCatsRandomly();
  setupAvatarSelectors();
};
window.onresize = placeCatsRandomly;

// Fonction : Affichage aléatoire des émojis chat
function placeCatsRandomly() {
  const container = document.getElementById('cat-decoration');
  container.innerHTML = '';
  const emojis = ['🐱', '😺', '🐾', '🐈', '😹', '😻', '🐈‍⬛'];
  const catsCount = 20;
  const placedPositions = [];
  const isFarEnough = (x, y, minDist = 60) =>
    placedPositions.every(pos => Math.hypot(pos.x - x, pos.y - y) > minDist);

  for (let i = 0; i < catsCount; i++) {
    let x, y, tries = 0;
    do {
      x = Math.random() * (window.innerWidth - 64);
      y = Math.random() * (window.innerHeight - 64);
      tries++;
      if (tries > 100) break;
    } while (!isFarEnough(x, y));
    placedPositions.push({ x, y });

    const span = document.createElement('span');
    span.className = 'emoji-chat';
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    container.appendChild(span);
  }
}

// Fonction : Configuration des avatars
function setupAvatarSelectors() {
  [1, 2].forEach(num => {
    const container = document.getElementById(`avatar-selection-${num}`);
    container.innerHTML = "";
    avatarOptions.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Avatar ${index + 1}`;
      img.className = "avatar-option";
      img.addEventListener("click", () => {
        container.querySelectorAll(".avatar-option").forEach(el => el.classList.remove("selected"));
        img.classList.add("selected");
        playerAvatars[num - 1] = src;
      });
      container.appendChild(img);
    });
  });
}

// Boutons
const startButtonPVP = document.getElementById("start-button-pvp");
const startButtonPVP2 = document.getElementById("start-button-pvp2");
const startButtonAi =document.getElementById("start-button-ai")

startButtonPVP.onclick = () => {
  welcomeScreen.style.display = "none";
  setupScreen.style.display = "block";
};

startButtonAi.addEventListener("click", function () {
    iaEnabled = true;
    document.getElementById("welcome-screen").style.display = "none";
    document.getElementById("player-setup").style.display = "block";
    document.getElementById("player2-setup").style.display = "none";
    document.getElementById("difficulty-container").style.display = "block";
});

startButtonPVP2.addEventListener("click", function () {
    const name1 = document.getElementById("player1-name").value.trim();
    const name2 = document.getElementById("player2-name").value.trim();
    const avatar1 = document.querySelector('#avatar-selection-1 .avatar-option.selected')?.src;
    const avatar2 = document.querySelector('#avatar-selection-2 .avatar-option.selected')?.src;

    playerNames = [name1 || "Joueur 1", name2 || "Joueur 2"];
    playerAvatars = [avatar1 || "😺", avatar2 || "😺"];

    if (iaEnabled) {
        playerAvatars[1] = iaAvatar
        playerNames[1] = iaName
        iaDifficulty = parseInt(document.getElementById("ai-difficulty").value);
    }

    lancerMusique();
    setupScreen.style.display = "none";
    quizSection.style.display = "block";
    quiz.style.display = "block";
    startQuiz();
});


function lancerMusique() {
  const audio = document.getElementById('audio');
  audio.play().catch(err => console.error("Erreur audio:", err));
}

// Chargement des questions JSON
fetch('questions.json')
  .then(res => res.json())
  .then(data => allQuestions = data)
  .catch(err => console.error("Erreur JSON:", err));

// Lancement du quiz
function startQuiz() {
  selectedQuestions = shuffleArray(allQuestions).slice(0, 10);
  scores = [0, 0];
  currentQuestion = 0;
  currentPlayer = 0;
  updateScore();
  showQuestion();
}

function showQuestion() {
  clearInterval(timerInterval);
  const q = selectedQuestions[currentQuestion];
  quiz.innerHTML = '';

  const questionTitle = document.createElement('h3');
  questionTitle.textContent = `${currentQuestion + 1}. ${q.enoncer}`;
  quiz.appendChild(questionTitle);

  const answersDiv = document.createElement('div');
  answersDiv.className = 'answers';
  const shuffled = shuffleArray(q.reponses.map((r, i) => ({ ...r, index: i })));

  shuffled.forEach(rep => {
    const label = document.createElement('label');
    label.className = 'answer-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = rep.index;
    label.appendChild(input);
    label.appendChild(document.createTextNode(rep.reponse));
    answersDiv.appendChild(label);
    answersDiv.appendChild(document.createElement('br'));
  });

  quiz.appendChild(answersDiv);
  const validateBtn = document.createElement('button');
  validateBtn.id = "next-btn";
  validateBtn.textContent = "Valider";
  quiz.appendChild(validateBtn);
  const explanation = document.createElement('div');
  explanation.className = 'explanation';
  quiz.appendChild(explanation);

  const validerReponse = () => {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) return alert("Choisissez une réponse !");
    clearInterval(timerInterval);
    const index = selected.value;
    const correct = q.reponses[index].vraifaux === true;
    scores[currentPlayer] += correct ? 1 : 0;

    document.querySelectorAll('.answer-option').forEach(label => {
      const inp = label.querySelector('input');
      const idx = inp.value;
      if (q.reponses[idx].vraifaux) label.classList.add('correct');
      if (inp.checked && !q.reponses[idx].vraifaux) label.classList.add('incorrect');
      inp.disabled = true;
    });

    explanation.textContent = q.explication || "";
    validateBtn.textContent = "Continuer";
    validateBtn.disabled = false;
    validateBtn.onclick = () => {
      currentPlayer = currentPlayer === 0 ? 1 : 0;
      currentQuestion++;
      updateScore();
            if (currentQuestion < selectedQuestions.length) {
                showQuestion();
            } else {
                showResults();
                    const audio = document.getElementById('audio');
                    audio.pause();
                    audio.currentTime = 0;
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
  };

  if (!(iaEnabled && currentPlayer === 1)) {
    validateBtn.disabled = false;
    setInteraction(true)
    validateBtn.onclick = validerReponse;
  } else {
    setInteraction(false)
    validateBtn.disabled = true;
    simulateIaTurn(q, validerReponse);
  }

  updatePlayerDisplay();
  startTimer();
}

function simulateIaTurn(questionData, validerReponse) {
  let delay = 2000;
  if (Math.random() < 0.2) {
    delay += Math.floor(Math.random() * 1500);
  }

  setTimeout(() => {
    const choices = document.querySelectorAll('input[name="answer"]');
    const correctIndex = questionData.reponses.findIndex(r => r.vraifaux);
    let selectedIndex;
    const rand = Math.random() * 100;
    const probas = [25, 50, 75, 90];
    if (rand <= probas[iaDifficulty - 1]) {
      selectedIndex = correctIndex;
    } else {
      const wrongs = questionData.reponses
        .map((r, i) => ({ ...r, i }))
        .filter(r => !r.vraifaux);
      const wrongRandom = wrongs[Math.floor(Math.random() * wrongs.length)];
      selectedIndex = wrongRandom.i;
    }

    choices.forEach(input => {
      if (parseInt(input.value) === selectedIndex) {
        input.checked = true;
      }
    });

    setTimeout(() => {
      validerReponse();
    }, 1500);
  }, delay);
}



function showAvatar(player) {
  const img = document.createElement('img');
  img.src = playerAvatars[player];
  img.alt = playerNames[player];
  img.className = 'avatar-option';
  return img;
}

function updatePlayerDisplay() {
  playerDisplay.innerHTML = '';
  if (playerAvatars[currentPlayer] === "😺") {
    playerDisplay.textContent = `😺 ${playerNames[currentPlayer]}`;
  } else {
    playerDisplay.appendChild(showAvatar(currentPlayer));
    playerDisplay.appendChild(document.createTextNode(' ' + playerNames[currentPlayer]));
  }
}

function updateScore() {
    scoreDisplay.innerHTML = ''; 
    if (playerAvatars[0] == "😺"){
        scoreDisplay.appendChild(document.createTextNode(`😺   ${playerNames[0]} : ${scores[0]}  |  `))
    }else{
        scoreDisplay.appendChild(showAvatar(0));
        scoreDisplay.appendChild(document.createTextNode(` ${playerNames[0]} : ${scores[0]}  |  `));
    }
    if (playerAvatars[1] == "😺"){
        scoreDisplay.appendChild(document.createTextNode(`😺   ${playerNames[1]} : ${scores[1]} `))
    }else{
        scoreDisplay.appendChild(showAvatar(1));
        scoreDisplay.appendChild(document.createTextNode(` ${playerNames[1]} : ${scores[1]}`));
    }
}

function showResults() {
  clearInterval(timerInterval);
  quiz.innerHTML = '';
  timerDisplay.textContent = '';
  scoreDisplay.textContent = '';
  playerDisplay.textContent = '';

  const img = document.createElement('img');
  img.src = "static/icegif-718.gif";
  img.alt = "GIF";
  img.className = "nyan";
  quiz.appendChild(img);

  const result = document.createElement('h2');
  if (scores[0] > scores[1]) result.textContent = `🏆 ${playerNames[0]} gagne !`;
  else if (scores[1] > scores[0]) result.textContent = `🏆 ${playerNames[1]} gagne !`;
  else result.textContent = "🤝 Match nul !";
  quiz.appendChild(result);

    // Conteneur d'affichage des joueurs
    const playersContainer = document.createElement('div');
    playersContainer.classList.add('players-result');

    [0, 1].forEach(player => {
        const playerBox = document.createElement('div');
        playerBox.classList.add('player-box');
       
        if (playerAvatars[player] == "😺"){
            const nameScore = document.createElement('p');
            nameScore.textContent = `😺 \n \n ${playerNames[player]} : ${scores[player]}`;
            playerBox.appendChild(nameScore);
        }else{
            const nameScore = document.createElement('p');
            nameScore.textContent = `${playerNames[player]} : ${scores[player]}`;
            const avatarImg = showAvatar(player)
            playerBox.appendChild(avatarImg);
            playerBox.appendChild(nameScore);
    }
        playersContainer.appendChild(playerBox);
    });

    quiz.appendChild(playersContainer);

  const replayBtn = document.createElement('button');
  replayBtn.className = "result-button";
  replayBtn.textContent = "🔄 Rejouer";
  replayBtn.onclick = () => {
    const mus = document.getElementById('nya');
    mus.pause();
    mus.currentTime = 0;
    lancerMusique();
    startQuiz();
  };

  const quitBtn = document.createElement('button');
  quitBtn.className = "result-button";
  quitBtn.textContent = "🏠 Quitter";
  quitBtn.onclick = () => {
    const mus = document.getElementById('nya');
    mus.pause();
    mus.currentTime = 0;
    quizSection.style.display = "none";
    welcomeScreen.style.display = "block";
    document.getElementById("player1-name").value = "";
    document.getElementById("player2-name").value = "";
  };

  quiz.appendChild(replayBtn);
  quiz.appendChild(quitBtn);

  const confettiScript = document.createElement('script');
  confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
  confettiScript.onload = () => lancerConfettisContinu();
  document.head.appendChild(confettiScript);

  function lancerConfettisContinu() {
    const end = Date.now() + 10000;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

function startTimer() {
  let time = questionTime;
  timerDisplay.textContent = `⏱ ${time}s`;
  timerInterval = setInterval(() => {
    time--;
    timerDisplay.textContent = `⏱ ${time}s`;
    if (time <= 0) {
      clearInterval(timerInterval);
      alert("Temps écoulé !");
      currentQuestion++;
      currentPlayer = currentPlayer === 0 ? 1 : 0;
      currentQuestion < selectedQuestions.length ? showQuestion() : showResults();
    }
  }, 1000);
}

function setInteraction(enabled) {
    const inputs = document.querySelectorAll('input, button');
    inputs.forEach(el => {
        // Ne pas désactiver la musique, etc., si besoin : ajuster si nécessaire
        if (el.id !== 'audio') el.disabled = !enabled;
    });
}

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}