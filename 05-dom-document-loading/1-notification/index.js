export default class NotificationMessage {
  static rootElement;
  static timer;

  constructor(
    message,
    {
      duration = 2000,
      type = 'success'
    } = {}
  ) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.init();
    this.render();
  }

  init() {
    if (NotificationMessage.rootElement) {
      clearTimeout(NotificationMessage.timer);
      this.destroy();
    }
  }

  render() {
    const wrapper = document.createElement('DIV');
    
    wrapper.innerHTML = this.getTemplate();

    NotificationMessage.rootElement = wrapper.firstElementChild;
  }

  getTemplate() {
    const seconds = this.duration / 1000 + 's';

    return `
      <div class="notification ${this.type}" style="--value:${seconds}">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.message}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  show(target = document.body) {
    target.append(NotificationMessage.rootElement);

    NotificationMessage.timer = setTimeout(this.destroy.bind(this), this.duration);
  }

  remove() {
    NotificationMessage.rootElement.remove();
  }

  destroy() {
    if (NotificationMessage.rootElement) {
      this.remove();
      NotificationMessage.rootElement = null;
      NotificationMessage.timer = null;
    }
  }

  get element() {
    return NotificationMessage.rootElement;
  }
}
