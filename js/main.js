/**
 * main.js
 * Application entry point.
 * Orchestrates initialization of map, weather fetching, and dashboard rendering.
 * All module dependencies are imported and coordinated here.
 */

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

/** Holds results for stats aggregation */
const weatherResults = [];

/**
 * Bootstraps the application.
 */
async function init() {
    // 1. Init map
    initMap();

    // 2. Clear skeleton UI
    initDashboard();

    // 3. Update badge to loading state
    setStatusBadge("loading");

    let errorCount = 0;

    // 4. Fetch weather for each location sequentially
    //    (avoids hammering the free API; swap to Promise.all for speed if preferred)
    for (let i = 0; i < LOCATIONS.length; i++) {
        const loc = LOCATIONS[i];

        try {
            const weather = await fetchWeather(loc.lat, loc.lon);
            weatherResults.push(weather);

            // Render map marker
            addOrUpdateMarker(loc, weather);

            // Render sidebar card with staggered animation
            renderCard(loc, weather, i * 60);

            // Update counter
            updatePointCount(i + 1);

        } catch (err) {
            console.error(`[VegWatch] Erro ao carregar ${loc.name}:`, err);
            weatherResults.push(null);
            renderErrorCard(loc);
            errorCount++;
        }
    }

    // 5. Aggregate stats
    updateStats(weatherResults.filter(Boolean));

    // 6. Final status
    setStatusBadge(errorCount === 0 ? "done" : "error");
    updateTimestamp();
}

// ── Start ──
init();
