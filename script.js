const destinations = {
    eua: {
        button: document.getElementById("btn-eua"),
        name: "Nova York, EUA",
        timeZone: "America/New_York"
    },
    coreia: {
        button: document.getElementById("btn-coreia"),
        name: "Seul, Coreia do Sul",
        timeZone: "Asia/Seoul"
    }
};

const localClock = document.getElementById("relogio-local");
const destinationClock = document.getElementById("relogio-estrangeiro");
const destinationName = document.getElementById("nome-pais");
const differenceLabel = document.getElementById("diferenca-horas");
const localDate = document.getElementById("data-local");
const designButton = document.getElementById("btn-fonte");
const wallpaperButton = document.getElementById("btn-fundo");
const wallpaperHint = document.getElementById("wallpaper-hint");
const background = document.querySelector(".background");
const audioBarsContainer = document.getElementById("audio-bars");
const audioStatus = document.getElementById("audio-status");

const preferencesKey = "time-with-newjeans.preferences.v1";

function loadPreferences() {
    let serializedPreferences;

    try {
        serializedPreferences = window.localStorage.getItem(preferencesKey);
    } catch (error) {
        console.error("Could not load wallpaper preferences.", error);
        return {};
    }

    if (!serializedPreferences) {
        return {};
    }

    try {
        const preferences = JSON.parse(serializedPreferences);
        return preferences && typeof preferences === "object" && !Array.isArray(preferences)
            ? preferences
            : {};
    } catch (error) {
        console.error("Could not parse saved wallpaper preferences.", error);
        return {};
    }
}

const preferences = loadPreferences();
wallpaperHint.hidden = preferences.wallpaperHintDismissed === true;

function savePreference(name, value) {
    preferences[name] = value;

    try {
        window.localStorage.setItem(preferencesKey, JSON.stringify(preferences));
    } catch (error) {
        console.error("Could not save wallpaper preferences.", error);
    }
}

let selectedDestination = null;

function formatClock(date, timeZone) {
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).format(date);
}

function getTimeZoneOffset(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hourCycle: "h23"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
    const zonedTime = Date.UTC(
        values.year,
        values.month - 1,
        values.day,
        values.hour,
        values.minute,
        values.second
    );
    return Math.round((zonedTime - date.getTime()) / 60000);
}

function formatDifference(minutes) {
    if (minutes === 0) {
        return "Mesmo horário que o seu.";
    }

    const direction = minutes > 0 ? "à frente" : "atrás";
    const absoluteMinutes = Math.abs(minutes);
    const hours = Math.floor(absoluteMinutes / 60);
    const remainingMinutes = absoluteMinutes % 60;
    const timeDifference = remainingMinutes === 0
        ? `${hours} ${hours === 1 ? "hora" : "horas"}`
        : `${hours}h${String(remainingMinutes).padStart(2, "0")}`;

    return `${timeDifference} ${direction} do seu horário.`;
}

function updateClocks() {
    const now = new Date();
    localClock.dateTime = now.toISOString();
    localClock.textContent = formatClock(now, Intl.DateTimeFormat().resolvedOptions().timeZone);
    localDate.textContent = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long"
    }).format(now);

    if (selectedDestination) {
        destinationClock.dateTime = now.toISOString();
        destinationClock.textContent = formatClock(now, selectedDestination.timeZone);
        const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const difference = getTimeZoneOffset(now, selectedDestination.timeZone)
            - getTimeZoneOffset(now, localZone);
        differenceLabel.textContent = formatDifference(difference);
    }
}

function selectDestination(destinationKey, save = true) {
    const destination = destinations[destinationKey];
    selectedDestination = destination;
    destinationName.textContent = destination.name;

    for (const item of Object.values(destinations)) {
        item.button.setAttribute("aria-pressed", String(item === destination));
    }

    if (save) {
        savePreference("destination", destinationKey);
    }

    updateClocks();
}

for (const [key, destination] of Object.entries(destinations)) {
    destination.button.addEventListener("click", () => selectDestination(key));
}

designButton.addEventListener("click", () => {
    const isAlternative = localClock.classList.toggle("fonte-alternativa");
    destinationClock.classList.toggle("fonte-alternativa", isAlternative);
    designButton.setAttribute("aria-pressed", String(isAlternative));
    savePreference("alternativeFont", isAlternative);
});

const wallpapers = [
    {
        image: "Fundos/newjeans 2.jpg",
        overlay: "linear-gradient(90deg, rgba(5, 16, 31, 0.56), rgba(10, 22, 38, 0.18) 54%, rgba(9, 20, 35, 0.4)), linear-gradient(0deg, rgba(8, 17, 31, 0.55), transparent 65%)"
    },
    {
        image: "Fundos/newjeans 3.jpg",
        overlay: "linear-gradient(90deg, rgba(5, 16, 31, 0.5), rgba(10, 22, 38, 0.16) 54%, rgba(9, 20, 35, 0.36)), linear-gradient(0deg, rgba(8, 17, 31, 0.52), transparent 65%)"
    },
    {
        image: "Fundos/newjeans-omg.gif",
        overlay: "linear-gradient(90deg, rgba(5, 16, 31, 0.48), rgba(10, 22, 38, 0.18) 54%, rgba(9, 20, 35, 0.38)), linear-gradient(0deg, rgba(8, 17, 31, 0.5), transparent 65%)"
    },
    {
        image: "Fundos/newjeans.jpg",
        overlay: "linear-gradient(90deg, rgba(5, 16, 31, 0.6), rgba(10, 22, 38, 0.2) 54%, rgba(9, 20, 35, 0.42)), linear-gradient(0deg, rgba(8, 17, 31, 0.55), transparent 65%)"
    },
    {
        image: "Fundos/ditto-newjeans.gif",
        overlay: "linear-gradient(90deg, rgba(5, 16, 31, 0.54), rgba(10, 22, 38, 0.22) 54%, rgba(9, 20, 35, 0.42)), linear-gradient(0deg, rgba(8, 17, 31, 0.52), transparent 65%)"
    },
    {
        image: "Fundos/newjeans-ditto.gif",
        overlay: "linear-gradient(90deg, rgba(5, 16, 31, 0.54), rgba(10, 22, 38, 0.22) 54%, rgba(9, 20, 35, 0.42)), linear-gradient(0deg, rgba(8, 17, 31, 0.52), transparent 65%)"
    }
];

const savedWallpaperIndex = preferences.wallpaperIndex;
let currentWallpaper = Number.isInteger(savedWallpaperIndex)
    && savedWallpaperIndex >= 0
    && savedWallpaperIndex < wallpapers.length
    ? savedWallpaperIndex
    : 0;

function showWallpaper(index) {
    const wallpaper = wallpapers[index];
    background.style.backgroundImage = `${wallpaper.overlay}, url("${wallpaper.image}")`;
}

if (currentWallpaper > 0) {
    showWallpaper(currentWallpaper);
}

wallpaperButton.addEventListener("click", () => {
    currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
    showWallpaper(currentWallpaper);
    savePreference("wallpaperIndex", currentWallpaper);

    if (!wallpaperHint.hidden) {
        wallpaperHint.hidden = true;
        savePreference("wallpaperHintDismissed", true);
    }
});

const audioBars = Array.from({ length: 32 }, () => {
    const bar = document.createElement("span");
    bar.className = "audio-visualizer__bar";
    audioBarsContainer.append(bar);
    return bar;
});
const displayedAudioLevels = new Array(audioBars.length).fill(0);

function updateAudioVisualizer(audioArray) {
    if (!audioArray || audioArray.length < 128) {
        audioStatus.textContent = "SINAL DE ÁUDIO INDISPONÍVEL";
        return;
    }

    audioStatus.textContent = "CAPTANDO ÁUDIO DO SISTEMA";

    for (let index = 0; index < audioBars.length; index += 1) {
        const firstFrequency = index * 2;
        const leftLevel = (audioArray[firstFrequency] + audioArray[firstFrequency + 1]) / 2;
        const rightLevel = (
            audioArray[64 + firstFrequency] + audioArray[65 + firstFrequency]
        ) / 2;
        const averageLevel = Math.max((leftLevel + rightLevel) / 2, 0);
        const level = Math.min(Math.sqrt(Math.max(averageLevel - 0.008, 0) * 3.8), 1);
        const previousLevel = displayedAudioLevels[index];
        displayedAudioLevels[index] = level > previousLevel
            ? previousLevel + (level - previousLevel) * 0.65
            : previousLevel * 0.84;
        audioBars[index].style.setProperty(
            "--bar-height",
            `${7 + displayedAudioLevels[index] * 88}%`
        );
    }
}

const isAlternativeFont = preferences.alternativeFont === true;
if (isAlternativeFont) {
    localClock.classList.add("fonte-alternativa");
    destinationClock.classList.add("fonte-alternativa");
    designButton.setAttribute("aria-pressed", "true");
}

if (typeof preferences.destination === "string"
    && Object.prototype.hasOwnProperty.call(destinations, preferences.destination)) {
    selectDestination(preferences.destination, false);
}

updateClocks();
setInterval(updateClocks, 1000);

if (typeof window.wallpaperRegisterAudioListener === "function") {
    window.wallpaperRegisterAudioListener(updateAudioVisualizer);
}
