// Weather App Configuration and Constants
const apiKey = 'e3b18d5022affc4119fe54454edbe155';
let units = 'metric';
let currentLanguage = 'en';
let currentCityTimezone = 0;

// DOM Element References
const searchInput = document.getElementById('search');
const unitToggleBtn = document.getElementById('unitToggle');
const languageSelect = document.getElementById('languageSelect');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const weatherDisplay = document.getElementById('weatherDisplay');
const forecastDisplay = document.getElementById('forecast');

// Event Listeners
unitToggleBtn.addEventListener('click', handleUnitToggle);

languageSelect.addEventListener('change', handleLanguageChange);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather(searchInput.value);
    }
});

function handleLanguageChange(event) {
    currentLanguage = event.target.value;

    // Trigger weather fetch with the new language
    getWeather()
        .then(() => {
            // Handle successful weather fetch and update UI
        })
        .catch(error => {
            // Handle errors, e.g., display error message to the user
            console.error('Error fetching weather data:', error);
            showError('Error fetching weather data. Please try again.');
        });
}

// Unit Toggle Handler
function handleUnitToggle() {
    units = units === 'metric' ? 'imperial' : 'metric';
    if (searchInput.value) {
        getWeather();
    }
}

// Language Change Handler
function handleLanguageChange(event) {
    currentLanguage = event.target.value;
    if (searchInput.value) {
      getWeather();
    }
  }

// Loading Spinner Toggle
function toggleLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

// Error Message Display
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Weather Fetch with 5-Day Forecast
async function getWeather() {
    const city = searchInput.value.trim();
  
    if (!city) {
      showError('Please enter a city name');
      return; // Exit the function if no city is entered
    }
  
    toggleLoading(true);
  
    try {
      const weatherUrl = buildWeatherUrl(city);
      const forecastUrl = buildForecastUrl(city); // Helper functions for URLs
  
      const response = await Promise.all([fetch(weatherUrl), fetch(forecastUrl)]);
  
      if (!response[0].ok || !response[1].ok) {
        throw new Error('City not found'); // Handle API errors
      }
  
      const weatherData = await response[0].json();
      const forecastData = await response[1].json();
  
      displayWeather(weatherData);
      displayForecast(forecastData);
      errorMessage.style.display = 'none'; // Hide error message
  
    } catch (error) {
      showError(error.message);
      weatherDisplay.innerHTML = ''; // Clear display in case of errors
      forecastDisplay.innerHTML = '';
    } finally {
      toggleLoading(false);
    }
  }
  
  // Helper functions to build weather and forecast URLs (optional)
  function buildWeatherUrl(city) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;
  }
  
  function buildForecastUrl(city) {
    return `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;
  }

// Current Weather Display
function displayWeather(data) {
    const tempUnit = units === 'metric' ? '°C' : '°F';
    const windUnit = units === 'metric' ? 'm/s' : 'mph';

    weatherDisplay.innerHTML = `
        <div class="row">
            <div class="col-md-6 text-center">
                <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                <h2>${data.name}, ${data.sys.country}</h2>
                <p>${Math.round(data.main.temp)}${tempUnit}</p>
                <p>${data.weather[0].description}</p>
            </div>
            <div class="col-md-6">
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind Speed: ${data.wind.speed} ${windUnit}</p>
                <p>Pressure: ${data.main.pressure} hPa</p>
                <p>Feels Like: ${Math.round(data.main.feels_like)}${tempUnit}</p>
            </div>
        </div>
    `;

     // Start city-specific time display
     startCityTimeDisplay();
}



// 5-Day Forecast Display
function displayForecast(data) {
    forecastDisplay.innerHTML = '';
    const tempUnit = units === 'metric' ? '°C' : '°F';

    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyForecasts.forEach(day => {
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('col-md-3');
        forecastCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${new Date(day.dt_txt).toLocaleDateString()}</h5>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                    <p class="card-text">Temperature: ${Math.round(day.main.temp)}°C</p>
                </div>
            </div>
        `;
        forecastDisplay.appendChild(forecastCard);
    });
}

// Geolocation Function
function getUserLocation() {
    if (navigator.geolocation) {
        toggleLoading(true);
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            error => {
                showError('Unable to retrieve your location');
                toggleLoading(false);
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

// Weather by Coordinates
async function getWeather() {
    const city = searchInput.value.trim();
  
    if (!city) {
      showError('Please enter a city name');
      return;
    }
  
    toggleLoading(true);
  
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;
  
      console.log("Fetching weather data for:", city, "in language:", currentLanguage);
  
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);
  
      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('City not found');
      }
  
      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
  
      console.log("Weather data:", weatherData);
      console.log("Forecast data:", forecastData);
  
      displayWeather(weatherData);
      displayForecast(forecastData);
      errorMessage.style.display = 'none';
    } catch (error) {
      console.error("Error fetching weather data:", error);
      showError(error.message);
      weatherDisplay.innerHTML = '';
      forecastDisplay.innerHTML = '';
    } finally {
      toggleLoading(false);
    }
  }

// New City-Specific Time Display Function
function startCityTimeDisplay() {
    const localTimeElement = document.getElementById('localTime');
    const localDateElement = document.getElementById('localDate');
    
    function updateCityTime() {
        // Get current UTC time
        const now = new Date();
        
        // Create a new date with the city's timezone offset
        const cityTime = new Date(
            now.getTime() + now.getTimezoneOffset() * 60000 + (currentCityTimezone * 1000)
        );
        
        // Date and Time Options
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const timeOptions = { 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric', 
            hour12: true 
        };

        // Format date and time
        const currentDate = cityTime.toLocaleDateString('en-US', dateOptions);
        const currentTime = cityTime.toLocaleTimeString('en-US', timeOptions);

        // Update display
        localDateElement.textContent = `Date: ${currentDate}`;
        localTimeElement.textContent = `Time: ${currentTime}`;
    }
    
    // Clear any existing interval
    if (window.cityTimeInterval) {
        clearInterval(window.cityTimeInterval);
    }
    
    // Start new interval
    window.cityTimeInterval = setInterval(updateCityTime, 1000);
}

// Modify getWeather to handle time interval
async function getWeather() {
    const city = searchInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    toggleLoading(true);
    
    // Clear existing city time interval if it exists
    if (window.cityTimeInterval) {
        clearInterval(window.cityTimeInterval);
    }
    
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        if (!weatherResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found');
        }

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData);
        displayForecast(forecastData);
        errorMessage.style.display = 'none';
    } catch (error) {
        showError(error.message);
        weatherDisplay.innerHTML = '';
        forecastDisplay.innerHTML = '';
        
        // Clear the city time interval if error occurs
        if (window.cityTimeInterval) {
            clearInterval(window.cityTimeInterval);
        }
    } finally {
        toggleLoading(false);
    }
}

// Modify getWeatherByCoords to handle time interval
async function getWeatherByCoords(lat, lon) {
    // Clear existing city time interval if it exists
    if (window.cityTimeInterval) {
        clearInterval(window.cityTimeInterval);
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData);
        displayForecast(forecastData);
        errorMessage.style.display = 'none';
    } catch (error) {
        showError('Error fetching weather data');
        
        // Clear the city time interval if error occurs
        if (window.cityTimeInterval) {
            clearInterval(window.cityTimeInterval);
        }
    } finally {
        toggleLoading(false);
    }
}

function updateBackground(weatherCondition) {
    console.log(`Updating background for: ${weatherCondition}`);
  
    const body = document.querySelector('body');
  
    const weatherBackgrounds = {
      Clear: 'linear-gradient(to right, #ffdb00, #ffa500)', // Sunny
      Clouds: 'linear-gradient(to right, #d3d3d3, #a9a9a9)', // Cloudy
      Rain: 'linear-gradient(to right, #4e54c8, #8f94fb)', // Rainy
      Thunderstorm: 'linear-gradient(to right, #3a6073, #16222a)', // Thunderstorm
      Snow: 'linear-gradient(to right, #e0eafc, #cfdef3)', // Snowy
      Drizzle: 'linear-gradient(to right, #89f7fe, #66a6ff)', // Drizzle
      Mist: 'linear-gradient(to right, #dde2e3, #bcc9cd)', // Mist/Fog
      default: 'linear-gradient(to right, #667eea, #764ba2)' // Default
    };
  
    // More specific selector to avoid conflicts with Bootstrap
    body.style.background = weatherBackgrounds[weatherCondition] || weatherBackgrounds.default;
  }
  
  // This part assumes you have a function to fetch weather data (e.g., using an API)
  async function fetchWeatherData(city) {
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}&lang=${currentLanguage}`;
  
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);
  
      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('City not found');
      }
  
      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
  
      displayWeather(weatherData);
      displayForecast(forecastData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Handle error, e.g., display an error message to the user
    }
  }

function loadCities() {
    const storedCities = localStorage.getItem('preferredCities');
    return storedCities ? JSON.parse(storedCities) : [];
}

function addCityToList(city) {
    const cities = loadCities();
    cities.push(city);
    displayPreferredCities();
    saveCity(city);
}

function displayPreferredCities() {
    const cities = loadCities();
    cityList.innerHTML = '';

    cities.forEach(city => {
        const cityItem = document.createElement('li');
        cityItem.textContent = city;
        cityItem.addEventListener('click', () => {
            getWeather(city);
        });
        cityList.appendChild(cityItem);
    });
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    getUserLocation(); // Get weather for user's location on page load
    //displayPreferredCities();
});