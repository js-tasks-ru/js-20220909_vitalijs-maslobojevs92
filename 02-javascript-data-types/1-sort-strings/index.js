/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const strArr = [...arr];
  const comparedProps = [['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' }];

  if (param === 'asc') return strArr.sort((a, b) => a.localeCompare(b, ...comparedProps));

  if (param === 'desc') return strArr.sort((a, b) => b.localeCompare(a, ...comparedProps));
}
