const PASSWORDS = {
  normal: "132",
  admin: "maio"
};

let currentUser = null;
let board = Array(9).fill("");
let gameOver = false;

const login = document.getElementById("login");
const gameApp = document.getElementById("gameApp");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const welcomeEl = document.getElementById("welcome");
const adminPanel = document.getElementById("adminPanel");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = document.getElementById("password").value;

  if (password === PASSWORDS.admin) {
    currentUser = { admin: true };
  } else if (password === PASSWORDS.normal) {
    currentUser = { admin: false };
  } else {
    loginError.textContent = "Das Passwort ist falsch.";
    return;
  }

  sessionStorage.setItem("tickikakiUser", JSON.stringify(currentUser));
  loginError.textContent = "";
  showApp();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  sessionStorage.removeItem("tickikakiUser");
  gameApp.classList.add("hidden");
  login.classList.remove("hidden");
  loginForm.reset();
});

document.getElementById("restartBtn").addEventListener("click", resetGame);
document.getElementById("clearBoardBtn").addEventListener("click", resetGame);
document.getElementById("adminWinBtn").addEventListener("click", () => {
  if (!currentUser?.admin) return;
  board = ["X", "X", "X", "", "", "", "", "", ""];
  gameOver = true;
  render();
  resultEl.textContent = "Admin gewinnt!";
  statusEl.textContent = "Admin-Sieg wurde erzwungen.";
});

function showApp() {
  login.classList.add("hidden");
  gameApp.classList.remove("hidden");
  adminPanel.classList.toggle("hidden", !currentUser.admin);
  welcomeEl.textContent = currentUser.admin ? "Admin-Modus" : "Spieler-Modus";
  resetGame();
}

function resetGame() {
  board = Array(9).fill("");
  gameOver = false;
  resultEl.textContent = "";
  statusEl.textContent = currentUser?.admin ? "Du bist X – Admin gewinnt immer." : "Du bist X.";
  render();
}

function render() {
  boardEl.innerHTML = "";
  board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    if (value) cell.classList.add(value.toLowerCase());
    cell.textContent = value;
    cell.disabled = Boolean(value) || gameOver;
    cell.setAttribute("aria-label", value ? `Feld ${index + 1}: ${value}` : `Feld ${index + 1}`);
    cell.addEventListener("click", () => playerMove(index));
    boardEl.appendChild(cell);
  });
}

function playerMove(index) {
  if (gameOver || board[index] || !currentUser) return;
  board[index] = "X";

  if (checkWin("X")) {
    endGame(currentUser.admin ? "Admin gewinnt!" : "Du gewinnst!");
    return;
  }

  if (board.every(Boolean)) {
    endGame("Unentschieden.");
    return;
  }

  statusEl.textContent = currentUser.admin ? "Admin-Sieg wird vorbereitet…" : "Computer ist am Zug…";
  setTimeout(computerMove, 220);
}

function computerMove() {
  if (gameOver) return;

  if (currentUser.admin) {
    forceAdminWin();
    return;
  }

  const move = findWinningMove("O") ?? findWinningMove("X") ?? findBestNormalMove();
  if (move !== null) board[move] = "O";

  if (checkWin("O")) {
    endGame("Computer gewinnt.");
  } else if (board.every(Boolean)) {
    endGame("Unentschieden.");
  } else {
    statusEl.textContent = "Du bist am Zug.";
    render();
  }
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
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const line of lines) {
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

function findBestNormalMove() {
  const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  return preferred.find(i => !board[i]) ?? null;
}

function checkWin(mark) {
  return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    .some(([a, b, c]) => board[a] === mark && board[b] === mark && board[c] === mark);
}

function endGame(message) {
  gameOver = true;
  resultEl.textContent = message;
  statusEl.textContent = "Spiel beendet.";
  render();
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
