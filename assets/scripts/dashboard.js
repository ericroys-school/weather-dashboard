import {
  DATE,
  ICON,
  DESC,
  TEMP,
  NAME,
  WIND,
  HUM,
  getForcast,
  DATETXT,
} from "./weather.js";
import { CITY } from "./storage.js";
import { getValue } from "./helper.js";
import { createEntry, getListEntries } from "./storage.js";

const DEFAULT_TXT = `<p>Please enter a city to search</p><p>e.g. <b>Sacramento, California, US</b>
or <b>Cork, Ireland</b></p>`;
const NOMATCH = `${DEFAULT_TXT}<p>-- No match found --</p>`;

document.getElementById("btnSearch").addEventListener("click", (event) => {
  event.preventDefault();
  renderCards(getValue("inCity"));
});

function setMsg(msg) {
  clear5Day();
  clearDaily();
  let t = $("#cardToday");
  t.append(msg);
}

function setNoMatch() {
  setMsg(NOMATCH);
}

function setDefaultMsg() {
  setMsg(DEFAULT_TXT);
}

/**
 * Render all the cards for a given location
 * @param string location name (expect city, state, country code)
 * @returns
 */
async function renderCards(location) {
  if (!location) {
    setDefaultMsg();
    return;
  }
  let weather = await getForcast(location);
  if (weather) {
    //clean up any cached leftovers
    clear5Day();
    let hasToday = false;

    //vars for forecast
    const slots = {};
    const matched = {};
    //iterate the results and render to page
    weather.forEach((d) => {
      //grab the first time slot for today since api will return any slots of the day
      //still remaining (i.e. if now is noon, then will return the afternoon/eve slots)
      //data goes to the day card
      if (isToday(d[DATE]) && !hasToday) {
        // console.log("***Daily****: " + d[DATETXT]);
        clearDaily();
        hasToday = true;
        render(true, createCard(d, true));
      } else if (!isToday(d[DATE])) {

      /* deal with the forcast: idea is to get the 16:00 timeframe but
         depending on the time of day the data is pulled, there may not
         be a timeslot for that so use the one just prior to it
      */
        // get the day from date
        let day = dayjs(dayjs.unix(d[DATE])).format("DD");
        //if there is not currently match on the day for the 1600 slot
        //write the slot
        if (!matched[day]) {
          slots[day] = d;
          //if 1600 slot then don't write any more for that day slot
          if (d[DATETXT] === "16:00:00") {
            matched[day] = true;
          }
        }
      }
    });

    // render the 5 day slots collected earlier
    Object.values(slots).forEach((v) => {
      render(false, createCard(v, false));
    });

    //write the city to storage
    createEntry(weather[0][NAME]);
    //re-render history list
    renderHistoryList();
  } else {
    setNoMatch();
  }
}

/**
 * check if it's today or not
 * @param date in milliseconds
 * @returns true if today otherwise false
 */
function isToday(d) {
  return d >= dayjs().startOf("day").unix() && d <= dayjs().endOf("day").unix();
}

/**
 * clear the daily weather
 */
function clearDaily() {
  $("#cardToday").empty();
}

/**
 * Clear the 5 day forcast
 */
function clear5Day() {
  $("#container5day").empty();
}

/**
 * Render a card to it's proper placeholder
 * @param boolean isDaily
 * @param card object card
 * @returns
 */
function render(isDaily, card) {
  //if we didn't get a valid card just return
  if (!card) return;
  //otherwise add the card to the appropriate container
  //depending on daily or forcast
  let place = isDaily ? $("#cardToday") : $("#container5day");
  place.append(card);
}

/**
 * Build an individual card element
 * @param weather object data
 * @param boolean isDaily true for daily card otherwise for forecast card
 * @returns a card element
 */
function createCard(data, isDaily) {
  if (!data) return null;

  //icon tag definition
  let ico = `<img class="icon" src="${data[ICON]}" alt="${data[DESC]}"/>`;

  //set the card header based on whether dealing with daily or forcast
  let header = isDaily
    ? `${data[NAME]} (${dayjs(dayjs.unix(data[DATE])).format(
        "MM/DD/YYYY  HH"
      )})`
    : dayjs(dayjs.unix(data[DATE])).format("MM/DD/YYYY");

  //card tag definition
  const card = $(`
    <div class="card ${isDaily ? "daily" : "forecast"}" id="${data[DATE]}">
    <div class="card-head">
    <span class="card-title ">${header} ${isDaily ? ico : ""}</span>
    ${!isDaily ? `<p>${ico}</>` : ""}
    </div>
    <div class="card-body">
    <p class="card-text">Temp: ${data[TEMP]} &deg;F</p>
    <p class="card-text">Wind: ${data[WIND]} MPH</p>
    <p class="card-text">Humidity: ${data[HUM]} &percnt;</p>
    </div>
    </div>
  `);
  return card;
}

/**
 * Renders the buttons for the history list
 * @returns
 */
function renderHistoryList() {
  let entries = getListEntries();
  if (!entries) return;
  let place = $("#history");
  place.empty();

  entries.forEach((en) => {
    let place = $("#history");
    place.append(
      `<button data-name="${en[CITY]}" class="btn-history">${en[CITY]}</button>`
    );
  });
}

/** set default msg and load the history when page loads */
$(document).ready(function () {
  setDefaultMsg();
  renderHistoryList();
});

/**
 * add btn click handler for the history buttons
 */
let h = $("#history").on("click", ".btn-history", (e) => {
  let c = $(e.target).attr("data-name");
  renderCards(c);
});
