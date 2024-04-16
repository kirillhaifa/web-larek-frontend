import './scss/styles.scss';
import { Api } from './components/base/api';
import { API_URL } from './utils/constants';
import { ProductListResponse, IProductModel, IOrder, IApi } from './types';
import { CardTemplate, ProductCard } from './components/card';
import { Bascket, ProductsListModel, Order } from './components/model';
import { EventEmitter } from './components/base/events';
import {
	ModalProduct,
	ModalBasket,
	AddressModal,
	ModalContacts,
	FinalModal,
} from './components/modal';

// Кэширование элементов DOM
export const bascketButton = document.querySelector('.header__basket');
export const bascketCounter = bascketButton.querySelector('.header__basket-counter');
export const gallery = document.querySelector('.gallery') as HTMLElement;
export const modalContainer = document.querySelector('#modal-container') as HTMLElement;

// Инициализация объектов
export const api = new Api(API_URL);
export const eventEmitter = new EventEmitter();
export const bascket = new Bascket();
export const order = new Order();

//получаем список продуктов 
api
	.get('/product')
	.then((response: ProductListResponse) => {
		const productList = new ProductsListModel(response.items);
		productList.getProductList().forEach((product: IProductModel) => {
			const cardTemplate = new CardTemplate();
			const template = cardTemplate.getTemplate('card-catalog');
			const productCard = new ProductCard(product, template);
			productCard.renderCard(gallery);
		});
	})
	.catch((error: any) => {
		console.error('Error:', error);
		console.log('не работает ларёк, потому что Рагнарёк')
	});

//открытие модального окна продукта
eventEmitter.on('productModal:open', (data: { product: IProductModel }) => {
	const contentTemplate = document.querySelector(
		'#card-preview'
	) as HTMLTemplateElement;
	const content = contentTemplate.content.cloneNode(true) as HTMLElement;

	const modalProduct = new ModalProduct(modalContainer, content, data.product, bascket);
	modalProduct.render().controlButton().open();
});

//открытие модального окна корзины
eventEmitter.on('bascketModal:open', () => {
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
		modalContainer,
		bascketContentTemplate,
		cardBascketTemplate,
		order
	);

	modalBascket.render(bascket).validateBascket(bascket).open();
});

//обработка изменений в коризне
eventEmitter.on('bascket:changed', () => {
	const currentNumber = bascket.countAmmount();
	bascketCounter.textContent = currentNumber.toString();
	const bascketContent = modalContainer.querySelector('.modal_active .basket');
	if (bascketContent) {
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
			modalContainer,
			bascketContentTemplate,
			cardBascketTemplate,
			order
		);
		modalBascket.render(bascket).validateBascket(bascket).open();
	}
});

//слушатель для кнопки корзины
bascketButton.addEventListener('click', () => {
	eventEmitter.emit('bascketModal:open');
});

//переход от коризны к оформлению заказа
eventEmitter.on('bascket:checkout', () => {
	const addressTemplate = document.querySelector(
		'#order'
	) as HTMLTemplateElement;
	const addressTemplateContent = addressTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const addressModal = new AddressModal(modalContainer, addressTemplateContent, order);
	addressModal.open();
});

//открытие модального окна заполнения контактов
eventEmitter.on('modalContacts:open', () => {
	const contactsTemplate = document.querySelector(
		'#contacts'
	) as HTMLTemplateElement;
	const contactsTemplateContent = contactsTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const modalContacts = new ModalContacts(
		modalContainer,
		contactsTemplateContent,
		order,
		api
	);
	modalContacts.open();
});

//открытие модального окна завершения заказа
eventEmitter.on('finalModal:open', () => {
	const finalTemplate = document.querySelector(
		'#success'
	) as HTMLTemplateElement;
	const finalTemplateContent = finalTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const finalContacts = new FinalModal(modalContainer, finalTemplateContent);
	finalContacts.render().open();
});

const postOrder = (order: IOrder, api: IApi) => {
	api
		.post('/order', order)
		.then((response: { id: string; total: number }) => {
			// Обработка успешного ответа
			console.log('Order created successfully:', response);
		})
		.catch((error: any) => {
			console.error('Error creating order:', error);
		});
}

eventEmitter.on('order:send', () => postOrder(order, api))
