(function () {
  const MIN_PLAYERS = 2;
  const SCREENS = ['setup', 'handoff', 'vote', 'results'];
  const VERDICTS = {
    empty: 'Nadie votó un número. Hablen de la historia y vuelvan a votar.',
    consensus: 'Hay consenso. Pueden usar este valor.',
    dispersed: 'Los votos están muy separados. Quien votó más bajo y quien votó más alto explican su razonamiento y se vota de nuevo.',
    mixed: 'Hay diferencias pequeñas. Decidan si discuten o se quedan con la mediana.',
  };

  const $ = (id) => document.getElementById(id);
  const screens = Object.fromEntries(SCREENS.map((name) => [name, $('screen-' + name)]));

  const STORAGE_KEY = 'poker.players';

  const state = { players: loadPlayers(), votes: [], turn: 0 };

  // localStorage puede no existir o fallar (modo privado, cuota): la app sigue funcionando sin él.
  function loadPlayers() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(saved)) return [];
      return saved.filter((n) => typeof n === 'string' && n.trim()).map((n) => n.trim().slice(0, 24));
    } catch (e) {
      return [];
    }
  }

  function savePlayers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.players));
    } catch (e) { /* sin persistencia */ }
  }

  function show(name) {
    for (const key of SCREENS) screens[key].hidden = key !== name;
  }

  function fmt(n) {
    return n === null ? '–' : String(Math.round(n * 10) / 10);
  }

  // Configuración

  function renderPlayers() {
    const list = $('player-list');
    list.replaceChildren(...state.players.map((name, i) => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Quitar a ' + name);
      remove.addEventListener('click', () => {
        state.players.splice(i, 1);
        savePlayers();
        renderPlayers();
        $('player-name').focus();
      });
      li.append(label, remove);
      return li;
    }));
    const ready = state.players.length >= MIN_PLAYERS;
    $('start-btn').disabled = !ready;
    $('setup-hint').hidden = ready;
  }

  function addPlayer(event) {
    event.preventDefault();
    const input = $('player-name');
    const name = input.value.trim();
    input.value = '';
    input.focus();
    if (!name || state.players.includes(name)) return;
    state.players.push(name);
    savePlayers();
    renderPlayers();
  }

  // Ronda

  function startRound() {
    state.votes = [];
    state.turn = 0;
    showHandoff();
  }

  function showHandoff() {
    $('handoff-name').textContent = state.players[state.turn];
    show('handoff');
    $('handoff-btn').focus();
  }

  function showVote() {
    $('voter-name').textContent = state.players[state.turn];
    $('vote-progress').textContent = 'Voto ' + (state.turn + 1) + ' de ' + state.players.length;
    show('vote');
    $('deck').querySelector('.card').focus();
  }

  function castVote(card) {
    state.votes[state.turn] = card;
    state.turn++;
    if (state.turn < state.players.length) showHandoff();
    else showResults();
  }

  function showResults() {
    $('reveal-hint').hidden = false;
    $('reveal-btn').hidden = false;
    $('results-body').hidden = true;
    show('results');
    $('reveal-btn').focus();
  }

  function reveal() {
    const summary = Poker.summarize(state.votes);
    $('vote-list').replaceChildren(...state.players.map((name, i) => {
      const li = document.createElement('li');
      const card = document.createElement('span');
      card.className = 'mini-card';
      card.textContent = state.votes[i];
      li.append(card, name);
      return li;
    }));
    $('stat-average').textContent = fmt(summary.average);
    $('stat-median').textContent = fmt(summary.median);
    $('stat-mode').textContent = summary.modes.length ? summary.modes.join(', ') : '–';
    $('stat-min').textContent = fmt(summary.min);
    $('stat-max').textContent = fmt(summary.max);
    $('verdict').textContent = VERDICTS[summary.status];
    $('reveal-hint').hidden = true;
    $('reveal-btn').hidden = true;
    $('results-body').hidden = false;
    $('new-round-btn').focus();
  }

  $('setup-form').addEventListener('submit', addPlayer);
  $('start-btn').addEventListener('click', startRound);
  $('handoff-btn').addEventListener('click', showVote);
  $('deck').addEventListener('click', (event) => {
    const card = event.target.closest('[data-card]');
    if (card) castVote(card.dataset.card);
  });
  // Atajos: 1-9 y 0 eligen la carta por posición; las flechas mueven el foco entre cartas.
  document.addEventListener('keydown', (event) => {
    if (screens.vote.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
    const cards = [...$('deck').querySelectorAll('[data-card]')];
    const digit = /^[0-9]$/.test(event.key) ? (Number(event.key) + 9) % 10 : -1;
    if (digit >= 0 && cards[digit]) {
      event.preventDefault();
      castVote(cards[digit].dataset.card);
      return;
    }
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const at = cards.indexOf(document.activeElement);
    cards[(at + step + cards.length) % cards.length].focus();
  });
  $('reveal-btn').addEventListener('click', reveal);
  $('new-round-btn').addEventListener('click', startRound);
  $('edit-players-btn').addEventListener('click', () => {
    show('setup');
    $('player-name').focus();
  });

  renderPlayers();
  show('setup');
})();
