//convenience funtion to get element by id
export function getElement(id) {
    if (!id) throw "Missing an id";
    return document.getElementById(id);
  }
  
  //convenience function to get value of an element
  export function getValue(id) {
    if (!id) throw "Missing an id";
    return getElement(id).value;
  }
  