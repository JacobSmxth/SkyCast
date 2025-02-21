const tempVal = document.querySelector("#temperatureVal");
const locationInput = document.querySelector("#locationInput");
const weatherType = document.querySelector("#weatherType");
const windVal = document.querySelector("#windVal");
const locationName = document.querySelector('#locationVal')

const hrContainer = document.querySelector("#hourlyWeather")

const deg = "°F"


// simple function to make debugging easier and quicker
function l(v) {
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

    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=1&appid=${API_key}`

    const geoData = await fetchJson(geoUrl);
    if (geoData) {
        locationName.innerText = `${geoData[0].name}, ${geoData[0].state} in the ${geoData[0].country}`
    }

    const weatherData = await fetchJson(apiUrl);
    if (weatherData) {
        l(weatherData)
        const {current, hourly} = weatherData;

        setWeatherUi(current.temperature_2m, current.weather_code, current.wind_wspeed_10m)
        setHourlyUi(current.time, hourly.time, hourly.temperature_2m, hourly.precipitation_probability)
    }
}


function setWeatherUi(temp, weather, wind) {

    const tempString = Math.round(temp) + deg
    const windString = () => {
        if(wind === 0) return "No winds currently"
        else return `${wind} mph winds`
    }
    const weatherString = () => {
        switch (weather) {
            case 0:
                return "Clear Skies"
            case 1:
                return "Mostly Clear"
            case 2:
                return "Partly Cloudy"
            case 3:
                return "Overcast"
            case 45:
            case 48:
                return "Foggy"
            case 51: 
            case 53: 
            case 55:
                return "Drizzle"
            case 56:
            case 57:
                return "Freezing Drizzle"
            case 61:
                return "Light Rain"
            case 63:
                return "Moderate Rain"
            case 65:
                return "Heavy Rain"
            case 95:
                return "Thunderstorms"
            default:
                return "Weathering weather"
        }
    }

    tempVal.innerText = tempString
    weatherType.innerText = weatherString()
    windVal.innerText = windString()
}

function setHourlyUi(currentTime, timeArr, tempArr, precArr) {

    let newTimeArr = []
    let newTempArr = []



    for(let i = 0; i < timeArr.length; i++) {
        if (timeArr[i] > currentTime) {
            newTimeArr.push(timeArr[i])
            newTempArr.push(tempArr[i])
        }
    }
    let i = 0;
    newTimeArr.slice(0, 10).forEach(thing => {
    
        const item = document.createElement('li')
        const hrTime = document.createElement('h3')
        const hrTemp = document.createElement('h4')
        const hrPrec = document.createElement('p')

        item.className = "hour"
        hrTime.className = "hourTime"
        hrTemp.className = "hourTempVal"
        hrPrec.className = "hourHumidity"

        hrContainer.append(item)
        item.append(hrTime)
        item.append(hrTemp)
        item.append(hrPrec)

        hrTime.innerText = thing.slice(11)
        hrTemp.innerText = Math.round(newTempArr[i]) + deg;
        hrPrec.innerText = precArr[i] +"%"

        i++
    })



}

initApp()


