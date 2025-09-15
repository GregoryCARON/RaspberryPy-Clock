let allSaints = [];
let currentSaintIndex = 0;
let currentDay = new Date().getDate();
let saintInterval;
let showMilliseconds = false;

function updateTime() {
    const now = new Date();
    if (now.getDate() !== currentDay) {
        currentDay = now.getDate();
        updateDate();
        getSaint();
    }

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = showMilliseconds === true ? ':' + String(now.getMilliseconds()).padStart(3, '0') : '';
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}${milliseconds}`;

    requestAnimationFrame(updateTime);
}

function updateDate() {
    const now = new Date();
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const dayName = days[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    document.getElementById('date').textContent = `${dayName} ${day} ${monthName} ${year}`;
    document.getElementById('weekDay').textContent = `Semaine N°${getWeekNumber()} - Jour N°${getDayOfYear()}`;
}

function getWeather() {
    fetch('https://wttr.in/Paris?format=j1&lang=fr')
        .then(response => response.json())
        .then(data => {
            const weather = data.current_condition[0];
            const weatherDesc = weather.lang_fr[0].value;
            const weatherCode = weather.weatherCode;
            const weatherIcon = getWeatherIcon(weatherCode);
            document.getElementById('weather').textContent = `${weatherIcon} ${weatherDesc}, ${weather.temp_C}°C`;
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            document.getElementById('weather').textContent = 'Météo indisponible';
        });
}

function getWeatherIcon(code) {
    const weatherIcons = {
        // Sunny/Clear
        '113': '☀️',
        // Partly cloudy
        '116': '⛅️',
        // Cloudy
        '119': '☁️',
        '122': '☁️',
        // Rain
        '176': '🌦️',
        '263': '🌦️',
        '266': '🌦️',
        '293': '🌦️',
        '296': '🌦️',
        '299': '🌧️',
        '302': '🌧️',
        '305': '🌧️',
        '308': '🌧️',
        '353': '🌧️',
        '356': '🌧️',
        '359': '🌧️',
        // Thunderstorm
        '200': '⛈️',
        '386': '⛈️',
        '389': '⛈️',
        // Snow
        '179': '❄️',
        '182': '❄️',
        '185': '❄️',
        '227': '❄️',
        '230': '❄️',
        '323': '❄️',
        '326': '❄️',
        '329': '❄️',
        '332': '❄️',
        '335': '❄️',
        '338': '❄️',
        '368': '❄️',
        '371': '❄️',
        // Fog
        '143': '🌫️',
        '248': '🌫️',
        '260': '🌫️',
    };
    return weatherIcons[code] || '';
}

function getSaint() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const url = `https://nominis.cef.fr/json/nominis.php?jour=${day}&mois=${month}&annee=${year}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let saints = {};
            if (data.response.prenoms.majeur) {
                saints = { ...saints, ...data.response.prenoms.majeur };
            }
            if (data.response.prenoms.autres) {
                saints = { ...saints, ...data.response.prenoms.autres };
            }
            if (data.response.prenoms.derives) {
                saints = { ...saints, ...data.response.prenoms.derives };
            }
            allSaints = Object.keys(saints);
            currentSaintIndex = 0;

            if (!saintInterval) {
                displayNextSaint(); // Display the first saint immediately
                saintInterval = setInterval(displayNextSaint, 3000);
            }
        })
        .catch(error => {
            console.error('Error fetching saint:', error);
            document.getElementById('saint-name').textContent = 'Saint du jour indisponible';
        });
}

function displayNextSaint() {
    if (allSaints.length > 0) {
        document.getElementById('saint-name').textContent = allSaints[currentSaintIndex];
        currentSaintIndex = (currentSaintIndex + 1) % allSaints.length;
    }
}

function getWeekNumber(date = new Date()) {
    // Copie de la date pour éviter de la modifier
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Jeudi de la semaine courante
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    // Premier jeudi de l'année
    const yearStart = new Date(d.getFullYear(), 0, 4);
    // Calcul du numéro de semaine
    return 1 + Math.round(((d - yearStart) / 86400000) / 7);
}

function getDayOfYear() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function adjustClockSize() {
    const clockElement = document.getElementById('clock');
    const container = document.body;
    const maxWidth = container.offsetWidth;
    let fontSize = 10;
    clockElement.style.fontSize = fontSize + 'px';
    while (clockElement.offsetWidth < maxWidth) {
        fontSize++;
        clockElement.style.fontSize = fontSize + 'px';
    }
    clockElement.style.fontSize = (fontSize - 2) + 'px';
}

requestAnimationFrame(updateTime);

updateDate();

getWeather();
setInterval(getWeather, 300000); // Update every 5 minutes

getSaint();

window.addEventListener('load', adjustClockSize);
window.addEventListener('resize', adjustClockSize);

document.documentElement.addEventListener('click', () => {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
});
