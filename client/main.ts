interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    isAvailable: boolean;
}

const appContainer = document.getElementById('app');

// --- 1. Отрисовка главной страницы ---
const renderHome = async (): Promise<void> => {
    if (!appContainer) return;
    
    // Базовая разметка с сеткой для карточек
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
            productsList.appendChild(card);
        });

    } catch (error) {
        console.error('Ошибка загрузки товаров', error);
        productsList.innerHTML = '<p style="color: red;">Не удалось загрузить товары.</p>';
    }
};

// --- 2. Отрисовка страницы регистрации ---
const renderRegister = (): void => {
    if (!appContainer) return;
    
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
    const form = document.getElementById('register-form') as HTMLFormElement;
    form.addEventListener('submit', handleRegister);
};

// --- 3. Логика отправки данных (Связь с API) ---
const handleRegister = async (event: Event): Promise<void> => {
    event.preventDefault(); // Запрещаем стандартную перезагрузку страницы браузером
    
const form = event.target as HTMLFormElement;
    const messageBox = document.getElementById('form-message');
    if (!messageBox) return;

    // Строгая типизация полей без использования any [cite: 67, 73]
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
        // Отправляем POST-запрос на наш бэкенд
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            messageBox.style.color = 'green';
            messageBox.textContent = 'Успешно: ' + result.message;
            form.reset(); // Очищаем поля формы
            
            // Автоматический возврат на главную через 2 секунды
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

// --- 4. Простейший Роутер (Навигация) ---
document.getElementById('nav-home')?.addEventListener('click', renderHome);
document.getElementById('nav-register')?.addEventListener('click', renderRegister);

// Инициализация приложения: при загрузке открываем главную
window.addEventListener('DOMContentLoaded', renderHome);