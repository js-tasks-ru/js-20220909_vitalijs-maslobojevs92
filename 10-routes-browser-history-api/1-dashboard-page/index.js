import RangePicker from './components/range-picker/src/index.js';
import SortableTable from '../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js';
import ColumnChart from '../../07-async-code-fetch-api-part-1/1-column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  subElements = {}
  components = {};

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.dashboardPage = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.dashboardPage);

    this.initComonents();
    this.renderComponents();
    this.init();

    return this.dashboardPage;
  }

  getTemplate() {
    return `
        <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  initComonents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      },
      label: 'orders',
      link: '#'
    });
  
    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });
  
    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'customers',
    });

    const rangePicker = new RangePicker({ from, to });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true,
      sorted: {
        id: header.find(item => item.sortable).id,
        order: 'asc'
      }
    });

    this.components = {
      ordersChart,
      salesChart,
      customersChart,
      rangePicker,
      sortableTable
    };
  }

  renderComponents() {
    for (const component of Object.keys(this.components)) {
      this.subElements[component].append(this.components[component].element);
    }
  }

  init() {
    document.addEventListener('DOMContentLoaded', this.hideProgressBar);
    this.components.rangePicker.element.addEventListener('date-select', this.updateComponents);
  }

  updateComponents = async (event) => {
    this.components.sortableTable.url.searchParams.set('from', event.detail.from);
    this.components.sortableTable.url.searchParams.set('to', event.detail.to);

    const data = await this.components.sortableTable.loadData();

    this.components.sortableTable.update(data);
    this.components.ordersChart.update(e.detail.from, event.detail.to);
    this.components.salesChart.update(e.detail.from, event.detail.to);
    this.components.customersChart.update(e.detail.from, event.detail.to);
  }

  hideProgressBar() {
    document.body.querySelector('.progress-bar').hidden = true;
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

  remove() {
    if (this.dashboardPage) this.dashboardPage.remove();
  }

  destroy() {
    this.remove();
    this.dashboardPage = null;
    this.components = {};
    this.subElements = {};
    document.removeEventListener('DOMContentLoaded', this.hideProgressBar);
  }

  get element() {
    return this.dashboardPage;
  }
}
