/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  const symbols = [...string];
  let counter = 1;

  if (size === 0) return '';

  if (!size || string === '') return string;

  return symbols.reduce((prev, next) => {
    if (next === prev[prev.length - 1]) { //prev.at(-1) на гите не работает
      if (counter !== size) {
        counter++;

        return prev + next;
      }

      return prev;
    }

    counter = 1;

    return prev + next;
  });
}
