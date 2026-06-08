import { data } from "./data2.js";

let mode = data.hard;
let letters = [];
let cursorIndex = 0;
let totalKeystrokes = 0;
let mistakeCount = 0;
let currentLineOffset = 0;
let lastWordOffset = 0;
let personalBest;

let isGameStarted = false;
let timeElapsed = 0;
let timerId = null;
let gameDuration = 60;
document.getElementById("hard").classList.add("active");
document.querySelector(`[data-value="60"]`).classList.add("active");
const modeButtons = document.querySelectorAll(".timed-mode");
const difficultyButtons = document.querySelectorAll(
  ".difficulties-block button",
);

function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split("").join('</span><span class="letter">')}</span></div>`;
}

function formText() {
  let container = document.getElementById("words");
  container.innerHTML = "";

  const text = randomText(mode);
  const words = text.split(/(?<=\s)/);

  for (const word of words) {
    container.innerHTML += formatWord(word);
  }
}

function resetGame() {
  clearInterval(timerId);

  isGameStarted = false;
  timeElapsed = 0;
  cursorIndex = 0;
  totalKeystrokes = 0;
  mistakeCount = 0;
  currentLineOffset = 0;
  lastWordOffset = 0;
  document.getElementById("words").style.transform = `translateY(0px)`;
  document.getElementById("cur-wpm").innerHTML = "0";
  document.getElementById("cur-accuracy").innerHTML = "0%";

  formText();
  letters = Array.from(document.querySelectorAll(".letter"));

  letters.forEach((letter) => {
    letter.dataset.original = letter.textContent;
  });

  updateCursorPosition();

  // reset visual elements
  if (gameDuration === "passage") {
    document.getElementById("cur-time").textContent = "0";
  } else {
    document.getElementById("cur-time").textContent = gameDuration;
  }

  document.getElementById("cur-wpm").textContent = "0";

  document.removeEventListener("keydown", typeLetter);
  document.addEventListener("keydown", typeLetter);
}

function startGame() {
  if (isGameStarted) return;
  isGameStarted = true;
  setTimer(gameDuration);
}

function moveCursorForward() {
  if (cursorIndex < letters.length - 1) {
    cursorIndex++;
    updateCursorPosition();
  }
}

function moveCursorBackward() {
  if (cursorIndex > 0) {
    cursorIndex--;
    updateCursorPosition();
  }
}

function updateCursorPosition() {
  document.querySelector(".letter.current")?.classList.remove("current");
  const currentLetter = letters[cursorIndex];
  if (!currentLetter) return;
  currentLetter.classList.add("current");

  const currentWordDiv = currentLetter.closest(".word");
  const currentWordTop = currentWordDiv.offsetTop;

  if (currentWordTop > lastWordOffset) {
    currentLineOffset -= 30;
    document.getElementById("words").style.transform =
      `translateY(${currentLineOffset}px)`;
    lastWordOffset = currentWordTop;
  } else if (currentWordTop < lastWordOffset) {
    currentLineOffset += 30;
    document.getElementById("words").style.transform =
      `translateY(${currentLineOffset}px)`;
    lastWordOffset = currentWordTop;
  }
}

function typeLetter(event) {
  if (event.key === "Backspace") {
    let prevLetter = letters[cursorIndex - 1];
    if (!prevLetter) return;
    moveCursorBackward();
    prevLetter.classList.remove("incorrect", "correct");
    letters[cursorIndex].textContent = letters[cursorIndex].dataset.original;
    return;
  }

  if (event.key.length > 1) return;

  if (!isGameStarted) {
    startGame();
  }

  const currentLetter = letters[cursorIndex];
  if (!currentLetter) return;

  totalKeystrokes++;

  if (event.key === currentLetter.textContent) {
    currentLetter.classList.add("correct");
    currentLetter.classList.remove("incorrect");
  } else {
    currentLetter.classList.add("incorrect");
    currentLetter.classList.remove("correct");
    currentLetter.textContent = event.key;
    mistakeCount++;
  }

  moveCursorForward();
  document.getElementById("cur-wpm").textContent = calculateWPM(timeElapsed);
  document.getElementById("cur-accuracy").textContent =
    `${calculateAccuracy()}%`;
}

function setTimer(time) {
  const curTime = document.getElementById("cur-time");

  if (time === "passage") {
    curTime.textContent = timeElapsed;
    timerId = setInterval(() => {
      timeElapsed++;
      curTime.textContent = timeElapsed;
      document.getElementById("cur-wpm").textContent =
        calculateWPM(timeElapsed);
    }, 1000);

    return;
  }

  let timeLeft = time;
  curTime.textContent = timeLeft;

  timerId = setInterval(() => {
    timeLeft--;
    timeElapsed++;

    curTime.textContent = timeLeft;
    document.getElementById("cur-wpm").textContent = calculateWPM(timeElapsed);

    if (timeLeft <= 0) {
      clearInterval(timerId);
      curTime.textContent = "Time is up";
      document.removeEventListener("keydown", typeLetter);
    }
  }, 1000);
}

function calculateWPM(seconds) {
  const correctLetters = document.querySelectorAll(".letter.correct").length;
  const standardizedWords = correctLetters / 5;
  const minutes = seconds / 60;
  if (minutes === 0) return 0;
  return Math.round(standardizedWords / minutes);
}

function calculateAccuracy() {
  if (totalKeystrokes === 0) return 100;
  const accuracy = Math.round(
    ((totalKeystrokes - mistakeCount) / totalKeystrokes) * 100,
  );
  return Math.max(0, accuracy);
}

function checkBestResult(wpm) {
  if (wpm > personalBest) {
    personalBest = wpm;
  }
}

function randomText(mode) {
  const randomText = mode[Math.floor(Math.random() * mode.length)];
  return randomText;
}

// --- EVENT LISTENERS ---

resetGame();

function switchMode(event) {
  modeButtons.forEach((button) => button.classList.remove("active"));
  const value = event.currentTarget.dataset.value;
  const activeButton = event.currentTarget;
  activeButton.classList.add("active");
  gameDuration = value;
  resetGame();
  event.target.blur();
}

function switchDifficulty(event) {
  difficultyButtons.forEach((button) => button.classList.remove("active"));
  const activeButton = event.currentTarget;
  activeButton.classList.add("active");

  const difficulty = activeButton.id;

  mode = data[difficulty];
  resetGame();
  event.target.blur();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", (event) => switchMode(event));
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", (event) => switchDifficulty(event));
});

if (localStorage.getItem(personalBest) === null) {
  localStorage.setItem(personalBest, 0);
}
