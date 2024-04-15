import {
	IBascket,
	IOrder,
	IFormContacts,
	IProductModel,
	Product,
	IApi,
} from '../types';
import { CDN_URL } from '../utils/constants';
import { bascket, order, eventEmitter } from '../index';
import { FormAdress, FormContacts } from './form';
import { Modal } from './base/modal';

// Модальное окно продукта
export class ModalProduct extends Modal {
	protected _modalContent: HTMLElement;
	protected _product: IProductModel;
	protected _addToBascketButton: HTMLButtonElement;
	protected _addToBascketHandler: () => void;

	constructor(
		template: HTMLElement,
		content: HTMLElement,
		product: IProductModel,
		bascket: IBascket
	) {
		super(template);
		this._modalContent = content;
		this._product = product;
		this._addToBascketHandler = () => {
			this.addOrRemoveToBascket(this._addToBascketButton, bascket, product);
		};

		this._addToBascketButton = this._modalContent.querySelector(
			'.button'
		) as HTMLButtonElement;
		('.button');
		this._addToBascketButton.addEventListener(
			'click',
			this._addToBascketHandler
		);
	}

	private addOrRemoveToBascket(
		addToBascketButton: HTMLButtonElement,
		bascket: IBascket,
		product: IProductModel
	) {
		if (this.checkIfProductAdded(bascket, this._product.getProduct())) {
			bascket.removeProduct(product);
			addToBascketButton.textContent = 'В корзину';
		} else {
			bascket.addProduct(product);
			addToBascketButton.textContent = 'Убрать';
		}
		eventEmitter.emit('bascket:changed');
	}

	private checkIfProductAdded(bascket: IBascket, product: Product): boolean {
		return bascket
			.getOrdersList()
			.some((order) => order.getProduct().id === product.id);
	}

	render() {
		const productData = this._product.getProduct();
		this._modalContent.querySelector('.card__category').textContent =
			productData.category;
		this._modalContent.querySelector('.card__title').textContent =
			productData.title;
		this._modalContent.querySelector('.card__text').textContent =
			productData.description;
		if (productData.price) {
			this._modalContent.querySelector(
				'.card__price'
			).textContent = `${productData.price.toString()} синапсов`;
		} else {
			this._modalContent.querySelector('.card__price').textContent = 'Бесценно';
		}
		this._modalContent
			.querySelector('.card__image')
			.setAttribute('src', CDN_URL + productData.image);
		this._modalContent
			.querySelector('.card__image')
			.setAttribute('alt', productData.title);

		return this;
	}

	controlButton() {
		const cardButton = this._modalContent.querySelector('.card__button');
		if (this.checkIfProductAdded(bascket, this._product.getProduct())) {
			cardButton.textContent = 'Убрать';
		} else {
			cardButton.textContent = 'В корзину';
		}
		return this;
	}

	open() {
		super.open();
		this._contentContainer.append(this._modalContent);
		return this;
	}

	close(): this {
		super.close();
		this._addToBascketButton.removeEventListener(
			'click',
			this._addToBascketHandler
		);

		return this;
	}
}

//модальное окно корзины
export class ModalBasket extends Modal {
	protected _basketTemplate: HTMLElement;
	protected _cardBasketTemplate: HTMLTemplateElement;
	protected _checkoutOrderButton: HTMLButtonElement;

	constructor(
		template: HTMLElement,
		basketTemplate: HTMLElement,
		cardBascketTemplate: HTMLTemplateElement,
		order: IOrder
	) {
		super(template);
		this._basketTemplate = basketTemplate;
		this._cardBasketTemplate = cardBascketTemplate;

		this._checkoutOrderButton =
			this._basketTemplate.querySelector('.basket__button');
		this._checkoutOrderButton.addEventListener('click', this.checkoutHandler);
	}

	private checkoutHandler() {
		order.setOrderedItems(bascket)
		eventEmitter.emit('bascket:checkout');
	}

	private removeProductHandler(product: IProductModel) {
		bascket.removeProduct(product);
		eventEmitter.emit('bascket:changed');
	}

	render(bascket: IBascket) {
		const ordersList = this._basketTemplate.querySelector('.basket__list');
		const orders = bascket.getOrdersList();
		ordersList.innerHTML = '';
		for (let i = 0; i < orders.length; i++) {
			const product = orders[i];
			if (product) {
				const cardBasketTemplate = this._cardBasketTemplate.content.cloneNode(
					true
				) as HTMLElement;
				const productData = product.getProduct();
				cardBasketTemplate.querySelector('.card__title').textContent =
					productData.title;
				if (productData.price) {
					cardBasketTemplate.querySelector(
						'.card__price'
					).textContent = `${productData.price.toString()} синапсов`;
				} else {
					cardBasketTemplate.querySelector('.card__price').textContent =
						'Бесценно';
				}
				cardBasketTemplate.querySelector(
					'.basket__item-index'
				).textContent = `${i + 1}`;

				const removeProductButton = cardBasketTemplate.querySelector(
					'.basket__item-delete'
				);
				removeProductButton.addEventListener(
					'click',
					this.removeProductHandler.bind(this, product)
				);
				ordersList.append(cardBasketTemplate);
			}
		}
		this._basketTemplate.querySelector(
			'.basket__price'
		).textContent = `${bascket.countTotalprice().toString()} синапсисов`;
		return this;
	}

	open() {
		super.open();
		this._contentContainer.append(this._basketTemplate);
		return this;
	}

	close() {
		super.close();
		this._checkoutOrderButton.removeEventListener(
			'click',
			this.checkoutHandler
		);
		const removeProductButtons = this._basketTemplate.querySelectorAll(
			'.basket__item-delete'
		);
		removeProductButtons.forEach((button: HTMLButtonElement) => {
			if (button) {
				// Получаем индекс продукта из dataset кнопки
				const index = button.dataset.index;
				// Получаем продукт по индексу
				const product = bascket.getOrdersList()[parseInt(index)];
				// Удаляем обработчик события
				button.removeEventListener(
					'click',
					this.removeProductHandler.bind(this, product)
				);
			}
		});
		return this;
	}

	//если в козине нет товаров кнопка должна быть не активна
	validateBascket(bascket: IBascket) {
		const proceedButton = this._basketTemplate.querySelector('.basket__button');
		if (bascket.getOrdersList().length === 0) {
			proceedButton.setAttribute('disabled', 'disabled');
		} else {
			proceedButton.removeAttribute('disabled');
		}
		return this;
	}
}

//модальное окно ввода адреса
export class AddressModal extends Modal {
	protected _addressTemplate: HTMLElement;
	protected _adressForm;
	protected _order: IOrder;

	constructor(
		template: HTMLElement,
		addressTemplate: HTMLElement,
		order: IOrder
	) {
		super(template);
		this._order = order;
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

	close() {
		// Удаление слушателей событий из формы адреса при закрытии модального окна
		this._adressForm.buttonsAlt.forEach((button) => {
			button.removeEventListener(
				'click',
				this._adressForm.buttonAltHandler.bind(this)
			);
		});
		this._adressForm
			.getSubmitButton()
			.removeEventListener('click', (event) =>
				this._adressForm.submitHandler(event, this._adressForm.order)
			);
		super.close();
		return this;
	}
}

//модальное окно ввода контактов
export class ModalContacts extends Modal {
	protected _modalContent: HTMLElement;
	protected _form: IFormContacts;
	api: IApi

	constructor(
		template: HTMLElement,
		content: HTMLElement,
		order: IOrder,
		api: IApi
	) {
		super(template);
		this.api = api
		this._modalContent = content;
		this._form = new FormContacts(
			this._modalContent.querySelector('.form') as HTMLFormElement,
			order,
			bascket,
			api
		);
	}

	open() {
		super.open();
		this._contentContainer.append(this._modalContent);
		return this;
	}

	//при закрытии удаляем слушатели как окна так и формы
	close(): this {
		super.close();
		if (this._form.emailInput) {
			this._form.emailInput.removeEventListener(
				'input',
				this._form.emeilInputHandler.bind(this._form)
			);
		}
		if (this._form.phoneInput) {
			this._form.phoneInput.removeEventListener(
				'input',
				this._form.phoneInputHandler.bind(this._form)
			);
		}
		if (this._form.submitButton) {
			this._form.submitButton.removeEventListener(
				'click',
				(event: MouseEvent) =>
					this._form.submitHandler(event, this._form.order, this.api)
			);
		}

		return this;
	}
}

//модальное окно завершения заказа
export class FinalModal extends Modal {
	protected _modalContent: HTMLElement;
	protected _finalButton: HTMLButtonElement;

	constructor(template: HTMLElement, content: HTMLElement) {
		super(template);
		this._modalContent = content;
		this._finalButton = this._modalContent.querySelector(
			'.order-success__close'
		);
		this._finalButton.addEventListener('click', () => {
			this.close();
		});
	}

	render() {
		this._modalContent.querySelector(
			'.order-success__description'
		).textContent = `Списано ${order.getLastOrderPrice()} синапсисов`;
		return this;
	}

	open() {
		super.open();
		this._contentContainer.append(this._modalContent);
		return this;
	}

	close(): this {
		super.close();
		this._finalButton.removeEventListener('click', () => {
			this.close();
		});
		return this;
	}
}
