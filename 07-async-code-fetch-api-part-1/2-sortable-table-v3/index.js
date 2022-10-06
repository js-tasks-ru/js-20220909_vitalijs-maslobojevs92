import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  data = [];
  subElements = {};
  step = 30;
  dataStart = 0;
  dataEnd = this.dataStart + this.step;
  loading = false;

  constructor(headersConfig = [], {
    sorted = {
      order: 'asc',
      id: headersConfig.find(item => item.sortable).id,
    },
    isSortLocally = false,
    url = ''
  } = {}) {
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);

    this.render();
  }

  async render() {
    const wrapper = document.createElement('DIV');
    
    wrapper.innerHTML = this.getTemplate();
    const table = wrapper.firstElementChild;
    
    this.table = table;
    this.subElements = this.getSubElements(table);

    const sortedData = await this.loadData();

    this.renderTableBody(sortedData);
    this.init();
  }

  init() {
    this.subElements.header.addEventListener('pointerdown', this.sortTableOnClick);
    document.addEventListener('scroll', this.onScrollEvent);
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
    return this.headersConfig.map(element => {
      const order = this.sorted.id === element.id ? this.sorted.order : "";
      return `
      <div class="sortable-table__cell" data-id="${element.id}" data-order="${order}" data-sortable="${element.sortable}">
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
      const cells = this.headersConfig.map(item => {
        const rowId = item['id'];

        if (!item['template']) {
          return `<div class="sortable-table__cell">${element[rowId]}</div>`;
        }

        if (item['template']) {
          if (Array.isArray(element[rowId]) && !element[rowId].length) {
            return `<div class="sortable-table__cell"></div>`;
          }

          return item['template'](element[rowId]);
        }
      }).join('');

      return `
        <a href="/products/${element.id}" class="sortable-table__row">
          ${cells}
        </a>
      `;
    }).join('');
  }

  renderTableBody(data) {
    this.subElements.body.innerHTML = this.getBodyRows(data);
  }

  updateTableBody(data) {
    this.subElements.body.insertAdjacentHTML('beforeend', this.getBodyRows(data));
  }

  async loadData(dataStart = this.dataStart, dataEnd = this.dataEnd) {
    this.url.searchParams.set('_embed', 'subcategory.category');
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);
    this.url.searchParams.set('_start', dataStart);
    this.url.searchParams.set('_end', dataEnd);

    this.data = await fetchJson(this.url);

    return this.data;
  }

  sortOnClient (id, order) {
    if (!id || !order) {
      return this.getBodyRows(this.data);
    }
    
    const sortedData = this.sortData(id, order);
    const allColumns = this.table.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.table.querySelector(`[data-id="${id}"]`);

    allColumns.forEach(column => {
      column.dataset.order = "";
    });

    currentColumn.dataset.order = order;

    this.renderTableBody(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const fieldParams = this.headersConfig.find(item => item.id === field);
    
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

  async sortOnServer(id, order) {
    this.sorted.order = order;
    this.sorted.id = id;
    this.dataStart = 0;
    this.dataEnd = this.step;

    const data = await this.loadData();

    this.renderTableBody(data);
  }

  sortTableOnClick = (e) => {
    e.preventDefault();
    
    const field = e.target.closest('[data-sortable="true"]');

    if (field) {
      let order = field.dataset.order;
      const fieldId = field.dataset.id;

      if (order === 'asc') order = 'desc';

      else if (order === 'desc') order = 'asc';

      else order = 'asc';

      field.dataset.order = order;

      if (this.isSortLocally) {
        this.sortOnClient(fieldId, order);
      } else {
        this.sortOnServer(fieldId, order);
      }
    }
  }

  onScrollEvent = async (e) => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight && !this.loading && !this.isSortLocally) {
      this.dataStart += 30;
      this.dataEnd += 30;

      this.loading = true;

      const data = await this.loadData(this.dataStart, this.dataEnd);

      this.updateTableBody(data);

      this.loading = false;
    }
  }

  remove() {
    if (this.table) this.table.remove();
  }

  destroy() {
    this.remove();
    this.table = null;
    this.subElements = {};
    this.data = [];
    document.removeEventListener('scroll', this.onScrollEvent);
  }

  get element() {
    return this.table;
  }
}
