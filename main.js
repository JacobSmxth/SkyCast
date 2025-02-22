const tempVal = document.querySelector("#temperatureVal");
const locationInput = document.querySelector("#locationInput");
const weatherType = document.querySelector("#weatherType");
const windVal = document.querySelector("#windVal");
const locationName = document.querySelector('#locationName')

const hrContainer = document.querySelector("#hourlyWeather")

const deg = "°F"


// simple function to make debugging easier and quicker
function log(v) {
    console.log(v)
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

// Function to set location of 
async function setLocation(lat, long) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,precipitation_hours,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`

    const geoUrl = `https://us1.api-bdc.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`

    const geoData = await fetchJson(geoUrl);
    if (geoData) {
        log(geoData)
        locationName.innerText = `${geoData.locality}, ${geoData.principalSubdivisionCode.slice(3)}`
    }

    const weatherData = await fetchJson(apiUrl);
    if (weatherData) {
        log(weatherData)
        const {current, hourly} = weatherData;

        setWeatherUi(current.temperature_2m, current.weather_code, current.wind_speed_10m)
        setHourlyUi(current.time, hourly.time, hourly.temperature_2m, hourly.precipitation_probability)
    }
}


function setWeatherUi(temp, weather, wind) {
    tempVal.innerText = `${Math.round(temp)}${deg}`
    log(wind)
    windVal.innerText = wind === 0 ? "No winds currently" : `${wind} mph winds`



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

    
    weatherType.innerText = weatherString[weather] || "Weathering Weather"
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
    toNormalTime("13:00")

}

initApp()


