import { fetchData, URL } from './weatherapi.js';
import {
  weekDays,
  months,
  getFormattedDate,
  getFormattedTime,
  mpsToKmh,
  airQualityText,
} from './utils.js';
import { getSavedCitys, storeCitys } from './local-storage.js';

const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) {
    element.addEventListener(eventType, callback);
  }
};

// Toggle search container on mobile
const searchContainer = document.querySelector('[data-search-container]');
const searchTogglers = document.querySelectorAll('[data-search-toggler]');

function toggleSearch() {
  searchContainer.classList.toggle('active');
}
addEventOnElements(searchTogglers, 'click', toggleSearch);

// Toggle saved locations on mobile
const savedContainer = document.querySelector('.saved-locations');
const savedTogglers = document.querySelectorAll('[data-saved-toggler');
function toggleSavedLocations() {
  savedContainer.classList.toggle('d-none');
}

addEventOnElements(savedTogglers, 'click', toggleSavedLocations);

// Search city by query
const searchInput = document.querySelector('[data-search-input');
const searchResult = document.querySelector('[data-search-result');
let prevSearchTimeout = null;
const DELAY_SEARCH_DURATION = 500;

searchInput.addEventListener('input', () => {
  if (prevSearchTimeout) clearTimeout(prevSearchTimeout);

  if (!searchInput.value) {
    searchResult.classList.remove('active');
    searchResult.innerHTML = ``;
    searchInput.classList.remove('searching');
    return;
  } else {
    searchInput.classList.add('searching');
  }

  if (searchInput.value) {
    prevSearchTimeout = setTimeout(() => {
      fetchData(URL.getGeocodingURL(searchInput.value), (locations) => {
        searchInput.classList.remove('searching');
        searchResult.classList.add('active');
        searchResult.innerHTML = `
          <ul class="search-result__list">
            ${locations
              .map((location) => {
                return `
                <li class="search-result__item">
                  <span class="search-result__item-location-icon m-icon"
                    >location_on</span
                  >

                  <div class="search-result__title-container">
                    <p class="search-result__item-title">${location.name}</p>
                    <p class="label-2 search-result__item-subtitle">
                      ${location.state || ''} ${location.country}
                    </p>
                  </div>

                  <a
                    href="#/weather?lat=${location.lat}&lon=${location.lon}"
                    class="search-result__item-link state-changeable"
                    data-search-toggler
                  ></a>
                </li>
              `;
              })
              .join('')}
          </ul>
        `;

        const resultItems = [
          ...document.querySelectorAll('.search-result__item'),
        ];
        addEventOnElements(resultItems, 'click', () => {
          toggleSearch();
          searchResult.classList.remove('active');
        });
      });
    }, DELAY_SEARCH_DURATION);
  }
});

// Render weather on different locations
const currentLocationBtn = document.querySelector(
  '[data-current-location-btn]'
);
const container = document.querySelector('[data-container]');
const loading = document.querySelector('[data-loading]');
const errorContent = document.querySelector('[data-error-content]');

function renderWeather(lat, lon) {
  lat = lat.replace('lat=', '');
  lon = lon.replace('lon=', '');
  loading.style.display = 'grid';
  container.style.overflowY = 'hidden';
  container.classList.remove('fade-in');
  container.classList.contains('fade-in') ??
    container.classList.remove('fade-in');
  errorContent.style.display = 'none';

  // Render like btn header
  renderLikeBtnHeader(lat, lon);

  // Render body
  const currentWeatherSection = document.querySelector(
    '[data-current-weather]'
  );
  const hightlightSection = document.querySelector('[data-hightlights]');
  const hourlySection = document.querySelector('[data-hourly-forecast]');
  const forecastSection = document.querySelector('[data-five-day-forecast]');

  currentWeatherSection.innerHTML = `
    
  `;
  hightlightSection.innerHTML = `
    
  `;
  hourlySection.innerHTML = `
    
  `;
  forecastSection.innerHTML = `
    
  `;

  if (window.location.hash === '#/current-location') {
    currentLocationBtn.setAttribute('disabled', '');
  } else {
    currentLocationBtn.removeAttribute('disabled');
  }

  if (true) {
    // Fetch data of current weather
    fetchData(URL.getCurrentWeatherURL(lat, lon), (currentWeather) => {
      const {
        weather,
        dt: dateUnix,
        sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC, country },
        main: { temp, feels_like, pressure, humidity },
        visibility,
        timezone,
        name,
      } = currentWeather;
      const [{ description, icon }] = weather;

      currentWeatherSection.innerHTML = `
        <div class="card card-lg current-weather-card">
          <h2 class="title-2 card-title">Now</h2>

          <div class="weapper">
            <p class="heading">${parseInt(temp)}&deg;<sup>c</sup></p>

            <img
              class="weather-icon"
              src="./assets/imgs/weather_icons/${icon}.png"
              width="64"
              height="64"
              alt="${description}"
            />
          </div>

          <p class="body-3">${weather[0].main}</p>

          <ul class="meta-list">
            <li class="meta-item">
              <i class="fa-regular fa-calendar-days"></i>

              <p class="title-3 meta-text">${getFormattedDate(
                dateUnix,
                timezone
              )}</p>
            </li>
            <li class="meta-item">
              <i class="fa-solid fa-location-dot"></i>

              <p class="title-3 meta-text">${name}, ${country}</p>
            </li>
          </ul>
        </div>
      `;

      // Fetch data today hightlight section
      fetchData(URL.getAirPollutionURL(lat, lon), (airPollutions) => {
        const [
          {
            main: { aqi },
            components: { co, no, no2, o3, so2, pm2_5, pm10, nh3 },
          },
        ] = airPollutions.list;

        hightlightSection.innerHTML = `
          <div class="card card-lg">
            <h2 class="title-2" id="hightlights-label">
              Todays Hightlights
            </h2>

            <div class="hightlight__list">
              <div class="card card-sm hightlight-card one">
                <h3 class="title-3">Air Quality Index</h3>

                <div class="wrapper">
                  <ul class="card-list">
                    <li class="card-item">
                      <i class="fa-solid fa-wind"></i>

                      <p class="title-1">${Number(pm2_5).toFixed(2)}</p>

                      <p class="label-1">PM<sub>2.5</sub></p>
                    </li>

                    <li class="card-item">
                      <i class="fa-solid fa-wind"></i>

                      <p class="title-1">${Number(so2).toFixed(2)}</p>

                      <p class="label-1">SO<sub>2</sub></p>
                    </li>

                    <li class="card-item">
                      <i class="fa-solid fa-wind"></i>

                      <p class="title-1">${Number(no2).toFixed(2)}</p>

                      <p class="label-1">NO<sub>2</sub></p>
                    </li>

                    <li class="card-item">
                      <i class="fa-solid fa-wind"></i>

                      <p class="title-1">${Number(o3).toFixed(2)}</p>

                      <p class="label-1">O<sub>3</sub></p>
                    </li>
                  </ul>
                </div>

                <span class="badge aqi-${aqi} label-${aqi}">
                  ${airQualityText[aqi].level}
                </span>
              </div>

              <div class="card card-sm hightlight-card two">
                <h3 class="title-3">Sunrise & Sunset</h3>

                <div class="card-list">
                  <div class="card-item">
                    <span class="m-icon">clear_day</span>

                    <div>
                      <p class="label-1">Sunrise</p>
                      <p class="title-1">${getFormattedTime(
                        sunriseUnixUTC,
                        timezone
                      )}</p>
                    </div>
                  </div>

                  <div class="card-item">
                    <span class="m-icon">clear_night</span>

                    <div>
                      <p class="label-1">Sunset</p>
                      <p class="title-1">${getFormattedTime(
                        sunsetUnixUTC,
                        timezone
                      )}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card card-sm hightlight-card">
                <h3 class="title-3">Humidity</h3>

                <div class="wrapper">
                  <span class="m-icon">Humidity_percentage</span>

                  <p class="title-1">${humidity}<sub>%</sub></p>
                </div>
              </div>

              <div class="card card-sm hightlight-card">
                <h3 class="title-3">Pressure</h3>

                <div class="wrapper">
                  <span class="m-icon">airwave</span>

                  <p class="title-1">${pressure}<sub>hPa</sub></p>
                </div>
              </div>

              <div class="card card-sm hightlight-card">
                <h3 class="title-3">Visibility</h3>

                <div class="wrapper">
                  <span class="m-icon">visibility</span>

                  <p class="title-1">${Number(visibility / 1000).toFixed(
                    2
                  )}<sub>km</sub></p>
                </div>
              </div>

              <div class="card card-sm hightlight-card">
                <h3 class="title-3">Feel like</h3>

                <div class="wrapper">
                  <span class="m-icon">thermostat</span>

                  <p class="title-1">${parseInt(
                    feels_like
                  )}&deg;<sup>c</sup></p>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      // Fetch data current day forecast section, 5 day forecast section
      fetchData(URL.get5DaysForeCastURL(lat, lon), (forecast) => {
        const {
          list: forecastList,
          city: { timezone },
        } = forecast;

        // Hourly forecast section
        hourlySection.innerHTML = `
          <h2 class="title-2">Today at</h2>

          <div class="slider-container">
            <ul class="slider-list" data-temp>
              ${forecastList
                .map((day, index) => {
                  if (index >= 7) return '';

                  return `
                  <li class="slider-item">
                    <div class="card card-sm slider-card">
                      <p class="body-3">${getFormattedTime(
                        day.dt,
                        timezone
                      )}</p>

                      <img
                        src="./assets/imgs/weather_icons/${
                          day.weather[0].icon
                        }.png"
                        width="48"
                        height="48"
                        loading="lazy"
                        alt="Weather icon"
                        class="weather-icon"
                      />

                      <p class="body-3">${day.main.temp}&deg;</p>
                    </div>
                  </li>
                `;
                })
                .join('')}
            </ul>

            <ul class="slider-list" data-wind>
              ${forecastList
                .map((day, index) => {
                  if (index >= 7) return '';

                  return `
                  <li class="slider-item">
                    <div class="card card-sm slider-card">
                      <p class="body-3">${getFormattedTime(
                        day.dt,
                        timezone
                      )}</p>

                      <img
                        src="./assets/imgs/weather_icons/direction.png"
                        width="48"
                        height="48"
                        loading="lazy"
                        alt="Weather icon"
                        class="weather-icon"
                        style="transform: rotate(${-(day.wind.deg - 90)}deg)"
                      />

                      <p class="body-3">${day.wind.speed} km/h</p>
                    </div>
                  </li>
                `;
                })
                .join('')}
            </ul>
          </div>
        `;

        // Next 5 days forecast section
        const HTMLs = [];
        for (let i = 7; i < forecastList.length; i += 8) {
          // Get next 24 hours
          const {
            main: { temp_max },
            weather,
            dt_txt,
          } = forecastList[i];
          const [{ icon }] = weather;
          const date = new Date(dt_txt);

          HTMLs.push(`
            <li class="card-item">
              <div class="icon-wrapper">
                <img
                  src="./assets/imgs/weather_icons/${icon}.png"
                  width="36"
                  height="36"
                  alt="Weather icon"
                  class="weather-icon"
                />

                <span class="text">
                  <p class="title-2">${parseInt(temp_max)}&deg;</p>
                </span>
              </div>

              <p class="label-1">
              ${date.getDate()} ${months[date.getUTCMonth()]}
              </p>
              <p class="label-1">${weekDays[date.getUTCDay()]}</p>
            </li>
          `);
        }

        forecastSection.innerHTML = `
          <h2 class="title-2">5 Days Forecast</h2>

          <div class="card card-lg forecast-card">
            <ul>
              ${HTMLs.join('')}
            </ul>
          </div>
        `;

        loading.style.display = 'none';
        container.style.overflowY = 'overlay';
        container.classList.add('fade-in');
      });
    });
  }
}

// Render like btn
function renderLikeBtnHeader(lat, lon) {
  let cityArray = getSavedCitys() || [];
  const headerActions = document.querySelector('.header-actions');
  const locationBtn = document.querySelector('[data-current-location-btn');
  const loveBtn = document.createElement('button');
  loveBtn.className = 'btn-icon changable-state btn-love';
  loveBtn.style.display = 'flex';

  // Check if current city is saved
  let isSaved = false;
  for (let i = 0; i < cityArray.length; i++) {
    const curCity = cityArray[i];
    if (
      curCity[0] === Number(lat).toFixed(7) &&
      curCity[1] === Number(lon).toFixed(7)
    ) {
      isSaved = true;
      break;
    }
  }

  loveBtn.innerHTML = `
    ${
      isSaved
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>'
    }
  `;

  const prevLoveBtn = headerActions.querySelector('.btn-love');
  if (prevLoveBtn) headerActions.removeChild(prevLoveBtn);
  headerActions.insertBefore(loveBtn, locationBtn);

  loveBtn.addEventListener('click', () => {
    if (!isSaved) {
      cityArray.push([Number(lat).toFixed(7), Number(lon).toFixed(7)]);
      storeCitys(cityArray);
      renderLikeBtnHeader(lat, lon);
    } else {
      let savedIndex = -1;
      for (let i = 0; i < cityArray.length; i++) {
        const curCity = cityArray[i];
        if (
          curCity[0] === Number(lat).toFixed(7) &&
          curCity[1] === Number(lon).toFixed(7)
        ) {
          savedIndex = i;
          break;
        }
      }
      cityArray.splice(savedIndex, 1);
      storeCitys(cityArray);
      renderLikeBtnHeader(lat, lon);
    }
  });
}

// Render saved locations
const savedLocationsBtn = document.querySelector('.btn-saved-locations');
savedLocationsBtn.addEventListener('click', () => {
  renderSavedLocations();
});

function renderSavedLocations() {
  let cityArray = getSavedCitys() || [];
  const ulList = document.querySelector('.saved-locations__list');
  let HTMLs = [];

  cityArray.forEach((city, index) => {
    fetchData(URL.getReverseGeocodingURL(city[0], city[1]), (location) => {
      HTMLs.push(`
        <li class="search-result__item saved-locations__item">
          <span class="search-result__item-location-icon m-icon"
            >location_on</span
          >

          <div class="search-result__title-container">
            <p class="search-result__item-title">${location[0].name}</p>
            <p class="label-2 search-result__item-subtitle">
              ${location[0].state || ''} ${location[0].country}
            </p>
          </div>

          <a
            href="#/weather?lat=${location[0].lat}&lon=${location[0].lon}"
            class="search-result__item-link state-changeable"
            data-saved-toggler
          ></a>
        </li>
      `);

      ulList.innerHTML = HTMLs.join('');

      // Add event listener for each item
      const liSavedItems = ulList.querySelectorAll('.saved-locations__item');
      liSavedItems.forEach((liSavedItem) => {
        liSavedItem.addEventListener('click', () => {
          toggleSavedLocations();
        });
      });
    });
  });
}

// Render error 404
function renderError404() {
  errorContent.style.display = 'flex';
}

export { renderWeather, renderError404 };
