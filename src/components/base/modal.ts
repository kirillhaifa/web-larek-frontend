import { ensureElement } from "../../utils/utils";
import { IModal } from "../../types";
import { Component } from "./component";

//базовый класс модального окна
export class Modal extends Component <IModal> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;
	protected _modalTemplate: HTMLElement;
	protected _contentContainer: HTMLElement;

	constructor(template: HTMLElement) {
		super()
		this._modalTemplate = template;
		this._contentContainer =
			this._modalTemplate.querySelector('.modal__content');
		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			this._modalTemplate
		);
		this._content = ensureElement<HTMLElement>(
			'.modal__content',
			this._modalTemplate
		);
		this._closeButton.addEventListener('click', this.close.bind(this));
		this._modalTemplate.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	open() {
		this._contentContainer.innerHTML = '';
		this._modalTemplate.classList.add('modal_active');
		this._modalTemplate.style.top = window.scrollY + 'px';
		document.body.style.overflow = 'hidden';
		return this;
	}

	close() {
		this._modalTemplate.classList.remove('modal_active');
		document.body.style.overflow = '';
		return this;
	}
}