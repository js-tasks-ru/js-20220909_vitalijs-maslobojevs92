export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  render() {
    const wrapper = document.createElement('DIV');
    wrapper.innerHTML = this.getTemplate();

    this.table = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.table.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderRows()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getBodyRows(this.data)}
        </div>
      </div>
    </div>  
    `;
  }

  getHeaderRows() {
    return this.headerConfig.map(element => {
      return `
      <div class="sortable-table__cell" data-id="${element.id}" data-sortable="${element.sortable}">
        <span>${element.title}</span>
      </div>
      `;
    }).join('');
  }

  getBodyRows(data) {
    return data.map(element => {
      const cells = this.headerConfig.map(item => {
        const rowId = item['id'];

        if (!item['template']) {
          return `<div class="sortable-table__cell">${element[rowId]}</div>`;
        }

        if (item['template']) return item['template']();
      }).join('');

      return `
      <a href="/products/${element.id}" class="sortable-table__row">
        ${cells}
      </a>
      `;
    }).join('');
  }

  sort(fieldId, order) {
    let sortedData = null;

    let fieldParams = this.headerConfig.filter(element => {
      return element['id'] === fieldId;
    });

    fieldParams = Object.assign({}, ...fieldParams);

    if (fieldParams.sortType === 'number') {
      sortedData = this.sortNumbers(this.data, order, fieldId);
    }

    if (fieldParams.sortType === 'string') {
      sortedData = this.sortStrings(this.data, order, fieldId);
    }
  
    this.subElements.body.innerHTML = `
      ${this.getBodyRows(sortedData)};
    `;
  }

  sortStrings(arr, param = 'asc', fieldId) {
    const strArr = [...arr];

    function sort(a, b) {
      return a.localeCompare(b, ['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' });
    }
  
    return strArr.sort((a, b) => {
      if (param === 'asc') {
        return sort(a[fieldId], b[fieldId]);
      }
  
      if (param === 'desc') {
        return sort(b[fieldId], a[fieldId]);
      }
    });
  }

  sortNumbers(arr, param = 'asc', fieldId) {
    const numArr = [...arr];

    function sort(a, b) {
      return a - b;
    }

    return numArr.sort((a, b) => {
      if (param === 'asc') {
        return sort(a[fieldId], b[fieldId]);
      }
      if (param === 'desc') {
        return sort(b[fieldId], a[fieldId]);
      }
    });
  }

  remove() {
    if (this.table) this.table.remove();
  }

  destroy() {
    this.remove();
    this.table = null;
    this.subElements = null;
  }

  get element() {
    return this.table;
  }
}

