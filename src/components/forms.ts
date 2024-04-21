import { basket, eventEmitter } from '..';
import { IBasket, IOrder, IFormAddress, IFormContacts, IApi } from '../types';
import { ensureAllElements, ensureElement } from '../utils/utils';
import { Form } from './base/form';

//форма адреса и способа оплаты
export class FormAdress extends Form implements IFormAddress {
	protected _adressInput: HTMLInputElement;
	protected _errorMessage: HTMLElement;
	buttonsAlt: HTMLButtonElement[];

	constructor(form: HTMLElement, order: IOrder) {
		super(form);
		this._errorMessage = ensureElement<HTMLElement>(
			'.form__errors',
			this._form
		);
		this.buttonsAlt = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			this._form
		);
		this.behaveLikeRadioButtons(this.buttonsAlt);
		this._adressInput = ensureElement<HTMLInputElement>(
			'.form__input',
			this._form
		);
		this.buttonsAlt.forEach((button) => {
			button.addEventListener('click', this.buttonAltHandler.bind(this));
		});
		this._submitButton.addEventListener('click', (event) =>
			this.submitHandler(event, order)
		);
	}

	buttonAltHandler() {
		this.returnChoosenValue(this.buttonsAlt);
		this.validate().controlSubmitButton();
	}

	submitHandler(event: MouseEvent, order: IOrder) {
		event.preventDefault();
		eventEmitter.emit('modalContacts:open');
		order.setPaymentMethod(`${this.returnChoosenValue(this.buttonsAlt)}`);
		order.setAddress(this._adressInput.value);
	}

	//кнопки вsбора способа оплаты сделаны не радиокнопками, а обычными кнопками.
	//фунция заставляет их вести себя как радиокнопки,
	//но при первой загрузке ни одна из них не выбрана
	private behaveLikeRadioButtons(buttons: HTMLButtonElement[]): void {
		const checkNoChoosen = (buttons: HTMLButtonElement[] | null): boolean => {
			return !Array.from(buttons).some((button) =>
				button.classList.contains('button_alt-active')
			);
		};

		buttons.forEach((button: HTMLButtonElement) => {
			button.addEventListener('click', () => {
				if (checkNoChoosen(buttons)) {
					//если опция не выбрана - переключаем класс только у одной кнопки
					this.toggleClass(button, 'button_alt-active');
				} else {
					//если опция выбрана - переключаем класс у обеих
					buttons.forEach((button: HTMLButtonElement) => {
						this.toggleClass(button, 'button_alt-active');
					});
				}
			});
		});
	}

	//возращает способ оплаты, берет его из кнопок
	private returnChoosenValue(buttons: HTMLButtonElement[]): string | null {
		let choosenOption: string = '';

		buttons.forEach((button) => {
			if (button.classList.contains('button_alt-active')) {
				choosenOption = button.innerText.trim();
			}
		});

		return choosenOption;
	}

	//переопределяем валидацию из-за необходимости выбора метода оплаты
	//метод переработан, добавлены вариации сообщений 
	validate() {
		switch (true) {
			case !this._adressInput.validity.valid &&
				!this.returnChoosenValue(this.buttonsAlt):
				this.setText(
					this._errorMessage,
					'Введите корректный адрес и выберите способ оплаты'
				);
				this.valid = false;
				break;
			case !this._adressInput.validity.valid &&
				this.returnChoosenValue(this.buttonsAlt).length !== 0:
				this.setText(this._errorMessage, 'Введите корректный адрес');
				this.valid = false;
				break;
			case this._adressInput.validity.valid &&
				!this.returnChoosenValue(this.buttonsAlt):
				this.setText(this._errorMessage, 'Выберите способ оплаты');
				this.valid = false;
				break;
			case this._adressInput.validity.valid &&
				this.returnChoosenValue(this.buttonsAlt) &&
				this.returnChoosenValue(this.buttonsAlt).length !== 0:
				this.setText(this._errorMessage, '');
				this.valid = true;
				break;
		}
		return this;
	}
}

//форма заполнения контактов
export class FormContacts extends Form implements IFormContacts {
	emailInput: HTMLInputElement;
	phoneInput: HTMLInputElement;
	submitButton: HTMLButtonElement;
	protected _errorMessage: HTMLElement;

	constructor(form: HTMLFormElement, order: IOrder, basket: IBasket) {
		super(form);
		this.emailInput = ensureElement<HTMLInputElement>(
			'input[name="email"]',
			this._form
		);
		this.emailInput.addEventListener(
			'input',
			this.emeilInputHandler.bind(this)
		);

		this.phoneInput = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			this._form
		);
		this.phoneInput.addEventListener(
			'input',
			this.phoneInputHandler.bind(this)
		);
		this._errorMessage = ensureElement<HTMLElement>(
			'.form__errors',
			this._form
		);
		this._submitButton.addEventListener('click', (event) =>
			this.submitHandler(event, order, basket)
		);
	}

	emeilInputHandler() {
		this.validate().renderError().controlSubmitButton();
	}

	phoneInputHandler() {
		//если пользователь вводит 8 в начале, автоматически меняется на +7
		if (this.phoneInput.value === '8') {
			this.phoneInput.value = '+7';
		}
		this.validate().renderError().controlSubmitButton();
	}

	//при этом происходит сразу много всего, очистка корзины, api/post,
	submitHandler(event: MouseEvent, order: IOrder, basket: IBasket) {
		event.preventDefault();
		order.setLastOrderPrice(basket.countTotalprice());
		order.setEmail(this.emailInput.value);
		order.setPhoneNumber(this.phoneInput.value);
		console.log(order);
		eventEmitter.emit('order:send');
	}

	renderError() {
		let message = '';

		switch (true) {
			case !this.emailInput.validity.valid && !this.phoneInput.validity.valid:
				message = 'Введите корректный номер телефона и адрес электронной почты';
				break;
			case !this.emailInput.validity.valid:
				message = 'Введите корректный адрес электронной почты';
				break;
			case !this.phoneInput.validity.valid:
				message = 'Введите корректный номер телефона';
				break;
			default:
				message = '';
				break;
		}

		this.setText(this._errorMessage, message);
		return this;
	}
}
