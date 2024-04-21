import { IForm } from '../../types';
import { ensureAllElements, ensureElement } from '../../utils/utils';
import { Component } from './component';

//базовый код формы
export class Form extends Component<IForm> {
	protected _form: HTMLElement;
	protected _submitButton: HTMLButtonElement;
	protected _inputs: HTMLInputElement[];
	valid: boolean = false;

	constructor(form: HTMLElement) {
		super()
		this._form = form;
		this._inputs = ensureAllElements<HTMLInputElement>('.form__input', this._form)
		this._submitButton = ensureElement<HTMLButtonElement>('.button[type="submit"]', this._form)

		this._form.addEventListener('input', () => {
			this.validate().controlSubmitButton();
		});
	}

	getSubmitButton() {
		return this._submitButton;
	}

	validate() {
		if (
			this._inputs.every((input: HTMLInputElement) => {
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
