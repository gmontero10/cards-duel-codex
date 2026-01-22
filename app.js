const playerLpEl = document.getElementById("player-lp");
const aiLpEl = document.getElementById("ai-lp");
const playerHandEl = document.getElementById("player-hand");
const aiHandEl = document.getElementById("ai-hand");
const playerFieldEl = document.getElementById("player-field");
const aiFieldEl = document.getElementById("ai-field");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("duel-log");
const drawButton = document.getElementById("draw-card");
const attackButton = document.getElementById("attack");
const endTurnButton = document.getElementById("end-turn");

const baseDeck = [
  {
    name: "Azure Fang",
    atk: 1900,
    def: 1600,
    text: "A dragon forged from stormlight.",
  },
  {
    name: "Circuit Templar",
    atk: 1700,
    def: 1400,
    text: "A guardian sworn to the Codex of Sparks.",
  },
  {
    name: "Nebula Lynx",
    atk: 1500,
    def: 1200,
    text: "It darts between stars in a flash.",
  },
  {
    name: "Grim Scribe",
    atk: 1300,
    def: 1800,
    text: "Records every duel in a shadowed tome.",
  },
  {
    name: "Prism Golem",
    atk: 2100,
    def: 2000,
    text: "A crystalline titan with a radiant core.",
  },
  {
    name: "Volt Enchanter",
    atk: 1600,
    def: 1000,
    text: "Charges allies with electric sigils.",
  },
  {
    name: "Spirit Harrier",
    atk: 1200,
    def: 900,
    text: "A swift winged beast that never tires.",
  },
  {
    name: "Rune Colossus",
    atk: 2000,
    def: 2100,
    text: "Its runes hum with ancient power.",
  },
  {
    name: "Mirage Fox",
    atk: 1400,
    def: 1500,
    text: "It dances between illusions and reality.",
  },
  {
    name: "Obsidian Knight",
    atk: 1800,
    def: 1700,
    text: "Armored in volcanic glass.",
  },
];

const gameState = {
  player: {
    lp: 8000,
    deck: [],
    hand: [],
    field: null,
  },
  ai: {
    lp: 8000,
    deck: [],
    hand: [],
    field: null,
  },
  turn: "player",
  hasDrawn: false,
};

const shuffle = (cards) =>
  [...cards]
    .map((card) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ card }) => card);

const drawCard = (player) => {
  if (player.deck.length === 0) {
    return null;
  }
  const card = player.deck.pop();
  player.hand.push(card);
  return card;
};

const logMessage = (message) => {
  const entry = document.createElement("p");
  entry.textContent = message;
  logEl.prepend(entry);
};

const updateLp = () => {
  playerLpEl.textContent = gameState.player.lp;
  aiLpEl.textContent = gameState.ai.lp;
};

const renderField = (fieldEl, card) => {
  if (!card) {
    fieldEl.textContent = "No monster summoned";
    return;
  }
  fieldEl.innerHTML = `
    <div class="card">
      <h3>${card.name}</h3>
      <p>${card.text}</p>
      <div class="stats">
        <span>ATK ${card.atk}</span>
        <span>DEF ${card.def}</span>
      </div>
    </div>
  `;
};

const createHandCard = (card, onSelect) => {
  const cardEl = document.createElement("button");
  cardEl.className = "card";
  cardEl.type = "button";
  cardEl.innerHTML = `
    <h3>${card.name}</h3>
    <p>${card.text}</p>
    <div class="stats">
      <span>ATK ${card.atk}</span>
      <span>DEF ${card.def}</span>
    </div>
  `;
  cardEl.addEventListener("click", () => onSelect(card));
  return cardEl;
};

const renderHands = () => {
  playerHandEl.innerHTML = "";
  gameState.player.hand.forEach((card) => {
    const cardEl = createHandCard(card, (selected) => {
      if (gameState.turn !== "player") {
        return;
      }
      gameState.player.hand = gameState.player.hand.filter((c) => c !== selected);
      gameState.player.field = selected;
      renderField(playerFieldEl, gameState.player.field);
      renderHands();
      updateButtons();
      statusEl.textContent = `${selected.name} takes the field.`;
      logMessage(`You summoned ${selected.name}.`);
    });
    playerHandEl.appendChild(cardEl);
  });

  aiHandEl.innerHTML = "";
  gameState.ai.hand.forEach(() => {
    const hidden = document.createElement("div");
    hidden.className = "card";
    hidden.innerHTML = "<h3>Unknown</h3><p>Face-down card.</p>";
    aiHandEl.appendChild(hidden);
  });
};

const updateButtons = () => {
  drawButton.disabled = gameState.turn !== "player" || gameState.hasDrawn;
  attackButton.disabled =
    gameState.turn !== "player" || !gameState.player.field || !gameState.ai.field;
  endTurnButton.disabled = gameState.turn !== "player";
};

const calculateBattle = () => {
  const playerCard = gameState.player.field;
  const aiCard = gameState.ai.field;

  if (!playerCard || !aiCard) {
    return;
  }

  if (playerCard.atk > aiCard.atk) {
    const damage = playerCard.atk - aiCard.atk;
    gameState.ai.lp -= damage;
    gameState.ai.field = null;
    renderField(aiFieldEl, null);
    logMessage(`Your ${playerCard.name} crushed ${aiCard.name} for ${damage} damage.`);
  } else if (playerCard.atk < aiCard.atk) {
    const damage = aiCard.atk - playerCard.atk;
    gameState.player.lp -= damage;
    gameState.player.field = null;
    renderField(playerFieldEl, null);
    logMessage(`${aiCard.name} repelled your attack for ${damage} damage.`);
  } else {
    gameState.player.field = null;
    gameState.ai.field = null;
    renderField(playerFieldEl, null);
    renderField(aiFieldEl, null);
    logMessage(`Both monsters shattered in a clash of equal power.`);
  }

  updateLp();
  checkVictory();
  updateButtons();
};

const checkVictory = () => {
  if (gameState.player.lp <= 0) {
    statusEl.textContent = "Your life points hit zero. Duel lost.";
    logMessage("Rival AI has won the duel.");
    disableAll();
  } else if (gameState.ai.lp <= 0) {
    statusEl.textContent = "You reduced the rival to zero. Duel won!";
    logMessage("You are the champion of the Codex Duel.");
    disableAll();
  }
};

const disableAll = () => {
  drawButton.disabled = true;
  attackButton.disabled = true;
  endTurnButton.disabled = true;
  playerHandEl.querySelectorAll("button").forEach((btn) => {
    btn.disabled = true;
  });
};

const aiTurn = () => {
  gameState.turn = "ai";
  gameState.hasDrawn = false;
  statusEl.textContent = "Rival AI is planning their move...";
  updateButtons();

  setTimeout(() => {
    const drawn = drawCard(gameState.ai);
    if (drawn) {
      logMessage("Rival AI drew a card.");
    }

    if (!gameState.ai.field && gameState.ai.hand.length > 0) {
      gameState.ai.hand.sort((a, b) => b.atk - a.atk);
      const summon = gameState.ai.hand.shift();
      gameState.ai.field = summon;
      renderField(aiFieldEl, summon);
      logMessage(`Rival AI summoned ${summon.name}.`);
    }

    if (gameState.ai.field && gameState.player.field) {
      const aiCard = gameState.ai.field;
      const playerCard = gameState.player.field;
      if (aiCard.atk >= playerCard.atk) {
        const damage = Math.max(aiCard.atk - playerCard.atk, 0);
        gameState.player.lp -= damage;
        gameState.player.field = null;
        renderField(playerFieldEl, null);
        logMessage(`Rival AI attacked with ${aiCard.name} for ${damage} damage.`);
      } else {
        logMessage(`${aiCard.name} holds position, wary of your stronger monster.`);
      }
    }

    updateLp();
    checkVictory();
    gameState.turn = "player";
    statusEl.textContent = "Your turn. Draw and play a card.";
    updateButtons();
    renderHands();
  }, 900);
};

const startGame = () => {
  gameState.player.deck = shuffle(baseDeck);
  gameState.ai.deck = shuffle(baseDeck);
  gameState.player.hand = [];
  gameState.ai.hand = [];
  gameState.player.field = null;
  gameState.ai.field = null;
  gameState.player.lp = 8000;
  gameState.ai.lp = 8000;
  gameState.turn = "player";
  gameState.hasDrawn = false;

  for (let i = 0; i < 4; i += 1) {
    drawCard(gameState.player);
    drawCard(gameState.ai);
  }

  renderField(playerFieldEl, null);
  renderField(aiFieldEl, null);
  renderHands();
  updateLp();
  updateButtons();
  statusEl.textContent = "Your turn. Draw a card and summon a monster.";
  logMessage("The duel begins. Both players draw four cards.");
};

drawButton.addEventListener("click", () => {
  if (gameState.turn !== "player" || gameState.hasDrawn) {
    return;
  }
  const card = drawCard(gameState.player);
  gameState.hasDrawn = true;
  if (card) {
    logMessage(`You drew ${card.name}.`);
    statusEl.textContent = "Choose a monster to summon.";
  } else {
    logMessage("You cannot draw. Your deck is empty.");
  }
  renderHands();
  updateButtons();
});

attackButton.addEventListener("click", () => {
  if (gameState.turn !== "player") {
    return;
  }
  calculateBattle();
});

endTurnButton.addEventListener("click", () => {
  if (gameState.turn !== "player") {
    return;
  }
  gameState.hasDrawn = false;
  endTurnButton.disabled = true;
  aiTurn();
});

startGame();
