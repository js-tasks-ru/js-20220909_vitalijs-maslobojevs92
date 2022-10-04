import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  data = {};

  constructor({
    url = '',
    range = {
      from: '',
      to: ''
    },
    label = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  render() {
    const wrapper = document.createElement('DIV');

    wrapper.innerHTML = this.getTemplate();
    this.columnChart = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.update(this.range.from, this.range.to);
  }

  getSubElements() {
    const result = {};
    const elements = this.columnChart.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getTemplate() {
    const titleLink = this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
    const rootElemClassName = this.data.length ? `column-chart` : `column-chart column-chart_loading`;

    return `
      <div class="${rootElemClassName}" style="-chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${titleLink}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  createChartContent(data) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    let valueSum = 0;

    const arr = data.map(element => {
      const date = new Date(Date.parse(element.date));

      valueSum += element.valueData;

      return `<div style="--value: ${element.value}" data-tooltip="<div><small>${date.toLocaleString('ru', options)}</small></div><strong>${element.valueData}</strong>"></div>`;
    }).join('');

    this.subElements.header.innerHTML = this.formatHeading(valueSum);

    return arr;
  }

  getColumnProps(data) {
    const arrData = Object.entries(data);
    const valueArr = arrData.map(([date, value]) => value);

    const maxValue = Math.max(...valueArr);
    const scale = this.chartHeight / maxValue;

    return arrData.map(([date, value]) => {
      return {
        valueData: value,
        value: Math.floor(value * scale),
        date
      };
    });
  }


  async update(from = this.range.from, to = this.range.to) {
    this.columnChart.classList.add('column-chart_loading');

    await fetchJson(`${BACKEND_URL}/${this.url}?from=${from.toISOString()}&to=${to.toISOString()}`)
      .then(json => {

        this.data = json;

        this.columnChart.classList.remove('column-chart_loading');
        this.subElements.body.innerHTML = this.createChartContent(this.getColumnProps(this.data));
      });

    return this.data;
  }

  destroy() {
    this.remove();
    this.columnChart = null;
    this.subElements = {};
    this.data = {};
  }

  remove() {
    if (this.columnChart) this.columnChart.remove();
  }

  get element() {
    return this.columnChart;
  }
}
