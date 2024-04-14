import './scss/styles.scss';
import { Api, ApiListResponse } from './components/base/api';
import { CDN_URL, API_URL } from './utils/constants';
import { Product, ProductListResponse, IProductModel } from './types';
import { CardTemplate, ProductCard } from './components/card';
import { Bascket, ProductModel, ProductsListModel, Customer} from './components/model';
import { EventEmitter } from './components/base/events';
import {
	ModalProduct,
	ModalBasket,
	AddressModal,
	ModalContacts,
	FinalModal,
} from './components/modal';

export const api = new Api(API_URL);
export const eventEmitter = new EventEmitter();
export const bascket = new Bascket();
export const customer = new Customer()

api
	.get('/product')
	.then((response: ProductListResponse) => {
		const productList = new ProductsListModel(response.items);
		const gallery = document.querySelector('.gallery') as HTMLElement;
		console.log(productList);
		productList.getProductList().forEach((product: IProductModel) => {
			const cardTemplate = new CardTemplate();
			const template = cardTemplate.getTemplate('card-catalog');
			const productCard = new ProductCard(product, template);
			productCard.renderCard(gallery);
		});
	})
	.catch((error: any) => {
		console.error('Error:', error);
	});

eventEmitter.on('productModal:open', (data: { product: IProductModel }) => {
	const modal = document.querySelector('#modal-container') as HTMLElement;
	const contentTemplate = document.querySelector(
		'#card-preview'
	) as HTMLTemplateElement;
	const content = contentTemplate.content.cloneNode(true) as HTMLElement;

	const modalProduct = new ModalProduct(modal, content, data.product, bascket);
	modalProduct.render().controlButton().open();
});

const bascketButton = document.querySelector('.header__basket');
const bascketCounter = bascketButton.querySelector('.header__basket-counter');

eventEmitter.on('bascketModal:open', () => {
	const modal = document.querySelector('#modal-container') as HTMLElement;
	const bascketTemplate = document.querySelector(
		'#basket'
	) as HTMLTemplateElement;
	const bascketContentTemplate = bascketTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const cardBascketTemplate = document.querySelector(
		'#card-basket'
	) as HTMLTemplateElement;

	const modalBascket = new ModalBasket(
		modal,
		bascketContentTemplate,
		cardBascketTemplate
	);

	modalBascket.render(bascket).validateBascket(bascket).open();
});

eventEmitter.on('bascket:changed', () => {
	const currentNumber = bascket.countAmmount();
	bascketCounter.textContent = currentNumber.toString();
	const modal = document.querySelector('#modal-container') as HTMLElement;
	const bascketTemplate = document.querySelector(
		'#basket'
	) as HTMLTemplateElement;
	const bascketContentTemplate = bascketTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const cardBascketTemplate = document.querySelector(
		'#card-basket'
	) as HTMLTemplateElement;

	const modalBascket = new ModalBasket(
		modal,
		bascketContentTemplate,
		cardBascketTemplate
	);
	//проверяем открыто ли окно корзины,
	//если открыто то при изменении в корзине перерисовываем список
	const openModal = document.querySelector('.modal_active');
	const bascketContent = openModal.querySelector('.basket');
	if (bascketContent) {
		modalBascket.render(bascket).validateBascket(bascket).open();
	}
});

bascketButton.addEventListener('click', () => {
	eventEmitter.emit('bascketModal:open');
});

eventEmitter.on('bascket:checkout', () => {
	const modal = document.querySelector('#modal-container') as HTMLElement;
	const addressTemplate = document.querySelector(
		'#order'
	) as HTMLTemplateElement;
	const addressTemplateContent = addressTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const addressModal = new AddressModal(modal, addressTemplateContent, customer);
	addressModal.open();
});

eventEmitter.on('modalContacts:open', () => {
	const modal = document.querySelector('#modal-container') as HTMLElement;
	const contactsTemplate = document.querySelector(
		'#contacts'
	) as HTMLTemplateElement;
	const contactsTemplateContent = contactsTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const modalContacts = new ModalContacts(modal, contactsTemplateContent, customer);
	modalContacts.open();
});

eventEmitter.on('finalModal:open', () => {
	const modal = document.querySelector('#modal-container') as HTMLElement;
	const finalTemplate = document.querySelector(
		'#success'
	) as HTMLTemplateElement;
	const finalTemplateContent = finalTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const finalContacts = new FinalModal(modal, finalTemplateContent);
	finalContacts.render(bascket).open();
});
