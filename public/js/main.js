"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c, _d, _e;
const appContainer = document.getElementById('app');
let allProducts = [];
let currentFilters = {
    search: '',
    category: 'all',
    availability: 'all',
    sort: 'default'
};
const renderHome = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!appContainer)
        return;
    appContainer.innerHTML = `
        
        <!-- Панель поиска и фильтров -->
        <div class="filters-panel">
            <div class="search-box">
                <input type="text" id="search-input" placeholder="Поиск по названию или описанию...">
            </div>
            
            <div class="filter-group">
                <label for="category-filter">Категория:</label>
                <select id="category-filter">
                    <option value="all">Все категории</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="availability-filter">Наличие:</label>
                <select id="availability-filter">
                    <option value="all">Все товары</option>
                    <option value="available">В наличии</option>
                    <option value="unavailable">Нет в наличии</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="sort-select">Сортировка:</label>
                <select id="sort-select">
                    <option value="default">По умолчанию</option>
                    <option value="price-asc">Цена: по возрастанию</option>
                    <option value="price-desc">Цена: по убыванию</option>
                </select>
            </div>
            
            <button id="reset-filters" class="reset-btn">Сбросить фильтры</button>
        </div>
        
        <div id="products-list" class="products-grid"></div>
        <div id="no-results" class="no-results" style="display: none;">Товары не найдены</div>
    `;
    yield loadProducts();
    setupFilterListeners();
});
const loadProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const productsList = document.getElementById('products-list');
    if (!productsList)
        return;
    try {
        const response = yield fetch('/api/products');
        allProducts = yield response.json();
        if (allProducts.length === 0) {
            productsList.innerHTML = '<p>Товары пока не добавлены.</p>';
            return;
        }
        populateCategoryFilter();
        applyFiltersAndRender();
    }
    catch (error) {
        console.error('Ошибка загрузки товаров', error);
        productsList.innerHTML = '<p style="color: red;">Не удалось загрузить товары.</p>';
    }
});
const populateCategoryFilter = () => {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter)
        return;
    const categories = [...new Set(allProducts.map(p => p.category))].sort();
    categoryFilter.innerHTML = '<option value="all">Все категории</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
};
const setupFilterListeners = () => {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const availabilityFilter = document.getElementById('availability-filter');
    const sortSelect = document.getElementById('sort-select');
    const resetBtn = document.getElementById('reset-filters');
    // Поиск
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase().trim();
        applyFiltersAndRender();
    });
    // Категория
    categoryFilter.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
        applyFiltersAndRender();
    });
    // Наличие
    availabilityFilter.addEventListener('change', (e) => {
        currentFilters.availability = e.target.value;
        applyFiltersAndRender();
    });
    // Сортировка
    sortSelect.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        applyFiltersAndRender();
    });
    // Сброс фильтров
    resetBtn === null || resetBtn === void 0 ? void 0 : resetBtn.addEventListener('click', () => {
        currentFilters = {
            search: '',
            category: 'all',
            availability: 'all',
            sort: 'default'
        };
        searchInput.value = '';
        categoryFilter.value = 'all';
        availabilityFilter.value = 'all';
        sortSelect.value = 'default';
        applyFiltersAndRender();
    });
};
// Применение фильтров и отрисовка товаров
const applyFiltersAndRender = () => {
    const productsList = document.getElementById('products-list');
    const noResults = document.getElementById('no-results');
    if (!productsList)
        return;
    // Фильтрация
    let filteredProducts = allProducts.filter(product => {
        // Поиск по имени или описанию
        const matchesSearch = currentFilters.search === '' ||
            product.title.toLowerCase().includes(currentFilters.search) ||
            product.description.toLowerCase().includes(currentFilters.search);
        // Фильтр по категории
        const matchesCategory = currentFilters.category === 'all' ||
            product.category === currentFilters.category;
        // Фильтр по наличию
        let matchesAvailability = true;
        if (currentFilters.availability === 'available') {
            matchesAvailability = product.isAvailable === true;
        }
        else if (currentFilters.availability === 'unavailable') {
            matchesAvailability = product.isAvailable === false;
        }
        return matchesSearch && matchesCategory && matchesAvailability;
    });
    // Сортировка
    if (currentFilters.sort === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    }
    else if (currentFilters.sort === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }
    // Отображение
    if (filteredProducts.length === 0) {
        productsList.innerHTML = '';
        if (noResults)
            noResults.style.display = 'block';
        return;
    }
    if (noResults)
        noResults.style.display = 'none';
    // Очищаем и отрисовываем товары
    productsList.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-placeholder">🌿</div>
            <div class="product-card-content">
                <h3>${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-price">${product.price}</span>
                    <span class="product-category">${product.category}</span>
                </div>
                <p class="product-availability ${product.isAvailable ? 'available' : 'unavailable'}">
                    ${product.isAvailable ? '✓ В наличии' : '✗ Нет в наличии'}
                </p>
                <button 
                    class="add-to-cart-btn"
                    ${!product.isAvailable ? 'disabled' : ''}
                >
                    ${product.isAvailable ? 'В корзину' : 'Нет в наличии'}
                </button>
            </div>
        `;
        const buyBtn = card.querySelector('button');
        buyBtn === null || buyBtn === void 0 ? void 0 : buyBtn.addEventListener('click', () => addToCartHandler(product.id));
        productsList.appendChild(card);
    });
};
//  Отрисовка страницы регистрации 
const renderRegister = () => {
    if (!appContainer)
        return;
    appContainer.innerHTML = `
        <h2>Регистрация</h2>
        <form id="register-form" data-registration="true">
            <div style="margin-bottom: 10px;">
                <label for="username">Имя пользователя (Логин):</label><br>
                <input type="text" id="username" name="username" required>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="email">Email:</label><br>
                <input type="email" id="email" name="email" required>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="phone">Телефон:</label><br>
                <input type="tel" id="phone" name="phone" required>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="password">Пароль:</label><br>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Зарегистрироваться</button>
        </form>
        <div id="form-message" style="margin-top: 15px; font-weight: bold;"></div>
        <div style="margin-top: 20px; text-align: center;">Уже есть аккаунт? <button id="go-to-login" style="background: none; border: none; color: blue; cursor: pointer; text-decoration: underline; padding: 0;">Войти</button></div>
    `;
    const form = document.getElementById('register-form');
    form.addEventListener('submit', handleRegister);
    const loginBtn = document.getElementById('go-to-login');
    loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.addEventListener('click', renderLogin);
};
// Отрисовка страницы входа
const renderLogin = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!appContainer)
        return;
    appContainer.innerHTML = `
        <h2>Вход в аккаунт</h2>
        <form id="login-form" data-login="true">
            <div style="margin-bottom: 10px;">
                <label for="login-username">Имя пользователя:</label><br>
                <input type="text" id="login-username" name="username" required>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="login-password">Пароль:</label><br>
                <input type="password" id="login-password" name="password" required>
            </div>
            <button type="submit">Войти</button>
        </form>
        <div id="login-message" style="margin-top: 15px; font-weight: bold;"></div>
        <div style="margin-top: 20px; text-align: center;">Нет аккаунта? <button id="go-to-register" style="background: none; border: none; color: blue; cursor: pointer; text-decoration: underline; padding: 0;">Зарегистрироваться</button></div>
    `;
    const form = document.getElementById('login-form');
    form.addEventListener('submit', handleLogin);
    const registerBtn = document.getElementById('go-to-register');
    registerBtn === null || registerBtn === void 0 ? void 0 : registerBtn.addEventListener('click', renderRegister);
});
const handleLogin = (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const form = event.target;
    const messageBox = document.getElementById('login-message');
    if (!messageBox)
        return;
    const usernameInput = form.elements.namedItem('username');
    const passwordInput = form.elements.namedItem('password');
    const data = {
        username: usernameInput.value,
        password: passwordInput.value
    };
    try {
        const response = yield fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = yield response.json();
        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Успешный вход!';
            showUserInfo(result.user.username);
            setTimeout(renderHome, 1000);
        }
        else {
            messageBox.style.color = 'red';
            messageBox.textContent = 'Ошибка: ' + result.message;
        }
    }
    catch (error) {
        console.error('Network error:', error);
        messageBox.style.color = 'red';
        messageBox.textContent = 'Ошибка соединения с сервером.';
    }
});
// Отрисовка страницы заказов
const renderOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!appContainer)
        return;
    appContainer.innerHTML = '<h2>Мои заказы</h2><div id="orders-content">Загрузка...</div>';
    const ordersContent = document.getElementById('orders-content');
    if (!ordersContent)
        return;
    try {
        const response = yield fetch('/api/delivery');
        if (response.status === 401) {
            ordersContent.innerHTML = '<p style="color: red;">Нужно авторизоваться для просмотра заказов.</p>';
            return;
        }
        const orders = yield response.json();
        if (orders.length === 0) {
            ordersContent.innerHTML = '<p>У вас пока нет заказов.</p>';
            return;
        }
        const productsResponse = yield fetch('/api/products');
        const products = yield productsResponse.json();
        const productsMap = new Map(products.map(p => [p.id, p]));
        let ordersHtml = '<div class="orders-container">';
        for (const order of orders) {
            ordersHtml += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Заказ #${order.id}</span>
                        <span class="order-status ${order.status}">${getStatusName(order.status)}</span>
                    </div>
                    <div class="order-details">
                        <div class="order-detail">
                            <span class="order-detail-label">Адрес доставки</span>
                            <span class="order-detail-value">${order.address}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-detail-label">Дата доставки</span>
                            <span class="order-detail-value">${formatDate(order.date)}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-detail-label">Сумма заказа</span>
                            <span class="order-detail-value">${order.totalPrice} ₽</span>
                        </div>
                    </div>
                    <div class="order-items">
                        <div class="order-items-title">Товары в заказе</div>
            `;
            for (const item of order.items) {
                const product = productsMap.get(item.productId);
                const title = product ? product.title : `Товар #${item.productId}`;
                ordersHtml += `<div class="order-item"><span class="order-item-name">${title}</span><span class="order-item-qty">${item.quantity} шт.</span></div>`;
            }
            ordersHtml += '</div></div>';
        }
        ordersHtml += '</div>';
        ordersContent.innerHTML = ordersHtml;
    }
    catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        ordersContent.innerHTML = '<p style="color: red;">Не удалось загрузить заказы.</p>';
    }
});
function getStatusName(status) {
    switch (status) {
        case 'pending': return 'Ожидает';
        case 'completed': return 'Выполнен';
        case 'cancelled': return 'Отменён';
        default: return status;
    }
}
//  Логика отправки данных 
const handleRegister = (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const form = event.target;
    const messageBox = document.getElementById('form-message');
    if (!messageBox)
        return;
    const usernameInput = form.elements.namedItem('username');
    const emailInput = form.elements.namedItem('email');
    const phoneInput = form.elements.namedItem('phone');
    const passwordInput = form.elements.namedItem('password');
    const data = {
        username: usernameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        password: passwordInput.value
    };
    try {
        const response = yield fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = yield response.json();
        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Успешно: ' + result.message;
            form.reset();
            setTimeout(renderHome, 2000);
        }
        else {
            messageBox.style.color = 'red';
            messageBox.textContent = 'Ошибка: ' + result.message;
        }
    }
    catch (error) {
        console.error('Network error:', error);
        messageBox.style.color = 'red';
        messageBox.textContent = 'Ошибка соединения с сервером.';
    }
});
const addToCartHandler = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        if (response.status === 401) {
            alert('Сначала нужно войти в аккаунт!');
            renderRegister();
            return;
        }
        if (response.ok) {
            alert('Товар в корзине!');
        }
    }
    catch (error) {
        console.error('Ошибка при добавлении в корзину', error);
    }
});
const renderCart = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!appContainer)
        return;
    appContainer.innerHTML = '<h2>Ваша корзина</h2><div id="cart-content">Загрузка...</div>';
    const cartContent = document.getElementById('cart-content');
    if (!cartContent)
        return;
    try {
        // Получаем данные корзины и список товаров параллельно
        const [cartResponse, productsResponse] = yield Promise.all([
            fetch('/api/cart'),
            fetch('/api/products')
        ]);
        if (cartResponse.status === 401) {
            cartContent.innerHTML = '<p style="color: red;">Нужно авторизоваться, чтобы увидеть корзину.</p>';
            return;
        }
        const data = yield cartResponse.json();
        const items = data.items || [];
        const products = yield productsResponse.json();
        if (items.length === 0) {
            cartContent.innerHTML = '<p>В корзине пока пусто. Время купить веник!</p>';
            return;
        }
        // Создаём карту товаров для быстрого поиска
        const productsMap = new Map(products.map(p => [p.id, p]));
        let totalPrice = 0;
        let cartHtml = '<div class="cart-container"><table class="cart-table">';
        cartHtml += '<thead><tr><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th>Действия</th></tr></thead><tbody>';
        items.forEach((item) => {
            const product = productsMap.get(item.productId);
            const title = product ? product.title : `Товар #${item.productId}`;
            const price = product ? product.price : 0;
            const itemSum = price * item.quantity;
            totalPrice += itemSum;
            cartHtml += `
                <tr id="cart-item-${item.productId}">
                    <td class="cart-item-title">${title}</td>
                    <td class="cart-item-price">${price} ₽</td>
                    <td>
                        <div class="cart-quantity">
                            <button class="cart-quantity-btn" onclick="handleQuantityChange('${item.productId}', 'decrease')">−</button>
                            <span id="qty-${item.productId}">${item.quantity}</span>
                            <button class="cart-quantity-btn" onclick="handleQuantityChange('${item.productId}', 'increase')">+</button>
                        </div>
                    </td>
                    <td class="cart-item-price" id="sum-${item.productId}">${itemSum} ₽</td>
                    <td>
                        <button class="cart-remove-btn" onclick="handleRemoveItem('${item.productId}')">Удалить</button>
                    </td>
                </tr>
            `;
        });
        cartHtml += '</tbody></table>';
        cartHtml += '<div class="cart-total"><div class="cart-total-label">Итого к оплате</div><div class="cart-total-amount" id="cart-total">' + totalPrice + ' ₽</div></div>';
        cartHtml += '<button id="checkout-btn" class="checkout-btn">Оформить доставку</button></div>';
        cartContent.innerHTML = cartHtml;
        (_a = document.getElementById('checkout-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', renderDelivery);
    }
    catch (error) {
        cartContent.innerHTML = '<p>Ошибка при загрузке корзины.</p>';
    }
});
// Обработчик изменения количества (+/-)
window.handleQuantityChange = (productId, action) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const endpoint = action === 'increase' ? '/api/cart/increase' : '/api/cart/decrease';
        const response = yield fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        if (response.ok) {
            const data = yield response.json();
            const userCart = data.cart;
            const qtySpan = document.getElementById(`qty-${productId}`);
            const sumSpan = document.getElementById(`sum-${productId}`);
            const totalSpan = document.getElementById('cart-total');
            const item = userCart.items.find((i) => i.productId === productId);
            if (item) {
                const productsResponse = yield fetch('/api/products');
                const products = yield productsResponse.json();
                const product = products.find(p => p.id === productId);
                const price = product ? product.price : 0;
                if (qtySpan)
                    qtySpan.textContent = item.quantity.toString();
                if (sumSpan)
                    sumSpan.textContent = `${price * item.quantity} руб.`;
            }
            else {
                const row = document.getElementById(`cart-item-${productId}`);
                if (row)
                    row.remove();
                let newTotal = 0;
                for (const i of userCart.items) {
                    const p = yield fetch('/api/products').then(r => r.json()).then(products => products.find((prod) => prod.id === i.productId));
                    if (p)
                        newTotal += p.price * i.quantity;
                }
                if (totalSpan)
                    totalSpan.textContent = newTotal.toString();
            }
            let total = 0;
            const items = document.querySelectorAll('tr[id^="cart-item-"]');
            items.forEach(row => {
                var _a;
                const id = row.id.replace('cart-item-', '');
                const sumEl = document.getElementById(`sum-${id}`);
                if (sumEl) {
                    const sumText = ((_a = sumEl.textContent) === null || _a === void 0 ? void 0 : _a.replace(' руб.', '')) || '0';
                    total += parseInt(sumText);
                }
            });
            if (totalSpan)
                totalSpan.textContent = total.toString();
            if (userCart.items.length === 0) {
                const appContainer = document.getElementById('app');
                if (appContainer) {
                    appContainer.innerHTML = '<h2>Ваша корзина</h2><p>В корзине пока пусто. Время купить веник!</p>';
                }
            }
        }
    }
    catch (error) {
        console.error('Ошибка изменения количества:', error);
    }
});
// Обработчик удаления товара
window.handleRemoveItem = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch('/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        if (response.ok) {
            const row = document.getElementById(`cart-item-${productId}`);
            if (row)
                row.remove();
            const totalSpan = document.getElementById('cart-total');
            let total = 0;
            const items = document.querySelectorAll('tr[id^="cart-item-"]');
            items.forEach(r => {
                var _a;
                const id = r.id.replace('cart-item-', '');
                const sumEl = document.getElementById(`sum-${id}`);
                if (sumEl) {
                    const sumText = ((_a = sumEl.textContent) === null || _a === void 0 ? void 0 : _a.replace(' руб.', '')) || '0';
                    total += parseInt(sumText);
                }
            });
            if (totalSpan)
                totalSpan.textContent = total.toString();
            const appContainer = document.getElementById('app');
            if (appContainer && items.length === 0) {
                appContainer.innerHTML = '<h2>Ваша корзина</h2><p>В корзине пока пусто. Время купить веник!</p>';
            }
        }
    }
    catch (error) {
        console.error('Ошибка удаления товара:', error);
    }
});
//Отрисовка страницы Доставки 
const renderDelivery = () => {
    var _a;
    if (!appContainer)
        return;
    const captchaNum1 = Math.floor(Math.random() * 10) + 1;
    const captchaNum2 = Math.floor(Math.random() * 10) + 1;
    const captchaAnswer = captchaNum1 + captchaNum2;
    const captchaQuestion = `${captchaNum1} + ${captchaNum2}`;
    appContainer.innerHTML = `
        <h2>Оформление доставки</h2>
        <form id="delivery-form" data-delivery="true">
            <div class="form-group">
                <label for="address">Адрес доставки</label>
                <input type="text" id="address" name="address" required placeholder="Улица, дом, квартира">
            </div>
            <div class="form-group">
                <label for="delivery-phone">Контактный телефон</label>
                <input type="tel" id="delivery-phone" name="phone" required placeholder="+7 (999) 123-45-67">
            </div>
            <div class="form-group">
                <label for="delivery-email">Электронная почта</label>
                <input type="email" id="delivery-email" name="email" required placeholder="email@example.com">
            </div>
            <div class="form-group">
                <label for="delivery-date">Дата доставки</label>
                <input type="date" id="delivery-date" name="date" required>
            </div>
            
            <h3 style="margin-top: 25px; margin-bottom: 15px;">Способ оплаты</h3>
            <div class="form-group" style="display: flex; gap: 20px; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="radio" id="payment-card" name="payment" value="card" checked style="width: auto;">
                    <span>Оплата картой онлайн</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="radio" id="payment-cash" name="payment" value="cash" style="width: auto;">
                    <span>Наличными при получении</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="radio" id="payment-transfer" name="payment" value="transfer" style="width: auto;">
                    <span>Перевод на карту</span>
                </label>
            </div>

            <h3 style="margin-top: 25px; margin-bottom: 15px;">Подтверждение</h3>
            <div class="form-group" style="background: var(--bg-light); padding: 15px; border-radius: 8px; display: inline-block;">
                <label for="captcha" style="margin-bottom: 0;">Решите пример: ${captchaQuestion} = </label>
                <input type="number" id="captcha" name="captcha" required style="width: 80px; display: inline-block; margin-left: 10px; padding: 8px;">
                <input type="hidden" id="captcha-answer" value="${captchaAnswer}">
            </div>

            <button type="submit" id="submit-order" class="checkout-btn" style="margin-top: 25px;">
                Оформить заказ
            </button>
        </form>
        <div id="delivery-message" style="margin-top: 20px; text-align: center;"></div>
    `;
    const dateInput = document.getElementById('delivery-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split("T")[0];
    (_a = document.getElementById('delivery-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', handleDeliverySubmit);
};
// Обработка оформления заказа 
const handleDeliverySubmit = (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const form = event.target;
    const messageBox = document.getElementById('delivery-message');
    if (!messageBox)
        return;
    const captchaInput = form.elements.namedItem('captcha');
    const captchaAnswerInput = document.getElementById('captcha-answer');
    const userAnswer = parseInt(captchaInput.value);
    const correctAnswer = parseInt(captchaAnswerInput.value);
    if (userAnswer !== correctAnswer) {
        messageBox.style.color = 'red';
        messageBox.textContent = 'Неверный ответ на капчу. Попробуйте ещё раз.';
        const captchaNum1 = Math.floor(Math.random() * 10) + 1;
        const captchaNum2 = Math.floor(Math.random() * 10) + 1;
        const newAnswer = captchaNum1 + captchaNum2;
        const captchaLabel = form.querySelector('label[for="captcha"]');
        if (captchaLabel) {
            captchaLabel.textContent = `Решите пример: ${captchaNum1} + ${captchaNum2} = `;
        }
        captchaAnswerInput.value = newAnswer.toString();
        captchaInput.value = '';
        return;
    }
    const address = form.elements.namedItem('address').value;
    const phone = form.elements.namedItem('phone').value;
    const email = form.elements.namedItem('email').value;
    const date = form.elements.namedItem('date').value;
    const payment = form.elements.namedItem('payment').value;
    try {
        const response = yield fetch('/api/delivery/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, phone, email, date, payment })
        });
        const result = yield response.json();
        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.innerHTML = `Заказ #${result.order.id} успешно оформлен!<br>
                Способ оплаты: ${getPaymentName(payment)}<br>
                Сумма: ${result.order.totalPrice} руб.<br>
                Дата доставки: ${formatDate(result.order.date)}<br>
                <em>Корзина очищена.</em>`;
            const submitBtn = document.getElementById('submit-order');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Заказ оформлен';
            }
            setTimeout(renderHome, 5000);
        }
        else {
            messageBox.style.color = 'red';
            messageBox.textContent = 'Ошибка: ' + result.message;
        }
    }
    catch (error) {
        messageBox.style.color = 'red';
        messageBox.textContent = 'Ошибка связи с сервером.';
    }
});
function getPaymentName(payment) {
    switch (payment) {
        case 'card': return 'Оплата картой онлайн';
        case 'cash': return 'Наличными при получении';
        case 'transfer': return 'Перевод на карту';
        default: return payment;
    }
}
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
// Отрисовка страницы профиля
const renderProfile = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!appContainer)
        return;
    appContainer.innerHTML = `
        <h2>Личный кабинет</h2>
        <div id="profile-content">
            <div class="cart-container" style="max-width: 600px;">
                <div class="profile-info" id="profile-info" style="margin-bottom: 25px;">Загрузка...</div>
                <button id="logout-btn" class="cart-remove-btn" style="width: 100%; text-align: center;">Выйти из аккаунта</button>
            </div>
        </div>
    `;
    const profileInfo = document.getElementById('profile-info');
    const logoutBtn = document.getElementById('logout-btn');
    try {
        const response = yield fetch('/api/users/me');
        if (response.ok) {
            const user = yield response.json();
            if (profileInfo) {
                profileInfo.innerHTML = `
                    <div class="order-detail" style="padding: 15px 0; border-bottom: 1px solid var(--bg-light);">
                        <span class="order-detail-label">Имя пользователя</span>
                        <span class="order-detail-value">${user.username}</span>
                    </div>
                    <div class="order-detail" style="padding: 15px 0; border-bottom: 1px solid var(--bg-light);">
                        <span class="order-detail-label">Email</span>
                        <span class="order-detail-value">${user.email || 'Не указан'}</span>
                    </div>
                    <div class="order-detail" style="padding: 15px 0;">
                        <span class="order-detail-label">Телефон</span>
                        <span class="order-detail-value">${user.phone || 'Не указан'}</span>
                    </div>
                `;
            }
        }
        else {
            if (profileInfo)
                profileInfo.innerHTML = '<p>Не удалось загрузить данные профиля</p>';
        }
    }
    catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        if (profileInfo)
            profileInfo.innerHTML = '<p>Ошибка загрузки профиля</p>';
    }
    logoutBtn === null || logoutBtn === void 0 ? void 0 : logoutBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fetch('/api/users/logout', { method: 'POST' });
            hideUserInfo();
            renderHome();
        }
        catch (error) {
            console.error('Ошибка выхода:', error);
        }
    }));
});
(_a = document.getElementById('nav-home')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', renderHome);
(_b = document.getElementById('nav-auth')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', renderLogin);
(_c = document.getElementById('nav-cart')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', renderCart);
(_d = document.getElementById('nav-orders')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', renderOrders);
(_e = document.getElementById('nav-profile')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', renderProfile);
// Проверка авторизации при загрузке
const checkAuth = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch('/api/users/me');
        if (response.ok) {
            const user = yield response.json();
            showUserInfo(user.username);
        }
    }
    catch (error) {
        console.error('Ошибка проверки авторизации:', error);
    }
});
const showUserInfo = (username) => {
    const navAuth = document.getElementById('nav-auth');
    const navProfile = document.getElementById('nav-profile');
    if (navProfile)
        navProfile.style.display = 'inline-block';
    if (navAuth)
        navAuth.style.display = 'none';
};
const hideUserInfo = () => {
    const navAuth = document.getElementById('nav-auth');
    const navProfile = document.getElementById('nav-profile');
    if (navProfile)
        navProfile.style.display = 'none';
    if (navAuth)
        navAuth.style.display = 'inline-block';
};
window.addEventListener('DOMContentLoaded', () => {
    renderHome();
    checkAuth();
});
