var tutorialActive = false;
var tutorialFinger = null;
var tutorialTimeout;
var tutorialWord = "CUTE";

function getLetterPosition(letter) {
    if (window.letterPositions && window.letterPositions[letter]) {
        return window.letterPositions[letter];
    }

    var letterEl = document.querySelector(".letter[data-letter='" + letter + "']");
    var keypad = document.querySelector('.keypad');
    if (letterEl && keypad) {
        var letterRect = letterEl.getBoundingClientRect();
        var keypadRect = keypad.getBoundingClientRect();
        return {
            x: letterRect.left - keypadRect.left + 35,
            y: letterRect.top - keypadRect.top + 35
        };
    }
    return { x: 0, y: 0 };
}

function drawTutorialLine(positions) {
    var canvas = document.getElementById('keypad-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (positions.length === 0) return;

    positions.forEach(function (pos) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(140, 50, 187, 0.8)';
        ctx.fill();
    });

    for (var i = 0; i < positions.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[i + 1].x, positions[i + 1].y);
        ctx.strokeStyle = 'rgba(140, 50, 187, 0.8)';
        ctx.lineWidth = 15;
        ctx.stroke();
    }
}

function animateTutorialSequence(letters, index, positions) {
    if (!tutorialActive) return;
    if (index >= letters.length) {
        var canvas = document.getElementById('keypad-canvas');
        var ctx = canvas.getContext('2d');
        canvas.style.transition = 'opacity 0.5s ease-out';
        canvas.style.opacity = 0;
        if (tutorialFinger) {
            tutorialFinger.style.transition = 'opacity 0.5s ease-out';
            tutorialFinger.style.opacity = 0;
        }
        tutorialTimeout = setTimeout(function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.opacity = 1;
            if (tutorialFinger) {
                tutorialFinger.style.opacity = 1;
            }
            runTutorialLoop();
        }, 500);
        return;
    }
    var letter = letters[index];
    var pos = getLetterPosition(letter);

    tutorialFinger.style.transition = 'left 0.5s ease, top 0.5s ease';

    tutorialFinger.offsetHeight;

    tutorialFinger.style.left = pos.x + 'px';
    tutorialFinger.style.top = pos.y + 'px';

    setTimeout(function () {
        positions.push(pos);
        drawTutorialLine(positions);

        setTimeout(function () {
            setTimeout(function () {
                animateTutorialSequence(letters, index + 1, positions);
            }, 150);
        }, 150);
    }, 250);
}

function runTutorialLoop() {
    if (!tutorialActive) return;
    var keypad = document.querySelector('.keypad');

    if (!tutorialFinger) {
        tutorialFinger = document.createElement('div');
        tutorialFinger.id = 'tutorial-finger';
        tutorialFinger.style.position = 'absolute';
        tutorialFinger.style.transition = 'left 0.5s ease, top 0.5s ease';
        keypad.appendChild(tutorialFinger);
    }

    var canvas = document.getElementById('keypad-canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.opacity = 1;
    if (tutorialFinger) {
        tutorialFinger.style.opacity = 1;
    }

    var letters = tutorialWord.split('');
    animateTutorialSequence(letters, 0, []);
}

function startTutorial() {
    tutorialActive = true;

    runTutorialLoop();
}

function finishTutorial() {
    tutorialActive = false;
    if (tutorialTimeout) {
        clearTimeout(tutorialTimeout);
    }
    if (tutorialFinger && tutorialFinger.parentNode) {
        tutorialFinger.parentNode.removeChild(tutorialFinger);
        tutorialFinger = null;
    }
    var gameContainer = document.getElementById('game-container');
    var canvas = document.getElementById('keypad-canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}