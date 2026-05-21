import { LOCATIONS }      from "./locations.js";
import { fetchWeather }   from "./weather.js";
import { initMap, addOrUpdateMarker } from "./map.js";
import {
    initDashboard,
    renderCard,
    renderErrorCard,
    updateStats,
    updatePointCount,
    setStatusBadge,
    updateTimestamp,
} from "./dashboard.js";

const weatherResults = [];

async function init() {
    initMap();

    initDashboard();

    setStatusBadge("loading");

    let errorCount = 0;

    for (let i = 0; i < LOCATIONS.length; i++) {
        const loc = LOCATIONS[i];

        try {
            const weather = await fetchWeather(loc.lat, loc.lon);
            weatherResults.push(weather);

            addOrUpdateMarker(loc, weather);

            renderCard(loc, weather, i * 60);

            updatePointCount(i + 1);

        } catch (err) {
            console.error(`[VegWatch] Erro ao carregar ${loc.name}:`, err);
            weatherResults.push(null);
            renderErrorCard(loc);
            errorCount++;
        }
    }

    updateStats(weatherResults.filter(Boolean));

    setStatusBadge(errorCount === 0 ? "done" : "error");
    updateTimestamp();
}

init();
