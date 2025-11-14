
// =====================================
// === ГЛОБАЛЬНЫЕ КОНСТАНТЫ И НАСТРОЙКИ ===
// =====================================

// !!! ПЕРЕКЛЮЧАТЕЛЬ: Установите 'true', чтобы активировать выбор режима "Ваш часовой пояс / Мировое время" !!!
let globalModeEnabled = false; 

const PRIMARY_TIMEZONE = "Asia/Yerevan";
const SPECIAL_ANIMATION_ZONES = ["Asia/Yerevan", "Europe/Moscow"]; 

// Часовые пояса для режима "Мировое время" (если он будет активирован)
const TIMEZONES = [
    { name: "Ереван", zone: "Asia/Yerevan" },
    { name: "Москва", zone: "Europe/Moscow" },
    { name: "Лондон", zone: "Europe/London" },
    { name: "Нью-Йорк", zone: "America/New_York" },
    { name: "Токио", zone: "Asia/Tokyo" },
];

// --- АДАПТАЦИЯ DOM-ЭЛЕМЕНТОВ К ВАШЕМУ HTML ---
const timerSingle = document.getElementById('single-timer');
const timerMulti = document.getElementById('multi-timer');
const modeSelector = document.getElementById('mode-selector');
const btnLocal = document.getElementById('btn-local');
const btnGlobal = document.getElementById('btn-global');
const h1Element = document.querySelector('.contimer h1'); // Ищем h1 внутри .contimer
const musicToggleBtn = document.getElementById('music-toggle-btn');
const youtubeIframe = document.querySelector('#music-player-container iframe');

// Общие переменные
const currentYear = new Date().getFullYear();
const NEW_YEAR_DATE_UTC = new Date(`January 1, ${currentYear + 1} 00:00:00 UTC`);

let confettiLaunched = false; 
let timerMode = 'local'; 
let isMusicPlaying = false; 

// ------------------------------------
// ФУНКЦИИ АНИМАЦИИ
// ------------------------------------

function launchConfetti(count) {
    if (confettiLaunched) return;

    const container = document.getElementById('confetti-container');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti');
        
        let xStart = `${Math.random() * 200 - 100}px`;
        let yStart = `${Math.random() * 200 - 100}px`; 
        let xEnd = `${Math.random() * window.innerWidth - (window.innerWidth / 2)}px`;
        
        piece.style.setProperty('--x-start', xStart);
        piece.style.setProperty('--y-start', yStart);
        piece.style.setProperty('--x-end', xEnd);
        
        piece.style.top = `${centerY}px`;
        piece.style.left = `${centerX}px`;
        piece.style.animationDelay = `${Math.random() * 0.5}s`;

        container.appendChild(piece);
        
        setTimeout(() => {
            piece.remove();
        }, 3000); 
    }
    confettiLaunched = true;
    setTimeout(() => { confettiLaunched = false; }, 4000); 
}


// ------------------------------------
// ФУНКЦИИ ТАЙМЕРА И ВРЕМЕНИ
// ------------------------------------

function formatTimeDiff(timeDiff) {
    if (timeDiff < 0) return "С Новым Годом!";
    
    let days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    let hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${days}д ${hours}ч ${minutes}м ${seconds}с`;
}


function getNewYearDiff(timezone) {
    let nowInZone = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    let newYearInZone = new Date(NEW_YEAR_DATE_UTC.toLocaleString("en-US", { timeZone: timezone }));
    return newYearInZone - nowInZone;
}


function updatePrimaryTimer() {
    let timeDiff = getNewYearDiff(PRIMARY_TIMEZONE);

    const timerElement = document.getElementById("timer");
    timerElement.innerHTML = formatTimeDiff(timeDiff);

    if (timeDiff < 0) {
        let titleText = `С Новым Годом в ${PRIMARY_TIMEZONE.split('/')[1]}! 🎉`;
        
        if (SPECIAL_ANIMATION_ZONES.includes(PRIMARY_TIMEZONE)) {
             launchConfetti(200); 
             titleText = "Ура! С НОВЫМ ГОДОМ! 🥳";
        }
        
        h1Element.innerHTML = titleText;
        
    } else {
        h1Element.innerHTML = `До Нового Года в ${PRIMARY_TIMEZONE.split('/')[1]} осталось:`;
    }
}


function updateGlobalTimers() {
    timerMulti.innerHTML = '';
    
    TIMEZONES.forEach(tz => {
        let now = new Date();
        
        let currentTimeString = now.toLocaleString('ru-RU', {
            timeZone: tz.zone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: 'numeric',
            month: 'short',
            hour12: false
        });

        const cityDiv = document.createElement('div');
        cityDiv.classList.add('city-timer');
        
        let timeDiff = getNewYearDiff(tz.zone);
        let countdownValue = formatTimeDiff(timeDiff);

        if (timeDiff < 0 && SPECIAL_ANIMATION_ZONES.includes(tz.zone)) {
             countdownValue = "Ура! 🎉";
        }

        cityDiv.innerHTML = `
            <h3>${tz.name}</h3>
            <div class="countdown-value">${countdownValue}</div>
        `;
        
        timerMulti.appendChild(cityDiv);
    });
}


// ------------------------------------
// ФУНКЦИИ УПРАВЛЕНИЯ РЕЖИМОМ И МУЗЫКОЙ
// ------------------------------------

function setMode(mode) {
    if (!globalModeEnabled) {
        updatePrimaryTimer();
        return; 
    } 
    
    if (mode === 'local') {
        timerMode = 'local';
        timerSingle.classList.remove('hidden');
        timerMulti.classList.add('hidden');
        updatePrimaryTimer();
    } else {
        timerMode = 'global';
        timerSingle.classList.add('hidden');
        timerMulti.classList.remove('hidden');
        h1Element.innerHTML = "Текущее время по миру:";
        updateGlobalTimers();
    }
}


function initialize() {
    // Управление видимостью режима
    if (globalModeEnabled) {
        modeSelector.classList.remove('hidden');
        btnLocal.addEventListener('click', () => setMode('local'));
        btnGlobal.addEventListener('click', () => setMode('global'));
    } else {
        modeSelector.classList.add('hidden');
    }
    
    setMode('local');
}


// --- ЛОГИКА ВКЛЮЧЕНИЯ/ВЫКЛЮЧЕНИЯ МУЗЫКИ (Play/Pause Toggle) ---
if (musicToggleBtn && youtubeIframe) {
    musicToggleBtn.addEventListener('click', () => {
        let command = '';
        let buttonText = '';
        
        if (isMusicPlaying) {
            command = 'pauseVideo';
            buttonText = '<i class="fa fa-music" aria-hidden="true"></i>';
            isMusicPlaying = false;
        } else {
            command = 'playVideo';
            buttonText = '⏸️ Пауза';
            isMusicPlaying = true;
        }

        youtubeIframe.contentWindow.postMessage(
            `{"event":"command","func":${command},"args":""}`, 
            '*'
        );
        
        musicToggleBtn.innerHTML = buttonText;
    });
}


// ------------------------------------
// ЦИКЛ
// ------------------------------------

initialize(); 

const intervalId = setInterval(() => {
    if (timerMode === 'local') {
        updatePrimaryTimer();
    } else if (globalModeEnabled) {
        updateGlobalTimers();
    }
}, 1000);

