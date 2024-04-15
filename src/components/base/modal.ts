import { ensureElement } from "../../utils/utils";
import { IModal } from "../../types";

//базовый класс модального окна
export class Modal implements IModal {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;
	protected _modalTemplate: HTMLElement;
	protected _contentContainer: HTMLElement;

	constructor(template: HTMLElement) {
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
		// Удаляем слушатели событий
		if (this._closeButton) {
			this._closeButton.removeEventListener('click', this.close.bind(this));
		}
		if (this._modalTemplate) {
			this._modalTemplate.removeEventListener('click', this.close.bind(this));
		}
		if (this._content) {
			this._content.removeEventListener('click', (event) =>
				event.stopPropagation()
			);
		}
		this._modalTemplate.classList.remove('modal_active');
		document.body.style.overflow = '';
		return this;
	}
}