var keypadBlocked = false;
var gridData = [
    [["A", "C", "T"], ["C", "U", "T"]],
    [["C", "U", "E"], ["A", "C", "E"]],
    [["F", "A", "T"], ["E", "A", "T"]],
    [["T", "E", "A"], ["C", "A", "T"]],
    [["C", "U", "T", "E"], ["C", "A", "F", "E"]],
    [["F", "E", "A", "T"], ["F", "A", "C", "T"]],
    [["F", "A", "C", "E"], ["F", "A", "T", "E"]],
    [["F", "A", "C", "E", "T"], ["A", "C", "U", "T", "E"]],
];

var correctWords = [
    "ACT", "CUT", "CUE", "ACE",
    "FAT", "EAT", "TEA", "CAT",
    "CUTE", "CAFE", "FEAT", "FACT",
    "FACE", "FATE", "FACET", "ACUTE"
];

var availableLetters = ['E', 'T', 'F', 'A', 'C', 'U'];
var typedWord = "";
var coinCountElement = document.getElementById('coin-count');
var coinCount = parseInt(coinCountElement.textContent, 10);

var grid = document.getElementById('grid');
var typedWordElement = document.getElementById('typed-word');
var keypad = document.querySelector('.keypad');
var canvas = document.getElementById('keypad-canvas');
var ctx = canvas.getContext('2d');
var gameContainer = document.getElementById('game-container');
var moves = 0;
var musicStarted = false;

canvas.width = 300;
canvas.height = 300;

function initGrid() {
    gridData.forEach(function (row, rowIndex) {
        row.forEach(function (word, wordIndex) {
            var wordContainer = document.createElement('div');
            wordContainer.classList.add('word');

            var coinIndex = Math.floor(Math.random() * (word.length - 1)) + 1;

            word.forEach(function (letter, index) {
                var cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.row = rowIndex;
                cellElement.dataset.word = wordIndex;
                cellElement.dataset.index = index;

                if (index === 0) {
                    cellElement.innerHTML = "<span>" + letter + "</span>";
                    cellElement.classList.add('green');
                }

                if (index === coinIndex) {
                    var coinElement = document.createElement('div');
                    coinElement.classList.add('flying-target');
                    cellElement.appendChild(coinElement);
                    cellElement.coin = coinElement;
                }

                wordContainer.appendChild(cellElement);
            });

            grid.appendChild(wordContainer);
        });
    });
}

var isDragging = false;
var draggedWord = '';
var letterPositions = {};
var draggedLetters = [];
var dragTimer;
var clickedLetters = [];

function initLetters() {
    var angleStep = (2 * Math.PI) / availableLetters.length;
    var radius = 120;
    var centerOffset = 150;

    availableLetters.forEach(function (letter, index) {
        var letterElement = document.createElement('div');
        letterElement.classList.add('letter');
        letterElement.textContent = letter;
        letterElement.dataset.letter = letter;

        var angle = index * angleStep - Math.PI / 2;
        var x = radius * Math.cos(angle) + centerOffset - 35;
        var y = radius * Math.sin(angle) + centerOffset - 35;

        letterElement.style.left = x + 'px';
        letterElement.style.top = y + 'px';

        letterPositions[letter] = {
            x: x + 35,
            y: y + 35
        };

        letterElement.addEventListener('mousedown', function (e) {
            startDrag(letter, e);
        });
        letterElement.addEventListener('touchstart', function (e) {
            startDrag(letter, e);
        });
        letterElement.addEventListener('mouseenter', function (e) {
            dragOver(letter, e);
        });
        letterElement.addEventListener('touchmove', function (e) {
            var touch = e.touches[0];
            var letterEl = document.elementFromPoint(touch.clientX, touch.clientY);
            if (letterEl && letterEl.classList.contains('letter')) {
                var overLetter = letterEl.dataset.letter;
                dragOver(overLetter, e);
            }
        });

        keypad.appendChild(letterElement);
    });

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function startDrag(letter, e) {
    e.preventDefault();

    checkMoves();
    if (keypadBlocked) return;

    if (!musicStarted) {
        document.getElementById('music').play();
        musicStarted = true;
    }

    finishTutorial();

    isDragging = true;
    draggedWord = letter;
    typedWordElement.textContent = draggedWord;
    draggedLetters = [letter];

    updateTypedWordDisplay();
}

function checkMoves() {
    if (moves >= 4) {
        onCTAClick();
        keypadBlocked = true;
    }
}

function updateTypedWordDisplay() {
    var typedWordContainer = document.getElementById('typed-word');
    typedWordContainer.innerHTML = '';

    draggedWord.split('').forEach(function (letter, index) {
        var letterBlock = document.createElement('div');
        letterBlock.classList.add('typed-cell');
        letterBlock.innerHTML = "<span>" + letter + "</span>";

        if (index === draggedWord.length - 1) {
            letterBlock.classList.add('appear');
            setTimeout(function () {
                letterBlock.classList.remove('appear');
            }, 300);
        }
        typedWordContainer.appendChild(letterBlock);
    });

    document.getElementById('keypad_letter_' + draggedWord.length).play();
}

function dragOver(letter) {
    if (isDragging && draggedLetters.indexOf(letter) === -1) {
        draggedLetters.push(letter);
        draggedWord += letter;
        updateTypedWordDisplay();
        drawLine(draggedLetters);
    }
}

function endDrag() {
    if (isDragging) {
        isDragging = false;
        typedWord = draggedWord;
        checkWord();
        draggedWord = '';
        draggedLetters = [];
        clearLines();
    }
}

function drawLine(letters) {
    clearLines();
    if (letters.length < 1) return;

    letters.forEach(function (letter) {
        var pos = letterPositions[letter];
        if (pos) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(140, 50, 187, 0.8)';
            ctx.fill();
        }
    });

    for (var i = 0; i < letters.length - 1; i++) {
        var start = letterPositions[letters[i]];
        var end = letterPositions[letters[i + 1]];

        if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = 'rgba(140, 50, 187, 0.8)';
            ctx.lineWidth = 15;
            ctx.stroke();
        }
    }
}

function clearLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var currentDeltaAmount = 0;
var activeDeltaElement = null;
var accumulatedDelta = 0;
var deltaTimeoutId = null;

function addCoins(amount) {
    coinCount += amount;

    var coinCountElement = document.getElementById('coin-count');
    coinCountElement.textContent = coinCount;

    var coinContainer = document.getElementById('coin-container');

    if (activeDeltaElement) {
        accumulatedDelta += amount;
        activeDeltaElement.textContent = "+" + accumulatedDelta;

        clearTimeout(deltaTimeoutId);

        activeDeltaElement.style.transform = 'translateY(0)';
        activeDeltaElement.style.opacity = '1';

        setTimeout(function () {
            activeDeltaElement.style.transform = 'translateY(-10px)';
            activeDeltaElement.style.opacity = '0';
        }, 10);
    } else {
        accumulatedDelta = amount;
        activeDeltaElement = document.createElement('div');
        activeDeltaElement.textContent = "+" + accumulatedDelta;
        activeDeltaElement.classList.add('coin-delta');

        var left = coinCountElement.offsetLeft;
        var top = coinCountElement.offsetTop + coinCountElement.offsetHeight;
        activeDeltaElement.style.left = left + "px";
        activeDeltaElement.style.top = (top + 10) + "px";

        coinContainer.appendChild(activeDeltaElement);

        setTimeout(function () {
            activeDeltaElement.style.transform = 'translateY(-10px)';
            activeDeltaElement.style.opacity = '0';
        }, 10);
    }

    deltaTimeoutId = setTimeout(function () {
        if (activeDeltaElement) {
            activeDeltaElement.remove();
            activeDeltaElement = null;
            accumulatedDelta = 0;
        }
    }, 1000);
}

var guessedWords = new Set();
function checkWord() {
    var typedWordContainer = document.getElementById('typed-word');

    if (guessedWords.has(typedWord)) {
        resetTypedWord();
        return;
    }

    if (correctWords.indexOf(typedWord) !== -1) {
        moves++;
        guessedWords.add(typedWord);
        keypadBlocked = true;

        setTimeout(function () {
            var gridCells = Array.from(document.querySelectorAll('.grid .cell'));

            var startIndex = 0;
            for (var i = 0; i < correctWords.length; i++) {
                if (correctWords[i] === typedWord) {
                    break;
                }
                startIndex += correctWords[i].length;
            }

            animateCorrectWord(gridCells.slice(startIndex, startIndex + typedWord.length));
        }, 300);
    } else {
        var crossImage = document.createElement('div');
        crossImage.classList.add('cross');
        typedWordContainer.appendChild(crossImage);

        document.getElementById('wrong_word').play();
        typedWordContainer.classList.add('shake');
        setTimeout(function () {
            typedWordContainer.classList.remove('shake');
            resetTypedWord();
        }, 500);
    }
}

function animateCorrectWord(targetCells) {
    var typedWordContainer = document.getElementById('typed-word');
    var letters = Array.from(typedWordContainer.children);

    letters.forEach(function (letterElement, index) {
        var targetCell = targetCells[index];
        var scaleFactor = getScaleFactor(gameContainer);

        var letterRect = letterElement.getBoundingClientRect();
        var targetRect = targetCell.getBoundingClientRect();
        var containerRect = gameContainer.getBoundingClientRect();

        var startX = (letterRect.left - containerRect.left + window.scrollX) / scaleFactor;
        var startY = (letterRect.top - containerRect.top + window.scrollY) / scaleFactor;
        var endX = (targetRect.left - containerRect.left + window.scrollX) / scaleFactor;
        var endY = (targetRect.top - containerRect.top + window.scrollY) / scaleFactor;

        var animationElement = letterElement.cloneNode(true);
        animationElement.style.position = 'absolute';
        animationElement.style.left = startX + 'px';
        animationElement.style.top = startY + 'px';
        animationElement.style.transition = 'transform 0.5s ease, left 0.5s ease, top 0.5s ease';
        animationElement.style.transitionDelay = (index * 0.1) + 's';
        gameContainer.appendChild(animationElement);

        document.getElementById('correct_word').play();

        setTimeout(function () {
            animationElement.style.left = endX + 'px';
            animationElement.style.top = (endY - (index !== 0 ? 3 : 0)) + 'px';
            letterElement.remove();
        }, 10);

        if (targetCell.coin) {
            animateCollect(targetCell, document.getElementById('coin-icon'), function () {addCoins(10);}, getScaleFactor(gameContainer));
            targetCell.coin.style.visibility = 'hidden';
        }

        setTimeout(function () {
            animationElement.remove();
            targetCell.innerHTML = "<span>" + letterElement.textContent + "</span>";
            keypadBlocked = false;
            targetCell.classList.add('green');
        }, index * 100 + 500);
    });
}

function getScaleFactor(element) {
    var transform = element.style.transform;
    if (!transform) return 1;

    var match = transform.match(/scale\(([^)]+)\)/);
    if (!match) return 1;

    return parseFloat(match[1]);
}

function resetTypedWord() {
    typedWord = '';
    var typedWordContainer = document.getElementById('typed-word');
    typedWordContainer.innerHTML = '';
    clearLines();
    clickedLetters = [];
}

function resizeGame() {
    var widthToHeightRatio = 600 / 931;
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    var scaleFactor;
    if (viewportWidth / viewportHeight < widthToHeightRatio) {
        scaleFactor = viewportWidth / 600;
    } else {
        scaleFactor = viewportHeight / 931;
    }

    gameContainer.style.transform = 'scale(' + scaleFactor + ')';

    var scaledWidth = 600 * scaleFactor;
    var scaledHeight = 931 * scaleFactor;

    gameContainer.style.left = (viewportWidth - scaledWidth) / 2 + 'px';
    gameContainer.style.top = (viewportHeight - scaledHeight) / 2 + 'px';

    var coinContainer = document.getElementById('coin-container');
    coinContainer.style.transform = 'scale(' + scaleFactor + ')';
    coinContainer.style.left = (20 * scaleFactor) + 'px';
    coinContainer.style.top = (20 * scaleFactor) + 'px';
}

function startGame() {
    window.gameStarted = true;

    initGrid();
    initLetters();
    resizeGame();

    startTutorial();

    window.addEventListener('resize', resizeGame);
    window.addEventListener('load', resizeGame);
}

window.startGame = startGame;
