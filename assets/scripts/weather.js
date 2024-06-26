const APIKEY = "&APPID=7e72072283008043ee9f02c4250ba02a";
const GEOBASE = `https://api.openweathermap.org/geo/1.0/direct?q={{QUERY}}${APIKEY}&limit=1`;
const WBASE = "https://api.openweathermap.org/data/2.5/forecast?";
const WEATHER = `${WBASE}lat={{LAT}}&lon={{LON}}&units=imperial${APIKEY}`;
const ICONURI = "https://openweathermap.org/img/wn/";
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

export const NAME = "location";
export const DATE = "dt";
export const DATETXT = "dtext";
export const WIND = "wind";
export const TEMP = "temp";
export const HUM = "humidity";
export const ICON = "icon";
export const DESC = "description";

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

/**
 * Get the forcast for a location
 * @param string location
 * @returns
 */
export async function getForcast(location) {
  //get the coordinates for a location
  let coordinates = await getCoordinates(location);
  if (!coordinates) return null;

  //get the forcast for the location
  return getWeather(coordinates.lat, coordinates.lon, location);
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
      console.error(msg);
      throw msg;
    }
    let geo = await res.json();
    // console.log(geo);
    if (!geo || (Array.isArray(geo) && geo.length < 1)) {
      console.warn(`no results for location ${location}`);
      return;
    }
    if (!Array.isArray(geo)) {
      console.warn("warn: expected geo to return array!");
      return;
    }
    let r = {
      lat: geo[0].lat,
      lon: geo[0].lon,
    };
    // console.log("Returning: " + JSON.stringify(r));
    return r;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Get the weather forcast for given coordinates
 * @param number lat lattitude
 * @param number lon  longitude
 * @param string name location name
 * @returns
 */
async function getWeather(lat, lon, name) {
  if (!lat || !lon) return null;

  try {
    let res = await fetch(getWeatherEndpoint(lat, lon));
    if (res.status !== 200) {
      let msg = `error: weather fetch: ${res.statusText}`;
      // console.log(msg);
      throw msg;
    }
    return formatResponse(await res.json(), name);
  } catch (err) {}
}

/**
 * Lot of assumptions on type because js is stupid and typescript rules
 * Put response into a format expected by the app + any data massage required
 * @param {} res 
 * @param string name
 */
function formatResponse(res, name){

  if(!res) return;
  let w = [];
  res.list.forEach((r)=> {
    let x = {};
    x[NAME] = name;
    x[DATE] = r.dt;
    x[WIND] = r.wind.speed;
    x[TEMP] = r.main.temp;
    x[HUM] = r.main.humidity;
    x[ICON] = ICONURI + r.weather[0].icon + ".png";
    // console.log("ICON: " + x[ICON])
    x[DESC] = r.weather[0].main;
    x[DATETXT] = dayjs(dayjs.unix(r.dt)).format("MM/DD/YYYY HH:mm:ss").split(" ")[1].trim();
  //   console.log("00000000: " + dayjs.utc().isUTC())
  //   console.log(`_____ ${dayjs(dayjs.unix(r.dt)).format("MM/DD/YYYY HH:mm:ss")}
  //   ${r.main.temp}  -----> ${r.dt_txt}
  // `);
  // console.log(`-----> ${x[DATETXT]}`)
    w.push(x);
  });

  return w;
}