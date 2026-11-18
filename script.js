const PASSWORDS = { normal: "132", admin: "maio" };

let currentUser = null;
let board = Array(9).fill("");
let gameOver = false;
let mode = "ai";
let difficulty = "medium";
let myMark = "X";
let peer = null;
let connection = null;
let isHost = false;

const login = document.getElementById("login");
const gameApp = document.getElementById("gameApp");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const welcomeEl = document.getElementById("welcome");
const adminPanel = document.getElementById("adminPanel");
const aiSettings = document.getElementById("aiSettings");
const friendSettings = document.getElementById("friendSettings");
const difficultyEl = document.getElementById("difficulty");
const connectionStatus = document.getElementById("connectionStatus");
const roomCodeBox = document.getElementById("roomCodeBox");
const roomCodeEl = document.getElementById("roomCode");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = document.getElementById("password").value;

  if (password === PASSWORDS.admin) currentUser = { admin: true };
  else if (password === PASSWORDS.normal) currentUser = { admin: false };
  else {
    loginError.textContent = "Das Passwort ist falsch.";
    return;
  }

  sessionStorage.setItem("tickikakiUser", JSON.stringify(currentUser));
  loginError.textContent = "";
  showApp();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  closeConnection();
  currentUser = null;
  sessionStorage.removeItem("tickikakiUser");
  gameApp.classList.add("hidden");
  login.classList.remove("hidden");
  loginForm.reset();
});

document.getElementById("aiModeBtn").addEventListener("click", () => setMode("ai"));
document.getElementById("friendModeBtn").addEventListener("click", () => setMode("friend"));
difficultyEl.addEventListener("change", () => {
  difficulty = difficultyEl.value;
  resetGame();
});
document.getElementById("restartBtn").addEventListener("click", resetGame);
document.getElementById("clearBoardBtn").addEventListener("click", resetGame);

document.getElementById("adminWinBtn").addEventListener("click", () => {
  if (!currentUser?.admin || mode !== "ai") return;
  board = ["X", "X", "X", "", "", "", "", "", ""];
  gameOver = true;
  render();
  resultEl.textContent = "Admin gewinnt!";
  statusEl.textContent = "Admin-Sieg wurde erzwungen.";
});

document.getElementById("createRoomBtn").addEventListener("click", createRoom);
document.getElementById("joinRoomBtn").addEventListener("click", joinRoom);

document.getElementById("copyRoomBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(roomCodeEl.textContent);
    connectionStatus.textContent = "Raum-Code kopiert.";
  } catch {
    connectionStatus.textContent = "Kopieren nicht möglich – Code manuell teilen.";
  }
});

function showApp() {
  login.classList.add("hidden");
  gameApp.classList.remove("hidden");
  adminPanel.classList.toggle("hidden", !currentUser.admin);
  welcomeEl.textContent = currentUser.admin ? "Admin-Modus" : "Spieler-Modus";
  setMode("ai");
}

function setMode(nextMode) {
  if (nextMode === "ai") closeConnection();

  mode = nextMode;
  document.getElementById("aiModeBtn").classList.toggle("secondary", mode !== "ai");
  document.getElementById("friendModeBtn").classList.toggle("secondary", mode !== "friend");
  aiSettings.classList.toggle("hidden", mode !== "ai");
  friendSettings.classList.toggle("hidden", mode !== "friend");

  if (mode === "ai") {
    myMark = "X";
    resetGame();
  } else {
    myMark = "X";
    board = Array(9).fill("");
    gameOver = true;
    resultEl.textContent = "";
    statusEl.textContent = "Erstelle ein Spiel oder tritt einem Raum bei.";
    render();
  }
}

function resetGame() {
  board = Array(9).fill("");
  gameOver = false;
  resultEl.textContent = "";

  if (mode === "ai") {
    statusEl.textContent = currentUser?.admin
      ? "Du bist X – Admin gewinnt immer."
      : "Du bist X.";
  } else {
    if (!connection) {
      gameOver = true;
      statusEl.textContent = "Noch nicht verbunden.";
    } else {
      statusEl.textContent = myMark === "X" ? "Du bist X." : "Du bist O.";
      sendState();
    }
  }

  render();
}

function render() {
  boardEl.innerHTML = "";

  board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    if (value) cell.classList.add(value.toLowerCase());
    cell.textContent = value;

    let myTurn = false;
    if (mode === "ai") {
      myTurn = !gameOver && myMark === "X";
    } else if (connection) {
      const xCount = countMarks("X");
      const oCount = countMarks("O");
      myTurn = !gameOver && ((myMark === "X" && xCount === oCount) || (myMark === "O" && xCount > oCount));
    }

    cell.disabled = Boolean(value) || !myTurn;
    cell.setAttribute("aria-label", value ? `Feld ${index + 1}: ${value}` : `Feld ${index + 1}`);
    cell.addEventListener("click", () => playerMove(index));
    boardEl.appendChild(cell);
  });
}

function playerMove(index) {
  if (gameOver || board[index] || !currentUser) return;

  if (mode === "friend") {
    if (!connection) return;

    const xCount = countMarks("X");
    const oCount = countMarks("O");
    const myTurn = (myMark === "X" && xCount === oCount) || (myMark === "O" && xCount > oCount);
    if (!myTurn) return;

    board[index] = myMark;
    sendMove(index, myMark);
    finishFriendTurn(myMark);
    return;
  }

  board[index] = "X";

  if (checkWin("X")) {
    endGame(currentUser.admin ? "Admin gewinnt!" : "Du gewinnst!");
    return;
  }

  if (board.every(Boolean)) {
    endGame("Unentschieden.");
    return;
  }

  statusEl.textContent = "Computer ist am Zug…";
  render();
  setTimeout(computerMove, 220);
}

function finishFriendTurn(mark) {
  if (checkWin(mark)) {
    gameOver = true;
    resultEl.textContent = mark === myMark ? "Du gewinnst!" : "Dein Freund gewinnt!";
    statusEl.textContent = "Spiel beendet.";
  } else if (board.every(Boolean)) {
    gameOver = true;
    resultEl.textContent = "Unentschieden.";
    statusEl.textContent = "Spiel beendet.";
  } else {
    statusEl.textContent = mark === myMark ? "Warte auf deinen Freund…" : "Du bist am Zug.";
  }

  render();
}

function computerMove() {
  if (gameOver || mode !== "ai") return;

  if (currentUser.admin) {
    forceAdminWin();
    return;
  }

  let move;
  if (difficulty === "easy") {
    move = randomMove();
  } else if (difficulty === "medium") {
    move = findWinningMove("O")
      ?? findWinningMove("X")
      ?? (Math.random() < 0.65 ? findBestNormalMove() : randomMove());
  } else {
    move = minimax(board, "O").index;
  }

  if (move !== null && move !== undefined) board[move] = "O";

  if (checkWin("O")) {
    endGame("Computer gewinnt.");
  } else if (board.every(Boolean)) {
    endGame("Unentschieden.");
  } else {
    statusEl.textContent = "Du bist am Zug.";
    render();
  }
}

function randomMove() {
  const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
}

function findBestNormalMove() {
  const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  return preferred.find(i => !board[i]) ?? null;
}

function findWinningMove(mark) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  for (const [a, b, c] of lines) {
    const values = [board[a], board[b], board[c]];
    if (values.filter(v => v === mark).length === 2 && values.includes("")) {
      return [a, b, c][values.indexOf("")];
    }
  }

  return null;
}

function minimax(state, player) {
  const available = state.map((v, i) => v ? null : i).filter(i => i !== null);

  if (winner(state, "O")) return { score: 10 };
  if (winner(state, "X")) return { score: -10 };
  if (!available.length) return { score: 0 };

  const moves = [];

  for (const index of available) {
    const next = state.slice();
    next[index] = player;
    const result = minimax(next, player === "O" ? "X" : "O");
    moves.push({ index, score: result.score });
  }

  if (player === "O") {
    return moves.reduce((best, move) => move.score > best.score ? move : best, { score: -Infinity });
  }

  return moves.reduce((best, move) => move.score < best.score ? move : best, { score: Infinity });
}

function winner(state, mark) {
  return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    .some(([a, b, c]) => state[a] === mark && state[b] === mark && state[c] === mark);
}

function checkWin(mark) {
  return winner(board, mark);
}

function forceAdminWin() {
  const winningMove = findWinningMove("X");

  if (winningMove !== null) {
    board[winningMove] = "X";
  } else {
    const empty = board.findIndex(v => !v);
    if (empty !== -1) board[empty] = "X";
  }

  if (!checkWin("X")) {
    for (const line of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]) {
      const free = line.find(i => !board[i]);
      if (free !== undefined) {
        board[free] = "X";
        break;
      }
    }
  }

  gameOver = true;
  resultEl.textContent = "Admin gewinnt!";
  statusEl.textContent = "Admin-Sieg wurde erzwungen.";
  render();
}

function endGame(message) {
  gameOver = true;
  resultEl.textContent = message;
  statusEl.textContent = "Spiel beendet.";
  render();
}

function countMarks(mark) {
  return board.filter(v => v === mark).length;
}

function createRoom() {
  closeConnection();
  isHost = true;
  myMark = "X";

  const code = "TK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  peer = new Peer(code);

  peer.on("open", id => {
    roomCodeEl.textContent = id;
    roomCodeBox.classList.remove("hidden");
    connectionStatus.textContent = "Raum erstellt. Teile den Code mit deinem Freund.";
    board = Array(9).fill("");
    gameOver = true;
    render();
  });

  peer.on("connection", conn => setupConnection(conn));
  peer.on("error", err => {
    connectionStatus.textContent =
      err.type === "unavailable-id"
        ? "Raum-Code bereits vergeben. Bitte neu erstellen."
        : "Verbindungsfehler: " + err.message;
  });
}

function joinRoom() {
  const code = document.getElementById("roomCodeInput").value.trim().toUpperCase();
  if (!code) {
    connectionStatus.textContent = "Bitte einen Raum-Code eingeben.";
    return;
  }

  closeConnection();
  isHost = false;
  myMark = "O";
  peer = new Peer();

  peer.on("open", () => {
    connection = peer.connect(code, { reliable: true });
    setupConnection(connection);
  });

  peer.on("error", err => {
    connectionStatus.textContent = "Verbindung fehlgeschlagen: " + err.message;
  });
}

function setupConnection(conn) {
  connection = conn;

  connection.on("open", () => {
    connectionStatus.textContent = isHost ? "Freund verbunden. Du bist X." : "Verbunden. Du bist O.";
    board = Array(9).fill("");
    gameOver = false;
    statusEl.textContent = isHost ? "Du bist X. Du bist am Zug." : "Du bist O. Warte auf X.";
    render();

    if (isHost) sendState();
  });

  connection.on("data", data => {
    if (!data) return;

    if (data.type === "move") {
      receiveMove(data);
    } else if (data.type === "restart") {
      board = Array(9).fill("");
      gameOver = false;
      resultEl.textContent = "";
      statusEl.textContent = myMark === "X" ? "Du bist X. Du bist am Zug." : "Du bist O. Warte auf X.";
      render();
    } else if (data.type === "state") {
      board = Array.isArray(data.board) ? data.board.slice(0, 9) : Array(9).fill("");
      gameOver = Boolean(data.gameOver);
      resultEl.textContent = gameOver ? (winner(board, myMark) ? "Du gewinnst!" : "Dein Freund gewinnt!") : "";
      statusEl.textContent = gameOver ? "Spiel beendet." : (myMark === "X" && countMarks("X") === countMarks("O") ? "Du bist am Zug." : myMark === "O" && countMarks("X") > countMarks("O") ? "Du bist am Zug." : "Warte auf deinen Freund…");
      render();
    }
  });

  connection.on("close", () => {
    connectionStatus.textContent = "Verbindung beendet.";
    gameOver = true;
    statusEl.textContent = "Dein Freund hat die Verbindung beendet.";
    render();
  });

  connection.on("error", () => {
    connectionStatus.textContent = "Fehler bei der Verbindung.";
  });
}

function receiveMove(data) {
  const expectedMark = myMark === "X" ? "O" : "X";
  const xCount = countMarks("X");
  const oCount = countMarks("O");
  const expectedTurn = expectedMark === "X" ? xCount === oCount : xCount > oCount;

  if (gameOver || data.mark !== expectedMark || !Number.isInteger(data.index) || board[data.index] || !expectedTurn) return;

  board[data.index] = data.mark;
  finishFriendTurn(data.mark);
}

function sendMove(index, mark) {
  if (connection?.open) {
    connection.send({ type: "move", index, mark });
  }
}

function sendState() {
  if (connection?.open) {
    connection.send({ type: "state", board, gameOver });
  }
}

function closeConnection() {
  if (connection) {
    try { connection.close(); } catch {}
  }
  if (peer) {
    try { peer.destroy(); } catch {}
  }

  connection = null;
  peer = null;
  roomCodeBox.classList.add("hidden");
  connectionStatus.textContent = "Erstelle ein Spiel oder tritt einem Spiel bei.";
}

const saved = sessionStorage.getItem("tickikakiUser");

if (saved) {
  try {
    currentUser = JSON.parse(saved);
    showApp();
  } catch {
    sessionStorage.removeItem("tickikakiUser");
  }
}
