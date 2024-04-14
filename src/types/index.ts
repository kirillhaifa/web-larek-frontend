import { Api, ApiListResponse } from '../components/base/api';

// типизация товара
export type Product = {
  id: string,
  description: string,
  image: string,
  title: string,
  category: string,
  price: number | null
};

// типизация списка товаров
export type ProductListResponse = ApiListResponse<Product>;

//типизация модели товара
export interface IProductModel {
  getProduct(): Product;
}

//типизация модели спискаа товаров 
export interface IProductsListModel {
  getProductList(): IProductModel[];
}

//интерфейс карточки тимплейта 
export interface ICardTemplate {
  getTemplate(templateId: string): HTMLElement;
}

//интерфейс карточки товара 
export interface IProductCard {
  renderCard(container: HTMLElement): HTMLElement;
}

export interface IModal {
  open(): void;
  close(): void;
}

export interface IBascket {
  getOrdersList(): IProductModel[]
  addProduct(product: IProductModel): void
  removeProduct(product: IProductModel): void
  countTotalprice(): number
}

export interface ICustomer {
	setPaymentMethod(paymentMethod: string): void;
	setAddress(address: string): void;
	setEmail(email: string): void;
	setPhoneNumber(phoneNumber: string): void;
}

export interface IForm {
  valid: boolean;
  validate(): this;
  controlSubmitButton(): this;
}