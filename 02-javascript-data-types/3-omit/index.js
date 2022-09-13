/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const result = {};
  const arr = Object.keys(obj);

  for (let elem of arr) {
    if (!fields.includes(elem)) result[elem] = obj[elem];
  }

  return result;
};
