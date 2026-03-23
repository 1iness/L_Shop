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
var _a, _b, _c;
const appContainer = document.getElementById('app');
// --- 1. Отрисовка главной страницы ---
const renderHome = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!appContainer)
        return;
    // Базовая разметка с сеткой для карточек
    appContainer.innerHTML = `
        <h2>Наши банные принадлежности</h2>
        <div id="products-list" style="display: flex; gap: 20px; flex-wrap: wrap;"></div>
    `;
    const productsList = document.getElementById('products-list');
    if (!productsList)
        return;
    try {
        const response = yield fetch('/api/products');
        const products = yield response.json();
        if (products.length === 0) {
            productsList.innerHTML = '<p>Товары пока не добавлены.</p>';
            return;
        }
        // Рендерим карточки на основе данных
        products.forEach(product => {
            const card = document.createElement('div');
            // Немного стилей для визуального порядка [cite: 76]
            card.style.border = '1px solid #ddd';
            card.style.padding = '15px';
            card.style.borderRadius = '8px';
            card.style.width = '250px';
            card.style.backgroundColor = '#f9f9f9';
            // Строго соблюдаем ТЗ: вешаем data-title и data-price [cite: 86, 87]
            card.innerHTML = `
                <h3 data-title>${product.title}</h3>
                <p style="font-size: 0.9em; color: #555;">${product.description}</p>
                <p><strong>Цена:</strong> <span data-price>${product.price} руб.</span></p>
                <p><em>Категория: ${product.category}</em></p>
                <button 
                    style="width: 100%; padding: 8px; cursor: pointer;" 
                    ${!product.isAvailable ? 'disabled' : ''}
                >
                    ${product.isAvailable ? 'В корзину' : 'Нет в наличии'}
                </button>
            `;
            const buyBtn = card.querySelector('button');
            buyBtn === null || buyBtn === void 0 ? void 0 : buyBtn.addEventListener('click', () => addToCartHandler(product.id));
            productsList.appendChild(card);
        });
    }
    catch (error) {
        console.error('Ошибка загрузки товаров', error);
        productsList.innerHTML = '<p style="color: red;">Не удалось загрузить товары.</p>';
    }
});
// --- 2. Отрисовка страницы регистрации ---
const renderRegister = () => {
    if (!appContainer)
        return;
    // Форма с атрибутом data-registration по требованиям ТЗ
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
    `;
    // Подключаем обработчик отправки формы
    const form = document.getElementById('register-form');
    form.addEventListener('submit', handleRegister);
};
// --- 3. Логика отправки данных (Связь с API) ---
const handleRegister = (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault(); // Запрещаем стандартную перезагрузку страницы браузером
    const form = event.target;
    const messageBox = document.getElementById('form-message');
    if (!messageBox)
        return;
    // Строгая типизация полей без использования any [cite: 67, 73]
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
        // Отправляем POST-запрос на наш бэкенд
        const response = yield fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = yield response.json();
        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Успешно: ' + result.message;
            form.reset(); // Очищаем поля формы
            // Автоматический возврат на главную через 2 секунды
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
        const response = yield fetch('/api/cart'); // Предполагаем, что ты добавил GET в cartRoutes
        if (response.status === 401) {
            cartContent.innerHTML = '<p style="color: red;">Нужно авторизоваться, чтобы увидеть корзину.</p>';
            return;
        }
        const data = yield response.json();
        // В data у нас объект { username: string, items: [...] }
        const items = data.items || [];
        if (items.length === 0) {
            cartContent.innerHTML = '<p>В корзине пока пусто. Время купить веник!</p>';
            return;
        }
        // Отрисовываем список товаров в корзине
        let cartHtml = '<table style="width: 100%; border-collapse: collapse;">';
        cartHtml += '<tr style="background: #eee;"><th>Товар (ID)</th><th>Кол-во</th></tr>';
        items.forEach((item) => {
            cartHtml += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px;">Товар #${item.productId}</td>
                    <td style="padding: 10px;">${item.quantity} шт.</td>
                </tr>
            `;
        });
        cartHtml += '</table>';
        cartHtml += `<br><button id="checkout-btn" style="padding: 10px 20px; background: green; color: white; border: none; cursor: pointer;">Оформить доставку</button>`;
        cartContent.innerHTML = cartHtml;
        // Привязываем переход к доставке (следующий этап)
        (_a = document.getElementById('checkout-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', renderDelivery);
    }
    catch (error) {
        cartContent.innerHTML = '<p>Ошибка при загрузке корзины.</p>';
    }
});
// --- 6. Отрисовка страницы Доставки ---
const renderDelivery = () => {
    var _a;
    if (!appContainer)
        return;
    appContainer.innerHTML = `
        <h2>Оформление доставки</h2>
        <form id="delivery-form" data-delivery="true">
            <div style="margin-bottom: 10px;">
                <label for="address">Адрес доставки:</label><br>
                <input type="text" id="address" name="address" required>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="delivery-phone">Контактный телефон:</label><br>
                <input type="tel" id="delivery-phone" name="phone" required>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="delivery-email">Электронная почта:</label><br>
                <input type="email" id="delivery-email" name="email" required>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="delivery-date">Дата доставки:</label><br>
                <input type="date" id="delivery-date" name="date" required>
            </div>
            <button type="submit" style="padding: 10px 20px; background: blue; color: white; border: none; cursor: pointer;">
                Подтвердить заказ
            </button>
        </form>
        <div id="delivery-message" style="margin-top: 15px; font-weight: bold;"></div>
    `;
    // Устанавливаем минимальную дату — сегодня (чтобы нельзя было заказать на "вчера")
    const dateInput = document.getElementById('delivery-date');
    dateInput.min = new Date().toISOString().split("T")[0];
    (_a = document.getElementById('delivery-form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', handleDeliverySubmit);
};
// --- 7. Обработка оформления заказа ---
const handleDeliverySubmit = (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const form = event.target;
    const messageBox = document.getElementById('delivery-message');
    if (!messageBox)
        return;
    // Сбор данных без any
    const address = form.elements.namedItem('address').value;
    const phone = form.elements.namedItem('phone').value;
    const email = form.elements.namedItem('email').value;
    const date = form.elements.namedItem('date').value;
    try {
        const response = yield fetch('/api/delivery/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, phone, email, date })
        });
        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Заказ успешно оформлен! Корзина очищена.';
            // Через 3 секунды возвращаемся на главную
            setTimeout(renderHome, 3000);
        }
        else {
            const errData = yield response.json();
            messageBox.style.color = 'red';
            messageBox.textContent = 'Ошибка: ' + errData.message;
        }
    }
    catch (error) {
        messageBox.style.color = 'red';
        messageBox.textContent = 'Ошибка связи с сервером.';
    }
});
// --- 4. Простейший Роутер (Навигация) ---
(_a = document.getElementById('nav-home')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', renderHome);
(_b = document.getElementById('nav-register')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', renderRegister);
(_c = document.getElementById('nav-cart')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', renderCart);
// Инициализация приложения: при загрузке открываем главную
window.addEventListener('DOMContentLoaded', renderHome);
