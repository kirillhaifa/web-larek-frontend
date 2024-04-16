import { bascket, eventEmitter } from '..';
import { IBascket, IOrder, IFormAddress, IFormContacts, IApi } from '../types';
import { Form } from './base/form';

//форма адреса и способа оплаты
export class FormAdress extends Form implements IFormAddress {
	protected _adressInput: HTMLInputElement;
	buttonsAlt: NodeListOf<HTMLButtonElement>;

	constructor(form: HTMLFormElement, order: IOrder) {
		super(form);
		this.buttonsAlt = this._form.querySelectorAll(
			'.button_alt'
		) as NodeListOf<HTMLButtonElement>;
		this.behaveLikeRadioButtons(this.buttonsAlt);

		this._adressInput = this._form.querySelector(
			'.form__input'
		) as HTMLInputElement;
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
	private behaveLikeRadioButtons(buttons: NodeListOf<HTMLButtonElement>): void {
		const checkNoChoosen = (
			buttons: NodeListOf<HTMLButtonElement> | null
		): boolean => {
			return !Array.from(buttons).some((button) =>
				button.classList.contains('button_alt-active')
			);
		};

		buttons.forEach((button: HTMLButtonElement) => {
			button.addEventListener('click', () => {
				if (checkNoChoosen(buttons)) {
					button.classList.add('button_alt-active');
				} else {
					buttons.forEach((button: HTMLButtonElement) => {
						button.classList.toggle('button_alt-active');
					});
				}
			});
		});
	}

	//возращает способ оплаты, берет его из кнопок
	private returnChoosenValue(
		buttons: NodeListOf<HTMLButtonElement>
	): string | null {
		let choosenOption: string = '';

		buttons.forEach((button) => {
			if (button.classList.contains('button_alt-active')) {
				choosenOption = button.innerText.trim();
			}
		});
		return choosenOption;
	}

	//переопределяем валидацию из-за необходимости выбора метода оплаты
	validate() {
		if (
			this._adressInput.validity.valid &&
			this.returnChoosenValue(this.buttonsAlt) // должна быть нажата кнопка
		) {
			this._form.querySelector('.form__errors').textContent = '';
			this.valid = true;
		} else {
			this._form.querySelector('.form__errors').textContent =
				'Введите адрес и выберите способ оплаты';
			this.valid = false;
		}
		return this;
	}
}

//форма заполнения контактов
export class FormContacts extends Form implements IFormContacts {
	emailInput: HTMLInputElement;
	phoneInput: HTMLInputElement;
	submitButton: HTMLButtonElement;

	constructor(
		form: HTMLFormElement,
		order: IOrder,
		bascket: IBascket
	) {
		super(form);
		this.emailInput = this._form.querySelector(
			'input[name="email"]'
		) as HTMLInputElement;
		this.emailInput.addEventListener(
			'input',
			this.emeilInputHandler.bind(this)
		);

		this.phoneInput = this._form.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;
		this.phoneInput.addEventListener(
			'input',
			this.phoneInputHandler.bind(this)
		);

		this._submitButton.addEventListener('click', (event) =>
			this.submitHandler(event, order, bascket)
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

	//при этом происходит сразу много всего, очистка корзины, api/post
	submitHandler(event: MouseEvent, order: IOrder, bascket: IBascket) {
		event.preventDefault();
		const payedPrice = bascket.countTotalprice();
		order.setLastOrderPrice(payedPrice);
		order.setEmail(this.emailInput.value);
		order.setPhoneNumber(this.phoneInput.value);
		//бесценные лоты купить нельзя,
		//если сумма заказа равна нулю не демаем запрос на сервер
		if (payedPrice !== 0) {
			eventEmitter.emit('order:send')
		}
		bascket.removeAllProducts();
		eventEmitter.emit('finalModal:open');
		eventEmitter.emit('bascket:changed');
	}

	renderError() {
		const errorMessage = this._form.querySelector('.form__errors');
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

		errorMessage.textContent = message;
		return this;
	}
}
