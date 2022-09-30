export default class DoubleSlider {
  constructor({
    min = 0,
    max = 300,
    formatValue = value => value,
    selected = {
      from: min,
      to: max
    }
  } = {}) {
    this.formatValue = formatValue;
    this.min = min;
    this.max = max;
    this.selected = selected;

    this.render();
    this.init();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    const doubleSlider = wrapper.firstElementChild;

    this.doubleSlider = doubleSlider;
    this.subElements = this.getSubElements(doubleSlider);
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
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner" data-element="inner">
          <span class="range-slider__progress" data-element="progress" style="left: ${this.getPosition(this.selected.from, 'left')}%; right: ${this.getPosition(this.selected.to, 'right')}%"></span>
          <span class="range-slider__thumb-left" data-element="thumbLeft" style="touch-action: none; left: ${this.getPosition(this.selected.from, 'left')}%"></span>
          <span class="range-slider__thumb-right" data-element="thumbRight" style="touch-action: none; right: ${this.getPosition(this.selected.to, 'right')}%"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;
  }

  getPosition(value, direction) {
    if (direction === 'left') {
      return (value - this.min) / (this.max - this.min) * 100;
    }
  
    if (direction === 'right') {
      return (this.max - value) / (this.max - this.min) * 100;
    }
  }

  init() {
    this.doubleSlider.addEventListener('pointerdown', (e) => {
      e.preventDefault();

      if (e.target.closest('.range-slider__thumb-left')) {
        document.addEventListener('pointermove', this.pointerMoveEventLeft);
        document.addEventListener('pointerup', this.onPointerUp);
      }

      if (e.target.closest('.range-slider__thumb-right')) {
        document.addEventListener('pointermove', this.pointerMoveEventRight);
        document.addEventListener('pointerup', this.onPointerUp);
      }
    });
  }

  pointerMoveEventRight = (e) => {
    e.preventDefault();
    
    const sliderLine = this.subElements.inner;
    const sliderRange = (this.max - this.min);
    const leftThumbProgress = parseFloat(this.subElements.thumbLeft.style.left);

    let clickCoord = e.clientX - this.subElements.inner.getBoundingClientRect().left;

    if (clickCoord >= sliderLine.clientWidth) clickCoord = sliderLine.clientWidth; 

    const percent = 100 - (clickCoord * 100 / sliderLine.clientWidth); 

    this.subElements.thumbRight.style.right = percent + "%";
    this.subElements.progress.style.right = percent + "%";

    if (100 - percent <= leftThumbProgress) {
      this.subElements.thumbRight.style.right = 100 - leftThumbProgress + '%';
      this.subElements.progress.style.right = 100 - leftThumbProgress + '%';
    }

    let value = this.max - (sliderRange * parseFloat(this.subElements.thumbRight.style.right) / 100);
    value = Math.floor(value);

    this.subElements.to.innerHTML = this.formatValue(value);

    this.valueTo = value;
  }

  pointerMoveEventLeft = (e) => {
    e.preventDefault();
    
    const sliderLine = this.subElements.inner;
    const sliderRange = (this.max - this.min);
    const rightThumbProgress = parseFloat(this.subElements.thumbRight.style.right);

    let clickCoord = e.clientX - this.subElements.inner.getBoundingClientRect().left;
  
    if (clickCoord <= 0) clickCoord = 0; 

    const percent = clickCoord * 100 / sliderLine.clientWidth; 

    this.subElements.thumbLeft.style.left = percent + "%";
    this.subElements.progress.style.left = percent + "%";

    if (percent >= 100 - rightThumbProgress) {
      this.subElements.thumbLeft.style.left = 100 - rightThumbProgress + '%';
      this.subElements.progress.style.left = 100 - rightThumbProgress + '%';
    }

    let value = sliderRange * parseFloat(this.subElements.thumbLeft.style.left) / 100 + this.min;
    value = Math.floor(value);

    this.subElements.from.innerHTML = this.formatValue(value);

    this.valueFrom = value;
  }

  onPointerUp = (e) => {
    e.preventDefault();

    this.doubleSlider.dispatchEvent(new CustomEvent('range-select', {
      detail: {
        from: this.valueFrom || this.selected.from,
        to: this.valueTo || this.selected.to
      },
      bubbles: true
    }));

    document.removeEventListener('pointermove', this.pointerMoveEventLeft);
    document.removeEventListener('pointermove', this.pointerMoveEventRight);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  remove() {
    if (this.doubleSlider) this.doubleSlider.remove();
  }

  destroy() {
    document.removeEventListener('pointermove', this.pointerMoveEventLeft);
    document.removeEventListener('pointermove', this.pointerMoveEventRight);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.remove();
    this.doubleSlider = null;
  }

  get element() {
    return this.doubleSlider;
  }
}
