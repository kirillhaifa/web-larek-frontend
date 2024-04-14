import { IForm } from "../../types";

export class Form implements IForm {
	protected _form: HTMLFormElement | null;
	protected _submitButton: HTMLButtonElement;
	valid: boolean = false;

	constructor(form: HTMLFormElement) {
		this._form = form;
		this._submitButton = this._form.querySelector(
			'.button[type="submit"]'
		) as HTMLButtonElement;

		this._form.addEventListener('input', () => {
			this.validate().controlSubmitButton();
		});
	}

  getSubmitButton() {
    return this._submitButton
  }

	getFormValue(): FormData | null {
		if (!this._form) return null;

		return new FormData(this._form);
	}

	validate() {
		const inputs = Array.from(this._form.querySelectorAll('.form__input'));
		if (
			inputs.every((input: HTMLInputElement) => {
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
		if (this.valid) {
			this._submitButton.removeAttribute('disabled');
		} else {
			this._submitButton.setAttribute('disabled', 'disabled');
		}
		return this;
	}
}