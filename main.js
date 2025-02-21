


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

function setLocation(lat, long) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_key}`
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was doo doo');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error)
        })
}

initApp()


