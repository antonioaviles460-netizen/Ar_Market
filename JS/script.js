/**
 * AR MARKET STORE - JAVASCRIPT FINAL V4
 * Ajuste Final: Implementación completa de Edición de Inventario y Control de Ventas (Admin).
 */

// ====================================================================
// 1. DATOS Y ESTADO DE LA APLICACIÓN (GLOBAL)
// ====================================================================

let products = [];
for (let i = 1; i <= 20; i++) {
    const categories = ["mujer", "hombre", "accesorios"];
    products.push({
        id: i,
        name: `Camisa Urbana Slim Fit ${i}`,
        price: 1000 + i * 50,
        category: categories[i % 3],
        stock: Math.floor(Math.random() * 10) + 1,
        img: `https://picsum.photos/400/400?random=${i}`,
        rating: (Math.random() * (5 - 3) + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 300) + 10,
        description: `Esta es una descripción detallada de la Camisa Urbana Slim Fit ${i}. Confeccionada con algodón premium y corte moderno. Ideal para cualquier ocasión casual. Disponible en tallas S a XL.`,
    });
}

let cart = [];
let currentUser = null;
let registeredUsers = [{ email: "designer@ar.com", name: "Admin", password: "123" }];
let salesHistory = []; // NUEVO: Historial de ventas

let currentProductFilter = "all"; 
let currentSort = "default"; 


// ====================================================================
// 2. REFERENCIAS AL DOM (Se llenan en DOMContentLoaded)
// ====================================================================

let splash, enterBtn, mainContent, productsGrid, cartBtn, loginModal, authBtn, userStatus, 
    toast, inventoryButton, inventoryModal, inventoryList, closeInventoryBtn,
    salesButton, salesModal, salesList, closeSalesBtn, salesFilterForm, totalRevenue, // NUEVAS REFERENCIAS DE VENTAS
    cartCount, cartItems, cartTotal, closeCartBtn, checkoutBtn, authForm, authSubmitBtn, 
    toggleRegister, authTitle, nameInput, categoryLinks, categoryFilterSelect, searchInput,
    productDetailModal, detailTitle, detailImage, detailPrice, detailDescription, detailStock, detailRating, detailAddToCartBtn, closeDetailBtn, sortSelect; 

// ====================================================================
// 3. FUNCIONES DE UTILIDAD (GLOBAL)
// ====================================================================

function showToast(message, type = 'info') {
    if (!toast) return;

    toast.className = 'fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300';
    
    switch (type) {
        case 'success':
            toast.classList.add('bg-green-600', 'text-white');
            break;
        case 'error':
            toast.classList.add('bg-red-600', 'text-white');
            break;
        default: 
            toast.classList.add('bg-gray-800', 'text-white');
            break;
    }
    
    toast.textContent = message;
    toast.classList.remove('hidden', 'opacity-0');
    toast.classList.add('animate-fadeIn');

    setTimeout(() => {
        toast.classList.remove('animate-fadeIn');
        toast.classList.add('opacity-0');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2500);
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.toggle('hidden');
}

function getRatingHTML(rating, reviews) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';

    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star text-yellow-400 text-sm"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt text-yellow-400 text-sm"></i>';
    }
    const totalStars = fullStars + (hasHalfStar ? 1 : 0);
    for (let i = totalStars; i < 5; i++) {
        starsHTML += '<i class="far fa-star text-yellow-400 text-sm"></i>';
    }

    return `
        <div class="flex items-center space-x-1">
            ${starsHTML}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">(${reviews})</span>
        </div>
    `;
}

// ====================================================================
// 4. LÓGICA DE PRODUCTOS, BÚSQUEDA Y CARRITO
// ====================================================================

function decreaseStock(id) {
    const product = products.find(p => p.id === id);
    if (product && product.stock > 0) {
        product.stock -= 1;
        return true;
    }
    return false;
}

function increaseStock(id, quantity = 1) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.stock += quantity;
        return true;
    }
    return false;
}

function renderProducts(filter = currentProductFilter, searchTerm = '', sort = currentSort) { 
    if (!productsGrid) return;
    productsGrid.innerHTML = "";
    currentProductFilter = filter; 
    currentSort = sort; 

    let filtered = products;

    if (filter !== "all") {
        filtered = filtered.filter(p => p.category === filter);
    }
    
    if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(lowerCaseSearch) ||
            p.category.toLowerCase().includes(lowerCaseSearch)
        );
    }

    if (sort !== "default") {
        filtered.sort((a, b) => {
            const getFinalPrice = (p) => Math.round(p.price * (1 - Math.floor(Math.random() * (60 - 20 + 1) + 20) / 100));
            
            const priceA = getFinalPrice(a);
            const priceB = getFinalPrice(b);

            if (sort === 'price_asc') {
                return priceA - priceB;
            } else if (sort === 'price_desc') {
                return priceB - priceA;
            }
            return 0;
        });
    }

    if (filtered.length === 0) {
        productsGrid.innerHTML = '<p class="text-center text-xl text-gray-600 dark:text-gray-400 col-span-full py-10">❌ No se encontraron productos que coincidan con los criterios.</p>';
        return;
    }

    filtered.forEach(product => {
        const originalPrice = product.price;
        // Se usa un descuento fijo para renderizar (ej: 30%) para consistencia visual
        const discountPercentage = 30; 
        const finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100));

        const card = document.createElement('div');
        card.onclick = () => renderProductDetail(product.id); 
        card.className = "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition duration-300 flex flex-col product-card cursor-pointer";

        card.innerHTML = `
            <div class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                <img src="${product.img}" alt="${product.name}" class="w-full h-full object-cover">
                <span class="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full bg-red-600 text-white">${discountPercentage}% OFF</span>
            </div>
            
            <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <h3 class="text-lg font-semibold truncate">${product.name}</h3>
                
                ${getRatingHTML(product.rating, product.reviews)}
                
                <div class="flex items-baseline space-x-2">
                    <span class="text-sm line-through text-gray-500 dark:text-gray-400">$${originalPrice.toLocaleString('es-AR')}</span>
                </div>
                
                <p class="text-2xl font-bold mb-3">$${finalPrice.toLocaleString('es-AR')}</p>
                
                <p class="text-sm font-semibold ${product.stock === 0 ? 'text-red-600' : (product.stock <= 3 ? 'text-orange-500 animate-pulse' : 'text-green-500')}">
                    ${product.stock === 0 ? '¡Agotado!' : (product.stock <= 3 ? `¡Últimas ${product.stock} unidades!` : 'En stock')}
                </p>
                
                <button 
                    onclick="event.stopPropagation(); addToCart(${product.id})" 
                    ${product.stock === 0 ? 'disabled' : ''}
                    class="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition duration-300 ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                    ${product.stock === 0 ? 'Ver Agotado' : 'Agregar al Carrito'}
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function renderProductDetail(id) {
    const product = products.find(p => p.id === id);
    if (!product || !productDetailModal) return;

    const discountPercentage = 30; 
    const originalPrice = product.price;
    const finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100));

    detailTitle.textContent = product.name;
    detailImage.src = product.img;
    detailPrice.innerHTML = `<span class="text-3xl font-bold">$${finalPrice.toLocaleString('es-AR')}</span>
                             <span class="text-base line-through text-gray-500 ml-2">$${originalPrice.toLocaleString('es-AR')}</span>
                             <span class="text-sm font-semibold text-red-600 ml-2">(-${discountPercentage}%)</span>`;
    detailDescription.textContent = product.description;
    detailRating.innerHTML = getRatingHTML(product.rating, product.reviews);
    
    detailStock.textContent = product.stock === 0 ? '¡Agotado!' : `En stock: ${product.stock}`;
    detailStock.className = `text-lg font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-green-500'}`;

    detailAddToCartBtn.onclick = () => {
        addToCart(product.id);
        toggleModal('productDetailModal'); 
    };
    detailAddToCartBtn.disabled = product.stock === 0;
    detailAddToCartBtn.classList.toggle('opacity-50', product.stock === 0);
    detailAddToCartBtn.textContent = product.stock === 0 ? 'Agotado' : 'Agregar al Carrito';

    toggleModal('productDetailModal');
}

window.addToCart = function (id) {
    const product = products.find(p => p.id === id);
    if (!product || product.stock <= 0) { showToast("⚠️ Producto agotado", 'error'); return; }

    if (decreaseStock(id)) {
        const cartItem = cart.find(c => c.id === id);
        if (cartItem) cartItem.qty += 1;
        else cart.push({ ...product, qty: 1 });

        updateCartUI();
        renderProducts(currentProductFilter, searchInput.value, currentSort); 
        showToast("✅ Producto agregado", 'success');
    }
}

window.removeFromCart = function(id) {
    const index = cart.findIndex(item => item.id === id);
    
    if (index !== -1) {
        const item = cart[index];
        increaseStock(id, item.qty); 
        cart.splice(index, 1); 
        
        updateCartUI();
        renderProducts(currentProductFilter, searchInput.value, currentSort); 
        showToast(`➖ Item ${item.name} eliminado del carrito.`, 'error');
    }
}

window.checkout = function() {
    if (cart.length === 0) {
        showToast("El carrito está vacío.", 'error');
        return;
    }
    
    // NUEVO: Registro de la venta
    const newSale = {
        id: salesHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        items: JSON.parse(JSON.stringify(cart)), 
        total: cart.reduce((a, b) => {
            const productInStock = products.find(p => p.id === b.id);
            const itemDiscount = 30; 
            const itemPrice = productInStock ? Math.round(productInStock.price * (1 - itemDiscount / 100)) : b.price;
            return a + (itemPrice * b.qty);
        }, 0),
        user: currentUser ? currentUser.name : 'Invitado'
    };
    
    salesHistory.push(newSale);

    // Simulación de limpieza y cierre
    cart = [];
    updateCartUI();
    toggleModal('cartModal');
    renderProducts(currentProductFilter, searchInput.value, currentSort); 
    showToast("🎉 ¡Compra exitosa! Procesando tu pedido.", 'success');
}

function updateCartUI() {
    if (!cartCount || !cartItems || !cartTotal || !checkoutBtn) return;

    cartCount.textContent = cart.reduce((a, b) => a + b.qty, 0);
    cartItems.innerHTML = "";
    
    if (cart.length === 0) {
        cartItems.innerHTML = `<p id="emptyCartMessage" class="text-gray-500 italic">El carrito está vacío.</p>`;
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        
        let total = 0;
        
        cart.forEach(item => {
            const productInStock = products.find(p => p.id === item.id);
            const itemDiscount = 30; // Descuento fijo para el carrito
            const itemPrice = productInStock ? Math.round(productInStock.price * (1 - itemDiscount / 100)) : item.price;
            const itemSubtotal = itemPrice * item.qty;
            total += itemSubtotal;

            const div = document.createElement('div');
            div.className = "flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 text-sm";
            div.innerHTML = `
                <div class="flex-1 truncate">${item.name} x${item.qty}</div>
                <div class="flex items-center space-x-3">
                    <span class="font-semibold">$${itemSubtotal.toLocaleString('es-AR')}</span>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700 transition">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(div);
        });
        
        cartTotal.textContent = "$" + total.toLocaleString('es-AR');
    }
}

// ====================================================================
// 5. LÓGICA DE AUTENTICACIÓN Y ADMIN
// ====================================================================

function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const nameInputEl = document.getElementById('name');
    const name = nameInputEl ? nameInputEl.value : '';
    
    // [Lógica de Registro]
    if (nameInputEl && !nameInputEl.classList.contains('hidden')) { 
        if (!name || !email || !password) {
            showToast("⚠️ Completa todos los campos para registrarte.", 'error');
            return;
        }
        currentUser = { email: email, name: name, role: 'user' };
        showToast(`🎉 ¡Bienvenido, ${name}! Registro exitoso.`, 'success');
        
    } else { 
        // [Lógica de Login]
        if (email === "designer@ar.com" && password === "123") {
            currentUser = { email: email, name: "Admin", role: 'admin' };
            showToast("🛡️ Acceso de Administrador exitoso.", 'success');
        } else if (email === "user@ar.com" && password === "123") {
            currentUser = { email: email, name: "Usuario", role: 'user' };
            showToast("👤 Acceso de Usuario exitoso.", 'success');
        } else {
            showToast("❌ Credenciales incorrectas. Usa user@ar.com o designer@ar.com (pass: 123).", 'error');
            return;
        }
    }

    toggleModal('loginModal');
    updateAuthUI();
}

function updateAuthUI() { 
    if (!userStatus || !inventoryButton || !authBtn || !salesButton) return; // Añadido salesButton

    if (currentUser) {
        userStatus.textContent = currentUser.name || 'Mi Cuenta';
        authBtn.onclick = logout; 
        
        if (currentUser.role === 'admin') { 
             inventoryButton.classList.remove('hidden');
             salesButton.classList.remove('hidden'); // Muestra el botón de ventas
        } else {
             inventoryButton.classList.add('hidden');
             salesButton.classList.add('hidden');
        }
    } else {
        userStatus.textContent = 'Ingresar';
        authBtn.onclick = () => toggleModal('loginModal'); 
        inventoryButton.classList.add('hidden');
        salesButton.classList.add('hidden');
    }
}

function logout() { 
    currentUser = null;
    updateAuthUI();
    showToast("Sesión cerrada.", 'info');
} 

// ====================================================================
// 5.5. MANEJO DE INVENTARIO (Administrador)
// ====================================================================

function showInventoryModal() {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('Acceso denegado. Solo administradores pueden ver el inventario.', 'error');
        return;
    }
    
    if (!inventoryList || !inventoryModal) return;

    inventoryList.innerHTML = ''; 

    products.forEach(product => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition space-y-2';
        
        const stockClass = product.stock < 5 ? 'text-red-500 font-bold' : 'text-green-500 font-bold';

        itemDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="dark:text-white font-semibold truncate">ID: ${product.id}</span>
                <span class="${stockClass}">Stock: ${product.stock}</span>
            </div>
            
            <div class="space-y-1">
                <label class="text-xs text-gray-500 dark:text-gray-400">Nombre:</label>
                <input type="text" id="name-${product.id}" value="${product.name}" 
                       class="w-full p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
                <div class="flex gap-2 items-center">
                    <span class="font-bold text-gray-700 dark:text-gray-300">$</span>
                    <input type="number" id="price-${product.id}" value="${product.price}" 
                           class="flex-1 p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" min="1"/>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-2">
                <button class="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 transition" 
                        onclick="saveProductChanges(${product.id})">
                    <i class="fas fa-save mr-1"></i> Guardar
                </button>
                <button class="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition" 
                        onclick="restockProduct(${product.id})">
                    <i class="fas fa-plus mr-1"></i> Reponer (+5)
                </button>
            </div>
        `;
        inventoryList.appendChild(itemDiv);
    });

    toggleModal('inventoryModal');
}

window.restockProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.stock += 5; 
        showToast(`Stock de ${product.name} actualizado a ${product.stock}.`, 'info');
        showInventoryModal(); 
        renderProducts(currentProductFilter, searchInput.value, currentSort); 
    }
}

window.saveProductChanges = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newName = document.getElementById(`name-${id}`).value;
    const newPrice = parseFloat(document.getElementById(`price-${id}`).value);

    if (newName && newPrice > 0) {
        product.name = newName;
        product.price = newPrice;
        showToast(`✅ Producto ${id} actualizado.`, 'success');
        
        showInventoryModal(); 
        renderProducts(currentProductFilter, searchInput.value, currentSort); 
    } else {
        showToast('⚠️ Nombre y Precio deben ser válidos.', 'error');
    }
}

// ====================================================================
// 5.6. CONTROL DE VENTAS (Administrador)
// ====================================================================

function showSalesControlModal(startDate = null, endDate = null) {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('Acceso denegado. Solo administradores pueden ver ventas.', 'error');
        return;
    }

    if (!salesList || !salesModal) return;

    salesList.innerHTML = '';
    let currentTotalRevenue = 0;
    
    // Filtrado de ventas
    let filteredSales = salesHistory;
    if (startDate || endDate) {
        // Aseguramos que la fecha final incluya todo el día
        const start = startDate ? new Date(startDate + 'T00:00:00') : new Date(0);
        const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
        
        filteredSales = salesHistory.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start && saleDate <= end;
        });
    }


    if (filteredSales.length === 0) {
        salesList.innerHTML = `<p class="p-4 text-center text-gray-500">No hay ventas registradas en este período.</p>`;
    } else {
        filteredSales.forEach(sale => {
            currentTotalRevenue += sale.total;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex justify-between items-center p-3 border-b dark:border-gray-700 text-sm';
            itemDiv.innerHTML = `
                <div class="space-y-0.5">
                    <span class="font-bold dark:text-white">Venta #${sale.id}</span>
                    <span class="text-xs text-gray-500 block">Cliente: ${sale.user}</span>
                </div>
                <div class="text-right">
                    <span class="font-semibold text-lg text-green-600 dark:text-green-400">$${sale.total.toLocaleString('es-AR')}</span>
                    <span class="text-xs text-gray-500 block">${sale.date}</span>
                </div>
            `;
            salesList.appendChild(itemDiv);
        });
    }

    // Actualizar resumen de ingresos
    totalRevenue.textContent = `$${currentTotalRevenue.toLocaleString('es-AR')}`;
    
    toggleModal('salesModal');
}


// ====================================================================
// 6. LISTENERS Y EVENT HANDLERS
// ====================================================================

function setupListeners() {
    
    if (enterBtn && splash && mainContent) {
        enterBtn.addEventListener('click', () => {
            splash.classList.add('hidden');
            mainContent.classList.remove('hidden');
            showToast("¡Bienvenido a Ar Market Store!");
        });
    }
    
    if(authForm) authForm.addEventListener('submit', handleAuthSubmit); 

    if(toggleRegister && nameInput && authTitle && authSubmitBtn) toggleRegister.addEventListener('click', (e) => {
        e.preventDefault();
        
        const isLoginMode = nameInput.classList.contains('hidden'); 
        
        if (isLoginMode) {
            nameInput.classList.remove('hidden');
            authTitle.textContent = 'Registro';
            authSubmitBtn.textContent = 'Registrarse';
            toggleRegister.textContent = '¿Ya tienes cuenta? Inicia sesión';
        } else {
            nameInput.classList.add('hidden');
            authTitle.textContent = 'Acceso';
            authSubmitBtn.textContent = 'Iniciar sesión';
            toggleRegister.textContent = '¿No tienes cuenta? Regístrate aquí';
        }
    });
    
    // Modales y Checkout
    if(cartBtn) cartBtn.addEventListener('click', () => toggleModal('cartModal'));
    if(closeLoginBtn) closeLoginBtn.addEventListener('click', () => toggleModal('loginModal')); 
    if(closeCartBtn) closeCartBtn.addEventListener('click', () => toggleModal('cartModal'));
    if(closeInventoryBtn) closeInventoryBtn.addEventListener('click', () => toggleModal('inventoryModal'));
    if(closeDetailBtn) closeDetailBtn.addEventListener('click', () => toggleModal('productDetailModal')); 
    if(closeSalesBtn) closeSalesBtn.addEventListener('click', () => toggleModal('salesModal')); // NUEVO
    
    if (checkoutBtn) checkoutBtn.addEventListener('click', window.checkout);
    
    // ** Listener de Admin **
    if(inventoryButton) inventoryButton.addEventListener('click', showInventoryModal);
    if(salesButton) salesButton.addEventListener('click', () => showSalesControlModal()); // NUEVO
    
    // ** Filtro de Ventas (Admin) **
    if(salesFilterForm) salesFilterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        showSalesControlModal(startDate, endDate);
    });

    // Filtros y Búsqueda
    if (sortSelect) sortSelect.addEventListener('change', (e) => {
        renderProducts(currentProductFilter, searchInput.value, e.target.value);
    });

    if(categoryFilterSelect) categoryFilterSelect.addEventListener('change', (e) => {
        renderProducts(e.target.value, searchInput.value, currentSort); 
    });

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            renderProducts(e.target.getAttribute('data-category'), searchInput.value, currentSort); 
        });
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(currentProductFilter, e.target.value, currentSort); 
        });
    }
}

// ====================================================================
// 7. INICIALIZACIÓN FINAL (Asegura la carga)
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Asignación de referencias DOM (CRÍTICO)
    splash = document.getElementById('splash-screen');
    enterBtn = document.getElementById('enterBtn');
    mainContent = document.getElementById('main-content');
    productsGrid = document.getElementById('productsGrid');
    cartBtn = document.getElementById('cartBtn');
    loginModal = document.getElementById('loginModal');
    authBtn = document.getElementById('authBtn');
    userStatus = document.getElementById('userStatus');
    toast = document.getElementById('toast-message');
    inventoryButton = document.getElementById('inventoryButton');
    inventoryModal = document.getElementById('inventoryModal');
    inventoryList = document.getElementById('inventoryList');
    cartCount = document.getElementById('cartCount');
    cartItems = document.getElementById('cartItems');
    cartTotal = document.getElementById('cartTotal');
    closeCartBtn = document.getElementById('closeCartBtn');
    closeLoginBtn = document.getElementById('closeLoginBtn');
    closeInventoryBtn = document.getElementById('closeInventoryBtn');
    checkoutBtn = document.getElementById('checkoutBtn');
    authForm = document.getElementById('authForm');
    authSubmitBtn = document.getElementById('authSubmitBtn');
    toggleRegister = document.getElementById('toggleRegister');
    authTitle = document.getElementById('authTitle');
    nameInput = document.getElementById('name');
    categoryFilterSelect = document.getElementById('categoryFilter');
    categoryLinks = document.querySelectorAll('.nav-category-link');
    searchInput = document.getElementById('searchInput');
    productDetailModal = document.getElementById('productDetailModal');
    detailTitle = document.getElementById('detailTitle');
    detailImage = document.getElementById('detailImage');
    detailPrice = document.getElementById('detailPrice');
    detailDescription = document.getElementById('detailDescription');
    detailStock = document.getElementById('detailStock');
    detailRating = document.getElementById('detailRating');
    detailAddToCartBtn = document.getElementById('detailAddToCartBtn');
    closeDetailBtn = document.getElementById('closeDetailBtn');
    sortSelect = document.getElementById('sortSelect'); 
    
    // NUEVAS REFERENCIAS DE VENTAS
    salesButton = document.getElementById('salesButton');
    salesModal = document.getElementById('salesModal');
    salesList = document.getElementById('salesList');
    closeSalesBtn = document.getElementById('closeSalesBtn');
    salesFilterForm = document.getElementById('salesFilterForm');
    totalRevenue = document.getElementById('totalRevenue');
    
    // 2. Configuración de Listeners y UI
    setupListeners();
    renderProducts();
    updateCartUI();
    updateAuthUI(); 
});