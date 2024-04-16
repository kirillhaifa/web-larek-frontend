import { Api, ApiListResponse, ApiPostMethods } from '../components/base/api';

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
  getProductId(): string
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

//типизация базового модального окна
export interface IModal {
  open(): void;
  close(): void;
}

//типизация корзины
export interface IBascket {
  getOrdersList(): IProductModel[]
  addProduct(product: IProductModel): void
  removeAllProducts(): void
  removeProduct(product: IProductModel): void
  countTotalprice(): number
}

//типизация заказа
export interface IOrder {
  payment: string,
  email: string,
  phone: string,
  address: string,
  total: number,
  items: string[] 

	setPaymentMethod(paymentMethod: string): void;
	setAddress(address: string): void;
	setEmail(email: string): void;
	setPhoneNumber(phoneNumber: string): void;
  setLastOrderPrice(lastOrderPrice: number): void
  getLastOrderPrice(): number
}

//типизация базовой формы
export interface IForm {
  valid: boolean;
  validate(): this;
  controlSubmitButton(): this;
}

//типизация формы адреса
export interface IFormAddress extends IForm {
  buttonsAlt: NodeListOf<HTMLButtonElement>;

  buttonAltHandler(): void;
  submitHandler(event: MouseEvent, order: IOrder): void;
  validate(): this;
}

export interface IFormContacts extends IForm {
  emailInput: HTMLInputElement;
  phoneInput: HTMLInputElement;
  submitButton: HTMLButtonElement;

  emeilInputHandler(): void;
  phoneInputHandler(): void;
  submitHandler(event: MouseEvent, order: IOrder, bascket: IBascket): void;
  renderError(): this;
}

export interface IApi {
  readonly baseUrl: string;
  get(uri: string): Promise<object>;
  post(uri: string, data: object, method?: ApiPostMethods): Promise<object>;
}

