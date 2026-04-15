const BookHaven = (() => {
    const STORAGE = {
        cart: 'bh_cart',
        wishlist: 'bh_wishlist',
        user: 'bh_user',
        users: 'bh_users',
        orders: 'bh_orders'
    };

    const PRODUCTS = [
        {
            id: 'zero-to-one',
            title: 'Zero to One',
            price: 160,
            img: 'static/images/Zero-To-One-by-Peter-Thiel-400x600.jpg',
            category: 'Business',
            desc: 'A modern startup and business strategy classic.'
        },
        {
            id: 'the-alchemist',
            title: 'The Alchemist',
            price: 160,
            img: 'static/images/Alchemist.png',
            category: 'Fiction',
            desc: 'An inspiring novel about following your dreams.'
        },
        {
            id: 'intelligent-investor',
            title: 'The Intelligent Investor',
            price: 249,
            img: 'static/images/The_Intelligent_invester.jpg',
            category: 'Finance',
            desc: 'The classic guide to value investing and long-term success.'
        },
        {
            id: 'sherlock-holmes',
            title: 'Sherlock Holmes',
            price: 299,
            img: 'static/images/sherlock.jpg',
            category: 'Mystery',
            desc: 'A timeless detective collection filled with intrigue.'
        },
        {
            id: 'mystery-thriller',
            title: 'Mystery Thriller',
            price: 179,
            img: 'static/images/img-pro-01.jpg',
            category: 'Thriller',
            desc: 'A tense, page-turning thriller for mystery lovers.'
        },
        {
            id: 'storybook',
            title: 'Children Storybook',
            price: 129,
            img: 'static/images/img-pro-02.jpg',
            category: 'Kids',
            desc: 'A charming storybook perfect for bedtime reading.'
        },
        {
            id: 'romance-novel',
            title: 'Romance Novel',
            price: 189,
            img: 'static/images/img-pro-03.jpg',
            category: 'Romance',
            desc: 'A warm romantic story about love and hope.'
        },
        {
            id: 'history-book',
            title: 'History Book',
            price: 220,
            img: 'static/images/img-pro-04.jpg',
            category: 'History',
            desc: 'A deep dive into memorable events from the past.'
        }
    ];

    const SAMPLE_USERS = [
        {
            id: 'admin',
            email: 'admin@bookhaven.test',
            password: 'Admin123!',
            name: 'Admin User',
            role: 'admin'
        },
        {
            id: 'customer',
            email: 'customer@bookhaven.test',
            password: 'Book1234',
            name: 'Sipho Ndlela',
            role: 'customer'
        }
    ];

    const initData = () => {
        if (!localStorage.getItem(STORAGE.users)) {
            localStorage.setItem(STORAGE.users, JSON.stringify(SAMPLE_USERS));
        }
        if (!localStorage.getItem(STORAGE.cart)) {
            localStorage.setItem(STORAGE.cart, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE.wishlist)) {
            localStorage.setItem(STORAGE.wishlist, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE.orders)) {
            localStorage.setItem(STORAGE.orders, JSON.stringify([]));
        }
    };

    const readStorage = key => JSON.parse(localStorage.getItem(key) || 'null');
    const writeStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
    const getUser = () => readStorage(STORAGE.user);
    const getCart = () => readStorage(STORAGE.cart) || [];
    const getWishlist = () => readStorage(STORAGE.wishlist) || [];
    const getOrders = () => readStorage(STORAGE.orders) || [];
    const getUsers = () => readStorage(STORAGE.users) || [];
    const saveCart = cart => writeStorage(STORAGE.cart, cart);
    const saveWishlist = wishlist => writeStorage(STORAGE.wishlist, wishlist);
    const saveOrders = orders => writeStorage(STORAGE.orders, orders);
    const saveUser = user => writeStorage(STORAGE.user, user);
    const logout = () => {
        localStorage.removeItem(STORAGE.user);
        window.location.reload();
    };

    const formatMoney = amount => `R${amount.toFixed(2)}`;

    const findProduct = (id) => PRODUCTS.find(product => product.id === id);
    const findProductByTitle = title => PRODUCTS.find(product => product.title.toLowerCase().includes(title.toLowerCase()));

    const cartCount = () => getCart().reduce((sum, item) => sum + item.qty, 0);
    const cartTotal = () => getCart().reduce((sum, item) => {
        const product = findProduct(item.id);
        return sum + (product ? product.price * item.qty : 0);
    }, 0);

    const updateCartBadge = () => {
        const count = cartCount();
        document.querySelectorAll('.attr-nav .badge, .side-menu .badge').forEach(badge => badge.textContent = count);
    };

    const updateSideCart = () => {
        const sideList = document.querySelector('.side .cart-list');
        if (!sideList) return;
        const cart = getCart();
        const lines = cart.slice(0, 3).map(item => {
            const product = findProduct(item.id);
            return product ? `
                <li>
                    <a href="#" class="photo"><img src="${product.img}" class="cart-thumb" alt="${product.title}" /></a>
                    <h6><a href="#">${product.title}</a></h6>
                    <p>${item.qty}x - <span class="price">${formatMoney(product.price)}</span></p>
                </li>` : '';
        }).join('');

        const total = cartTotal();
        const totalLine = `
            <li class="total">
                <a href="cart.html" class="btn btn-default hvr-hover btn-cart">VIEW CART</a>
                <span class="float-right"><strong>Total</strong>: ${formatMoney(total)}</span>
            </li>`;
        sideList.innerHTML = lines + totalLine;
    };

    const getSelectedProductId = (button, index) => {
        if (button.dataset.id) return button.dataset.id;
        const product = PRODUCTS[index] || PRODUCTS[0];
        return product.id;
    };

    const attachProductCards = () => {
        document.querySelectorAll('.products-single').forEach((card, index) => {
            const productId = card.querySelector('a.cart')?.dataset.id || PRODUCTS[index]?.id;
            const titleEl = card.querySelector('.why-text h4');
            const priceEl = card.querySelector('.why-text h5');
            const imageEl = card.querySelector('.box-img-hover img');
            const cartButton = card.querySelector('a.cart');
            const wishlistButton = card.querySelector('.mask-icon a[href="#"] .far.fa-heart')?.closest('a') || card.querySelector('.mask-icon a[href="#"]');
            const product = findProduct(productId) || PRODUCTS[index] || PRODUCTS[0];
            if (!cartButton) return;
            cartButton.dataset.id = product.id;
            cartButton.addEventListener('click', event => {
                event.preventDefault();
                addToCart(product.id);
            });

            if (titleEl && priceEl) {
                titleEl.textContent = product.title;
                priceEl.textContent = formatMoney(product.price);
            }
            if (imageEl) {
                imageEl.src = product.img;
                imageEl.alt = product.title;
            }
            if (wishlistButton) {
                wishlistButton.addEventListener('click', event => {
                    event.preventDefault();
                    toggleWishlist(product.id);
                });
            }
        });
    };

    const addToCart = (id, quantity = 1) => {
        const cart = getCart();
        const item = cart.find(x => x.id === id);
        if (item) {
            item.qty += quantity;
        } else {
            cart.push({id, qty: quantity});
        }
        saveCart(cart);
        updateCartBadge();
        updateSideCart();
        showToast(`${findProduct(id)?.title || 'Item'} has been added to your cart.`);
    };

    const removeFromCart = (id) => {
        const cart = getCart().filter(item => item.id !== id);
        saveCart(cart);
        updateCartBadge();
        updateSideCart();
        renderCartPage();
    };

    const updateCartQuantity = (id, qty) => {
        const cart = getCart();
        const item = cart.find(x => x.id === id);
        if (!item) return;
        item.qty = qty > 0 ? qty : 1;
        saveCart(cart);
        updateCartBadge();
        updateSideCart();
        renderCartPage();
    };

    const toggleWishlist = (id) => {
        const wishlist = getWishlist();
        if (wishlist.includes(id)) {
            saveWishlist(wishlist.filter(item => item !== id));
            showToast('Removed from wishlist.');
        } else {
            wishlist.push(id);
            saveWishlist(wishlist);
            showToast('Added to wishlist.');
        }
        renderWishlistPage();
    };

    const showToast = (message) => {
        const existing = document.querySelector('.bh-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'bh-toast';
        toast.textContent = message;
        Object.assign(toast.style, {
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            padding: '14px 18px',
            background: '#28a745',
            color: '#fff',
            borderRadius: '6px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'            
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2800);
    };

    const transformCartTable = () => {
        const table = document.querySelector('.cart-box-main table');
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (tbody) tbody.id = 'cart-body';
        if (!table.querySelector('#cart-body')) {
            const newTbody = document.createElement('tbody');
            newTbody.id = 'cart-body';
            table.appendChild(newTbody);
        }
    };

    const renderCartPage = () => {
        const cart = getCart();
        const tbody = document.querySelector('#cart-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!cart.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Your cart is empty. Add books from the shop.</td></tr>';
            updateCartSummary(0);
            return;
        }
        const rows = cart.map(item => {
            const product = findProduct(item.id);
            if (!product) return '';
            const total = product.price * item.qty;
            return `
                <tr>
                    <td class="thumbnail-img"><a href="#"><img class="img-fluid" src="${product.img}" alt="${product.title}" /></a></td>
                    <td class="name-pr"><a href="#">${product.title}</a></td>
                    <td class="price-pr"><p>${formatMoney(product.price)}</p></td>
                    <td class="quantity-box"><input type="number" min="1" step="1" value="${item.qty}" data-id="${product.id}" class="c-input-text qty text cart-qty"></td>
                    <td class="total-pr"><p>${formatMoney(total)}</p></td>
                    <td class="remove-pr"><a href="#" class="remove-item" data-id="${product.id}"><i class="fas fa-times"></i></a></td>
                </tr>`;
        }).join('');
        tbody.innerHTML = rows;
        tbody.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                removeFromCart(button.dataset.id);
            });
        });
        tbody.querySelectorAll('.cart-qty').forEach(input => {
            input.addEventListener('change', event => {
                const qty = parseInt(event.target.value, 10) || 1;
                updateCartQuantity(event.target.dataset.id, qty);
            });
        });
        updateCartSummary(cartTotal());
    };

    const updateCartSummary = (subtotal) => {
        const orderBox = document.querySelector('.order-box');
        if (!orderBox) return;
        const discount = 0;
        const tax = Math.round(subtotal * 0.02);
        const shipping = 0;
        const grandTotal = subtotal + tax + shipping - discount;
        orderBox.innerHTML = `
            <h3>Order summary</h3>
            <div class="d-flex"><h4>Sub Total</h4><div class="ml-auto font-weight-bold">${formatMoney(subtotal)}</div></div>
            <div class="d-flex"><h4>Discount</h4><div class="ml-auto font-weight-bold">${formatMoney(discount)}</div></div>
            <hr class="my-1">
            <div class="d-flex"><h4>Tax</h4><div class="ml-auto font-weight-bold">${formatMoney(tax)}</div></div>
            <div class="d-flex"><h4>Shipping Cost</h4><div class="ml-auto font-weight-bold">Free</div></div>
            <hr>
            <div class="d-flex gr-total"><h5>Grand Total</h5><div class="ml-auto h5">${formatMoney(grandTotal)}</div></div>
        `;
    };

    const renderWishlistPage = () => {
        const wishlist = getWishlist();
        const tbody = document.querySelector('.wishlist-box-main tbody');
        if (!tbody) return;
        if (!wishlist.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Your wishlist is empty. Add books from the shop.</td></tr>';
            return;
        }
        tbody.innerHTML = wishlist.map(id => {
            const product = findProduct(id);
            if (!product) return '';
            return `
                <tr>
                    <td class="thumbnail-img"><a href="#"><img class="img-fluid" src="${product.img}" alt="${product.title}" /></a></td>
                    <td class="name-pr"><a href="#">${product.title}</a></td>
                    <td class="price-pr"><p>${formatMoney(product.price)}</p></td>
                    <td class="quantity-box">In Stock</td>
                    <td class="add-pr"><a class="btn hvr-hover add-wishlist-item" href="#" data-id="${product.id}">Add to Cart</a></td>
                    <td class="remove-pr"><a href="#" class="remove-wishlist-item" data-id="${product.id}"><i class="fas fa-times"></i></a></td>
                </tr>`;
        }).join('');
        tbody.querySelectorAll('.add-wishlist-item').forEach(anchor => {
            anchor.addEventListener('click', event => {
                event.preventDefault();
                addToCart(anchor.dataset.id);
            });
        });
        tbody.querySelectorAll('.remove-wishlist-item').forEach(anchor => {
            anchor.addEventListener('click', event => {
                event.preventDefault();
                saveWishlist(getWishlist().filter(item => item !== anchor.dataset.id));
                renderWishlistPage();
            });
        });
    };

    const setupCheckoutForms = () => {
        const loginForm = document.querySelector('#formLogin');
        const registerForm = document.querySelector('#formRegister');
        if (loginForm) {
            loginForm.addEventListener('submit', event => {
                event.preventDefault();
                const email = document.querySelector('#InputEmail')?.value.trim();
                const password = document.querySelector('#InputPassword')?.value.trim();
                const user = getUsers().find(u => u.email === email && u.password === password);
                if (!user) {
                    showToast('Login failed. Check your credentials.');
                    return;
                }
                saveUser(user);
                showToast(`Welcome back, ${user.name}.`);
            });
        }
        if (registerForm) {
            registerForm.addEventListener('submit', event => {
                event.preventDefault();
                const email = document.querySelector('#InputEmail1')?.value.trim();
                const password = document.querySelector('#InputPassword1')?.value.trim();
                const firstName = document.querySelector('#InputName')?.value.trim();
                const lastName = document.querySelector('#InputLastname')?.value.trim();
                if (!email || !password || !firstName || !lastName) {
                    showToast('Complete all registration fields.');
                    return;
                }
                const users = getUsers();
                if (users.some(u => u.email === email)) {
                    showToast('This email already exists.');
                    return;
                }
                const user = {
                    id: `user-${Date.now()}`,
                    email,
                    password,
                    name: `${firstName} ${lastName}`,
                    role: 'customer'
                };
                users.push(user);
                writeStorage(STORAGE.users, users);
                saveUser(user);
                showToast(`Account created for ${user.name}.`);
            });
        }
    };

    const renderCheckoutSummary = () => {
        const orderContainer = document.querySelector('.odr-box .rounded') || document.querySelector('.order-box');
        const cart = getCart();
        const productRows = cart.map(item => {
            const product = findProduct(item.id);
            if (!product) return '';
            return `<div class="media mb-2 border-bottom"><div class="media-body"><a href="#">${product.title}</a><div class="small text-muted">Price: ${formatMoney(product.price)} | Qty: ${item.qty} | Subtotal: ${formatMoney(product.price * item.qty)}</div></div></div>`;
        }).join('');
        if (!orderContainer) return;
        if (!cart.length) {
            orderContainer.innerHTML = '<div class="p-3 bg-light">Your cart is empty. Add items before checkout.</div>';
            return;
        }
        orderContainer.innerHTML = productRows;
        const orderSummary = document.querySelector('.order-box');
        if (orderSummary) {
            const subtotal = cartTotal();
            const shipping = document.querySelector('#shippingOption2')?.checked ? 10 : document.querySelector('#shippingOption3')?.checked ? 20 : 0;
            const tax = Math.round(subtotal * 0.02);
            const grandTotal = subtotal + shipping + tax;
            orderSummary.innerHTML = `
                <div class="title-left"><h3>Your order</h3></div>
                <div class="d-flex"><div class="font-weight-bold">Product</div><div class="ml-auto font-weight-bold">Total</div></div>
                <hr class="my-1">
                <div class="d-flex"><h4>Sub Total</h4><div class="ml-auto font-weight-bold">${formatMoney(subtotal)}</div></div>
                <div class="d-flex"><h4>Tax</h4><div class="ml-auto font-weight-bold">${formatMoney(tax)}</div></div>
                <div class="d-flex"><h4>Shipping Cost</h4><div class="ml-auto font-weight-bold">${shipping === 0 ? 'Free' : formatMoney(shipping)}</div></div>
                <hr>
                <div class="d-flex gr-total"><h5>Grand Total</h5><div class="ml-auto h5">${formatMoney(grandTotal)}</div></div>
            `;
        }
    };

    const placeOrder = () => {
        const cart = getCart();
        if (!cart.length) {
            showToast('Your cart is empty.');
            return;
        }
        const user = getUser();
        const order = {
            id: `order-${Date.now()}`,
            items: cart,
            total: cartTotal(),
            date: new Date().toLocaleString(),
            customer: user ? user.name : 'Guest',
            status: 'Paid'
        };
        const orders = getOrders();
        orders.unshift(order);
        saveOrders(orders);
        saveCart([]);
        updateCartBadge();
        updateSideCart();
        showToast('Payment successful! Order confirmed.');
        window.location.href = 'my-account.html';
    };

    const renderAccountPage = () => {
        const wrapper = document.querySelector('.my-account-page');
        if (!wrapper) return;
        const user = getUser();
        const orders = getOrders();
        const profile = user ? `<div class="col-lg-12 mb-4"><div class="border p-4"><h3>Welcome back, ${user.name}</h3><p>Role: ${user.role}</p><button class="btn btn-secondary" id="logoutButton">Logout</button></div></div>` : `<div class="col-lg-12 mb-4"><div class="border p-4"><h3>Welcome to BookHaven</h3><p>Please register or login to track orders.</p></div></div>`;
        const recentOrders = user ? `<div class="col-lg-12 mb-4"><div class="border p-4"><h4>Recent orders</h4>${orders.length ? orders.map(order => `
                <div class="mb-3">
                    <strong>Order ${order.id}</strong> - ${order.date} - ${order.status}<br />
                    <small>${order.items.length} item(s), Total ${formatMoney(order.total)}</small>
                </div>
            `).join('') : '<p>No orders yet.</p>'}</div></div>` : '';
        const adminPanel = user && user.role === 'admin' ? `
            <div class="col-lg-12 mb-4"><div class="border p-4 bg-light"><h4>Admin dashboard</h4><p>Use this admin view to see active orders and test a simulated system.</p>
                <div class="mb-3"><strong>Orders</strong>${orders.length ? orders.map(order => `
                    <div><span>${order.id}</span> - ${order.customer} - ${formatMoney(order.total)} - ${order.status}</div>
                `).join('') : '<p>No orders yet.</p>'}</div>
            </div></div>` : '';
        wrapper.innerHTML = `
            <div class="row">
                ${profile}
                ${recentOrders}
                ${adminPanel}
            </div>
        `;
        const logoutButton = document.querySelector('#logoutButton');
        if (logoutButton) logoutButton.addEventListener('click', logout);
    };

    const attachCheckoutActions = () => {
        const checkoutButton = document.querySelector('.shopping-box .btn');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', event => {
                event.preventDefault();
                placeOrder();
            });
        }
        document.querySelectorAll('input[name="shipping-option"]').forEach(input => {
            input.addEventListener('change', renderCheckoutSummary);
        });
    };

    const setupPage = () => {
        initData();
        updateCartBadge();
        updateSideCart();
        attachProductCards();

        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('shop.html')) {
            renderPageProducts();
        }
        if (window.location.pathname.endsWith('index.html')) {
            const categories = document.querySelector('.categories-shop');
            if (categories) categories.remove();
        }
        if (window.location.pathname.endsWith('cart.html')) {
            transformCartTable();
            renderCartPage();
        }
        if (window.location.pathname.endsWith('checkout.html')) {
            setupCheckoutForms();
            renderCheckoutSummary();
            attachCheckoutActions();
        }
        if (window.location.pathname.endsWith('wishlist.html')) {
            renderWishlistPage();
        }
        if (window.location.pathname.endsWith('my-account.html')) {
            renderAccountPage();
        }
    };

    const renderPageProducts = () => {
        document.querySelectorAll('.products-single').forEach((card, index) => {
            const titleEl = card.querySelector('.why-text h4');
            const priceEl = card.querySelector('.why-text h5');
            const imgEl = card.querySelector('.box-img-hover img');
            const product = PRODUCTS[index] || PRODUCTS[0];
            if (titleEl) titleEl.textContent = product.title;
            if (priceEl) priceEl.textContent = formatMoney(product.price);
            if (imgEl) {
                imgEl.src = product.img;
                imgEl.alt = product.title;
            }
            const cartButton = card.querySelector('a.cart');
            if (cartButton) cartButton.dataset.id = product.id;
            const wishlistButton = card.querySelector('.mask-icon a[href="#"] .far.fa-heart')?.closest('a') || card.querySelector('.mask-icon a[href="#"]');
            if (wishlistButton) wishlistButton.dataset.id = product.id;
        });
    };

    return {
        init: setupPage
    };
})();

window.addEventListener('DOMContentLoaded', BookHaven.init);
