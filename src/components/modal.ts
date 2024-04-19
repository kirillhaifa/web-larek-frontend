import {
	IBascket,
	IOrder,
	IFormContacts,
	IProductModel,
	Product,
} from '../types';
import { CDN_URL } from '../utils/constants';
import { bascket, order, eventEmitter } from '../index';
import { FormAdress, FormContacts } from './forms';
import { Modal } from './base/modal';

// Модальное окно продукта
// класс изменен, устранены лишние поиски внутри методов
export class ModalProduct extends Modal {
	protected _modalContent: HTMLElement;
	protected _product: IProductModel;
	protected _addToBascketButton: HTMLButtonElement;
	protected _addToBascketHandler: () => void;
	protected _category: HTMLElement;
	protected _title: HTMLElement;
	protected _text: HTMLElement;
	protected _price: HTMLElement;
	protected _image: HTMLImageElement;

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
			this.setText(addToBascketButton, 'В корзину');
		} else {
			bascket.addProduct(product);
			this.setText(addToBascketButton, 'Убрать из корзины');
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
		if (this.checkIfProductAdded(bascket, this._product.getProduct())) {
			this.setText(this._addToBascketButton, 'Убрать из корзины');
		} else {
			this.setText(this._addToBascketButton, 'В корзину');
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
	protected _ordersList: HTMLElement;

	constructor(
		template: HTMLElement,
		basketTemplate: HTMLElement,
		cardBascketTemplate: HTMLTemplateElement
	) {
		super(template);
		this._basketTemplate = basketTemplate;
		this._cardBasketTemplate = cardBascketTemplate;

		this._checkoutOrderButton =
			this._basketTemplate.querySelector('.basket__button');
		this._checkoutOrderButton.addEventListener('click', this.checkoutHandler);

		this._ordersList = this._basketTemplate.querySelector('.basket__list');
	}

	private checkoutHandler() {
		order.setOrderedItems(bascket);
		eventEmitter.emit('bascket:checkout');
	}

	private removeProductHandler(product: IProductModel) {
		bascket.removeProduct(product);
		eventEmitter.emit('bascket:changed');
	}

	//насколько я понимаю поиск элементов в этом методе нельзя вынести за метод,
	//тк рендерятся карточки товаров внутри модального окна.
	//возможно стоит сделать класс cardBascket? я как понимаю это не уменьшит код
	render(bascket: IBascket) {
		const orders = bascket.getOrdersList();
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
		//условие - корзина не пуста
		const noItemsBuscket = bascket.getOrdersList().length === 0
		//условие - в корзине есть товары имеющие стоимость 
		const onlyNonValuebleItems = bascket.getOrdersList().every((product) => {
			return product.getProduct().price === null;
		})

		if (noItemsBuscket) { 
			//коризна пуста - кнопка "оформить", но не активна
			this.setDisabled(this._checkoutOrderButton, noItemsBuscket);
			this.setText(this._checkoutOrderButton, 'Оформить');
		} else if (onlyNonValuebleItems) { 
			//корзина не пуста - кнопка нельзя купить, неактивна
			this.setDisabled(this._checkoutOrderButton, onlyNonValuebleItems);
			this.setText(this._checkoutOrderButton, 'Нельзя купить');
		} else if (!noItemsBuscket && !onlyNonValuebleItems) { 
			//коризна не пуста и есть товары с ценой - кнопка "оформить активна",
			this.setText(this._checkoutOrderButton, 'Оформить');
		}

		return this;
	}
}

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
				this._adressForm.submitHandler(event, order)
			);
		super.close();
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
			bascket
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
				(event: MouseEvent) => this._form.submitHandler(event, order, bascket)
			);
		}

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

	close(): this {
		super.close();
		this._finalButton.removeEventListener('click', () => {
			this.close();
		});
		return this;
	}
}
