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


// =========================
//  Global Variables
// =========================

let savedLocations = JSON.parse(localStorage.getItem('locations') || "[]");
let lastLatitude
let lastLongitude






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
    const year = date.getYear()
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
    try {
        const position = await getCoords()

        const userLat = position.coords.latitude;
        const userLong = position.coords.longitude;

        setLocation(userLat, userLong);

    } catch (error) {
        console.error("Error obtaining location: ", error)
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
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error(`Error fetching ${url}: `, error)
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
    const {weatherData, geoData } = await fetchWeatherAndGeoData(lat, long)
    if (weatherData && geoData) {
        setUi(weatherData, geoData)
        lastLatitude = lat
        lastLongitude = long
    } else {
        alert("Error fetching location")
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
    const {weatherData, geoData } = await fetchWeatherAndGeoData(lat, long)
    if (weatherData && geoData) {
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
        console.error("Error fetching saved location data")
        return null
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
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'SkyCast/0.4'
        }
    })
    const data = await response.json()
    log("Fetched suggestions:", data);
    return data
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

    return weatherString[code]
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
    
    weatherType.innerText = checkWeatherCode(weather) || "Weathering Weather"
}

/**
 * Converts a 24-hour time string to a 12-hour format.
 *
 * @param {string} time - The time string (e.g., "13:00:00").
 * @returns {string} The formatted time string (e.g., "1PM").
 */
function toNormalTime(time) {
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

    let html = '';
    forecastData.slice(0,15).forEach((entry, index) => {
        html += `
        <li class="hour">
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
        let daysThisMonth = daysInMonth(year, curMonth)
        html += `
            <li>
                            <div class="dayStuff">
                                <h3 class="weekDay">${date}</h3>
                                <h4 class="exactWeekDay">${curMonth}/${futureDay}</h4>
                            </div>
                            <div class="tempInfo">
                                <h3 class="weekTempHigh">${temperature_2m_max[index] + deg}</h3>
                                <h3 class="weekTempLow">${temperature_2m_min[index]+ deg}</h3>
                            </div>
                            <div class="sunInfo">
                                <p class="sunrise">Sunrise: ${(sunrise[index].slice(11))}</p>
                                <p class="sunset">Sunset: ${sunset[index].slice(11)}</p>
                            </div>
                            <p class="weekWeatherType">${checkWeatherCode(weather_code[index])}</p>
                            <p class="weekPrecipitationChance">Precipitation: ${precipitation_probability_max[index]}% </p>
                            <p class="weekUVIndex">UV: ${uv_index_max[index]}</p>
                        </li>
        
        `

        if(stillValidDay(futureDay, daysThisMonth)) {

        } else {
            let newDay = futureDay - daysThisMonth
            let newMonth = curMonth + 1

            if (newMonth > 12) {
                newMonth = 1
                year++
            }

        }
    })
    weeklyContainer.innerHTML = html
}

/**
 * Updates the main UI with current, hourly, and daily weather information.
 *
 * @param {Object} data1 - The weather data object containing current, hourly, and daily information.
 * @param {Object} data2 - The geographical data object containing location details.
 * @returns {void}
 */
function setUi(data1, data2) {
    const { current, hourly, daily } = data1;
    locationName.innerText = `${data2.locality}, ${data2.principalSubdivisionCode.slice(3)}`

    setWeatherUi(current.temperature_2m, current.weather_code, current.wind_speed_10m)
    setHourlyUi(current.time, hourly.time, hourly.temperature_2m, hourly.precipitation_probability)
    setDailyUi(data1)
}

/**
 * Saves the current location to localStorage if it is not already present.
 *
 * @param {number|string} lat - The latitude.
 * @param {number|string} long - The longitude.
 * @returns {void}
 */
function saveLocation(lat, long) {
    const coords = { lat: parseFloat(lat), long: parseFloat(long) };
    const tolerance = 0.001;
    const isDuplicate = savedLocations.some(
        loc => Math.abs(loc.lat - coords.lat) < tolerance && Math.abs(loc.long - coords.long) < tolerance
    );
    if (!isDuplicate) {
        savedLocations.push(coords);
        localStorage.setItem("locations", JSON.stringify(savedLocations));
        log(`Saved Location: ${coords.lat}, ${coords.long}`);
        setSavedLocation();
    } else {
        log(`Location ${coords.lat}, ${coords.long} already saved`);
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
    for (const location of savedLocations) {
        const data = await fetchSavedLocationData(location.lat, location.long);
        const { name, abr, temp, weather, wind, prec, lat, lon } = data;
        addSavedElement(name, abr, temp, weather, wind, prec, lat, lon);
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
    log("Removing: ", lat, lon);
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    savedLocations = savedLocations.filter(loc => 
        loc.lat !== latNum || loc.long !== lonNum
    );
    log('New savedLocations', savedLocations);
    localStorage.setItem('locations', JSON.stringify(savedLocations));
    setSavedLocation();
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
    li.className = 'weather-item';
    li.setAttribute('data-id', `${lat},${lon}`); // THis was giving trouble, had to change from setting everything in a innerHTML
    li.innerHTML = `
        <h2 class="location-name">${name}, ${abr}</h2>
        <button class="remove-btn"></button>
        <div class="weather-stats">
            <p class="temp">${temp}${deg}</p>
            <p class="wind"><span class="windIcon"></span>${wind} mph</p>
            <p class="precipitationChance"><span class="precipitationIcon"></span>${prec}% chance</p>
            <p class="weatherType">${checkWeatherCode(weather)}<span class="weatherIcon"></span></p>
        </div>
    `;
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
        alert("Nope, I dont think so")
    }
})

locationList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const clicked = e.target.closest('.weather-item');
        const id = clicked.getAttribute('data-id');
        const [lat, lon] = id.split(',');
        removeSavedLocation(lat, lon);
    }
});

locationInput.addEventListener('input', debounce(async (e) => {
    const query = e.target.value.trim();
    await fetchSuggestions(query)
}, 300))

initApp()
setSavedLocation()