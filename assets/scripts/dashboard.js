import {
  DATE,
  ICON,
  DESC,
  TEMP,
  NAME,
  WIND,
  HUM,
  getForcast,
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
    weather.forEach((d) => {
      let hasToday = false;

      //grab the first time slot for today since api will return any slots of the day
      //still remaining (i.e. if now is noon, then will return the afternoon/eve slots)
      //data goes to the day card
      if (
        d[DATE] >= dayjs().startOf("day").unix() &&
        d[DATE] <= dayjs().endOf("day").unix() &&
        !hasToday
      ) {
        hasToday = true;
        addDaily(createCard(d));
      }
      //data goes to forcast cards
      if (d[DATE] > dayjs().endOf("day").unix()) {
      }
    });
  } else {
    console.warn("none");
  }
}

function addDaily(card) {
  if (card) {
    let daily = $("#cardToday").append(card);
  }
}

function createCard(data, isDaily) {
  if (!data) return null;

  const card = $(`
    <div class="card" id="${data[DATE]}">
    <div class="card-body">
    <h5 class="card-title ${isDaily ? "daily" : "forcast"}">${
    isDaily
      ? data[NAME](dayjs(dayjs.unix(data[DATE])).format("MM/DD/YYYY  HH"))
      : dayjs(dayjs.unix(data[DATE])).format("MM/DD/YYYY")
  }</h5>
    <img class="icon" src="${data[ICON]}" alt="${data[DESC]}"/>
    <p class="card-text">Temp: ${data[TEMP]} &deg;F}</p>
    <p class="card-text">Wind: ${data[WIND]} MPH</p>
    <p class="card-text">Humidity: ${data[HUM]} &percnt;</p>
    </div>
    </div>
  `);
  return card;
}
