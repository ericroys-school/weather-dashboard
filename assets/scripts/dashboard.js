
import { getCoordinates } from "./weather.js";



document.getElementById("btnSearch").addEventListener('click', ()=>{
    event.preventDefault();

    getCoordinates("Evansville, WISCONSIN, US").then((r) => console.log(r))

})

