import './scss/styles.scss';
import { Api } from './components/base/api';
import { API_URL } from './utils/constants';
import { ProductListResponse, IProductModel, IOrder, IApi } from './types';
import { CardTemplate, ProductCard } from './components/card';
import { Basket, ProductsListModel, Order } from './components/model';
import { EventEmitter } from './components/base/events';
import {
	ModalProduct,
	ModalBasket,
	AddressModal,
	ModalContacts,
	FinalModal,
} from './components/modals';

// Кэширование элементов DOM
export const basketButton = document.querySelector('.header__basket');
export const basketCounter = basketButton.querySelector(
	'.header__basket-counter'
);
export const gallery = document.querySelector('.gallery') as HTMLElement;
export const modalContainer = document.querySelector(
	'#modal-container'
) as HTMLElement;

// Инициализация объектов
export const api = new Api(API_URL);
export const eventEmitter = new EventEmitter();
export const basket = new Basket();
export const order = new Order();

//тимплейты
const cardPreviewTemplate = document.querySelector(
	'#card-preview'
) as HTMLTemplateElement;
const basketTemplate = document.querySelector(
	'#basket'
) as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector(
	'#card-basket'
) as HTMLTemplateElement;
const addressTemplate = document.querySelector('#order') as HTMLTemplateElement;
const contactsTemplate = document.querySelector(
	'#contacts'
) as HTMLTemplateElement;
const finalTemplate = document.querySelector('#success') as HTMLTemplateElement;

//получаем список продуктов
api
	.get('/product')
	.then((response: ProductListResponse) => {
		const productList = new ProductsListModel(response.items);
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
		console.log('не работает ларёк, потому что Рагнарёк');
	});

//открытие модального окна продукта
eventEmitter.on('productModal:open', (data: { product: IProductModel }) => {
	const content = cardPreviewTemplate.content.cloneNode(true) as HTMLElement;
	// Получаем единственный экземпляр модального окна продукта
	const modalProduct = new ModalProduct(modalContainer, content, data.product);
	modalProduct.render().controlButton().open();
});

//открытие модального окна корзины
eventEmitter.on('basketModal:open', () => {
	const basketContentTemplate = basketTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const modalBasket = new ModalBasket(
		modalContainer,
		basketContentTemplate,
		cardBasketTemplate
	);
	modalBasket.render(basket).validateBasket(basket).open();
});

//обработка изменений в коризне
eventEmitter.on('basket:changed', () => {
	const currentNumber = basket.countAmmount();
	basketCounter.textContent = currentNumber.toString();
	const basketContent = modalContainer.querySelector('.modal_active .basket');
	if (basketContent) {
		const basketContentTemplate = basketTemplate.content.cloneNode(
			true
		) as HTMLElement;
		const modalBasket = new ModalBasket(
			modalContainer,
			basketContentTemplate,
			cardBasketTemplate
		);
		modalBasket.render(basket).validateBasket(basket).open();
	}
});

//слушатель для кнопки корзины
basketButton.addEventListener('click', () => {
	eventEmitter.emit('basketModal:open');
});

//переход от коризны к оформлению заказа
eventEmitter.on('basket:checkout', () => {
	const addressTemplateContent = addressTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const addressModal = new AddressModal(
		modalContainer,
		addressTemplateContent,
		order
	);
	addressModal.open();
});

//открытие модального окна заполнения контактов
eventEmitter.on('modalContacts:open', () => {
	const contactsTemplateContent = contactsTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const modalContacts = new ModalContacts(
		modalContainer,
		contactsTemplateContent,
		order
	);
	modalContacts.open();
});


//открытие модального окна завершения заказа
eventEmitter.on('finalModal:open', () => {
	const finalTemplateContent = finalTemplate.content.cloneNode(
		true
	) as HTMLElement;
	const finalModal = new FinalModal(modalContainer, finalTemplateContent);	
	finalModal.render().open();
});

const postOrder = (order: IOrder, api: IApi) => {
	api
		.post('/order', order)
		.then((response: { id: string; total: number }) => {
			// Обработка успешного ответа
			console.log('Order created successfully:', response);
			//открываем финальное модальное окно только если сработал api 
			
			eventEmitter.emit('finalModal:open');
			basket.removeAllProducts();
			eventEmitter.emit('basket:changed');
			order.clean()

		})
		.catch((error: any) => {
			console.error('Error creating order:', error);
		});
};

eventEmitter.on('order:send', () => postOrder(order, api));
