export default class ColumnChart {
  constructor(params = {}) {
    this.data = params.data ?? [];
    this.label = params.label;
    this.value = params.value;
    this.link = params.link;
    this.formatHeading = params.formatHeading;
    this.chartHeight = 50;

    this.render();
  }

  render() {
    this.columnChart = document.createElement('DIV');
    this.columnChart.style = `--chart-height: ${this.chartHeight}`;
    this.columnChart.className = this.data.length ? `column-chart` : `column-chart column-chart_loading`;

    const titleLink = this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
    const headerData = this.formatHeading ? this.formatHeading(this.value) : this.value;
    
    this.columnChart.innerHTML = 
      `
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
      `;

    return this.columnChart;
  }

  createCharts(data) {
    let result = '';

    for (const element of data) {
      result += `
        <div style="--value: ${element.value}" data-tooltip="${element.percent}"></div>
      `;
    }

    return result;
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
    const chartBody = this.columnChart.querySelector('.column-chart__chart');

    chartBody.innerHTML = `
      ${this.createCharts(this.getColumnProps(data))}
    `;
  }

  destroy() {
    this.columnChart = null;
  }

  remove() {
    this.columnChart.remove();
  }

  get element() {
    return this.columnChart;
  }
}
