(function () {
    // Флаг, указывающий, что туториал запущен.
    var tutorialActive = false;
    var tutorialFinger = null;
    var tutorialTimeout; // для циклических задержек
    // Здесь можно задать любое слово для демонстрации (например, "CAT", "ACT" и т.д.)
    var tutorialWord = "CAT";

    // Функция возвращает позицию центра буквы.
    // Если глобальный объект letterPositions уже определён (из initLetters игры), используем его.
    function getLetterPosition(letter) {
        if (window.letterPositions && window.letterPositions[letter]) {
            return window.letterPositions[letter];
        }
        // Фолбэк: рассчитываем аналогично, добавляя фиксированный отступ 35, как в основном коде.
        var letterEl = document.querySelector(".letter[data-letter='" + letter + "']");
        var keypad = document.querySelector('.keypad'); // используем контейнер с клавишами
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

    // Функция для отрисовки линии и кружков между набранными буквами.
    function drawTutorialLine(positions) {
        var canvas = document.getElementById('keypad-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        // Очищаем канвас перед отрисовкой
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (positions.length === 0) return;

        // Рисуем кружки для каждой позиции (радиус 30, как в основном коде)
        positions.forEach(function(pos) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(140, 50, 187, 0.8)';
            ctx.fill();
        });

        // Рисуем линии между последовательными позициями
        for (var i = 0; i < positions.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[i+1].x, positions[i+1].y);
            ctx.strokeStyle = 'rgba(140, 50, 187, 0.8)';
            ctx.lineWidth = 15;
            ctx.stroke();
        }
    }

    // Рекурсивная функция для анимации прохождения по буквам tutorialWord.
    function animateTutorialSequence(letters, index, positions) {
        if (!tutorialActive) return;
        if (index >= letters.length) {
            // После завершения последовательности – подождать 1000 мс, затем очистить канвас и перезапустить цикл.
            tutorialTimeout = setTimeout(function() {
                var canvas = document.getElementById('keypad-canvas');
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                runTutorialLoop();
            }, 1000);
            return;
        }
        var letter = letters[index];
        var pos = getLetterPosition(letter);
        positions.push(pos);
        // Отрисовываем линию и кружки с учётом новой буквы
        drawTutorialLine(positions);

        // Позиционируем изображение пальца точно в центре буквы (без смещения)
        tutorialFinger.style.left = pos.x + 'px';
        tutorialFinger.style.top = pos.y + 'px';

        // Добавляем эффект «тапа» (убедитесь, что CSS‑класс .tap определён)
        tutorialFinger.classList.add('tap');
        setTimeout(function(){
            tutorialFinger.classList.remove('tap');
            // Через 400 мс переходим к следующей букве
            setTimeout(function() {
                animateTutorialSequence(letters, index + 1, positions);
            }, 400);
        }, 300);
    }

    // Основной цикл туториала.
    function runTutorialLoop() {
        if (!tutorialActive) return;
        var keypad = document.querySelector('.keypad'); // контейнер с клавишами

        // Если изображение пальца ещё не создано, добавляем его в контейнер .keypad
        if (!tutorialFinger) {
            tutorialFinger = document.createElement('img');
            tutorialFinger.src = 'images/finger.png';
            tutorialFinger.id = 'tutorial-finger';
            tutorialFinger.style.position = 'absolute';
            tutorialFinger.style.width = '100px';
            tutorialFinger.style.height = '127px';
            tutorialFinger.style.pointerEvents = 'none';
            tutorialFinger.style.zIndex = '1000';
            tutorialFinger.style.transition = 'left 0.5s ease, top 0.5s ease';
            keypad.appendChild(tutorialFinger);
        }

        // Очищаем канвас перед запуском анимации
        var canvas = document.getElementById('keypad-canvas');
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var letters = tutorialWord.split('');
        animateTutorialSequence(letters, 0, []);
    }

    // Функция запуска туториала.
    function startTutorial() {
        tutorialActive = true;

        // Если пользователь начинает взаимодействовать с игрой, туториал отменяется.
        var gameContainer = document.getElementById('game-container');
        gameContainer.addEventListener('mousedown', cancelTutorial);
        gameContainer.addEventListener('touchstart', cancelTutorial);

        runTutorialLoop();
    }

    // Функция отмены туториала: очищаем таймауты, удаляем "палец" и канвас.
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

    // Экспортируем функцию запуска туториала в глобальную область.
    window.startTutorial = startTutorial;
})();
