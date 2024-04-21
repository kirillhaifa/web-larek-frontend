import { CDN_URL } from '../utils/constants';
import { IProductModel, ICardTemplate, IProductCard } from '../types/index';
import { eventEmitter } from '../index';
import { Component } from './base/component';
import { ensureElement } from '../utils/utils';

// Рендеринг карточки товара

//класс переделан, элементы находятся в контрукторе а не в методе.

export class ProductCard extends Component<IProductCard> {
	protected _card: HTMLElement;
	protected _product: IProductModel;
	protected _category: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _image: HTMLImageElement;

	constructor(product: IProductModel, cardTemplate: HTMLElement) {
		super();
		this._product = product;
		this._card = cardTemplate;
		this._category = ensureElement<HTMLElement>('.card__category', this._card);
		this._title = ensureElement<HTMLElement>('.card__title', this._card);
		this._price = ensureElement<HTMLElement>('.card__price', this._card);
		this._image = ensureElement<HTMLImageElement>('.card__image', this._card);

		this._card.addEventListener('click', () => {
			eventEmitter.emit('productModal:open', { product: this._product });
		});
	}

	renderCard(container: HTMLElement): HTMLElement {
		const productData = this._product.getProduct();
		this.setText(this._category, productData.category);
		this.setText(this._title, productData.title);

		if (productData.price) {
			this.setText(this._price, `${productData.price.toString()} синапсов`);
		} else {
			this.setText(this._price, 'Бесценно');
		}

		this.setImage(this._image, CDN_URL + productData.image, productData.title);
		container.append(this._card);

		return this._card;
	}
}
