import { eventEmitter } from '..';
import { ICustomer, IForm } from '../types';
import { Form } from './base/form';

export class FormAdress extends Form {
	protected _adressInput: HTMLInputElement;
	buttonsAlt: NodeListOf<HTMLButtonElement>;
	customer: ICustomer

	constructor(form: HTMLFormElement, customer: ICustomer) {
		super(form);
		this.customer = customer
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

		this._submitButton.addEventListener('click', (event) => this.submitHandler(event, customer));
	}

	buttonAltHandler() {
		this.returnChoosenValue(this.buttonsAlt);
		this.validate().controlSubmitButton();
	}

	submitHandler(event: MouseEvent, customer: ICustomer) {
		event.preventDefault();
		eventEmitter.emit('modalContacts:open');
		customer.setPaymentMethod(`${this.returnChoosenValue(this.buttonsAlt)}`);
		customer.setAddress(this._adressInput.value);
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

export class FormContacts extends Form {
	protected _emailInput: HTMLInputElement;
	protected _phoneInput: HTMLInputElement;
	protected _submitButton: HTMLButtonElement;

	constructor(form: HTMLFormElement, customer: ICustomer) {
		super(form);
		this._emailInput = this._form.querySelector(
			'input[name="email"]'
		) as HTMLInputElement;
		this._emailInput.addEventListener('input', () => {
			this.validate().renderError().controlSubmitButton();
		});
		this._phoneInput = this._form.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;
		this._phoneInput.addEventListener('input', () => {
			//если пользователь вводит 8 в начале, автоматически меняется на +7
			if (this._phoneInput.value === '8') {
				this._phoneInput.value = '+7';
			}
			this.validate().renderError().controlSubmitButton();
		});
		this._submitButton.addEventListener('click', (event) => {
			event.preventDefault();
			eventEmitter.emit('finalModal:open');
			customer.setEmail(this._emailInput.value);
			customer.setPhoneNumber(this._phoneInput.value);
			console.log(customer);
		});
	}

	

	renderError() {
		const errorMessage = this._form.querySelector('.form__errors');
		let message = '';

		switch (true) {
			case !this._emailInput.validity.valid && !this._phoneInput.validity.valid:
				message = 'Введите корректный номер телефона и адрес электронной почты';
				break;
			case !this._emailInput.validity.valid:
				message = 'Введите корректный адрес электронной почты';
				break;
			case !this._phoneInput.validity.valid:
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
