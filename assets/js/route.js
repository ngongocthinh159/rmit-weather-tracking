import { renderWeather, renderError404 } from './main.js';
const defaultLocation = '#/weather?lat=10.7758439&lon=106.7017555'; // Ho Chi Minh city

const routes = new Map([
  ['/current-location', currentLocation],
  ['/weather', searchedLocation],
]);

const checkHash = function () {
  const requestURL = window.location.hash.slice(1); // skip '#' character

  const [route, query] = requestURL.includes('/weather?')
    ? requestURL.split('?')
    : [requestURL];

  routes.get(route) ? routes.get(route)(query) : renderError404();
};

window.addEventListener('hashchange', checkHash);

window.addEventListener('load', () => {
  if (!window.location.hash) {
    window.location.hash = '#/current-location';
  } else {
    checkHash();
  }
});

function searchedLocation(query) {
  renderWeather(...query.split('&')); // renderWeather('lat=31.32','lon=21.32')
}

function currentLocation() {
  window.navigator.geolocation.getCurrentPosition(
    (res) => {
      const { lat, lon } = res.coords;

      renderWeather(`lat=${lat}`, `lon=${lon}`);
    },
    (err) => {
      window.location.hash = defaultLocation;
    }
  );
}
