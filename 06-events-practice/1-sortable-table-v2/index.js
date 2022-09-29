export default class SortableTable {
  subElements;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.init();
  }

  render() {
    const wrapper = document.createElement('DIV');
  
    wrapper.innerHTML = this.getTemplate();

    const table = wrapper.firstElementChild;
    
    this.table = table;
    this.subElements = this.getSubElements(table);

    if (this.sorted.id) this.sort(this.sorted.id, this.sorted.order);

    else this.sort();
  }

  init() {
    this.subElements.header.addEventListener('pointerdown', this.clickEvent);
  }

  clickEvent = (e) => {
    e.preventDefault();
    
    const field = e.target.closest('[data-sortable="true"]');

    if (field) {
      const order = field.dataset.order;
      const fieldId = field.dataset.id;

      if (order === 'asc') this.sort(fieldId, 'desc');

      else if (order === 'desc') this.sort(fieldId, 'asc');

      else this.sort(fieldId, 'desc');
    }
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

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
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
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
    if (!fieldId || !order) {
      return this.subElements.body.innerHTML = this.getBodyRows(this.data);
    }

    const sortedData = this.sortData(fieldId, order);
    const allColumns = this.table.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.table.querySelector(`[data-id="${fieldId}"]`);

    allColumns.forEach(column => {
      column.dataset.order = "";
    });

    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getBodyRows(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const fieldParams = this.headerConfig.find(item => item.id === field);
    
    return arr.sort((a, b) => {
      if (order === 'asc') return sortFn(a[field], b[field]);
  
      if (order === 'desc') return sortFn(b[field], a[field]);
    });

    function sortFn(a, b) {
      if (fieldParams.sortType === 'number') {
        return a - b;
      }

      if (fieldParams.sortType === 'string') {
        return a.localeCompare(b, ['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' });
      }
    }
  }

  remove() {
    if (this.table) this.table.remove();
  }

  destroy() {
    if (this.subElements.header) {
      this.subElements.header.removeEventListener('pointerdown', this.clickEvent);
    }

    this.remove();
    this.table = null;
    this.subElements = {};
  }

  get element() {
    return this.table;
  }
}
