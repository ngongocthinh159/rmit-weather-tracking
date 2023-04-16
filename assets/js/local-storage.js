const STORAGE_KEY = 's3879364_ex2';

function getSavedCitys() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

/**
 *
 * @param {array} cityArray // [[lat1, lon1], [lat2, lon2],...]
 */
function storeCitys(cityArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cityArray));
}

export { getSavedCitys, storeCitys };
