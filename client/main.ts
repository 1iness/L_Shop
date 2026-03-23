interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    isAvailable: boolean;
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
        cartHtml += '<tr style="background: #eee;"><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Сумма</th></tr>';
        
        items.forEach((item: { productId: string, quantity: number }) => {
            const product = productsMap.get(item.productId);
            const title = product ? product.title : `Товар #${item.productId}`;
            const price = product ? product.price : 0;
            const itemSum = price * item.quantity;
            totalPrice += itemSum;
            
            cartHtml += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px;">${title}</td>
                    <td style="padding: 10px;">${price} руб.</td>
                    <td style="padding: 10px;">${item.quantity} шт.</td>
                    <td style="padding: 10px;">${itemSum} руб.</td>
                </tr>
            `;
        });
        
        cartHtml += '</table>';
        cartHtml += `<div style="margin-top: 15px; font-size: 1.2em;"><strong>Итого: ${totalPrice} руб.</strong></div>`;
        cartHtml += `<br><button id="checkout-btn" style="padding: 10px 20px; background: green; color: white; border: none; cursor: pointer;">Оформить доставку</button>`;
        
        cartContent.innerHTML = cartHtml;
        document.getElementById('checkout-btn')?.addEventListener('click', renderDelivery);

    } catch (error) {
        cartContent.innerHTML = '<p>Ошибка при загрузке корзины.</p>';
    }
};

//Отрисовка страницы Доставки 
const renderDelivery = (): void => {
    if (!appContainer) return;

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

    const dateInput = document.getElementById('delivery-date') as HTMLInputElement;
    dateInput.min = new Date().toISOString().split("T")[0];

    document.getElementById('delivery-form')?.addEventListener('submit', handleDeliverySubmit);
};

// Обработка оформления заказа 
const handleDeliverySubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const messageBox = document.getElementById('delivery-message');
    if (!messageBox) return;

    const address = (form.elements.namedItem('address') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;

    try {
        const response = await fetch('/api/delivery/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, phone, email, date })
        });

        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Заказ успешно оформлен! Корзина очищена.';
            
            setTimeout(renderHome, 3000);
        } else {
            const errData = await response.json();
            messageBox.style.color = 'red';
            messageBox.textContent = 'Ошибка: ' + errData.message;
        }
    } catch (error) {
        messageBox.style.color = 'red';
        messageBox.textContent = 'Ошибка связи с сервером.';
    }
};

document.getElementById('nav-home')?.addEventListener('click', renderHome);
document.getElementById('nav-register')?.addEventListener('click', renderRegister);
document.getElementById('nav-cart')?.addEventListener('click', renderCart);
window.addEventListener('DOMContentLoaded', renderHome);