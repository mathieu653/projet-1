const gameArea = document.getElementById('gameArea');
const startBtn = document.getElementById('startBtn');
const durationSelect = document.getElementById('durationSelect');
const status = document.getElementById('status');
const highScoresList = document.getElementById('highScoresList');
const themeBtn = document.getElementById('themeBtn');
const colorsBtn = document.getElementById('colorsBtn');
const emojisBtn = document.getElementById('emojisBtn');
const goldDisplay = document.getElementById('goldDisplay');
const colorsModal = document.getElementById('colorsModal');
const emojisModal = document.getElementById('emojisModal');
const colorItemsContainer = document.getElementById('colorItems');
const emojiItemsContainer = document.getElementById('emojiItems');
const closeColorsBtn = document.getElementById('closeColors');
const closeEmojisBtn = document.getElementById('closeEmojis');

let gameDuration = 20; // secondes
let gameActive = false;
let currentTargetAppearTime = 0;
let timeoutId = null;
let reactionTimes = [];

// Gold, couleurs et émojis
let gold = 0;
let selectedColor = 'skin-1';
let selectedEmoji = '';
let ownedColors = [];
let ownedEmojis = [];

// Catalogue de couleurs
const colors = [
  { id: 'skin-1', price: 0, desc: 'Bleu classique' },
  { id: 'skin-2', price: 20, desc: 'Rouge vif' },
  { id: 'skin-3', price: 30, desc: 'Vert carré' },
  { id: 'skin-4', price: 40, desc: 'Jaune dégradé' },
  { id: 'skin-5', price: 50, desc: 'Violet carré' },
  { id: 'skin-6', price: 60, desc: 'Orange dégradé' },
  { id: 'skin-7', price: 70, desc: 'Rose classique' },
  { id: 'skin-8', price: 80, desc: 'Cyan dégradé' },
  { id: 'skin-9', price: 90, desc: 'Gris carré' },
  { id: 'skin-10', price: 100, desc: 'Noir dégradé' },
];


// Catalogue d'émojis
const emojis = [
  { id: 'emoji-1', emoji: '😀', price: 0, desc: 'Sourire' },
  { id: 'emoji-2', emoji: '🎯', price: 25, desc: 'Cible' },
  { id: 'emoji-3', emoji: '👾', price: 35, desc: 'Alien' },
  { id: 'emoji-4', emoji: '🚀', price: 45, desc: 'Fusée' },
  { id: 'emoji-5', emoji: '💰', price: 55, desc: 'Argent' },
  { id: 'emoji-6', emoji: '🔥', price: 65, desc: 'Feu' },
  { id: 'emoji-7', emoji: '🌟', price: 75, desc: 'Étoile' },
  { id: 'emoji-8', emoji: '⚡️', price: 85, desc: 'Éclair' },
  { id: 'emoji-9', emoji: '🕹️', price: 95, desc: 'Joystick' },
  { id: 'emoji-10', emoji: '🎉', price: 105, desc: 'Confettis' },
];


function applyGameAreaSize(size) {
  const gameArea = document.getElementById("gameArea");
  gameArea.classList.remove("small", "medium", "large");
  gameArea.classList.add(size);
}

document.getElementById("sizeSelect").addEventListener("change", (e) => {
  const selectedSize = e.target.value;
  applyGameAreaSize(selectedSize);
});

window.addEventListener("DOMContentLoaded", () => {
  const defaultSize = document.getElementById("sizeSelect").value;
  applyGameAreaSize(defaultSize);
});

function moveTargetRandomly() {
  const gameArea = document.getElementById("gameArea");
  const btn = document.getElementById("targetBtn");

  const maxX = gameArea.clientWidth - btn.offsetWidth;
  const maxY = gameArea.clientHeight - btn.offsetHeight;

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
}


// Chargement des données
function loadData() {
  gold = parseInt(localStorage.getItem('gold') || '0');
  ownedColors = JSON.parse(localStorage.getItem('ownedColors') || '["skin-1"]');
  ownedEmojis = JSON.parse(localStorage.getItem('ownedEmojis') || '["emoji-1"]');
  selectedColor = localStorage.getItem('selectedColor') || 'skin-1';
  selectedEmoji = localStorage.getItem('selectedEmoji') || 'emoji-1';
  updateGoldDisplay();
}

// Sauvegarde des données
function saveData() {
  localStorage.setItem('gold', gold);
  localStorage.setItem('ownedColors', JSON.stringify(ownedColors));
  localStorage.setItem('ownedEmojis', JSON.stringify(ownedEmojis));
  localStorage.setItem('selectedColor', selectedColor);
  localStorage.setItem('selectedEmoji', selectedEmoji);
}

// Mise à jour affichage gold
function updateGoldDisplay() {
  goldDisplay.textContent = `⛀ Gold: ${gold}`;
}

// Création bouton cible
function createTargetBtn() {
  const btn = document.createElement('button');
  btn.id = 'targetBtn';
  btn.className = selectedColor;
  btn.title = "Clique moi vite !";
  
  // Ajout de l'emoji si sélectionné
  if (selectedEmoji) {
    const emoji = emojis.find(e => e.id === selectedEmoji)?.emoji || '';
    btn.innerText = emoji;
  }
  
  btn.addEventListener('click', () => {
    if (!gameActive) return;
    const now = performance.now();
    const reactionTime = now - currentTargetAppearTime;
    reactionTimes.push(reactionTime);

    gold++;
    updateGoldDisplay();
    saveData();

    spawnTarget();

    updateStatus(`Réaction : ${reactionTime.toFixed(0)} ms | Gold +1`);
  });
  return btn;
}

// Apparition aléatoire
function spawnTarget() {
  if (!gameActive) return;
  if (timeoutId) clearTimeout(timeoutId);
  gameArea.innerHTML = '';
  const btn = createTargetBtn();
  const maxX = gameArea.clientWidth - 70;
  const maxY = gameArea.clientHeight - 70;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
  gameArea.appendChild(btn);
  currentTargetAppearTime = performance.now();

  // Timeout pour changer position si pas cliqué
  timeoutId = setTimeout(() => {
    updateStatus('Trop lent !');
    spawnTarget();
  }, 1500);
}

// Démarrer partie
function startGame() {
  if (gameActive) return;
  reactionTimes = [];
  gold = parseInt(localStorage.getItem('gold') || '0');
  updateGoldDisplay();
  gameDuration = parseInt(durationSelect.value);
  gameActive = true;
  updateStatus(`Jeu démarré: ${gameDuration}s, clique vite sur le bouton bleu !`);
  spawnTarget();

  // Timer fin de jeu
  setTimeout(() => {
    endGame();
  }, gameDuration * 1000);
}

// Fin de partie
function endGame() {
  gameActive = false;
  gameArea.innerHTML = '';
  if (reactionTimes.length === 0) {
    updateStatus("Aucun clic détecté. Essaie encore !");
    return;
  }
  const avgTime = reactionTimes.reduce((a,b) => a+b,0) / reactionTimes.length;
  updateStatus(`Jeu terminé! Score: ${reactionTimes.length} clics, moyenne ${avgTime.toFixed(0)} ms`);

  // Sauvegarder score
  saveScore(avgTime);
}

// Status affichage
function updateStatus(msg) {
  status.textContent = msg;
}

// Scores
function saveScore(avgTime) {
  let scores = JSON.parse(localStorage.getItem('reactionScores') || '[]');
  scores.push(avgTime);
  scores.sort((a,b) => a-b); // plus petit temps mieux
  scores = scores.slice(0,5);
  localStorage.setItem('reactionScores', JSON.stringify(scores));
  updateScoresList();
}
function updateScoresList() {
  const scores = JSON.parse(localStorage.getItem('reactionScores') || '[]');
  highScoresList.innerHTML = '';
  if(scores.length === 0){
    highScoresList.innerHTML = '<li>Aucun score enregistré.</li>';
    return;
  }
  scores.forEach(score => {
    const li = document.createElement('li');
    li.textContent = `${score.toFixed(0)} ms`;
    highScoresList.appendChild(li);
  });
}

// Thème
function toggleTheme() {
  document.body.classList.toggle('light');
  // Ajuster modaux aussi
  if(document.body.classList.contains('light')) {
    colorsModal.classList.add('light');
    emojisModal.classList.add('light');
  } else {
    colorsModal.classList.remove('light');
    emojisModal.classList.remove('light');
  }
}

// Gestion des modaux
function openColorsModal() {
  colorsModal.style.display = 'flex';
  renderColorItems();

  // Ajuster le thème
  if(document.body.classList.contains('light')) {
    colorsModal.classList.add('light');
  } else {
    colorsModal.classList.remove('light');
  }
}

function openEmojisModal() {
  emojisModal.style.display = 'flex';
  renderEmojiItems();

  // Ajuster le thème
  if(document.body.classList.contains('light')) {
    emojisModal.classList.add('light');
  } else {
    emojisModal.classList.remove('light');
  }
}

function closeColorsModal() {
  colorsModal.style.display = 'none';
}

function closeEmojisModal() {
  emojisModal.style.display = 'none';
}

// Rendu des items dans les modaux
function renderColorItems() {
  colorItemsContainer.innerHTML = '';
  colors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'colorItem ' + color.id;
    div.dataset.price = color.price;
    div.title = `${color.desc}`;

    if (!ownedColors.includes(color.id)) {
      div.classList.add('locked');
    }
    if (color.id === selectedColor) {
      div.classList.add('selected');
    }

    // Label sous la couleur
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.bottom = '-18px';
    label.style.width = '100%';
    label.style.textAlign = 'center';
    label.style.fontSize = '0.75rem';
    label.style.color = '#f39c12';
    label.style.userSelect = 'none';

    if (ownedColors.includes(color.id)) {
      if (color.id === selectedColor) {
        label.textContent = 'Équipé';
      } else {
        label.textContent = 'Équiper';
      }
    } else {
      label.textContent = `${color.price} ⛀`;
    }
    div.appendChild(label);

    div.addEventListener('click', () => {
      if (ownedColors.includes(color.id)) {
        // Équiper couleur
        selectedColor = color.id;
        saveData();
        applyColorAndEmoji();
        renderColorItems();
      } else {
        // Acheter si possible
        if (gold >= color.price) {
          gold -= color.price;
          ownedColors.push(color.id);
          selectedColor = color.id;
          saveData();
          updateGoldDisplay();
          applyColorAndEmoji();
          renderColorItems();
        } else {
          alert("Pas assez de gold pour acheter cette couleur.");
        }
      }
    });

    colorItemsContainer.appendChild(div);
  });
}

function renderEmojiItems() {
  emojiItemsContainer.innerHTML = '';
  emojis.forEach(emoji => {
    const div = document.createElement('div');
    div.className = 'emojiItem';
    div.dataset.price = emoji.price;
    div.title = `${emoji.desc}`;
    div.innerHTML = emoji.emoji;

    if (!ownedEmojis.includes(emoji.id)) {
      div.classList.add('locked');
    }
    if (emoji.id === selectedEmoji) {
      div.classList.add('selected');
    }

    // Label sous l'emoji
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.bottom = '-18px';
    label.style.width = '100%';
    label.style.textAlign = 'center';
    label.style.fontSize = '0.75rem';
    label.style.color = '#f39c12';
    label.style.userSelect = 'none';

    if (ownedEmojis.includes(emoji.id)) {
      if (emoji.id === selectedEmoji) {
        label.textContent = 'Équipé';
      } else {
        label.textContent = 'Équiper';
      }
    } else {
      label.textContent = `${emoji.price} ⛀`;
    }
    div.appendChild(label);

    div.addEventListener('click', () => {
      if (ownedEmojis.includes(emoji.id)) {
        // Équiper emoji
        selectedEmoji = emoji.id;
        saveData();
        applyColorAndEmoji();
        renderEmojiItems();
      } else {
        // Acheter si possible
        if (gold >= emoji.price) {
          gold -= emoji.price;
          ownedEmojis.push(emoji.id);
          selectedEmoji = emoji.id;
          saveData();
          updateGoldDisplay();
          applyColorAndEmoji();
          renderEmojiItems();
        } else {
          alert("Pas assez de gold pour acheter cet emoji.");
        }
      }
    });

    emojiItemsContainer.appendChild(div);
  });
}

// Application des couleurs et émojis
function applyColorAndEmoji() {
  const btn = document.getElementById('targetBtn');
  if (!btn) return;

  // Appliquer la couleur
  const allColorClasses = colors.map(c => c.id);
  allColorClasses.forEach(colorClass => btn.classList.remove(colorClass));
  btn.classList.add(selectedColor);

  // Appliquer l'emoji
  const emoji = emojis.find(e => e.id === selectedEmoji)?.emoji || '';
  btn.innerText = emoji;
}

// Événements
startBtn.addEventListener('click', startGame);
themeBtn.addEventListener('click', toggleTheme);
colorsBtn.addEventListener('click', openColorsModal);
emojisBtn.addEventListener('click', openEmojisModal);
closeColorsBtn.addEventListener('click', closeColorsModal);
closeEmojisBtn.addEventListener('click', closeEmojisModal);

// Init
loadData();
updateScoresList();
toggleTheme(); // pour initialiser les modales thème
