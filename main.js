'use strict';

let cart = (JSON.parse(localStorage.getItem('cart')) || []);

const cartDOM = document.querySelector('.cart');
const addToCartButtons = document.querySelectorAll('[data-action="ADD_TO_CART"]');

if (cart.length > 0) {
    cart.forEach(product => {

        insertObjectToDOM(product);
        countCartTotal();

        addToCartButtons.forEach(addToCart => {
            const productDom = addToCart.parentNode;

            if (productDom.querySelector('.product__name').innerText === product.name) {

                handleActionButtons(addToCart, product);

            }
        });
    });
}

addToCartButtons.forEach(addToCart => {
    addToCart.addEventListener('click', () => {
        const productDom = addToCart.parentNode;

        const product = {
            image: productDom.querySelector('.product__image').getAttribute('src'),
            name: productDom.querySelector('.product__name').innerText,
            price: productDom.querySelector('.product__price').innerText,
            quantity: 1
        }

        const isInCart = (cart.filter(cartItem => (cartItem.name === product.name)).length > 0);

        if (!isInCart) {

            insertObjectToDOM(product);

            cart.push(product);
            saveCart();
            handleActionButtons(addToCart, product);

        }

    });

});

function insertObjectToDOM(product) {
    cartDOM.insertAdjacentHTML('beforeend', `
        <div class="cart__item">
            <img class="cart__item__image" src="${product.image}" alt="${product.name}">
            <h3 class="cart__item__name">${product.name}</h3>
            <h3 class="cart__item__price">${product.price}</h3>
            <button class="btn btn--primary btn--small${(product.quantity === 1 ? ' btn--danger' : '')}" data-action="DECREASE_QUANTITY">&minus;</button>
            <h3 class="cart__item__quantity">${product.quantity}</h3>
            <button class="btn btn--primary btn--small" data-action="INCREASE_QUANTITY">&plus;</button>
            <button class="btn btn--danger btn--small" data-action="REMOVE_ITEM">&times;</button>
        </div>
    `);

    addCartFooter();
}

function handleActionButtons(addToCart, product) {
    addToCart.innerText = 'In Cart';
    addToCart.disabled = true;

    const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
    cartItemsDOM.forEach(cartItemDOM => {
        if (cartItemDOM.querySelector('.cart__item__name').innerText === product.name) {

            cartItemDOM.querySelector('[data-action="INCREASE_QUANTITY"]').addEventListener('click', () => increaseQuantity(product, cartItemDOM));

            cartItemDOM.querySelector('[data-action="DECREASE_QUANTITY"]').addEventListener('click', () => decreaseQuantity(product, cartItemDOM, addToCart));

            cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => removeItem(product, cartItemDOM, addToCart));
        }
    });
}

function increaseQuantity(product, cartItemDOM) {
    cart.forEach(cartItem => {
        if (cartItem.name === product.name) {
            cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
            cartItemDOM.querySelector('[data-action="DECREASE_QUANTITY"]').classList.remove('btn--danger');
            saveCart();
        }
    });
}

function decreaseQuantity(product, cartItemDOM, addToCart) {
    cart.forEach(cartItem => {
        if (cartItem.name === product.name) {
            if (cartItem.quantity > 1) {
                cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
                saveCart();
            } else {
                removeItem(product, cartItemDOM, addToCart);
            }

            if (cartItem.quantity === 1) {
                cartItemDOM.querySelector('[data-action="DECREASE_QUANTITY"]').classList.add('btn--danger');
            }
        }
    });
}

function removeItem(product, cartItemDOM, addToCart) {
    cartItemDOM.classList.add('cart__item--removed');
    setTimeout(() => cartItemDOM.remove(), 250);
    cart = cart.filter(cartItem => cartItem.name !== product.name);
    saveCart();
    addToCart.innerText = 'Add To Cart';
    addToCart.disabled = false;

    if (cart.length < 1) {
        document.querySelector('.cart-footer').remove();
    }
}

function addCartFooter() {
    if (document.querySelector('.cart-footer') === null) {
        cartDOM.insertAdjacentHTML('afterend', `
        <div class="cart-footer">
            <button class="btn btn--danger" data-action="CLEAR_CART">Clear Cart</button>
            <button class="btn btn--primary" data-action="CHECKOUT">Pay</button>
        </div>
        `);

        document.querySelector('[data-action="CLEAR_CART"]').addEventListener('click', () => clearCart());
        document.querySelector('[data-action="CHECKOUT"]').addEventListener('click', () => checkout());
    }
}

function clearCart() {
    cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
        cartItemDOM.classList.add('cart__item--removed');
        setTimeout(() => cartItemDOM.remove(), 250);
    });

    cart = [];
    localStorage.removeItem('cart');
    document.querySelector('.cart-footer').remove();

    addToCartButtons.forEach(addToCart => {
        addToCart.innerText = 'Add To Cart';
        addToCart.disabled = false;
    });
}

function checkout() {
    let paypalFormHTML = `
        <form id="paypal-form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
            <input type="hidden" name="cmd" value="_cart">
            <input type="hidden" name="upload" value="1">
            <input type="hidden" name="business" value="amirrami.ce@gmail.com">
    `;

    cart.forEach((cartItem, index) => {
        ++index;
        paypalFormHTML += `
            <input type="hidden" name="item_name_${index}" value="${cartItem.name}">
            <input type="hidden" name="amount_${index}" value="${cartItem.price}">
            <input type="hidden" name="quantity_${index}" value="${cartItem.quantity}">
        `;
    });

    paypalFormHTML += `
            <input type="submit" value="PayPal">
        </form>
        <div class="overlay"></div>
    `;

    document.querySelector('body').insertAdjacentHTML('beforeend', paypalFormHTML);
    document.getElementById('paypal-form').submit();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    countCartTotal();
}

function countCartTotal() {
    let cartTotal = 0;
    cart.forEach(cartItem => {
        cartTotal += cartItem.quantity * cartItem.price;
    });

    document.querySelector('[data-action="CHECKOUT"]').innerText = `Pay $${cartTotal}`;
}
