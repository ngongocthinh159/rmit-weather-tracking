const API_KEY = ''; // Create a free account in https://openweathermap.org/ and get your free API key, then place it in here to use the application

function fetchData(URL, callback) {
  fetch(`${URL}`)
    .then((res) => res.json())
    .then((data) => callback(data))
    .catch((e) => {
      console.log('Fetch error!');
    });
}

const URL = {
  getOneCallURL(lat, lon) {
    return `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  },
  getCurrentWeatherURL(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  },
  get5DaysForeCastURL(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  },
  getAirPollutionURL(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  },
  getGeocodingURL(cityName) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;
  },
  getReverseGeocodingURL(lat, lon) {
    return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${API_KEY}`;
  },
};

export { fetchData, URL };
