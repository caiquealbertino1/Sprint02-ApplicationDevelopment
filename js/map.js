/** @type {import("leaflet").Map} */
let mapInstance = null;

/** @type {Map<number, import("leaflet").Marker>} */
const markerRegistry = new Map();

/**
 * Initializes the Leaflet map centered on São Paulo.
 * @returns {import("leaflet").Map}
 */
export function initMap() {
    mapInstance = L.map("map", {
        center: [-23.5505, -46.6333],
        zoom: 11,
        zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(mapInstance);

    return mapInstance;
}

/**
 * Creates a colored custom div-icon based on risk level.
 * @param {"low"|"mid"|"high"} risk
 * @returns {import("leaflet").DivIcon}
 */
function createMarkerIcon(risk) {
    const colors = {
        low:  { border: "#52b788", fill: "#1e4d35" },
        mid:  { border: "#e9c46a", fill: "#5c4a1c" },
        high: { border: "#ef233c", fill: "#5c1020" },
    };

    const c = colors[risk] || colors.low;

    return L.divIcon({
        className: "",
        html: `
            <div style="
                width: 26px; height: 26px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 2px solid ${c.border};
                background: ${c.fill};
                box-shadow: 0 0 8px ${c.border}88;
                display: flex; align-items: center; justify-content: center;
            ">
                <div style="
                    width: 9px; height: 9px;
                    border-radius: 50%;
                    background: ${c.border};
                    transform: rotate(45deg);
                "></div>
            </div>
        `,
        iconSize:   [26, 26],
        iconAnchor: [13, 26],
        popupAnchor:[0, -28],
    });
}

/**
 * Adds or updates a marker on the map for a location with weather data.
 * @param {{ id: number, name: string, type: string, lat: number, lon: number }} location
 * @param {{ temperature: number, windspeed: number, label: string, icon: string,
 *           precipProb: number|null, humidity: number|null, risk: string }} weather
 */
export function addOrUpdateMarker(location, weather) {
    if (!mapInstance) return;

    const icon = createMarkerIcon(weather.risk);

    const popupContent = `
        <div class="popup-title">${location.name}</div>
        <div style="font-size:.68rem; color: var(--text-muted); margin-bottom:.4rem;">${location.type}</div>
        <div class="popup-row">
            <span>Temperatura</span>
            <span class="popup-val">${weather.temperature}°C</span>
        </div>
        <div class="popup-row">
            <span>Vento</span>
            <span class="popup-val">${weather.windspeed} km/h</span>
        </div>
        ${weather.precipProb !== null ? `
        <div class="popup-row">
            <span>Prob. Chuva</span>
            <span class="popup-val">${weather.precipProb}%</span>
        </div>` : ""}
        ${weather.humidity !== null ? `
        <div class="popup-row">
            <span>Humidade</span>
            <span class="popup-val">${weather.humidity}%</span>
        </div>` : ""}
        <div style="margin-top:.5rem; font-size:.72rem; color: var(--text-secondary);">
            ${weather.icon} ${weather.label}
        </div>
    `;

    if (markerRegistry.has(location.id)) {
        const existing = markerRegistry.get(location.id);
        existing.setIcon(icon);
        existing.getPopup().setContent(popupContent);
    } else {
        const marker = L.marker([location.lat, location.lon], { icon })
            .addTo(mapInstance)
            .bindPopup(popupContent, { maxWidth: 220 });
        markerRegistry.set(location.id, marker);
    }
}

/**
 * Pans the map to a specific location and opens its popup.
 * @param {number} locationId
 */
export function flyToLocation(locationId) {
    const marker = markerRegistry.get(locationId);
    if (!marker || !mapInstance) return;
    mapInstance.flyTo(marker.getLatLng(), 14, { duration: 1 });
    marker.openPopup();
}
