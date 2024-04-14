import { Product, ProductListResponse } from '../types';
import { CDN_URL, API_URL } from '../utils/constants';
import { IProductModel, ICardTemplate, IProductCard } from '../types/index';
import { ModalProduct } from './modal';
import { EventEmitter } from './base/events';
import { bascket, eventEmitter } from '../index';


// Поиск и копирование тимплейта карточки
export class CardTemplate implements ICardTemplate {
  private template: HTMLElement | null = null;

  getTemplate(templateId: string): HTMLElement {
      const templateElement = document.querySelector('#' + templateId) as HTMLTemplateElement | null;
      
      return templateElement ? templateElement.content.cloneNode(true) as HTMLElement : document.createElement('div');
  }
}

// Рендеринг карточки товара
export class ProductCard implements IProductCard {
  card: HTMLElement;
  cardTemplate: HTMLElement;
  product: IProductModel;

  constructor( product: IProductModel, cardTemplate: HTMLElement) {
    this.cardTemplate = cardTemplate.cloneNode(true) as HTMLElement;
    this.card = this.cardTemplate.querySelector('.card'); 
    this.product = product;
    this.card.addEventListener('click', () => {
      eventEmitter.emit('productModal:open', { product: this.product });  
    });
  }

  renderCard(container: HTMLElement): HTMLElement {
      const productData = this.product.getProduct(); 
      this.card.querySelector('.card__category').textContent = productData.category;
      this.card.querySelector('.card__title').textContent = productData.title;
      if (productData.price) {
        this.card.querySelector('.card__price').textContent = `${productData.price.toString()} синапсов`;
      } else {
        this.card.querySelector('.card__price').textContent = 'Бесценно';
      }
      this.card.querySelector('.card__image').setAttribute('src', CDN_URL + productData.image);
      this.card.querySelector('.card__image').setAttribute('alt', productData.title);
      container.append(this.card);

      return this.card;
  }
}




