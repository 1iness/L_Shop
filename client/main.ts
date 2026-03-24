interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    isAvailable: boolean;
}

interface Window {
    handleQuantityChange: (productId: string, action: 'increase' | 'decrease') => Promise<void>;
    handleRemoveItem: (productId: string) => Promise<void>;
}

const appContainer = document.getElementById('app');

// Отрисовка главной страницы 
const renderHome = async (): Promise<void> => {
    if (!appContainer) return;
    
    appContainer.innerHTML = `
        <h2>Наши банные принадлежности</h2>
        <div id="products-list" style="display: flex; gap: 20px; flex-wrap: wrap;"></div>
    `;
    
    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    try {
        const response = await fetch('/api/products');
        const products: Product[] = await response.json();

        if (products.length === 0) {
            productsList.innerHTML = '<p>Товары пока не добавлены.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.style.border = '1px solid #ddd';
            card.style.padding = '15px';
            card.style.borderRadius = '8px';
            card.style.width = '250px';
            card.style.backgroundColor = '#f9f9f9';

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
            buyBtn?.addEventListener('click', () => addToCartHandler(product.id));
            productsList.appendChild(card);
        });

    } catch (error) {
        console.error('Ошибка загрузки товаров', error);
        productsList.innerHTML = '<p style="color: red;">Не удалось загрузить товары.</p>';
    }
};

//  Отрисовка страницы регистрации 
const renderRegister = (): void => {
    if (!appContainer) return;
    
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

    const form = document.getElementById('register-form') as HTMLFormElement;
    form.addEventListener('submit', handleRegister);
};

// Отрисовка страницы входа
const renderLogin = async (): Promise<void> => {
    if (!appContainer) return;
    
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
    `;
    
    const form = document.getElementById('login-form') as HTMLFormElement;
    form.addEventListener('submit', handleLogin);
};

const handleLogin = async (event: Event): Promise<void> => {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const messageBox = document.getElementById('login-message');
    if (!messageBox) return;
    
    const usernameInput = form.elements.namedItem('username') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    
    const data = {
        username: usernameInput.value,
        password: passwordInput.value
    };
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Успешный вход!';
            showUserInfo(result.user.username);
            setTimeout(renderHome, 1000);
        } else {
            messageBox.style.color = 'red';
            messageBox.textContent = 'Ошибка: ' + result.message;
        }
    } catch (error) {
        console.error('Network error:', error);
        messageBox.style.color = 'red';
        messageBox.textContent = 'Ошибка соединения с сервером.';
    }
};

// Отрисовка страницы заказов
const renderOrders = async (): Promise<void> => {
    if (!appContainer) return;
    
    appContainer.innerHTML = '<h2>Мои заказы</h2><div id="orders-content">Загрузка...</div>';
    const ordersContent = document.getElementById('orders-content');
    if (!ordersContent) return;

    try {
        const response = await fetch('/api/delivery');
        
        if (response.status === 401) {
            ordersContent.innerHTML = '<p style="color: red;">Нужно авторизоваться для просмотра заказов.</p>';
            return;
        }

        const orders = await response.json();

        if (orders.length === 0) {
            ordersContent.innerHTML = '<p>У вас пока нет заказов.</p>';
            return;
        }

        const productsResponse = await fetch('/api/products');
        const products: Product[] = await productsResponse.json();
        const productsMap = new Map(products.map(p => [p.id, p]));

        let ordersHtml = '<div style="display: flex; flex-direction: column; gap: 20px;">';
        
        for (const order of orders) {
            ordersHtml += `
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9;">
                    <h3 style="margin-top: 0;">Заказ #${order.id}</h3>
                    <p><strong>Статус:</strong> <span style="color: ${order.status === 'completed' ? 'green' : order.status === 'cancelled' ? 'red' : 'orange'}">${getStatusName(order.status)}</span></p>
                    <p><strong>Адрес доставки:</strong> ${order.address}</p>
                    <p><strong>Дата доставки:</strong> ${formatDate(order.date)}</p>
                    <p><strong>Сумма:</strong> ${order.totalPrice} руб.</p>
                    <h4>Товары:</h4>
                    <ul>
            `;
            
            for (const item of order.items) {
                const product = productsMap.get(item.productId);
                const title = product ? product.title : `Товар #${item.productId}`;
                ordersHtml += `<li>${title} - ${item.quantity} шт.</li>`;
            }
            
            ordersHtml += '</ul></div>';
        }
        
        ordersHtml += '</div>';
        ordersContent.innerHTML = ordersHtml;

    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        ordersContent.innerHTML = '<p style="color: red;">Не удалось загрузить заказы.</p>';
    }
};

function getStatusName(status: string): string {
    switch (status) {
        case 'pending': return 'Ожидает';
        case 'completed': return 'Выполнен';
        case 'cancelled': return 'Отменён';
        default: return status;
    }
}

//  Логика отправки данных 
const handleRegister = async (event: Event): Promise<void> => {
    event.preventDefault(); 
    
const form = event.target as HTMLFormElement;
    const messageBox = document.getElementById('form-message');
    if (!messageBox) return;

    const usernameInput = form.elements.namedItem('username') as HTMLInputElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const phoneInput = form.elements.namedItem('phone') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;

    const data = {
        username: usernameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        password: passwordInput.value
    };

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Успешно: ' + result.message;
            form.reset(); 
    
            setTimeout(renderHome, 2000);
        } else {
            messageBox.style.color = 'red';
            messageBox.textContent = 'Ошибка: ' + result.message;
        }
    } catch (error) {
        console.error('Network error:', error);
        messageBox.style.color = 'red';
        messageBox.textContent = 'Ошибка соединения с сервером.';
    }
};

const addToCartHandler = async (productId: string): Promise<void> => {
    try {
        const response = await fetch('/api/cart/add', {
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
    } catch (error) {
        console.error('Ошибка при добавлении в корзину', error);
    }
};

const renderCart = async (): Promise<void> => {
    if (!appContainer) return;

    appContainer.innerHTML = '<h2>Ваша корзина</h2><div id="cart-content">Загрузка...</div>';
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) return;

    try {
        // Получаем данные корзины и список товаров параллельно
        const [cartResponse, productsResponse] = await Promise.all([
            fetch('/api/cart'),
            fetch('/api/products')
        ]);
        
        if (cartResponse.status === 401) {
            cartContent.innerHTML = '<p style="color: red;">Нужно авторизоваться, чтобы увидеть корзину.</p>';
            return;
        }

        const data = await cartResponse.json();
        const items = data.items || [];
        const products: Product[] = await productsResponse.json();

        if (items.length === 0) {
            cartContent.innerHTML = '<p>В корзине пока пусто. Время купить веник!</p>';
            return;
        }

        // Создаём карту товаров для быстрого поиска
        const productsMap = new Map(products.map(p => [p.id, p]));

        let totalPrice = 0;
        let cartHtml = '<table style="width: 100%; border-collapse: collapse;">';
        cartHtml += '<tr style="background: #eee;"><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th>Действия</th></tr>';
        
        items.forEach((item: { productId: string, quantity: number }) => {
            const product = productsMap.get(item.productId);
            const title = product ? product.title : `Товар #${item.productId}`;
            const price = product ? product.price : 0;
            const itemSum = price * item.quantity;
            totalPrice += itemSum;
            
            cartHtml += `
                <tr style="border-bottom: 1px solid #ddd;" id="cart-item-${item.productId}">
                    <td style="padding: 10px;">${title}</td>
                    <td style="padding: 10px;">${price} руб.</td>
                    <td style="padding: 10px;">
                        <button onclick="handleQuantityChange('${item.productId}', 'decrease')" style="padding: 2px 8px;">-</button>
                        <span id="qty-${item.productId}" style="margin: 0 8px;">${item.quantity}</span>
                        <button onclick="handleQuantityChange('${item.productId}', 'increase')" style="padding: 2px 8px;">+</button>
                    </td>
                    <td style="padding: 10px;" id="sum-${item.productId}">${itemSum} руб.</td>
                    <td style="padding: 10px;">
                        <button onclick="handleRemoveItem('${item.productId}')" style="padding: 5px 10px; background: #dc3545; color: white; border: none; cursor: pointer;">Удалить</button>
                    </td>
                </tr>
            `;
        });
        
        cartHtml += '</table>';
        cartHtml += `<div style="margin-top: 15px; font-size: 1.2em;"><strong>Итого: <span id="cart-total">${totalPrice}</span> руб.</strong></div>`;
        cartHtml += `<br><button id="checkout-btn" style="padding: 10px 20px; background: green; color: white; border: none; cursor: pointer;">Оформить доставку</button>`;
        
        cartContent.innerHTML = cartHtml;
        document.getElementById('checkout-btn')?.addEventListener('click', renderDelivery);

    } catch (error) {
        cartContent.innerHTML = '<p>Ошибка при загрузке корзины.</p>';
    }
};

// Обработчик изменения количества (+/-)
window.handleQuantityChange = async (productId: string, action: 'increase' | 'decrease'): Promise<void> => {
    try {
        const endpoint = action === 'increase' ? '/api/cart/increase' : '/api/cart/decrease';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });

        if (response.ok) {
            const data = await response.json();
            const userCart = data.cart;
            
            const qtySpan = document.getElementById(`qty-${productId}`);
            const sumSpan = document.getElementById(`sum-${productId}`);
            const totalSpan = document.getElementById('cart-total');
            
            const item = userCart.items.find((i: { productId: string }) => i.productId === productId);
            
            if (item) {
                const productsResponse = await fetch('/api/products');
                const products: Product[] = await productsResponse.json();
                const product = products.find(p => p.id === productId);
                const price = product ? product.price : 0;
                
                if (qtySpan) qtySpan.textContent = item.quantity.toString();
                if (sumSpan) sumSpan.textContent = `${price * item.quantity} руб.`;
            } else {
                const row = document.getElementById(`cart-item-${productId}`);
                if (row) row.remove();
                
                let newTotal = 0;
                for (const i of userCart.items) {
                    const p = await fetch('/api/products').then(r => r.json()).then(products => products.find((prod: Product) => prod.id === i.productId));
                    if (p) newTotal += (p as Product).price * i.quantity;
                }
                if (totalSpan) totalSpan.textContent = newTotal.toString();
            }
            
            let total = 0;
            const items = document.querySelectorAll('tr[id^="cart-item-"]');
            items.forEach(row => {
                const id = (row as HTMLElement).id.replace('cart-item-', '');
                const sumEl = document.getElementById(`sum-${id}`);
                if (sumEl) {
                    const sumText = sumEl.textContent?.replace(' руб.', '') || '0';
                    total += parseInt(sumText);
                }
            });
            if (totalSpan) totalSpan.textContent = total.toString();
            
            if (userCart.items.length === 0) {
                const appContainer = document.getElementById('app');
                if (appContainer) {
                    appContainer.innerHTML = '<h2>Ваша корзина</h2><p>В корзине пока пусто. Время купить веник!</p>';
                }
            }
        }
    } catch (error) {
        console.error('Ошибка изменения количества:', error);
    }
};

// Обработчик удаления товара
window.handleRemoveItem = async (productId: string): Promise<void> => {
    try {
        const response = await fetch('/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });

        if (response.ok) {
            const row = document.getElementById(`cart-item-${productId}`);
            if (row) row.remove();
            
            const totalSpan = document.getElementById('cart-total');
            let total = 0;
            const items = document.querySelectorAll('tr[id^="cart-item-"]');
            items.forEach(r => {
                const id = (r as HTMLElement).id.replace('cart-item-', '');
                const sumEl = document.getElementById(`sum-${id}`);
                if (sumEl) {
                    const sumText = sumEl.textContent?.replace(' руб.', '') || '0';
                    total += parseInt(sumText);
                }
            });
            if (totalSpan) totalSpan.textContent = total.toString();
            
            const appContainer = document.getElementById('app');
            if (appContainer && items.length === 0) {
                appContainer.innerHTML = '<h2>Ваша корзина</h2><p>В корзине пока пусто. Время купить веник!</p>';
            }
        }
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
    }
};

//Отрисовка страницы Доставки 
const renderDelivery = (): void => {
    if (!appContainer) return;

    const captchaNum1 = Math.floor(Math.random() * 10) + 1;
    const captchaNum2 = Math.floor(Math.random() * 10) + 1;
    const captchaAnswer = captchaNum1 + captchaNum2;
    const captchaQuestion = `${captchaNum1} + ${captchaNum2}`;

    appContainer.innerHTML = `
        <h2>Оформление доставки</h2>
        <form id="delivery-form" data-delivery="true">
            <div style="margin-bottom: 10px;">
                <label for="address">Адрес доставки:</label><br>
                <input type="text" id="address" name="address" required style="padding: 8px; width: 300px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label for="delivery-phone">Контактный телефон:</label><br>
                <input type="tel" id="delivery-phone" name="phone" required style="padding: 8px; width: 300px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label for="delivery-email">Электронная почта:</label><br>
                <input type="email" id="delivery-email" name="email" required style="padding: 8px; width: 300px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label for="delivery-date">Дата доставки:</label><br>
                <input type="date" id="delivery-date" name="date" required style="padding: 8px;">
            </div>
            
            <h3>Способ оплаты</h3>
            <div style="margin-bottom: 10px;">
                <input type="radio" id="payment-card" name="payment" value="card" checked>
                <label for="payment-card">Оплата картой онлайн</label>
            </div>
            <div style="margin-bottom: 10px;">
                <input type="radio" id="payment-cash" name="payment" value="cash">
                <label for="payment-cash">Наличными при получении</label>
            </div>
            <div style="margin-bottom: 10px;">
                <input type="radio" id="payment-transfer" name="payment" value="transfer">
                <label for="payment-transfer">Перевод на карту</label>
            </div>

            <h3>Подтверждение</h3>
            <div style="margin-bottom: 10px; background: #f0f0f0; padding: 10px; display: inline-block; border-radius: 5px;">
                <label for="captcha">Решите пример: ${captchaQuestion} = </label>
                <input type="number" id="captcha" name="captcha" required style="padding: 5px; width: 60px;">
                <input type="hidden" id="captcha-answer" value="${captchaAnswer}">
            </div>

            <br><br>
            <button type="submit" id="submit-order" style="padding: 12px 24px; background: #28a745; color: white; border: none; cursor: pointer; font-size: 16px;">
                Оформить заказ
            </button>
        </form>
        <div id="delivery-message" style="margin-top: 15px; font-weight: bold;"></div>
    `;

    const dateInput = document.getElementById('delivery-date') as HTMLInputElement;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split("T")[0];

    document.getElementById('delivery-form')?.addEventListener('submit', handleDeliverySubmit);
};

// Обработка оформления заказа 
const handleDeliverySubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const messageBox = document.getElementById('delivery-message');
    if (!messageBox) return;

    const captchaInput = form.elements.namedItem('captcha') as HTMLInputElement;
    const captchaAnswerInput = document.getElementById('captcha-answer') as HTMLInputElement;
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

    const address = (form.elements.namedItem('address') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const payment = (form.elements.namedItem('payment') as RadioNodeList).value;

    try {
        const response = await fetch('/api/delivery/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, phone, email, date, payment })
        });

        const result = await response.json();

        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.innerHTML = `Заказ #${result.order.id} успешно оформлен!<br>
                Способ оплаты: ${getPaymentName(payment)}<br>
                Сумма: ${result.order.totalPrice} руб.<br>
                Дата доставки: ${formatDate(result.order.date)}<br>
                <em>Корзина очищена.</em>`;
            
            const submitBtn = document.getElementById('submit-order') as HTMLButtonElement;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Заказ оформлен';
            }
            
            setTimeout(renderHome, 5000);
        } else {
            messageBox.style.color = 'red';
            messageBox.textContent = 'Ошибка: ' + result.message;
        }
    } catch (error) {
        messageBox.style.color = 'red';
        messageBox.textContent = 'Ошибка связи с сервером.';
    }
};

function getPaymentName(payment: string): string {
    switch (payment) {
        case 'card': return 'Оплата картой онлайн';
        case 'cash': return 'Наличными при получении';
        case 'transfer': return 'Перевод на карту';
        default: return payment;
    }
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

document.getElementById('nav-home')?.addEventListener('click', renderHome);
document.getElementById('nav-login')?.addEventListener('click', renderLogin);
document.getElementById('nav-register')?.addEventListener('click', renderRegister);
document.getElementById('nav-cart')?.addEventListener('click', renderCart);
document.getElementById('nav-orders')?.addEventListener('click', renderOrders);

// Проверка авторизации при загрузке
const checkAuth = async (): Promise<void> => {
    try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
            const user = await response.json();
            showUserInfo(user.username);
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
    }
};

const showUserInfo = (username: string): void => {
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    
    if (userInfo && usernameDisplay) {
        userInfo.style.display = 'flex';
        usernameDisplay.textContent = username;
    }
    if (navLogin) navLogin.style.display = 'none';
    if (navRegister) navRegister.style.display = 'none';
};

const hideUserInfo = (): void => {
    const userInfo = document.getElementById('user-info');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    
    if (userInfo) userInfo.style.display = 'none';
    if (navLogin) navLogin.style.display = 'inline-block';
    if (navRegister) navRegister.style.display = 'inline-block';
};

// Обработчик выхода
document.getElementById('nav-logout')?.addEventListener('click', async () => {
    try {
        await fetch('/api/users/logout', { method: 'POST' });
        hideUserInfo();
        renderHome();
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    renderHome();
    checkAuth();
});