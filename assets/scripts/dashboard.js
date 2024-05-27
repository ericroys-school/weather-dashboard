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
import { getElement, getValue } from "./helper.js";

document.getElementById("btnSearch").addEventListener("click", (event) => {
  event.preventDefault();
  renderCards();
  //getCoordinates("Evansville, WISCONSIN, US").then((r) => console.log(r))
});

async function renderCards() {
  let location = getValue("inCity");
  if (!location) return;
  let weather = await getForcast(location);
  if (weather) {

    //clean up any cached leftovers
    clear5Day();

    //iterate the results and render to page
    weather.forEach((d) => {
      let hasToday = false;
      let i = 1;

      //grab the first time slot for today since api will return any slots of the day
      //still remaining (i.e. if now is noon, then will return the afternoon/eve slots)
      //data goes to the day card
      if (
        isToday(d[DATE]) &&
        !hasToday
      ) {
        clearDaily();
        hasToday = true;
        render(true, createCard(d, true));
      }
      //data goes to forcast cards
      else if (!isToday(d[DATE]) && d[DATETXT] === "12:00:00") {
        console.log("*******: " + d[DATETXT] + "    --> " + dayjs(dayjs.unix(d[DATE])).format("MM/DD/YYYY  HH"))
        render(false, createCard(d, false));
      }
    });
  } else {
    console.warn("none");
  }
}

function isToday(d){
    return d >= dayjs().startOf("day").unix() &&
    d <= dayjs().endOf("day").unix();
}

function clearDaily(){
    $("#cardToday").empty();
}
function clear5Day(){
    $("#container5day").empty();
}

function render(isDaily, card){

    //if we didn't get a valid card just return
    if(!card) return;
    //otherwise add the card to the appropriate container
    //depending on daily or forcast
    let place = isDaily ? $("#cardToday") : $("#container5day");
    place.append(card);
}

function createCard(data, isDaily) {
  if (!data) return null;
    console.log("DAILY: " + isDaily);

  //icon tag definition
  let ico = `<img class="icon" src="${data[ICON]}" alt="${data[DESC]}"/>`

  //set the card header based on whether dealing with daily or forcast
  let header = isDaily
  ? `${data[NAME]} (${dayjs(dayjs.unix(data[DATE])).format("MM/DD/YYYY  HH")})`
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
