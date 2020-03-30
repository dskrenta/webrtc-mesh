'use strict';

// Global state
window.state = {};

// Global localStorage utils for for JSON storing JS values
window.localStore = {
  get: (key) => JSON.parse(localStorage.getItem(key)),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  del: (key) => localStorage.removeItem(key)
};

window.navigate = (path = '#someRoute') => {
  window.location.href = window.location.origin + path;
}

let pages = {};

let appBodyId = '';

let updateMap = {};

function parseUrl() {
  const url = window.location.hash.slice(1).toLowerCase() || '/';
  const values = url.split("/");

  const request = {
    resource: values[0],
    id: values[1],
    url: window.location.href
  };

  return request;
}

async function mountComponentToDOM(elementId, component) {
  try {
    document.getElementById(elementId).innerHTML = await component.render();
    if (component.afterRender) await component.afterRender();
  }
  catch (error) {
    console.error('mountComponentToDOM error', component, elementId, error);
  }
}
async function router() {
  try {
    const request = parseUrl();
    const page = request.resource in pages ? pages[request.resource] : pages['/'];
    page.request = request;
    if (page.auth) {
      const auth = await page.auth();
      if (!auth) {
        page = pages['/'];
      }
    }
    mountComponentToDOM(appBodyId, page);
  }
  catch (error) {
    console.error(error);
  }
}

/*
    Adds update mapping to update map
    @param {String} stateKey - state key
    @param {Object} inputObj - object containing data required for update
  */
export function addUpdateMapping(stateKey, inputObj) {
  if (stateKey in updateMap) {
    updateMap[stateKey].push(inputObj);
  }
  else {
    updateMap[stateKey] = [
      inputObj
    ];
  }
}

/*
  Updates the DOM given a series of update mappings and value
  @param {Array} mappings - array of mappings
*/
function updateDOM(updateProp) {
  const mappings = updateMap[updateProp];
  if (mappings) {
    for (const { type, className, expression, attribute } of mappings) {
      if (type === 'replaceContent') {
        document.getElementsByClassName(className)[0].innerHTML = runExpression(expression);
      }
      else if (type === 'replaceAttribute') {
        let newAttributeValue = runExpression(expression);
        // If attribute is class, don't overwrite our inserted hash class from render
        if (attribute === 'class') {
          newAttributeValue += ` ${className}`;
        }
        document.getElementsByClassName(className)[0].setAttribute(attribute, newAttributeValue);
      }
    }
  }
}

/*
  Returns the full nested path of a object prop and value given the object
  Assumes every [key, value] pair throughout object is unique
  @param {Object} obj - input object
  @param {String} inputProp - input prop
  @param {String} inputValue - input value
  @param {String} path - path recursion temporary storage variable
*/
function findFullPath(obj, inputProp, inputValue, path = '') {
  for (const [prop, value] of Object.entries(obj)) {
    if (prop === inputProp && value === inputValue) {
      path += `.${prop}`;
      // Remove leading dot
      return path.slice(1);
    }
    else if (isObject(obj[prop])) {
      path += `.${prop}`;
      return findFullPath(obj[prop], inputProp, inputValue, path);
    }
  }

  return false;
}

/*
  Returns a proxy trap which runs updateDOM with passed prop on underlying object set trigger
*/
function createProxyTraps() {
  return {
    set: (obj, prop, value) => {
      obj[prop] = value;
      updateDOM(findFullPath(state, prop, value));
      return true;
    }
  };
}

/*
  Iterates over all child objects given parent object and inserts proxy for update mapping
  @param {Object} obj - object
  @return {Object} - object with proxies replacing children objects
*/
function recurseObjectAndInsertProxies(obj) {
  for (const prop in obj) {
    if (isObject(obj[prop])) {
      obj[prop] = new Proxy(obj[prop], createProxyTraps());
      recurseObjectAndInsertProxies(obj[prop]);
    }
  }

  return obj;
}

/*
  Creates a SuperHTML state object given an object
  @param {Object} stateObject - input state object
  @return {Object} - proxied version of input state object
*/
function createState(stateObject) {
  state = new Proxy(
    recurseObjectAndInsertProxies(stateObject, createProxyTraps()),
    createProxyTraps()
  );

  return state;
}

/*
  Runs a JS expression and returns the result
  @param {String} str - JS expression as a string
  @return {*} result of expression
*/
function runExpression(str) {
  return Function(`'use strict'; return(${str})`)();
}

/*
  Returns boolean based on whether passed value is object
  @param {*} value - input value
  @return {Boolean} value is object boolean
*/
function isObject(value) {
  return typeof value === 'object' && value !== null && !value.length;
}

export function init({
  state = {},
  views,
  viewElementId
}) {
  window.addEventListener('load', router);
  window.addEventListener('hashchange', router);
  appBodyId = viewElementId;
  window.state = createState(state);
  pages = views;
}
