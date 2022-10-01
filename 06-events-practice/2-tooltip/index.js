class Tooltip {
  static instance = null;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    return Tooltip.instance = this;
  }

  initialize () {
    document.addEventListener('pointerover', this.onPointerOver);
  }

  onPointerOver = (e) => {
    if (e.target.closest('[data-tooltip]')) {
      this.render(e.target.dataset.tooltip);

      document.addEventListener('pointermove', this.onPointerMove);  
      document.addEventListener('pointerout', this.onPointerOut);
    }
  }

  onPointerOut = () => {
    this.remove();

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerout', this.onPointerOut);
  }

  onPointerMove = (e) => {
    this.moveTooltip(e);
  }

  moveTooltip(e) {
    //При залезании тултипа за границу документа, тултип смещается на противоположную сторону курсора.
    const tooltipWidth = this.tooltip.clientWidth;
    const tooltipHeiht = this.tooltip.clientHeight;
    
    let indentX = 10;
    let indentY = 10;

    let posX = e.clientX;
    let posY = e.clientY;

    if (document.documentElement.clientWidth < posX + indentX + tooltipWidth) {
      posX -= tooltipWidth;
      indentX = -indentX; 
    }

    if (document.documentElement.clientHeight < posY + indentY + tooltipHeiht) {
      posY -= tooltipHeiht;
      indentY = -indentY; 
    }

    this.tooltip.style.top = indentY + posY + "px";
    this.tooltip.style.left = indentX + posX + "px";
  }

  render(text) {
    this.tooltip = document.createElement('div');
    this.tooltip.classList.add('tooltip');
    this.tooltip.innerHTML = text;

    document.body.append(this.tooltip);
  }

  remove() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    } 
  }

  destroy() {
    document.removeEventListener('pointermove', this.onPointerMove); 
    document.removeEventListener('pointerout', this.onPointerOut);
    document.addEventListener('pointerover', this.onPointerOver);

    this.remove();
  }

  get element() {
    return this.tooltip;
  }
}

export default Tooltip;
