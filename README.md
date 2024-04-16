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
- src/components/modal - дочерние классы modal: modalProduct, modalBascket, modalAddress, modalFinal


## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

npm install 
npm run start

или
yarn 
yarn start

## Сборка

npm run build или yarn build


## Описание 

Приложение готово, создать архитектуру отдельно не удалось, поэтому сдаю вместе, архитектура создавалась в процеесе путем проб и ошибок. Многократно тестировал, ошибок не нашел. 

### Содержание документации ###

  • Общее описание раобты  
  • Классы  
  • интерфейсы  
  • События   

### Общее описание раобты: ### 

  • Получаем через api список товаров и отрисовываем на его основе карточки.    
  • Карточки открывают модальное окно товара, в котором можно добавить или удалить товар из корзины    
  • Кнопка корзины открывает модальное окно коризны, данные берет из модели. При удалении товара отрисовывается заново. Кнопка сабмита ведет к окну адреса.     
  • В модальном окне адреса выбирается метод оплаты и адресс, данные записывается в модель заказа при сабмите.     
  • В модальном окне контактов заполняются и валидируются данные почты и номера телефона, данные записываются в модель заказа. При сабмите присходит отправка заказа на сервер, очистка корзи и открытие финального модального окна.    
  • Финальное модальное окно берет стоимоть заказа из модели. На этом цикл окончен.     

  Процессы реализованы через события: сабмиты форм, клики по кнопкам и др генерируют события, переводя пользователя но следующий этап покупки.      

Проект можно условно поделить на два слоя: model, view, а также код index.ts     

### Классы ### 

1. **model** - слой хранения информации. получает через api список товаров, выдает по запросу в другие классы. содержит классы:    

  1. **ProductModel** - модель хранения отдельного товара. Импдементирует IProductModel
    
    • конструктор    
      Аргументы:    
      product: объект продукта    
      Сохраняет продукт в приватное поле     

    • поля    
      #product

    • методы
      1. getProduct - возвращает объект продукта     
      2. getProductId - возвращает ID продукта     


  2. **ProductsListModel** - модель хранения всего списка товаров. Импдементирует IProductsListModel.

    • конструктор    
      Аргументы:    
      private data: Product[] - получает из Api массив объектов продуктов    

    • поля    
      #productList - массив объектов ProductModel    

    • методы    
      1. getProductList - возращает список продуктов     
      2. getProductById - находит в списке продукт по ID и возвращает его    


  3. **Bascket** - модель корзины. Хранит добавленные товары. Имплиментирует IBascket

    • конструктор - инциализирует список заказов пустым массивом
            
    • поля     
      ordersList - массив объектов моделей продуктов

    • методы    
      1. addProduct    
        Аргументы:    
        product - продукт типа IProductModel    
        Добавляет продукт в корзину.     
    
      2. removeProduct    
        Аргументы:    
        product - продукт типа IProductModel    
        Удаляет продукт из корзины     

      3. removeAllProducts - очищает корзину, инициализируя ее пустым массивом. 

      4. countAmmount - считает колличество товаров, добавленных в корзину

      5. countTotalprice - считает сумму всех добавленных товаров 

  4. **Order** - модель хранения данных о заказе. Имплиментирует IOrder

    • поля    
      payment, address, email, phone - строки    
      total - число, суммарная стоимость товаров     
      items - массив строк id товаров    

    • методы    
      1. setPaymentMethod, setAddress, setEmail,setPhoneNumber - принимают аргументом строку и устанавливают ее в объект
      
      2. setLastOrderPrice - принимает аргументов стоимость товаров в корзине ввиде числа и устанавливает его в объект

      3. setOrderedItems - принимает аргументом коризну, каждый находящий в коризне объект добавляет в модель заказа, проверяя возможнсть покупки

      4. getLastOrderPrice - возращает общую стоимость заказа


2. **view** - слой отображения информации в бразузере.     берет данные из модели, отвечает за переключение между можальными окнами,      дополняет модель в соответсвии с действиями пользователя.      Содержит классы:

  **Базовый, потенциально переиспользуемы код:**


1. **Api** - взаимодействие с сервером. Интерфейс IApi

      • контсруктор:     
          baseUrl: Строка, представляющая базовый URL для всех запросов к API.    
          options: Необязательный объект настроек запроса, совместимый с интерфейсом RequestInit, который может содержать дополнительные параметры, такие как заголовки и метод запроса. По умолчанию пустой объект. 

      • поля:     
        baseUrl: Строка, содержащая базовый URL для всех запросов.    
        options: Объект настроек запроса, используемый для всех запросов, содержащий заголовки и другие параметры.

      • методы:    
        1. get(uri: string): Promise<object>    
            Выполняет HTTP-запрос методом GET.    
            Аргументы:    
            uri: Строка, представляющая конечную точку запроса относительно базового URL.
        
        2. post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>    
            Выполняет HTTP-запрос методом POST или другим указанным методом.    
            Аргументы:    
            uri: Строка, представляющая конечную точку запроса относительно базового URL.    
            data: Объект, который будет преобразован в JSON и отправлен как тело запроса.    
            method: Необязательное перечисление ApiPostMethods, представляющее метод запроса (по умолчанию 'POST').
        
        3. protected handleResponse(response: Response): Promise<object>    
            Обрабатывает ответ от сервера, проверяет его статус и возвращает данные в виде объекта или выбрасывает ошибку, если запрос не удался.    
            Аргументы:    
            response: Объект Response, представляющий ответ от сервера.    


2. **Events** - брокер событий. Имплементирует IEvents

      • контсруктор:     
        Создает экземпляр класса EventEmitter, инициализируя пустой список событий и их подписчиков.

      • методы:
        1. on(eventName: EventName, callback: (event: T) => void)    
            Устанавливает обработчик на определенное событие.    
            Аргументы:    
            eventName: Наименование события.    
            callback: Функция-обработчик, вызываемая при возникновении события.
        
        2. emit(eventName: string, data?: T)    
            Инициирует событие с возможностью передачи данных подписчикам.    
            Аргументы:    
            eventName: Наименование события.    
            data: Данные, передаваемые подписчикам.    

        3. onAll(callback: (event: EmitterEvent) => void)    
            Устанавливает обработчик на все события.    
            Аргументы:    
            callback: Функция-обработчик, вызываемая при возникновении любого события.    

        4. offAll()    
            Сбрасывает все установленные обработчики событий.

        5. trigger(eventName: string, context?: Partial<T>)    
            Создает функцию-триггер, которая инициирует определенное событие при ее вызове.    
            Аргументы:    
            eventName: Наименование события.    
            context: Дополнительные данные для передачи вместе с событием.    


3. **Form** - базовый класс формы. Интерфейс IForm

      • конструктор     
        Аргументы: form: HTMLFormElement - принимает аргументов форму
        Конструктор устанвливает форму, полученную аргументом в поле класса, находит внутри нее кнопку сабмита.    
        Для ввода в инпуты вызывается валидация и управление кнопкой сабмита 
              
      • поля     
        #form: HTMLFormElement | null форма    
        #submitButton: HTMLButtonElement    
        valid: boolean - валидность формы. инциализируется как невалидная м

      • методы    
        1. getSubmitButton - возвращает кнопку сабмита     

        2. validate - проверяет что все инпуты формы валидны и устанавливает в поле valid true, в противном случае устанавливает false

        3. controlSubmitButton - если valid установлено как true, активирует кнопку сабмита, иначе деактивирует

4. **Modal** - базовый класс модального окна. Интерфейс IModal

        • конструктор     
          Аругменты: темплейт HTMLElement    
          устанавливает полученный тимплейт в поле класса, находит элементы контейнера, кнопки закрытия, контента. Расставляет слушатели для закрытия окна 
            
        • поля     
          #closeButton: HTMLButtonElement - кнопка закрытия     
          #content: HTMLElement - контент для модального окна     
          #modalTemplate: HTMLElement - тимплейт модального окна     
          #contentContainer: HTMLElement - контейнер в который вставляется контент    

        • методы    
          1. open    
            ощиает содержимое модального окна 
            добавляет css класс открытого окна
            блокирует скролл    

          2. close    
            Аргументы: удаляет слушатели событий,    
            удаляет css класс открытого окна    
            снимает блок скролла     


**Код, предназначенный только для этого проекта:**

1. **CardTemplate**    
      Имеет метод возращения тимлпейта по его id
    
2. **ProductCard** - отрисовка карточки товара 

      • конструктор:     
        Аргументы:     
        product: IProductModel - продукт для отрисовки    
        cardTemplate: HTMLElement - типлейт карточки     
        
        устанавливает тимплейт, карточку и продукт в поля класса, вещает на карточку слушатель событий 
      
      • поля    
          card: HTMLElement - карточка товара    
          cardTemplate: HTMLElement - тимплейт карточки товара     
          product: IProductModel - продукт для отрисовки    

      • методы    
        1. renderCard    
          Аргументы: container: HTMLElement - контейнер, куда будет вставляться карточка 
          метод берет из продукта необходимую информацию и вставляет значения в соответствующие поля 

        Формы:

3. **FormAddress** - форма заполнения адерса. Дочерний класс Form. 

    • конструктор    
      Аргументы:    
      1. form: HTMLFormElement - форма    
      1. order: IOrder - заказ    

      • находит кнопки выборы матода оплаты, делает их аналогом радиокнопок через приватную функцию    
      • находит adressInput    
      • навешивает слушатели на кнопки выбора оплаты и сабмит     

    • поля
      #adressInput: HTMLInputElement - инпут адресса    
      buttonsAlt: NodeListOf<HTMLButtonElement> - кнопки выбора метода оплаты     

    • методы    
      1. buttonAltHandler - дейтвия при клике по кнопке выбора метода оплаты. возвращает значение, управляет кнопкой сабмита 

      2. submitHandler     
        Аргументы:    
        • event: MouseEvent - событие клика     
        • order: IOrder - объект заказа

        вводит данные в модель заказа, открывает следующее модальное окно 

      3. behaveLikeRadioButtons - приватный метод, который делает кнопки аналогом радиокнопок после первого нажатия. 

      4. returnChoosenValue - приватный метод, возращает значение метода оплаты от кнопок 

      5. validate - переназначенная валидация, должен быть выбран метод и введен адрес

4. **FormContacts** - форма контактов. Наследует классу Form. 

      • конструктор     
        Аргументы:     
          form: HTMLFormElement - форма    
          order: IOrder - модель заказа    
          bascket: IBascket - модель коризны    
        
        Находит внутри формы нужные элементы и развешивает слушатели событий на инпуты и сабмит 
      
      • поля    
        emailInput: HTMLInputElement - инпут почты    
        phoneInput: HTMLInputElement - инпут телефона     
        submitButton: HTMLButtonElement - кнопка сабмита    

      • методы    
        1. emeilInputHandler - обработчик инпута почты. валидирует, отрисовывает ошибку, управляет кнопкой сабмита     
        2. phoneInputHandler - то же самое для телефона, но вместо введенной вначале "8" вписывает '+7'    
        3. submitHandler - обработчик сабмита. вводит данные в модель, создает события открытия следующего модального окна, очистки корзины, отправки заказа на сервер     
        4. renderError - отрисовка ошибки на все варинты невалидности.    

        
    Модальные окна:

5. **ModalProduct** - модальное окно продукта. берет продут из модели, может добавить или удалить его из корзины.

      • конструктор    
          Аргументы    
            template: HTMLElement - тимплейт модального окна    
            content: HTMLElement - контент модального акна    
            product: IProductModel - продукт    

      • поля    
        #modalContent: HTMLElement - контент модального окна    
        #product: IProductModel - продукт
        #addToBascketButton: HTMLButtonElement - кнопка добавления в корзину    
        #addToBascketHandler: () => void - обработчик кнопки добавления в корзину    

    • методы
      1. addOrRemoveToBascket - приватный метод, добавяляет или удаляет отвар из корзины, провяряя добавлен ли она уже     
        Аргументы:    
          addToBascketButton: HTMLButtonElement - кнопка добавления в коризину    
          bascket: IBascket - корзина    
          product: IProductModel - продукт     

      2. checkIfProductAdded - приватный метод. проверяет есть ли в коризне данный товар     
      Аргументы:    
          bascket: IBascket - корзина    
          product: IProductModel - продукт     

      3. render - берет из продукта нужные данные и отрисовывает модальное окно

      4. controlButton - управляет кнопкой добавления в корзину, проверяя есть ли товар в корзине

      5. open - открывает окно и вставляет контент

      6. close - закрывает окно и убирает слушатели 



6. **ModalBasсket** - модальное окно корзины. помимо основных функций модального окна, управляет кнопкой перехода к оформлению заказа в зависмости от того, есть ли товары в корзине. 

      • конструктор    
        заполняет поля класса, находит кнопку перехода к оформлению, вешает на нее слушатель.     
          Аргументы    
            template: HTMLElement - тимплейт окна    
            basketTemplate: HTMLElement - тимплейт корзины    
            cardBascketTemplate: HTMLTemplateElement - тимплейт карточки товара в корзине    

      
    • поля    
    	#basketTemplate: HTMLElement - тимплейт окна    
      #cardBasketTemplate: HTMLTemplateElement - тимплейт корзины    
      #checkoutOrderButton: HTMLButtonElement - тимплейт карточки товара в корзине    

    • методы    
      1. checkoutHandler - приватный класс клика по кнопке перерхода к оформлению. 

      2. removeProductHandler - обработчик кнопки удаления товара из корзины. 
        Аргументы:     
          product: IProductModel - продукт    

      3. render - класс отрисовки модального окна. берет товары из корзины и отрисовывает окно. 
        Аргументы:     
          bascket: IBascket - корзина    

      4. open - открывает окно и вставляет контент

      5. close - закрывает окно и убирает слушатели 

      6. validateBascket - проверяет есть ли товары в корзине и управляет кнопкой перехода к оформелнию
          


7. **AddressModal** - модальное окно заполнения адресса и вида оплаты. Взаимодействует с классом AdsressForm. Введенная информация валидируется, в зависимости от нее активируется кнопка сабмита. Полученную информацию записывает в модель. 

      • Конструктор    
        создает экземпляр класса Form, записывает его в поле класса    
        Аргументы: 		      
          1. template: HTMLElement - тимплейт окна    
          2. addressTemplate: HTMLElement - тимплейт содержимого    
          3. order: IOrder - заказ    

      • Поля    
        #addressTemplate: HTMLElement    
        #adressForm

      • Методы        
        1. open - открывает окно и вставляет контент    
        2. close - закрывает окно и убирает слушатели

8. **ModalContacts** - модальное окно заполнения контактов. Внутри создается классом FormContact. 

      • Конструктор.    
        заполняет поля класса, создает экземпляр класса FormContacts.     
          Аргументы:    
            1. template: HTMLElement - тимплейт окна    
            2. content: HTMLElement - контент    
            3. order: IOrder - заказ    

      • поля    
        1. #modalContent: HTMLElement - контент окна     
        2. #form: IFormContacts - форма    

      • методы:     
        1. open - открывает окно и вставляет контент    
        2. close - закрывает окно и убирает слушатели      

  
9. **FinalModal** - финальное окно. Получает из модели данные стоимости заказа. На этом цикл заказнчивается. 

      • конструктор. заполняет поля класса, вешает слушатель на кнопку 
        Аргументы:     
          1. template: HTMLElement - тимплейт окна  2. content: HTMLElement - тимплейт контента 

      • поля:     
        	#modalContent: HTMLElement - тимплейт окна     
          #finalButton: HTMLButtonElement - тимплейт контента     

      • Методы 
        1. render - отрисовывает списанную сумму     
        2. open - открывает окно и вставляет контент    
        3. close - закрывает окно и убирает слушатели    



3. Также отдельно код файла **index.ts.** В нем иниилизируются классы, базовае элементы страницы, распределются обработчики событий. 



### Основные интерфейсы: ### 

  более подробное описание принципа работы см. в разделе Классы

1. **Product** - объект с полями, описывающими продукт    
      id: string     
      description: string,    
      image: string,    
      title: string,    
      category: string,    
      price: number | null    

2. **IProductModel** - модель отдельного продукта. Помимо самого продука содержит методы     
    getProduct(): Product - возвращает продукт    
    getProductId(): string - находит продукт по id     

3. **IProductsListModel** - модель хранения всего списка товаров. Имеет метод     
      getProductList(): IProductModel[] - возвращает список продуктов     

4. **IModal** - базовое модальное окно 

5. **IBascket** - интерфейс корзины

6. **IOrder** - интрефес заказа

7. **IForm** - интерфейс базовой формы 

8. **IFormAddress** - интерфейс формы контактов

9. **IApi** - интерфейс апи


### События: ### 

1. **bascketModal:open** - открытие модального окна корзины

2. **bascket:changed** - изменения в коризне

3. **bascket:checkout** - подтверждение списка товаров
 добавленных в коризну и переход к следующему модальному окну.

4. **modalContacts:open** - открытие модального окна ввода контактов 

5. **finalModal:open** - открытие финального модального окна. 

6. **order:send** отправка заказа на сервер 





