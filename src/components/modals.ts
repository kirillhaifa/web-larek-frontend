import {
	IBasket,
	IOrder,
	IFormContacts,
	IProductModel,
	Product,
} from '../types';
import { CDN_URL } from '../utils/constants';
import { basket, order, eventEmitter } from '../index';
import { FormAdress, FormContacts } from './forms';
import { Modal } from './base/modal';

// Модальное окно продукта
// класс изменен, устранены лишние поиски внутри методов
export class ModalProduct extends Modal {
	protected _modalContent: HTMLElement;
	protected _product: IProductModel;
	protected _addToBasketButton: HTMLButtonElement;
	protected _addToBasketHandler: () => void;
	protected _category: HTMLElement;
	protected _title: HTMLElement;
	protected _text: HTMLElement;
	protected _price: HTMLElement;
	protected _image: HTMLImageElement;
	private static instance: ModalProduct | null = null;

	constructor(
		template: HTMLElement,
		content: HTMLElement,
		product: IProductModel
	) {
		super(template);
		this._modalContent = content;
		this._product = product;

		this._category = this._modalContent.querySelector('.card__category');
		this._title = this._modalContent.querySelector('.card__title');
		this._price = this._modalContent.querySelector('.card__price');
		this._image = this._modalContent.querySelector('.card__image');
		this._text = this._modalContent.querySelector('.card__text');

		this._addToBasketHandler = () => {
			this.addOrRemoveToBasket(this._addToBasketButton, basket, product);
		};

		this._addToBasketButton = this._modalContent.querySelector(
			'.button'
		) as HTMLButtonElement;
		('.button');
		this._addToBasketButton.addEventListener(
			'click',
			this._addToBasketHandler
		);
	}

	public static getInstance(template: HTMLElement, content: HTMLElement, product: IProductModel): ModalProduct {
		if (!ModalProduct.instance) {
				ModalProduct.instance = new ModalProduct(template, content, product);
		}
		return ModalProduct.instance;
}

	private addOrRemoveToBasket(
		addToBasketButton: HTMLButtonElement,
		basket: IBasket,
		product: IProductModel
	) {
		if (this.checkIfProductAdded(basket, this._product.getProduct())) {
			basket.removeProduct(product);
			this.setText(addToBasketButton, 'В корзину');
		} else {
			basket.addProduct(product);
			this.setText(addToBasketButton, 'Убрать из корзины');
		}
		eventEmitter.emit('basket:changed');
	}

	private checkIfProductAdded(basket: IBasket, product: Product): boolean {
		return basket
			.getOrdersList()
			.some((order) => order.getProduct().id === product.id);
	}

	render() {
		const productData = this._product.getProduct();
		this.setText(this._title, productData.title)
		this.setText(this._category, productData.category);
		this.setText(this._text, productData.description);
		if (productData.price) {
			this.setText(this._price, `${productData.price.toString()} синапсов`);
		} else {
			this.setText(this._price, 'Бесценно');
		}
		this.setImage(this._image, CDN_URL + productData.image, productData.title);

		return this;
	}

	controlButton() {
		if (this.checkIfProductAdded(basket, this._product.getProduct())) {
			this.setText(this._addToBasketButton, 'Убрать из корзины');
		} else {
			this.setText(this._addToBasketButton, 'В корзину');
		}
		return this;
	}

	open() {
		super.open();
		this._contentContainer.innerHTML = '';
		this._contentContainer.append(this._modalContent);
		return this;
	}
}

//модальное окно корзины
export class ModalBasket extends Modal {
	protected _basketTemplate: HTMLElement;
	protected _cardBasketTemplate: HTMLTemplateElement;
	protected _checkoutOrderButton: HTMLButtonElement;
	protected _ordersList: HTMLElement;

	constructor(
		template: HTMLElement,
		basketTemplate: HTMLElement,
		cardBasketTemplate: HTMLTemplateElement
	) {
		super(template);
		this._basketTemplate = basketTemplate;
		this._cardBasketTemplate = cardBasketTemplate;

		this._checkoutOrderButton =
			this._basketTemplate.querySelector('.basket__button');
		this._checkoutOrderButton.addEventListener('click', this.checkoutHandler);

		this._ordersList = this._basketTemplate.querySelector('.basket__list');
	}

	private checkoutHandler() {
		order.setOrderedItems(basket);
		eventEmitter.emit('basket:checkout');
	}

	private removeProductHandler(product: IProductModel) {
		basket.removeProduct(product);
		eventEmitter.emit('basket:changed');
	}

	//насколько я понимаю поиск элементов в этом методе нельзя вынести за метод,
	//тк рендерятся карточки товаров внутри модального окна.
	//возможно стоит сделать класс cardBasket? я как понимаю это не уменьшит код
	render(basket: IBasket) {
		const orders = basket.getOrdersList();
		this._ordersList.innerHTML = '';
		for (let i = 0; i < orders.length; i++) {
			const product = orders[i];
			if (product) {
				const cardBasketTemplate = this._cardBasketTemplate.content.cloneNode(
					true
				) as HTMLElement;
				const productData = product.getProduct();
				this.setText(
					cardBasketTemplate.querySelector('.card__title'),
					productData.title
				);

				if (productData.price) {
					this.setText(
						cardBasketTemplate.querySelector('.card__price'),
						`${productData.price.toString()} синапсов`
					);
				} else {
					this.setText(
						cardBasketTemplate.querySelector('.card__price'),
						'Бесценно'
					);
				}

				this.setText(
					cardBasketTemplate.querySelector('.basket__item-index'),
					`${i + 1}`
				);

				const removeProductButton = cardBasketTemplate.querySelector(
					'.basket__item-delete'
				);
				removeProductButton.addEventListener(
					'click',
					this.removeProductHandler.bind(this, product)
				);
				this._ordersList.append(cardBasketTemplate);
			}
		}
		this._basketTemplate.querySelector(
			'.basket__price'
		).textContent = `${basket.countTotalprice().toString()} синапсисов`;
		return this;
	}

	open() {
		super.open();
		this._contentContainer.append(this._basketTemplate);
		return this;
	}

	//если в козине нет товаров кнопка должна быть не активна
	validateBasket(basket: IBasket) {
		//условие - корзина не пуста
		const noItemsBuscket = basket.getOrdersList().length === 0
		//условие - в корзине только товары имеющие стоимость 
		const hasNonValuebleItems = basket.getOrdersList().some((product) => {
			return product.getProduct().price === null;
		})

		if (noItemsBuscket) { 
			//коризна пуста - кнопка "оформить", но не активна
			this.setDisabled(this._checkoutOrderButton, noItemsBuscket);
			this.setText(this._checkoutOrderButton, 'Оформить');
		} else if (hasNonValuebleItems) { 
			//корзина не пуста - кнопка нельзя купить, неактивна
			this.setDisabled(this._checkoutOrderButton, hasNonValuebleItems);
			this.setText(this._checkoutOrderButton, 'Нельзя купить');
		} else if (!noItemsBuscket && !hasNonValuebleItems) { 
			//коризна не пуста и есть товары с ценой - кнопка "оформить активна",
			this.setText(this._checkoutOrderButton, 'Оформить');
		}

		return this;
	}
}

//комментарий ревьюера:

//Пожалуйста, посмотрите учебный проект Оно тебе надо. 
//Там уже все готово. Вам нужно просто проанализировать то, 
//что там описано, и лишнее удалить. Классы почти все одинаковые, 
//как и их типизация. Внимательно посмотрите еще раз на тот проект
//Очень сложно проверять Вашу работу. Слишком многое нужно исправлять, 
//а это невозможно сделать быстро... 
//Очень много поисков элементов в коде, что является очень плохой практикой в ООП

//ответ

//в инструкции к проекту рекомендовалось написать код самостоятельно,
//не копируя из "оно тебе надо", что я и постарался сделать. 
//лишние поиски элементов я удалил, если правильно понял.
//после сдачи этой работы займусь "оно тебе надо"
//при первом подходе к нему было мало что понятно, сейчас смогу разобраться 


//модальное окно ввода адреса
export class AddressModal extends Modal {
	protected _addressTemplate: HTMLElement;
	protected _adressForm;

	constructor(
		template: HTMLElement,
		addressTemplate: HTMLElement,
		order: IOrder
	) {
		super(template);
		this._addressTemplate = addressTemplate;
		const formElement = this._addressTemplate.querySelector(
			'form[name="order"]'
		) as HTMLFormElement;
		this._adressForm = new FormAdress(formElement, order);
	}

	open() {
		super.open();
		this._contentContainer.append(this._addressTemplate);
		return this;
	}

}

//модальное окно ввода контактов
export class ModalContacts extends Modal {
	protected _modalContent: HTMLElement;
	protected _form: IFormContacts;

	constructor(template: HTMLElement, content: HTMLElement, order: IOrder) {
		super(template);
		this._modalContent = content;
		this._form = new FormContacts(
			this._modalContent.querySelector('.form') as HTMLFormElement,
			order,
			basket
		);
	}

	open() {
		super.open();
		this._contentContainer.append(this._modalContent);
		return this;
	}
}

//модальное окно завершения заказа
export class FinalModal extends Modal {
	protected _modalContent: HTMLElement;
	protected _finalButton: HTMLButtonElement;
	protected _description: HTMLElement;

	constructor(template: HTMLElement, content: HTMLElement) {
		super(template);
		this._modalContent = content;
		this._description = this._modalContent.querySelector(
			'.order-success__description'
		);
		this._finalButton = this._modalContent.querySelector(
			'.order-success__close'
		);
		this._finalButton.addEventListener('click', () => {
			this.close();
		});
	}

	render() {
		this.setText(
			this._description,
			`Списано ${order.getLastOrderPrice()} синапсисов`
		);
		return this;
	}

	open() {
		super.open();
		this._contentContainer.append(this._modalContent);
		return this;
	}
}
