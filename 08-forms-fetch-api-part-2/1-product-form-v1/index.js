import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};

  defaultProductData = [{
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }];

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    const categoriesPromise = this.loadCategoriesData();
    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve(this.defaultProductData);

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);

    const [productData] = productResponse;

    this.formData = productData;

    this.renderForm();

    if (this.formData) this.renderData(categoriesData, this.formData);

    this.init();

    return this.productForm;
  }

  renderForm() {
    const wrapper = document.createElement('div');
  
    if (this.formData) {
      wrapper.innerHTML = this.getTemplate();
    } else {
      wrapper.innerHTML = this.getEmptyTemplate();
    }

    this.productForm = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);
  }

  getTemplate() {
    const [defaultData] = this.defaultProductData;

    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list"></ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory"></select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="${defaultData.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="${defaultData.discount}">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="${defaultData.quantity}">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>       
          
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "Сохранить" : "Добавить"} товар
            </button>
          </div>

        </form>
      </div> 
    `;
  }

  getEmptyTemplate() {
    return `
      <div>Данные не загрузились!<div>
    `;
  }

  getCategories(data) {
    return data.map(category => {
      const subcategories = category.subcategories.map(subcategory => {
        return `
          <option value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>
        `;
      }).join('');

      return subcategories;
    }).join('');
  }

  renderCategories(data) {
    this.subElements.productForm.elements.subcategory.innerHTML = this.getCategories(data);
  }

  getFormData() {
    const { productForm, imageListContainer} = this.subElements;
    const formElements = productForm.elements;
    const formatToNumber = ['price', 'quantity', 'status', 'discount'];

    const result = {};

    for (const formElem of Object.values(formElements)) {
      const elemName = formElem.id;

      if (elemName) {
        result[elemName] = formatToNumber.includes(elemName) 
          ? parseInt(formElements[elemName].value)
          : formElements[elemName].value;
      }
    }

    const formImages = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    result.id = this.productId;
    result.images = [];

    for (const image of formImages) {
      result.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return result;
  }

  renderFormData(data) {
    const { productForm, imageListContainer } = this.subElements;
    const formElements = productForm.elements;

    for (const formElem of Object.values(formElements)) {
      const elemName = formElem.id;

      if (elemName) {
        formElements[elemName].value = data[elemName];
      }
    }

    imageListContainer.innerHTML = renderImages(data.images);

    function renderImages(arr) {
      return arr.map(image => {
        return `
          <li class="products-edit__imagelist-item sortable-list__item">
            <input type="hidden" name="url" value="${escapeHtml(image.url)}">
            <input type="hidden" name="source" value="${escapeHtml(image.source)}">
            <span>
              <img src="icon-grab.svg" data-grab-handle="" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(image.url)}">
              <span>${escapeHtml(image.source)}</span>
            </span>
            <button type="button">
              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </li>  
        `;
      }).join('');
    }
  }  

  renderData(categoriesData, productData) {
    this.renderCategories(categoriesData);
    this.renderFormData(productData);
  }

  async loadCategoriesData() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async loadProductData(id) {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${id}`);
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.log(error);
    }
  }

  dispatchEvent(id) {
    const event = this.productId  
      ? new CustomEvent('product-updated', { detail: id, bubbles: true })
      : new CustomEvent('product-saved', { bubbles: true });

    this.productForm.dispatchEvent(event);
  }

  onSubmit = (e) => {
    e.preventDefault();

    this.save();
  }
  
  init() {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
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
    if (this.productForm) this.productForm.remove();
  }

  destroy() {
    this.remove();
    this.productForm = null;
    this.subElements = {};
  }

  get element() {
    return this.productForm;
  }
}
