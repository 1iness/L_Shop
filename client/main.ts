const appContainer = document.getElementById('app');

const renderHome = async (): Promise<void> => {
    if (!appContainer) return;
    appContainer.innerHTML = '<h2>Наши банные принадлежности</h2><div id="products-list"></div>';
    
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        console.log('Загруженные товары:', products);
    } catch (error) {
        console.error('Ошибка загрузки товаров', error);
    }
};

const renderRegister = (): void => {
    if (!appContainer) return;
    appContainer.innerHTML = `
        <h2>Регистрация</h2>
        <form id="register-form" data-registration="true">
            <input type="text" placeholder="Имя пользователя" required>
            <button type="submit">Зарегистрироваться</button>
        </form>
    `;
};

document.getElementById('nav-home')?.addEventListener('click', renderHome);
document.getElementById('nav-register')?.addEventListener('click', renderRegister);
window.addEventListener('DOMContentLoaded', renderHome);