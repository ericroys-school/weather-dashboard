const APIKEY = "&APPID=7e72072283008043ee9f02c4250ba02a";
const GEOBASE = `http://api.openweathermap.org/geo/1.0/direct?q={{QUERY}}${APIKEY}&limit=1`;
const WBASE = "http://api.openweathermap.org/data/2.5/forecast?";
const WEATHER = `${WBASE}lat={{LAT}}&lon={{LON}}&units=imperial${APIKEY}`;

/** get the endpoint for weather forcast */
function getWeatherEndpoint(lat, lon) {
  //replace the placeholder vars with actual vars
  return WEATHER.replace("{{LAT}}", lat).replace("{{LON}}", lon);
}

/** get the endpoint for geo lookup */
function getGeoEnpoint(query) {
  //replace the placeholder vars with actual vars
  return GEOBASE.replace("{{QUERY}}", query.trim());
}


/** get the coordinates for a given location
 *  since the requirements didn't specifically call out
 *  how the behavior should work if more than single match
 *  occurs, this is using the simple first match rule
 */
export async function getCoordinates(location) {
  if (!location || location.length < 1) return null;

  try {
    let res = await fetch(getGeoEnpoint(location));
    if (res.status !== 200) {
      let msg = `error: geo city search: ${res.statusText}`;
      console.log(msg);
      throw msg;
    }
    let geo = await res.json();
    // console.log(geo);
    if (!geo || (Array.isArray(geo) && geo.length < 1)) {
      console.log(`no results for location ${location}`);
      return;
    }
    if (!Array.isArray(geo)) {
      console.log("warn: expected geo to return array!");
      return;
    }
    let r = {
      lat: geo[0].lat,
      lon: geo[0].lon,
    };
    console.log("Returning: " + JSON.stringify(r));
    return r;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Get the weather forcast for given coordinates
 * @param {*} lat 
 * @param {*} lon 
 * @returns 
 */
export async function getWeather(lat, lon) {

  if (!lat || !lon) return null;

  try{}catch(err){
    let res = fetch(getWeatherEndpoint(lat, lon));
    if (res.status !== 200) {
      let msg = `error: weather fetch: ${res.statusText}`;
      console.log(msg);
      throw msg;
    }
    let r = await res.json();

  }
}


