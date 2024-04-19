import { IForm } from '../../types';
import { Component } from './component';

//базовый код формы
export class Form extends Component<IForm> {
	protected _form: HTMLFormElement | null;
	protected _submitButton: HTMLButtonElement;
	protected _inputs: NodeListOf<HTMLInputElement>;
	valid: boolean = false;

	constructor(form: HTMLFormElement) {
		super();
		this._form = form;
		this._inputs = this._form.querySelectorAll('.form__input');

		this._submitButton = this._form.querySelector(
			'.button[type="submit"]'
		) as HTMLButtonElement;

		this._form.addEventListener('input', () => {
			this.validate().controlSubmitButton();
		});
	}

	getSubmitButton() {
		return this._submitButton;
	}

	validate() {
		if (
			Array.from(this._inputs).every((input: HTMLInputElement) => {
				return input.validity.valid;
			})
		) {
			this.valid = true;
		} else {
			this.valid = false;
		}
		return this;
	}

	controlSubmitButton() {
		this.setDisabled(this._submitButton, !this.valid);
		return this;
	}
}
