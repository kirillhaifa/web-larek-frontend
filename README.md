# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — базовый, потенциально переиспользуемый код. содержит api, evevnts, form, modal

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами
- src/components - ts компоненты кода. содержит папку base с базовым кодом, а также компоненты актуальные только для этого проекта: card, form, modal, model.
- src/components/card - класс карточки товара 
- src/components/form - дочерние классы form, formAdress и formContacts 
- src/components/modal - дочерние классы modal: modalProduct, modalBasket, modalAddress, modalFinal


## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

npm install 
npm run start

или
yarn 
yarn start

## Сборка

npm run build или yarn build

//комментарий ревьюера:

Вам лучше взять за основу проект Оно тебе надо https://github.com/yandex-praktikum/ono-tebe-nado-oop . Там уже все готово. Вам нужно просто проанализировать то, что там описано, и лишнее удалить. Классы почти все одинаковые, как и их типизация. Внимательно посмотрите еще раз на тот проект

//ответ

//в инструкции к проекту рекомендовалось написать код самостоятельно,
//не копируя из "оно тебе надо", что я и постарался сделать. 
//лишние поиски элементов я удалил, если правильно понял.
//после сдачи этой работы займусь "оно тебе надо", 
//при первом подходе к нему было мало что понятно, сейчас смогу разобраться 



## Описание 

### Содержание документации ###

- Об архитектуре 
- Общее описание работы  
- Классы  
- Интерфейсы  
- События   

### Об архитектуре ###

Взаимодействия внутри приложения происходят через события. Модель получает часть данных от сервера, часть данных от пользователя через интерфейс слоя view. Пользователь генерирует события через сабмиты форм, кнопки и др., слушатели событий выполняют передачу данных в цепи отображения - модель - презентер.

### Общее описание работы: ### 

- Получаем через api список товаров и отрисовываем на его основе карточки.    
- Карточки открывают модальное окно товара, в котором можно добавить или удалить товар из корзины    
- Кнопка корзины открывает модальное окно корзины, данные берутся из модели. При удалении товара отрисовывается заново. Кнопка сабмита ведет к окну адреса.     
- В модальном окне адреса выбирается метод оплаты и адрес, данные записываются в модель заказа при сабмите.     
- В модальном окне контактов заполняются и валидируются данные почты и номера телефона, данные записываются в модель заказа. При сабмите происходит отправка заказа на сервер, очистка корзины и открытие финального модального окна.    
- Финальное модальное окно берет стоимость заказа из модели. На этом цикл завершается.     

Проект можно условно поделить на три слоя: model, view, presenter.

### Классы ### 

#### model

- **ProductModel**: модель хранения отдельного товара. Реализует интерфейс IProductModel.
  - Конструктор: принимает объект продукта и сохраняет его в приватное поле.
  - Методы:
    1. `getProduct`: возвращает объект продукта    
    2. `getProductId`: возвращает ID продукта

- **ProductsListModel**: модель хранения списка товаров. Реализует интерфейс IProductsListModel.
  - Конструктор: принимает массив объектов продуктов из API и сохраняет их.
  - Методы:
    1. `getProductList`: возвращает список продуктов     
    2. `getProductById`: находит продукт по ID и возвращает его

- **Basket**: модель корзины. Хранит добавленные товары. Реализует интерфейс IBasket.
  - Конструктор: инициализирует список заказов пустым массивом.
  - Методы:
    1. `addProduct`: добавляет продукт в корзину
    2. `removeProduct`: удаляет продукт из корзины
    3. `removeAllProducts`: очищает корзину
    4. `countAmmount`: считает количество товаров в корзине
    5. `countTotalprice`: считает сумму всех товаров в корзине

- **Order**: модель хранения данных о заказе. Реализует интерфейс IOrder.
  - Поля: содержат информацию о платеже, адресе, электронной почте, номере телефона, общей стоимости заказа и массиве товаров.
  - Методы:
    1. `setPaymentMethod`, `setAddress`, `setEmail`, `setPhoneNumber`: устанавливают соответствующие данные в объект
    2. `setLastOrderPrice`: устанавливает стоимость заказа
    3. `setOrderedItems`: добавляет товары из корзины в заказ
    4. `getLastOrderPrice`: возвращает общую стоимость заказа

#### view

- **Api**: взаимодействие с сервером. Реализует интерфейс IApi.
  - Конструктор: принимает базовый URL и настройки запроса.
  - Методы:
    1. `get(uri: string)`: выполняет HTTP-запрос методом GET
    2. `post(uri: string, data: object, method: ApiPostMethods = 'POST')`: выполняет HTTP-запрос методом POST
    3. `protected handleResponse(response: Response)`: обрабатывает ответ от сервера

2. **Events** - брокер событий. Реализует интерфейс IEvents

    • контсруктор:     
        Создает экземпляр класса EventEmitter, инициализируя пустой список событий и их подписчиков.

    • методы:
        1. `on(eventName: EventName, callback: (event: T) => void)`: устанавливает обработчик на определенное событие.    
        2. `emit(eventName: string, data?: T)`: инициирует событие с возможностью передачи данных подписчикам.    
        3. `onAll(callback: (event: EmitterEvent) => void)`: устанавливает обработчик на все события.    
        4. `offAll()`: сбрасывает все установленные обработчики событий.
        5. `trigger(eventName: string, context?: Partial<T>)`: создает функцию-триггер, которая инициирует определенное событие при ее вызове.

3. **Form** - базовый класс формы. Реализует интерфейс IForm

    • конструктор     
        Аргументы: form: HTMLFormElement - принимает форму
        Конструктор устанавливает форму, полученную аргументом в поле класса, находит внутри нее кнопку сабмита.    
        Для ввода в инпуты вызывается валидация и управление кнопкой сабмита 
              
    • поля     
        #form: HTMLFormElement | null - форма    
        #submitButton: HTMLButtonElement - кнопка сабмита    
        valid: boolean - валидность формы. Инициализируется как невалидная.

    • методы    
        1. `getSubmitButton`: возвращает кнопку сабмита    
        2. `validate`: проверяет, что все инпуты формы валидны и устанавливает в поле valid true, в противном случае - false    
        3. `controlSubmitButton`: если valid установлено как true, активирует кнопку сабмита, иначе - деактивирует

4. **Modal** - базовый класс модального окна. Реализует интерфейс IModal

    • конструктор     
        Аргументы: template: HTMLElement - принимает шаблон
        Устанавливает полученный шаблон в поле класса, находит элементы контейнера, кнопки закрытия, контента. Расставляет слушатели для закрытия окна 
            
    • поля     
        #closeButton: HTMLButtonElement - кнопка закрытия     
        #content: HTMLElement - контент для модального окна     
        #modalTemplate: HTMLElement - шаблон модального окна     
        #contentContainer: HTMLElement - контейнер, в который вставляется контент    

    • методы    
        1. `open`: открывает содержимое модального окна, добавляет CSS-класс открытого окна, блокирует скролл    
        2. `close`: закрывает модальное окно, удаляет CSS-класс открытого окна, разблокирует скролл

**Код, предназначенный только для этого проекта:**

1. **ProductCard** - отрисовка карточки товара 

    • конструктор:     
        Аргументы:     
            product: IProductModel - продукт для отрисовки    
            cardTemplate: HTMLElement - шаблон карточки     
        
        Устанавливает шаблон, карточку и продукт в поля класса, вешает на карточку слушатель событий 
      
    • поля    
        card: HTMLElement - карточка товара    
        cardTemplate: HTMLElement - шаблон карточки товара     
        product: IProductModel - продукт для отрисовки    

    • методы    
        1. `renderCard(container: HTMLElement)`: отрисовывает карточку в указанный контейнер, заполняя его данными из продукта

2. **FormAddress** - форма заполнения адреса. Наследует класс Form. 

    • конструктор    
        Аргументы:    
            form: HTMLFormElement - форма    
            order: IOrder - заказ    

        Находит кнопки выбора метода оплаты, делает их аналогами радиокнопок через приватную функцию, находит адресный инпут, навешивает слушателей на кнопки выбора оплаты и сабмит 

    • поля
        #addressInput: HTMLInputElement - инпут адреса    
        buttonsAlt: NodeListOf<HTMLButtonElement> - кнопки выбора метода оплаты     

    • методы    
        1. `buttonAltHandler`: действия при клике по кнопке выбора метода оплаты. Возвращает значение, управляет кнопкой сабмита 
        2. `submitHandler(event: MouseEvent, order: IOrder)`: обработчик события сабмита. Вводит данные в модель заказа, открывает следующее модальное окно 
        3. `behaveLikeRadioButtons`: приватный метод, который делает кнопки аналогами радиокнопок после первого нажатия 
        4. `returnChoosenValue`: приватный метод, возвращает значение метода оплаты от кнопок 
        5. `validate`: переопределенная валидация, должен быть выбран метод и введен адрес

3. **FormContacts** - форма контактов. Наследует класс Form. 

    • конструктор     
        Аргументы:     
            form: HTMLFormElement - форма    
            order: IOrder - модель заказа    
            basket: IBasket - модель корзины    
        
        Находит внутри формы нужные элементы и развешивает слушатели событий на инпуты и сабмит 

    • поля    
        emailInput: HTMLInputElement - инпут почты    
        phoneInput: HTMLInputElement - инпут телефона     
        submitButton: HTMLButtonElement - кнопка сабмита    

    • методы    
        1. `emailInputHandler`: обработчик инпута почты. Валидирует, отрисовывает ошибку, управляет кнопкой сабмита     
        2. `phoneInputHandler`: то же самое для телефона, но вместо введенной вначале "8" вписывает '+7'    
        3. `submitHandler`: обработчик события сабмита. Вводит данные в модель, создает события открытия следующего модального окна, очистки корзины, отправки заказа на сервер     
        4. `renderError`: отрисовка ошибки для всех вариантов невалидности.    


Модальные окна:

4. **ModalProduct** - модальное окно продукта. Получает продукт из модели, позволяет добавить или удалить его из корзины.

      • Конструктор    
          Аргументы:    
            template: HTMLElement - тимплейт модального окна    
            content: HTMLElement - контент модального окна    
            product: IProductModel - продукт    

      • Поля    
        #modalContent: HTMLElement - контент модального окна    
        #product: IProductModel - продукт
        #addToBasketButton: HTMLButtonElement - кнопка добавления в корзину    
        #addToBasketHandler: () => void - обработчик кнопки добавления в корзину    

    • Методы
      1. addOrRemoveToBasket - приватный метод, добавляет или удаляет товар из корзины, проверяя, добавлен ли он уже    
        Аргументы:    
          addToBasketButton: HTMLButtonElement - кнопка добавления в корзину    
          basket: IBasket - корзина    
          product: IProductModel - продукт     

      2. checkIfProductAdded - приватный метод, проверяет, есть ли товар в корзине    
        Аргументы:    
          basket: IBasket - корзина    
          product: IProductModel - продукт     

      3. render - берет нужные данные из продукта и отрисовывает модальное окно

      4. controlButton - управляет кнопкой добавления в корзину, проверяя, есть ли товар в корзине

      5. open - открывает окно и вставляет контент


5. **ModalBasket** - модальное окно корзины. Кроме основных функций модального окна, управляет кнопкой перехода к оформлению заказа в зависимости от наличия товаров в корзине. 

      • Конструктор    
        Заполняет поля класса, находит кнопку перехода к оформлению, вешает на нее слушатель.     
          Аргументы    
            template: HTMLElement - тимплейт окна    
            basketTemplate: HTMLElement - тимплейт корзины    
            cardBasketTemplate: HTMLTemplateElement - тимплейт карточки товара в корзине    

      
    • Поля    
    	#basketTemplate: HTMLElement - тимплейт окна    
      #cardBasketTemplate: HTMLTemplateElement - тимплейт корзины    
      #checkoutOrderButton: HTMLButtonElement - тимплейт карточки товара в корзине    

    • Методы    
      1. checkoutHandler - приватный обработчик клика по кнопке перехода к оформлению заказа 

      2. removeProductHandler - обработчик кнопки удаления товара из корзины. 
        Аргументы:     
          product: IProductModel - продукт    

      3. render - метод отрисовки модального окна. Берет товары из корзины и отрисовывает окно. 
        Аргументы:     
          basket: IBasket - корзина    

      4. open - открывает окно и вставляет контент

      5. validateBasket - проверяет, есть ли товары в корзине, и управляет кнопкой перехода к оформлению заказа
          


6. **AddressModal** - модальное окно заполнения адреса и выбора способа оплаты. Взаимодействует с классом AddressForm. Введенная информация валидируется, и в зависимости от нее активируется кнопка сабмита. Полученную информацию записывает в модель заказа. 

      • Конструктор    
        Создает экземпляр класса AddressForm, записывает его в поле класса.     
          Аргументы: 		      
            1. template: HTMLElement - тимплейт окна    
            2. addressTemplate: HTMLElement - тимплейт содержимого    
            3. order: IOrder - заказ    

      • Поля    
        #addressTemplate: HTMLElement    
        #addressForm: AddressForm

      • Методы        
        1. open - открывает окно и вставляет контент    
        2. close - закрывает окно и убирает слушатели

7. **ModalContacts** - модальное окно заполнения контактов. Создает экземпляр класса ContactsForm внутри себя. 

      • Конструктор    
        Заполняет поля класса, создает экземпляр класса ContactsForm.     
          Аргументы:    
            1. template: HTMLElement - тимплейт окна    
            2. content: HTMLElement - контент    
            3. order: IOrder - заказ    

      • Поля    
        1. #modalContent: HTMLElement - контент окна     
        2. #form: ContactsForm    

      • Методы:     
        1. open - открывает окно и вставляет контент    

  
8. **FinalModal** - финальное окно. Получает данные о стоимости заказа из модели. По завершении заказа цикл заканчивается. 

      • Конструктор. Заполняет поля класса, вешает слушатель на кнопку. 
        Аргументы:     
          1. template: HTMLElement - тимплейт окна     
          2. content: HTMLElement - тимплейт контента 

      • Поля:     
        	#modalContent: HTMLElement - тимплейт окна     
          #finalButton: HTMLButtonElement - тимплейт контента     

      • Методы: 
        1. render - отрисовывает сумму заказа     
        2. open - открывает окно и вставляет контент    


3. Слой Presenter - код файла **index.ts**. Здесь инициализируются классы, базовые элементы страницы, и распределяются обработчики событий. 


### Основные интерфейсы: ### 

  Более подробное описание принципа работы см. в разделе Классы

1. **Product** - объект с полями, описывающими продукт:    
      id: string     
      description: string,    
      image: string,    
      title: string,    
      category: string,    
      price: number | null    

2. **IProductModel** - модель отдельного продукта. Помимо самого продукта содержит методы:     
    getProduct(): Product - возвращает продукт    
    getProductId(): string - находит продукт по id     

3. **IProductsListModel** - модель хранения всего списка товаров. Имеет метод:     
      getProductList(): IProductModel[] - возвращает список продуктов     

4. **IModal** - базовое модальное окно 

5. **IBasket** - интерфейс корзины

6. **IOrder** - интерфейс заказа

7. **IForm** - интерфейс базовой формы 

8. **IFormAddress** - интерфейс формы адреса

9. **IApi** - интерфейс API


### События: ### 

1. **basketModal:open** - открытие модального окна корзины

2. **basket:changed** - изменения в корзине

3. **basket:checkout** - подтверждение списка товаров добавленных в корзину и переход к следующему модальному окну.

4. **modalContacts:open** - открытие модального окна ввода контактов 

5. **finalModal:open** - открытие финального модального окна. 

6. **order:send** - отправка заказа на сервер 






