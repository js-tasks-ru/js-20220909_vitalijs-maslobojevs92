export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({
    data = [],
    label = '',
    value = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  render() {
    const wrapper = document.createElement('DIV');

    wrapper.innerHTML = this.getTemplate();
    this.columnChart = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
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
    const headerData = this.formatHeading(this.value);
    const rootElemClassName = this.data.length ? `column-chart` : `column-chart column-chart_loading`;

    return `
      <div class="${rootElemClassName}" style="-chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${titleLink}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${headerData}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.createCharts(this.getColumnProps(this.data))}
          </div>
        </div>
      </div>
    `;
  }

  createCharts(data) {
    return data.map(element => {
      return `<div style="--value: ${element.value}" data-tooltip="${element.percent}"></div>`;
    }).join('');
  }

  getColumnProps(data) {
    const height = this.chartHeight;
    const maxValue = Math.max(...data);
    const scale = height / maxValue;
      
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  update(data) {
    if (!data.length) this.columnChart.classList.add('column-chart_loading');

    this.data = data;

    this.subElements.body.innerHTML = 
      this.createCharts(this.getColumnProps(data));
  }

  destroy() {
    this.remove();
    this.columnChart = null;
    this.subElements = {};
  }

  remove() {
    if (this.columnChart) this.columnChart.remove();
  }

  get element() {
    return this.columnChart;
  }
}
