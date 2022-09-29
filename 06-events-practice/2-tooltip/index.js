class Tooltip {
  static instance = null;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    return Tooltip.instance = this;
  }

  initialize () {
    //нужно ли создавать отдельный метод, что бы можно было убить событие pointerover?
    document.addEventListener('pointerover', e => {
      if (e.target.closest('[data-tooltip]')) {

        this.render(e.target.dataset.tooltip);

        document.addEventListener('pointermove', this.onPointerMove);  
        document.addEventListener('pointerout', this.onPointerOut);
      }
    });
  }

  onPointerOut = () => {
    this.destroy();
  }

  onPointerMove = (e) => {
    //При залезании тултипа за границу документа, тултип смещается на противоположную сторону курсора.
    
    let indentX = 10;
    let indentY = 10;

    let PosX = e.clientX;
    let PosY = e.clientY;

    if (document.documentElement.clientWidth < PosX + indentX + this.tooltip.clientWidth) {
      PosX -= this.tooltip.clientWidth;
      indentX = -indentX; 
    }

    if (document.documentElement.clientHeight < PosY + indentY + this.tooltip.clientHeight) {
      PosY -= this.tooltip.clientHeight;
      indentY = -indentY; 
    }

    this.tooltip.style.top = indentY + PosY + "px";
    this.tooltip.style.left = indentX + PosX + "px";
  
  }

  render(text) {
    this.tooltip = document.createElement('div');
    this.tooltip.classList.add('tooltip');
    this.tooltip.innerHTML = text;

    document.body.append(this.tooltip);
  }


  destroy() {
    document.removeEventListener('pointermove', this.onPointerMove); 
    document.removeEventListener('pointerout', this.onPointerOur);

    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    } 
  }

  get element() {
    return this.tooltip;
  }
}

export default Tooltip;
