(function () {
    // Flag indicating that the tutorial is active.
    var tutorialActive = false;
    var tutorialFinger = null;
    var tutorialTimeout; // For cyclic delays
    // You can change the tutorial word as needed (e.g., "CAT", "ACT", etc.)
    var tutorialWord = "CUTE";

    // Returns the center position of a letter.
    // If the global object letterPositions (set in initLetters) exists, use it.
    function getLetterPosition(letter) {
        if (window.letterPositions && window.letterPositions[letter]) {
            return window.letterPositions[letter];
        }
        // Fallback: calculate similar to the main game code, adding a fixed offset of 35.
        var letterEl = document.querySelector(".letter[data-letter='" + letter + "']");
        var keypad = document.querySelector('.keypad'); // Using the keypad container
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

    // Draws the line and circles between the letters.
    function drawTutorialLine(positions) {
        var canvas = document.getElementById('keypad-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        // Clear the canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (positions.length === 0) return;

        // Draw circles at each position (radius 30, as in the main game)
        positions.forEach(function (pos) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(140, 50, 187, 0.8)';
            ctx.fill();
        });

        // Draw connecting lines between consecutive positions
        for (var i = 0; i < positions.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[i + 1].x, positions[i + 1].y);
            ctx.strokeStyle = 'rgba(140, 50, 187, 0.8)';
            ctx.lineWidth = 15;
            ctx.stroke();
        }
    }

    // Recursively animates the tutorial sequence.
    function animateTutorialSequence(letters, index, positions) {
        if (!tutorialActive) return;
        if (index >= letters.length) {
            // End of sequence: fade out the canvas and the finger.
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

        // Move the finger to the new letter's position.
        tutorialFinger.style.transition = 'left 0.5s ease, top 0.5s ease';

// Force reflow to ensure the transition applies
        tutorialFinger.offsetHeight; // This forces a reflow

// Move the finger to the new letter's position
        tutorialFinger.style.left = pos.x + 'px';
        tutorialFinger.style.top = pos.y + 'px';

        // Wait 500ms for the finger's transition to finish.
        setTimeout(function () {
            positions.push(pos);
            drawTutorialLine(positions);

            // Add a tap effect (ensure the CSS class .tap is defined).
            tutorialFinger.classList.add('tap');
            // Shorten the tap duration to reduce pauses.
            setTimeout(function () {
                tutorialFinger.classList.remove('tap');
                // After a short 150ms delay, proceed to the next letter.
                setTimeout(function () {
                    animateTutorialSequence(letters, index + 1, positions);
                }, 150);
            }, 150);
        }, 250);
    }

    // The main tutorial loop.
    function runTutorialLoop() {
        if (!tutorialActive) return;
        var keypad = document.querySelector('.keypad');

        // Create the finger image if it doesn't exist and add it to the keypad container.
        if (!tutorialFinger) {
            tutorialFinger = document.createElement('img');
            tutorialFinger.src = 'images/finger.png';
            tutorialFinger.id = 'tutorial-finger';
            tutorialFinger.style.position = 'absolute';
            tutorialFinger.style.width = '100px';
            tutorialFinger.style.height = '127px';
            tutorialFinger.style.pointerEvents = 'none';
            tutorialFinger.style.zIndex = '1000';
            // The finger's movement transition (0.5s) is defined here.
            tutorialFinger.style.transition = 'left 0.5s ease, top 0.5s ease';
            keypad.appendChild(tutorialFinger);
        }

        // Reset the canvas and finger opacity before starting.
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

    // Starts the tutorial.
    function startTutorial() {
        tutorialActive = true;

        // Cancel the tutorial if the user interacts with the game.
        var gameContainer = document.getElementById('game-container');
        gameContainer.addEventListener('mousedown', cancelTutorial);
        gameContainer.addEventListener('touchstart', cancelTutorial);

        runTutorialLoop();
    }

    // Cancels the tutorial: clears timeouts, removes the finger image, and clears the canvas.
    function cancelTutorial() {
        tutorialActive = false;
        if (tutorialTimeout) {
            clearTimeout(tutorialTimeout);
        }
        if (tutorialFinger && tutorialFinger.parentNode) {
            tutorialFinger.parentNode.removeChild(tutorialFinger);
            tutorialFinger = null;
        }
        var gameContainer = document.getElementById('game-container');
        gameContainer.removeEventListener('mousedown', cancelTutorial);
        gameContainer.removeEventListener('touchstart', cancelTutorial);
        var canvas = document.getElementById('keypad-canvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Expose startTutorial to the global scope.
    window.startTutorial = startTutorial;
})();
