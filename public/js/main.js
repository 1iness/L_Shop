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
var _a, _b;
const appContainer = document.getElementById('app');
const renderHome = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!appContainer)
        return;
    appContainer.innerHTML = '<h2>Наши банные принадлежности</h2><div id="products-list"></div>';
    try {
        const response = yield fetch('/api/products');
        const products = yield response.json();
        console.log('Загруженные товары:', products);
    }
    catch (error) {
        console.error('Ошибка загрузки товаров', error);
    }
});
const renderRegister = () => {
    if (!appContainer)
        return;
    appContainer.innerHTML = `
        <h2>Регистрация</h2>
        <form id="register-form" data-registration="true">
            <input type="text" placeholder="Имя пользователя" required>
            <button type="submit">Зарегистрироваться</button>
        </form>
    `;
};
(_a = document.getElementById('nav-home')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', renderHome);
(_b = document.getElementById('nav-register')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', renderRegister);
window.addEventListener('DOMContentLoaded', renderHome);
