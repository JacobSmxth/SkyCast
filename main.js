// ======================
// DOM Elements
// ======================
// Weather Display Elements
const locationName = document.querySelector('#locationName')
const tempVal = document.querySelector("#temperatureVal");
const weatherType = document.querySelector("#weatherType");
const windVal = document.querySelector("#windVal");
// User Input & Suggestions
const locationInput = document.querySelector("#locationInput");
const suggestionsContainer = document.querySelector('#suggestions')
// Hourly Weather Display
const hrContainer = document.querySelector("#hourlyWeather")
// Weekly Weather Display
const weeklyContainer = document.querySelector("#weeklyWeather")
const weeklyDay = document.querySelector(".weekDay")
const weeklyDate = document.querySelector(".exactWeekDay")
const weekTempHigh = document.querySelector(".weekTempHigh")
const weekTempLow = document.querySelector(".weekTempLow")
const weekSunrise = document.querySelector(".sunrise")
const weekSunset = document.querySelector(".sunset")
const weekPrecChance = document.querySelector(".weekPrecipitationChance")
const weekUVIndex = document.querySelector(".weekUVIndex")
// Saved Locations
const saveBtn = document.querySelector("#saveLocation")
const locationList = document.querySelector('#locationList')
// ==================
//  Constants
// ==================
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const deg = "°F"
const DEFAULT_LOCATION = { lat: 40.7128, long: -74.0060, name: "New York City" }; // Default location if geolocation fails
const WEATHER_ICONS = {
    0: "☀️", // Clear
    1: "🌤️", // Mostly Clear
    2: "⛅", // Partly Cloudy
    3: "☁️", // Overcast
    45: "🌫️", // Foggy
    48: "🌫️", // Foggy
    51: "🌦️", // Drizzle
    53: "🌦️", // Drizzle
    55: "🌦️", // Drizzle
    56: "🌨️", // Freezing Drizzle
    57: "🌨️", // Freezing Drizzle
    61: "🌧️", // Light Rain
    63: "🌧️", // Moderate Rain
    65: "🌧️", // Heavy Rain
    95: "⛈️", // Thunderstorms
    default: "🌡️" // Default
};

// =========================
//  Global Variables
// =========================
let savedLocations = JSON.parse(localStorage.getItem('locations') || "[]");
let lastLatitude;
let lastLongitude;
let lastLocationName;
let isLoading = false;
let lastUpdated = null;

// Create UI elements for enhanced UX
function createUXElements() {
    // Create loading indicator
    if (!document.querySelector('#loadingIndicator')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingIndicator';
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = '<div class="spinner"></div><p>Loading weather data...</p>';
        loadingDiv.style.display = 'none';
        document.body.appendChild(loadingDiv);
    }
    
    // Create notification element for messages
    if (!document.querySelector('#notification')) {
        const notificationDiv = document.createElement('div');
        notificationDiv.id = 'notification';
        notificationDiv.className = 'notification';
        notificationDiv.style.display = 'none';
        document.body.appendChild(notificationDiv);
    }
    
    // Create last updated timestamp element
    if (!document.querySelector('#lastUpdated') && locationName) {
        const lastUpdatedSpan = document.createElement('span');
        lastUpdatedSpan.id = 'lastUpdated';
        lastUpdatedSpan.className = 'last-updated';
        if (locationName.parentNode) {
            locationName.parentNode.insertBefore(lastUpdatedSpan, locationName.nextSibling);
        }
    }
    
    // Create refresh button
    if (!document.querySelector('#refreshBtn') && saveBtn) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'refreshBtn';
        refreshBtn.className = 'refresh-btn';
        refreshBtn.innerHTML = '🔄';
        refreshBtn.title = 'Refresh weather data';
        refreshBtn.addEventListener('click', () => {
            if (lastLatitude && lastLongitude) {
                setLocation(lastLatitude, lastLongitude);
            } else {
                initApp();
            }
        });
        saveBtn.parentNode.insertBefore(refreshBtn, saveBtn);
    }
    
    // Add CSS for new elements
    if (!document.querySelector('#extraStyles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'extraStyles';
        styleSheet.textContent = `
            .loading-indicator {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: white;
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 5px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s linear infinite;
                margin-bottom: 15px;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border-radius: 5px;
                z-index: 1001;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: opacity 0.3s, transform 0.3s;
                opacity: 0;
                transform: translateY(-20px);
            }
            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            .last-updated {
                display: block;
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.7);
                margin-top: 5px;
            }
            .refresh-btn {
                position: absolute;
                top: 1rem;
                right: 3.5rem;
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: transform 0.3s;
                z-index: 5;
            }
            .refresh-btn:hover {
                transform: rotate(180deg);
            }
            .weather-icon {
                font-size: 1.5rem;
                margin-right: 8px;
            }
            .location-saved-msg {
                background: rgba(0, 128, 0, 0.2);
                color: #4CAF50;
                padding: 5px 10px;
                border-radius: 5px;
                margin-top: 5px;
                font-size: 0.8rem;
                display: inline-block;
            }
            .saved-location-item {
                cursor: pointer;
            }
            .saved-location-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

/**
 * Shows a loading indicator when data is being fetched
 * @param {boolean} show - Whether to show or hide the loader
 */
function showLoading(show) {
    const loader = document.querySelector('#loadingIndicator');
    if (!loader) return;
    
    isLoading = show;
    loader.style.display = show ? 'flex' : 'none';
}

/**
 * Displays a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (info, success, error)
 */
function showNotification(message, type = 'info') {
    const notification = document.querySelector('#notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

/**
 * Updates the last updated timestamp
 */
function updateTimestamp() {
    const timestampEl = document.querySelector('#lastUpdated');
    if (!timestampEl) return;
    
    lastUpdated = new Date();
    timestampEl.textContent = `Last updated: ${lastUpdated.toLocaleTimeString()}`;
}

/**
 * Simply to let me type logs quicker
 * @param {any} v - The value I'm trying to log
 * @returns {void}
 */
function log(v) {
    console.log(v)
}

/**
 * Returns the number of days in a specific month of a given year
 * @param {number} year - The year 
 * @param {number} month - The month
 * @returns {number} The number of days in the month specified
 */
function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
}

/**
 * Retrieves information about the current date.
 *
 * This function creates a Date object for the current month and extracts several
 * properties such as the numeric day of the week, month, year, and the day of the month.
 * It then returns an object containing these values as strings along with the name of the day
 * The name of the day is from the global array "dayNames"
 * 
 * @returns {Object} An object with many properties
 */
function getTodaysDate() {
    const date = new Date()
    const weekday = date.getDay()
    const month = date.getMonth() + 1
    const year = date.getFullYear() // Fixed: Using getFullYear instead of getYear
    const monthDay = date.getDate()

    let dateInfo = {
        date: `${date}`,
        month: `${month}`,
        year: `${year}`,
        day: `${monthDay}`,
        weekDay: `${weekday}`,
        dayName: `${dayNames[weekday]}`
    }
    return dateInfo
}

/**
 * Obtains the user's current geographic coordinates using the Geolocation API.
 *
 * @returns {Promise} A promise that resolves with the position data.
 */
function getCoords() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        )
    })
}

/**
 * Initializes the application by obtaining the user's coordinates and setting the location.
 *
 * @async
 * @returns {Promise}
 */
async function initApp() {
    createUXElements(); // Create UX enhancement elements
    showLoading(true);
    
    try {
        const position = await getCoords()
        const userLat = position.coords.latitude;
        const userLong = position.coords.longitude;
        setLocation(userLat, userLong);
    } catch (error) {
        console.error("Error obtaining location: ", error)
        // Fallback to default location when geolocation fails
        showNotification(`Could not access your location: ${error.message}. Using default location.`, 'error');
        setLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.long);
    }
}

/**
 * Fetches JSON data from the provided URL.
 *
 * @async
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise} The parsed JSON data, or null if an error occurs.
 */
async function fetchJson(url) {
    try {
        // Add a timeout to the fetch call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, { 
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error(`Error fetching ${url}: `, error)
        
        if (error.name === 'AbortError') {
            showNotification('Request timed out. Please try again.', 'error');
        } else {
            showNotification(`Error fetching data: ${error.message}`, 'error');
        }
        
        return null
    }
}

/**
 * Fetches weather and geographical data concurrently for the specified coordinates.
 *
 * @async
 * @param {number|string} lat - The latitude.
 * @param {number|string} long - The longitude.
 * @returns {Promise} An promise resulting in object containing weather and geo data.
 */
async function fetchWeatherAndGeoData(lat, long) {
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,precipitation_hours,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`
    const geoApiUrl = `https://us1.api-bdc.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`
    const [weatherData, geoData] = await Promise.all([
        fetchJson(weatherApiUrl),
        fetchJson(geoApiUrl)
    ])
    return {weatherData, geoData};
}

/**
 * Sets the current location by fetching weather and geographical data for the given coordinates,
 * then updates the UI accordingly.
 *
 * @async
 * @param {number|string} lat - The latitude.
 * @param {number|string} long - The longitude.
 * @returns {Promise}
 */
async function setLocation(lat, long) {
    showLoading(true);
    
    try {
        const {weatherData, geoData} = await fetchWeatherAndGeoData(lat, long);
        
        if (weatherData && geoData) {
            setUi(weatherData, geoData);
            lastLatitude = lat;
            lastLongitude = long;
            lastLocationName = `${geoData.locality}, ${geoData.principalSubdivisionCode.slice(3)}`;
            updateTimestamp();
            
            // Check if location is already saved
            const coords = { lat: parseFloat(lat), long: parseFloat(long) };
            const tolerance = 0.001;
            const isAlreadySaved = savedLocations.some(
                loc => Math.abs(loc.lat - coords.lat) < tolerance && Math.abs(loc.long - coords.long) < tolerance
            );
            
            // Update save button appearance based on whether location is saved
            if (isAlreadySaved) {
                saveBtn.innerHTML = '✓';
                saveBtn.title = 'Location already saved';
                saveBtn.style.background = '#4CAF50';
            } else {
                saveBtn.innerHTML = '+';
                saveBtn.title = 'Save this location';
                saveBtn.style.background = '';
            }
        } else {
            showNotification("Could not fetch weather data. Please try again later.", 'error');
        }
    } catch (error) {
        console.error("Error setting location:", error);
        showNotification(`Error loading weather data: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Fetches weather and geo data for a saved location and returns a simplified data object.
 *
 * @async
 * @param {number|string} lat - The latitude of the saved location.
 * @param {number|string} long - The longitude of the saved location.
 * @returns {Promise} A promise resulting in object with location weather details or null on error.
 */
async function fetchSavedLocationData(lat, long) {
    try {
        const {weatherData, geoData} = await fetchWeatherAndGeoData(lat, long);
        
        if (weatherData && geoData) {
            // Check that required properties exist before destructuring
            if (!geoData.locality || !geoData.principalSubdivisionCode) {
                throw new Error("Missing location data");
            }
            
            if (!weatherData.current || !weatherData.daily) {
                throw new Error("Missing weather data");
            }
            
            const { locality, principalSubdivisionCode } = geoData;
            const { temperature_2m, weather_code, wind_speed_10m } = weatherData.current;
            const { precipitation_probability_max } = weatherData.daily;
            
            return {
                name: `${locality}`,
                abr: `${principalSubdivisionCode.slice(3)}`,
                temp: `${temperature_2m}`,
                weather: `${weather_code}`,
                wind: `${wind_speed_10m}`,
                prec: `${precipitation_probability_max[0]}`,
                lat: `${lat}`,
                lon: `${long}`,
            }
        } else {
            throw new Error("Could not fetch location data");
        }
    } catch (error) {
        console.error("Error fetching saved location data:", error);
        showNotification(`Error loading saved location: ${error.message}`, 'error');
        return null;
    }
}

/**
 * Creates a debounced version of a function that delays its execution.
 *
 * @param {Function} fun - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(fun, delay) {
    let timeout
    return function(...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => fun.apply(this, args), delay)
    }
}

/**
 * Checks if the input query is long enough to fetch suggestions.
 *
 * @param {string} query - The input query string.
 * @returns {boolean} Checks if query is atleast 3, if its not returns false
 */
function checkFetchSuggestions(query) {
    return query.length >= 3
}

/**
 * Clears the suggestions from the UI.
 *
 * @returns {void}
 */
function clearSuggestions() {
    suggestionsContainer.classList.remove("toggle")
    suggestionsContainer.innerHTML = ''
}

/**
 * Fetches location suggestions data from the OpenStreetMap Nominatim API.
 *
 * @async
 * @param {string} query - The search query.
 * @returns {Promise} A promise resulting in array of suggestion result objects.
 */
async function fetchSuggestionsData(query) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
        
        // Show mini loader in input field
        locationInput.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23ccc\' d=\'M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z\'%3E%3CanimateTransform attributeName=\'transform\' type=\'rotate\' from=\'0 12 12\' to=\'360 12 12\' dur=\'1s\' repeatCount=\'indefinite\'/%3E%3C/path%3E%3C/svg%3E")';
        locationInput.style.backgroundRepeat = 'no-repeat';
        locationInput.style.backgroundPosition = 'right 10px center';
        locationInput.style.backgroundSize = '20px 20px';
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SkyCast/0.4'
            }
        });
        
        // Remove loader
        locationInput.style.backgroundImage = '';
        
        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
        }
        
        const data = await response.json();
        log("Fetched suggestions:", data);
        return data;
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        // Remove loader on error
        locationInput.style.backgroundImage = '';
        return [];
    }
}

/**
 * Creates a DOM element representing a single suggestion item.
 *
 * @param {Object} result - The suggestion result object.
 * @returns {HTMLElement} The suggestion item element.
 */
function createSuggestionItem(result) {
    const item = document.createElement('div')
    item.classList.add('suggestion-item')
    item.textContent = result.display_name
    item.addEventListener('click', () => {
        locationInput.value = result.display_name
        clearSuggestions()
        suggestionsContainer.classList.remove('toggle')
        setLocation(result.lat, result.lon)
        locationInput.value = ""
    });
    return item
}

/**
 * Renders suggestion items in the suggestions container.
 *
 * @param {Array} data - Array of suggestion result objects.
 * @returns {void}
 */
function renderSuggestions(data) {
    suggestionsContainer.classList.add('toggle')
    suggestionsContainer.innerHTML = ''
    
    if (data.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'suggestion-item no-results';
        noResults.textContent = 'No locations found';
        suggestionsContainer.appendChild(noResults);
        return;
    }
    
    data.forEach(result => {
        const item = createSuggestionItem(result)
        suggestionsContainer.appendChild(item)
    })
}

/**
 * Fetches and renders location suggestions based on the user's query.
 *
 * @async
 * @param {string} query - The input query string.
 * @returns {Promise}
 */
async function fetchSuggestions(query) {
    if (!checkFetchSuggestions(query)) {
        clearSuggestions();
        return
    }
    try {
        const data = await fetchSuggestionsData(query)
        renderSuggestions(data)
    } catch (error) {
        console.error("Error fetching suggestions: ", error)
        showNotification("Could not fetch location suggestions", 'error');
    }
}

/**
 * Converts a weather code into a human-readable description.
 *
 * @param {number} code - The weather code.
 * @returns {string|undefined} The corresponding weather description, or undefined if not found.
 */
function checkWeatherCode(code) {
    const weatherString =  {
        0: "Clear Skies",
        1: "Mostly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Foggy",
        51: "Drizzle",
        53: "Drizzle",
        55: "Drizzle",
        56: "Freezing Drizzle",
        57: "Freezing Drizzle",
        61: "Light Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        95: "Thunderstorms",
    }
    return weatherString[code] || "Unknown Weather";
}

/**
 * Gets the appropriate weather icon for a weather code
 * 
 * @param {number} code - The weather code
 * @returns {string} The icon to display
 */
function getWeatherIcon(code) {
    return WEATHER_ICONS[code] || WEATHER_ICONS.default;
}

/**
 * Updates the UI with current weather information.
 *
 * @param {number} temp - The current temperature.
 * @param {number} weather - The weather code.
 * @param {number} wind - The wind speed.
 * @returns {void}
 */
function setWeatherUi(temp, weather, wind) {
    tempVal.innerText = `${Math.round(temp)}${deg}`
    windVal.innerText = wind === 0 ? "No winds currently" : `${wind} mph winds`
    
    const weatherDescription = checkWeatherCode(weather) || "Unknown Weather";
    const icon = getWeatherIcon(weather);
    weatherType.innerHTML = `<span class="weather-icon">${icon}</span>${weatherDescription}`;
}

/**
 * Converts a 24-hour time string to a 12-hour format.
 *
 * @param {string} time - The time string (e.g., "13:00:00").
 * @returns {string} The formatted time string (e.g., "1PM").
 */
function toNormalTime(time) {
    if (!time || typeof time !== 'string') return 'N/A';
    
    try {
        let val = parseInt(time.split(":")[0]) // I did it this way since I will not need any minutes part of the time
        if (val === 0) {
            return "12AM"
        } else if (val > 12) {
            return val-12 + "PM"
        } else if (val === 12) {
            return val + "PM"
        } else{
            return val + "AM"
        }
    } catch (error) {
        console.error("Error parsing time:", error);
        return 'N/A';
    }
}

/**
 * Updates the hourly forecast UI with upcoming weather data.
 *
 * @param {string} currentTime - The current time string.
 * @param {Array} timeArr - Array of time strings for the forecast.
 * @param {Array} tempArr - Array of temperature values for each hour.
 * @param {Array} precArr - Array of precipitation percentages for each hour.
 * @returns {void}
 */
function setHourlyUi(currentTime, timeArr, tempArr, precArr) {
    if (!timeArr || !tempArr || !precArr || !Array.isArray(timeArr) || 
        !Array.isArray(tempArr) || !Array.isArray(precArr)) {
        hrContainer.innerHTML = '<p>Hourly forecast data unavailable</p>';
        return;
    }
    
    let forecastData = [];
    for (let i = 0; i < timeArr.length; i++) {
        if (timeArr[i] > currentTime) {
            forecastData.push({
                time: timeArr[i],
                temp: tempArr[i],
                prec: precArr[i]
            })
        }
    }
    
    if (forecastData.length === 0) {
        hrContainer.innerHTML = '<p>No upcoming hourly forecast available</p>';
        return;
    }
    
    let html = '';
    forecastData.slice(0,15).forEach((entry, index) => {
        html += `
        <li class="hour" style="--i: ${index}">
            <h3 class="hourTime">${toNormalTime(entry.time.slice(11))}</h3>
            <h4 class="hourTempVal">${Math.round(entry.temp)}°</h4>
            <p class="hourPrecipitationChance">${entry.prec}%</p>
        </li>
    `;
    })
    hrContainer.innerHTML = html;
}

/**
 * Checks if a given day value is valid within the maximum number of days in the month.
 *
 * @param {number|string} day - The day to check.
 * @param {number|string} maxDays - The maximum number of days in the month.
 * @returns {boolean} returns true if the day is within the valid range, otherwise it's false.
 */
function stillValidDay(day, maxDays) {
    return  day <= parseInt(maxDays) 
}

/**
 * Updates the UI with daily weather forecast data.
 *
 * @param {Object} data - The weather data object containing daily forecast information.
 * @returns {void}
 */
function setDailyUi(data) {
    if (!data || !data.daily) {
        weeklyContainer.innerHTML = '<p>Daily forecast data unavailable</p>';
        return;
    }
    
    try {
        const dailyData = data.daily;
        const {precipitation_probability_max, sunrise, sunset, temperature_2m_max, temperature_2m_min, uv_index_max, weather_code} = dailyData;
        const {month, day, weekDay, dayName, year} = getTodaysDate();
        let curMonth = parseInt(month)
        let curDay = parseInt(day) 
        
        let firstSlice = dayNames.slice(weekDay, dayNames.length)
        let secondSlice = dayNames.slice(0, weekDay)
        let dayOrder = firstSlice.concat(secondSlice)

        let html = ``
        dayOrder.forEach((date, index) => {
            let futureDay = curDay + index
            let futureMonth = curMonth
            let futureYear = year
            let daysThisMonth = daysInMonth(year, curMonth)
            
            // Handle month/year rollover
            if (futureDay > daysThisMonth) {
                futureDay = futureDay - daysThisMonth
                futureMonth++
                
                if (futureMonth > 12) {
                    futureMonth = 1
                    futureYear++
                }
            }
            
            // Get the weather icon
            const icon = getWeatherIcon(weather_code[index]);
            
            html += `
                <li>
                    <div class="dayStuff">
                        <h3 class="weekDay">${date}</h3>
                        <h4 class="exactWeekDay">${futureMonth}/${futureDay}</h4>
                    </div>
                    <div class="tempInfo">
                        <h3 class="weekTempHigh">${temperature_2m_max[index] + deg}</h3>
                        <h3 class="weekTempLow">${temperature_2m_min[index]+ deg}</h3>
                    </div>
                    <div class="sunInfo">
                        <p class="sunrise">Sunrise: ${sunrise[index] ? sunrise[index].slice(11) : 'N/A'}</p>
                        <p class="sunset">Sunset: ${sunset[index] ? sunset[index].slice(11) : 'N/A'}</p>
                    </div>
                    <p class="weekWeatherType"><span class="weather-icon">${icon}</span>${checkWeatherCode(weather_code[index])}</p>
                    <p class="weekPrecipitationChance">Precipitation: ${precipitation_probability_max[index]}% </p>
                    <p class="weekUVIndex">UV: ${uv_index_max[index]}</p>
                </li>
            `
        })
        weeklyContainer.innerHTML = html
    } catch (error) {
        console.error("Error setting daily UI:", error);
        weeklyContainer.innerHTML = '<p>Error loading daily forecast</p>';
    }
}

/**
 * Updates the main UI with current, hourly, and daily weather information.
 *
 * @param {Object} data1 - The weather data object containing current, hourly, and daily information.
 * @param {Object} data2 - The geographical data object containing location details.
 * @returns {void}
 */
function setUi(data1, data2) {
    try {
        if (!data1 || !data2) {
            showNotification("Weather data could not be loaded", 'error');
            return;
        }
        
        const { current, hourly, daily } = data1;
        
        if (!current || !hourly || !daily) {
            showNotification("Incomplete weather data received", 'error');
            return;
        }
        
        if (!data2.locality || !data2.principalSubdivisionCode) {
            showNotification("Location information is incomplete", 'error');
            return;
        }
        
        locationName.innerText = `${data2.locality}, ${data2.principalSubdivisionCode.slice(3)}`
        setWeatherUi(current.temperature_2m, current.weather_code, current.wind_speed_10m)
        setHourlyUi(current.time, hourly.time, hourly.temperature_2m, hourly.precipitation_probability)
        setDailyUi(data1)
        
        showNotification(`Weather updated for ${data2.locality}`, 'success');
    } catch (error) {
        console.error("Error updating UI:", error);
        showNotification("Error displaying weather data", 'error');
    }
}

/**
 * Saves the current location to localStorage if it is not already present.
 *
 * @param {number|string} lat - The latitude.
 * @param {number|string} long - The longitude.
 * @returns {void}
 */
function saveLocation(lat, long) {
    try {
        const coords = { lat: parseFloat(lat), long: parseFloat(long) };
        const tolerance = 0.001;
        const isDuplicate = savedLocations.some(
            loc => Math.abs(loc.lat - coords.lat) < tolerance && Math.abs(loc.long - coords.long) < tolerance
        );
        
        if (!isDuplicate) {
            // Include location name with coordinates
            const locationToSave = {
                ...coords,
                name: lastLocationName || `Location at ${lat}, ${long}`
            };
            savedLocations.push(locationToSave);
            localStorage.setItem("locations", JSON.stringify(savedLocations));
            log(`Saved Location: ${coords.lat}, ${coords.long}`);
            setSavedLocation();
            
            // Update save button to indicate saved
            saveBtn.innerHTML = '✓';
            saveBtn.title = 'Location saved';
            saveBtn.style.background = '#4CAF50';
            
            showNotification(`Location saved: ${lastLocationName || 'Current location'}`, 'success');
        } else {
            log(`Location ${coords.lat}, ${coords.long} already saved`);
            showNotification('This location is already saved', 'info');
        }
    } catch (error) {
        console.error("Error saving location:", error);
        showNotification('Could not save location', 'error');
    }
}

/**
 * Retrieves saved locations from localStorage, fetches their weather data, and updates the UI.
 *
 * @async
 * @returns {Promise}
 */
async function setSavedLocation() {
    locationList.innerHTML = '';
    
    if (savedLocations.length === 0) {
        locationList.innerHTML = '<p class="no-saved">No saved locations</p>';
        return;
    }
    
    // Track loading state
    let loadingItem = document.createElement('div');
    loadingItem.innerHTML = 'Loading saved locations...';
    loadingItem.className = 'loading-message';
    locationList.appendChild(loadingItem);
    
    try {
        for (const location of savedLocations) {
            const data = await fetchSavedLocationData(location.lat, location.long);
            if (data) {
                const { name, abr, temp, weather, wind, prec, lat, lon } = data;
                addSavedElement(name, abr, temp, weather, wind, prec, lat, lon);
            }
        }
    } catch (error) {
        console.error("Error loading saved locations:", error);
        showNotification("Error loading some saved locations", 'error');
    } finally {
        // Remove loading indicator
        const loadingMessage = locationList.querySelector('.loading-message');
        if (loadingMessage) {
            locationList.removeChild(loadingMessage);
        }
        
        // If no locations were loaded
        if (locationList.children.length === 0) {
            locationList.innerHTML = '<p class="no-saved">No saved locations available</p>';
        }
    }
}

/**
 * Removes a saved location from localStorage and updates the UI.
 *
 * @param {number|string} lat - The latitude of the location to remove.
 * @param {number|string} lon - The longitude of the location to remove.
 * @returns {void}
 */
function removeSavedLocation(lat, lon) {
    try {
        log("Removing: ", lat, lon);
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        
        const locationToRemove = savedLocations.find(loc => 
            loc.lat === latNum && loc.long === lonNum
        );
        
        savedLocations = savedLocations.filter(loc => 
            loc.lat !== latNum || loc.long !== lonNum
        );
        
        log('New savedLocations', savedLocations);
        localStorage.setItem('locations', JSON.stringify(savedLocations));
        setSavedLocation();
        
        // If current location is the one being removed, update save button
        if (lastLatitude === latNum && lastLongitude === lonNum) {
            saveBtn.innerHTML = '+';
            saveBtn.title = 'Save this location';
            saveBtn.style.background = '';
        }
        
        const locationName = locationToRemove && locationToRemove.name 
            ? locationToRemove.name 
            : 'Selected location';
            
        showNotification(`Removed ${locationName} from saved locations`, 'success');
    } catch (error) {
        console.error("Error removing location:", error);
        showNotification("Could not remove location", 'error');
    }
}

/** 
 * Adds a saved weather element to the location list in the DOM.
 * 
 * This function creates a new list item element that represents a saved location and its corresponding weather data,
 * sets its inner HTML using the provided parameters, and appends it to the locationList element.
 * 
 * @param {string} name - The name of the location.
 * @param {string} abr - The abbreviated state or region of the location.
 * @param {number|string} temp - The current temperature.
 * @param {number|string} weather - The weather code (to be converted to a description).
 * @param {number|string} wind - The wind speed.
 * @param {number|string} prec - The precipitation chance percentage.
 * @param {number|string} lat - The latitude.
 * @param {number|string} lon - The longitude.
 * 
 * @returns {void}
 */
function addSavedElement(name, abr, temp, weather, wind, prec, lat, lon) {
    const li = document.createElement('li');
    li.className = 'weather-item saved-location-item';
    li.setAttribute('data-id', `${lat},${lon}`);
    
    // Get weather icon
    const icon = getWeatherIcon(weather);
    
    li.innerHTML = `
        <h2 class="location-name">${name}, ${abr}</h2>
        <button class="remove-btn" title="Remove this location"></button>
        <div class="weather-stats">
            <p class="temp">${Math.round(temp)}${deg}</p>
            <p class="wind"><span class="windIcon"></span>${wind} mph</p>
            <p class="precipitationChance"><span class="precipitationIcon"></span>${prec}% chance</p>
            <p class="weatherType"><span class="weather-icon">${icon}</span>${checkWeatherCode(weather) || "Unknown"}</p>
        </div>
    `;
    
    // Add click event to load this location
    li.addEventListener('click', (e) => {
        // Don't trigger if the remove button was clicked
        if (e.target.classList.contains('remove-btn')) return;
        
        setLocation(lat, lon);
    });
    
    locationList.appendChild(li);
}

// ======================
//  Event Listeners
// ======================

document.addEventListener('click', (e) => {
    if(!suggestionsContainer.contains(e.target) && e.target !== locationInput) {
        clearSuggestions()
    }
})

saveBtn.addEventListener('click', () => {
    if (lastLatitude !== undefined && lastLongitude !== undefined) {
        saveLocation(lastLatitude, lastLongitude)
    } else {
        showNotification("No location data available to save", 'error');
    }
})

locationList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const clicked = e.target.closest('.weather-item');
        const id = clicked.getAttribute('data-id');
        const [lat, lon] = id.split(',');
        removeSavedLocation(lat, lon);
        e.stopPropagation(); // Prevent loading location when removing
    }
});

locationInput.addEventListener('input', debounce(async (e) => {
    const query = e.target.value.trim();
    await fetchSuggestions(query)
}, 300))

// Show visual feedback when locationInput is focused
locationInput.addEventListener('focus', () => {
    locationInput.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.5)';
});

locationInput.addEventListener('blur', () => {
    locationInput.style.boxShadow = '';
});

// Handle keyboard navigation in suggestions
locationInput.addEventListener('keydown', (e) => {
    if (!suggestionsContainer.classList.contains('toggle')) return;
    
    const items = suggestionsContainer.querySelectorAll('.suggestion-item');
    if (items.length === 0) return;
    
    const activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!activeItem) {
            items[0].classList.add('active');
            items[0].scrollIntoView({ block: 'nearest' });
        } else {
            const nextItem = activeItem.nextElementSibling;
            if (nextItem) {
                activeItem.classList.remove('active');
                nextItem.classList.add('active');
                nextItem.scrollIntoView({ block: 'nearest' });
            }
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeItem) {
            const prevItem = activeItem.previousElementSibling;
            if (prevItem) {
                activeItem.classList.remove('active');
                prevItem.classList.add('active');
                prevItem.scrollIntoView({ block: 'nearest' });
            }
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeItem) {
            activeItem.click();
        }
    } else if (e.key === 'Escape') {
        clearSuggestions();
    }
});

// Initialize the app when the page loads
window.addEventListener('load', () => {
    createUXElements();
    initApp();
    setSavedLocation();
});

// Refresh weather data periodically (every 30 minutes)
setInterval(() => {
    if (lastLatitude && lastLongitude) {
        setLocation(lastLatitude, lastLongitude);
    }
}, 30 * 60 * 1000);

// Handle offline/online status
window.addEventListener('online', () => {
    showNotification('You are back online', 'success');
    // Refresh data if we have a location
    if (lastLatitude && lastLongitude) {
        setLocation(lastLatitude, lastLongitude);
    }
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Some features may be unavailable.', 'error');
});