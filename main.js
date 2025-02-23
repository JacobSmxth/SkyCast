const tempVal = document.querySelector("#temperatureVal");
const locationInput = document.querySelector("#locationInput");
const weatherType = document.querySelector("#weatherType");
const windVal = document.querySelector("#windVal");
const locationName = document.querySelector('#locationName')
const suggestionsContainer = document.querySelector('#suggestions')
const hrContainer = document.querySelector("#hourlyWeather")

const weeklyContainer = document.querySelector("#weeklyWeather")
const weeklyDay = document.querySelector(".weekDay")
const weeklyDate = document.querySelector(".exactWeekDay")
const weekTempHigh = document.querySelector(".weekTempHigh")
const weekTempLow = document.querySelector(".weekTempLow")
const weekSunrise = document.querySelector(".sunrise")
const weekSunset = document.querySelector(".sunset")
const weekPrecChance = document.querySelector(".weekPrecipitationChance")
const weekUVIndex = document.querySelector(".weekUVIndex")

const saveBtn = document.querySelector("#saveLocation")
const locationList = document.querySelector('#locationList')

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const deg = "°F"

let savedLocations = JSON.parse(localStorage.getItem('locations') || "[]");

let lastLatitude
let lastLongitude

// simple function to make debugging easier and quicker
function log(v) {
    console.log(v)
}

function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
}

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

async function fetchWeatherAndGeoData(lat, long) {
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,precipitation_hours,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`
    const geoApiUrl = `https://us1.api-bdc.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`

    const [weatherData, geoData] = await Promise.all([
        fetchJson(weatherApiUrl),
        fetchJson(geoApiUrl)
    ])

    return {weatherData, geoData};
}

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

function debounce(fun, delay) {
    let timeout
    return function(...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => fun.apply(this, args), delay)
    }
}

function checkFetchSuggestions(query) {
    return query.length >= 3
}

function clearSuggestions() {
    suggestionsContainer.classList.remove("toggle")
    suggestionsContainer.innerHTML = ''
}

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

function renderSuggestions(data) {
    suggestionsContainer.classList.add('toggle')
    suggestionsContainer.innerHTML = ''
    data.forEach(result => {
        const item = createSuggestionItem(result)
        suggestionsContainer.appendChild(item)
    })
}

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

function setWeatherUi(temp, weather, wind) {
    tempVal.innerText = `${Math.round(temp)}${deg}`
    windVal.innerText = wind === 0 ? "No winds currently" : `${wind} mph winds`
    
    weatherType.innerText = checkWeatherCode(weather) || "Weathering Weather"
}

function toNormalTime(time) {
    let val = parseInt(time.split(":")[0])

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

function stillValidDay(day, maxDays) {
    return  day <= parseInt(maxDays) 
}

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

function setUi(data1, data2) {
    const { current, hourly, daily } = data1;
    locationName.innerText = `${data2.locality}, ${data2.principalSubdivisionCode.slice(3)}`

    setWeatherUi(current.temperature_2m, current.weather_code, current.wind_speed_10m)
    setHourlyUi(current.time, hourly.time, hourly.temperature_2m, hourly.precipitation_probability)
    setDailyUi(data1)
}

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

async function setSavedLocation() {
    locationList.innerHTML = '';
    for (const location of savedLocations) {
        const data = await fetchSavedLocationData(location.lat, location.long);
        const { name, abr, temp, weather, wind, prec, lat, lon } = data;
        addSavedElement(name, abr, temp, weather, wind, prec, lat, lon);
    }
}

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

function addSavedElement(name, abr, temp, weather, wind, prec, lat, lon) {
    const li = document.createElement('li');
    li.className = 'weather-item';
    li.setAttribute('data-id', `${lat},${lon}`);
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