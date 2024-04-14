import {
	IProductModel,
	Product,
	IProductsListModel,
	ProductListResponse,
	IBascket,
	ICustomer,
} from '../types';
import { Api } from './base/api';
import { CDN_URL, API_URL } from '../utils/constants';

export class ProductModel implements IProductModel {
	private product: Product;

	constructor(product: Product) {
		this.product = product;
	}

	getProduct(): Product {
		return this.product;
	}
}

export class ProductsListModel implements IProductsListModel {
	private productList: ProductModel[];

	constructor(private data: Product[]) {
		this.productList = this.data.map((item) => new ProductModel(item));
	}

	getProductList(): IProductModel[] {
		return this.productList;
	}

	getProductById(id: string): IProductModel | undefined {
		return this.productList.find((product) => product.getProduct().id === id);
	}
}

export class Bascket implements IBascket {
	ordersList: IProductModel[];

	constructor() {
		this.ordersList = [];
	}

	getOrdersList() {
		return this.ordersList;
	}

	addProduct(product: IProductModel) {
		const existingProductIndex = this.ordersList.findIndex(
			(item) => item.getProduct().id === product.getProduct().id
		);

		if (existingProductIndex !== -1) {
			console.log('Товар уже добавлен в корзину');
		} else {
			this.ordersList.push(product);
		}
	}
	removeProduct(product: IProductModel) {
		this.ordersList = this.ordersList.filter((item) => item !== product);
	}

	removeAllProducts() {
		this.ordersList = [];
	}

	countAmmount() {
		return this.ordersList.length;
	}

	countTotalprice() {
		let totalPrice = 0;
		this.getOrdersList().forEach((order) => {
			if (order.getProduct().price) {
				totalPrice = totalPrice + order.getProduct().price;
			}
		});
		return totalPrice;
	}
}

export class Customer implements ICustomer {
	protected _paymentMethod: string = '';
	protected _address: string = '';
	protected _email: string = '';
	protected _phoneNumber: string = '';

	setPaymentMethod(paymentMethod: string) {
		this._paymentMethod = paymentMethod;
	}

	setAddress(address: string) {
		this._address = address;
	}

	setEmail(email: string) {
		this._email = email;
	}

	setPhoneNumber(phoneNumber: string) {
		this._phoneNumber = phoneNumber;
	}
}
