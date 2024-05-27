const CITIES = "weatherCities";
export const CITY = "city";
export const ID = "id"; 

function newCity(name){
    let c = {};
    c[CITY] = name;
    c[ID] = generateId();
    return c;
}

/* generate a UUID */
function generateId() {
    // generate a UUID as an id
    return crypto.randomUUID();
  }

/**
 * get the task entry array from local storage or create an empty one
 * @returns ["name1", "name2", "name3"] or empty array
 */
export function getListEntries() {
  let store = localStorage.getItem(CITIES);
  return store ? JSON.parse(store) : [];
}

/**
 * Get an entry from local storage
 * @param string name
 * @returns city or null
 */
export function getEntry(name) {
  let f = getListEntries().find((t) => name === t[CITY]);
  return f ? f : null;
}

/**
 * write the new item to the local storage
 * @param string name
 */
export function createEntry(name) {
  if (name) {
    //commit it as lower
    let lname = name.toLowerCase().trim();

    //only add if it isn't there already
    if (!getEntry(lname)) {
      //get existing array to append
      let store = getListEntries();
      /* only push in 10. If one wanted to get fancy and define
       policy for popping off the oldest have at it but just 
       doing cheap and dirty for now
    */
      if (store.length < 11) {
        store.push(newCity(lname));
        localStorage.setItem(CITIES, JSON.stringify(store));
      }
    }
  }
}
