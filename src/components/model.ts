import {
	IProductModel,
	Product,
	IProductsListModel,
	IBascket,
	IOrder,
} from '../types';

//модель отдельного продукта
export class ProductModel implements IProductModel {
	private product: Product;

	constructor(product: Product) {
		this.product = product;
	}

	getProduct(): Product {
		return this.product;
	}

	getProductId() {
		return this.getProduct().id
	}
}

//модель всего списка продуктов
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

//модель корзины
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

//модель заказа
export class Order implements IOrder {
	payment: string = '';
	address: string = '';
	email: string = '';
	phone: string = '';
  total: number;
	items: string[] = []

	setPaymentMethod(paymentMethod: string) {
		this.payment = paymentMethod;
	}

	setAddress(address: string) {
		this.address = address;
	}

	setEmail(email: string) {
		this.email = email;
	}

	setPhoneNumber(phoneNumber: string) {
		this.phone = phoneNumber;
	}

	setLastOrderPrice(lastOrderPrice: number) {
		this.total = lastOrderPrice;
	}

	setOrderedItems(bascket: IBascket) {
		bascket.getOrdersList().forEach(item => {
			if (item.getProduct().price) {
				this.items.push(item.getProductId())
			}
		});
	}

	getLastOrderPrice() {
		return this.total
	}
}
