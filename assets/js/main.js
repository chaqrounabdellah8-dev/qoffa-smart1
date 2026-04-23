// ==================== BASEROW CONFIGURATION ====================
const BASEROW_TOKEN = 'OIEan8aAjLjoCoTXKO6Evd4cifbtqRf8';
const BASEROW_TABLE_ID = '882093';
const BASEROW_URL = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true&size=200`;

// ==================== GLOBAL VARIABLES ====================
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('qoffaCart')) || [];

// ==================== HELPER FUNCTIONS ====================
function showLoader(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
        if (show) loader.classList.add('active');
        else loader.classList.remove('active');
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-content">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 3000);
}

function formatPrice(price) {
    if (typeof price !== 'number') {
        price = parseFloat(price) || 0;
    }
    return price.toFixed(2) + ' درهم';
}

// ==================== CART FUNCTIONS ====================
function calculateTotalPrice() {
    let total = 0;
    for (let item of cart) {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        const itemTotal = price * qty;
        total = total + itemTotal;
        console.log(`  - ${item.name_fr}: ${price} × ${qty} = ${itemTotal}`);
    }
    const finalTotal = Math.round(total * 100) / 100;
    console.log(`📊 المجموع النهائي: ${finalTotal}`);
    return finalTotal;
}

function updatePriceIndicator() {
    const totalPrice = calculateTotalPrice();
    console.log('💰 حساب السعر:', totalPrice, 'درهم');
    console.log('🛒 محتويات السلة:', cart);
    
    // تحديث من الـ sidebar الأعلى
    const priceText = document.getElementById('sidebarPriceText');
    if (priceText) {
        priceText.textContent = `💰 المجموع: ${totalPrice.toFixed(2)} درهم`;
        console.log('✅ تم تحديث sidebarPriceText');
    } else {
        console.warn('⚠️ sidebarPriceText غير موجود');
    }
    
    // تحديث الرقم في شريط التقدم
    const priceCurrentText = document.getElementById('priceCurrentText');
    if (priceCurrentText) {
        priceCurrentText.textContent = totalPrice.toFixed(2);
        console.log('✅ تم تحديث priceCurrentText');
    } else {
        console.warn('⚠️ priceCurrentText غير موجود');
    }
    
    // تحديث إجمالي السعر أسفل السلة
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    if (cartTotalPrice) {
        cartTotalPrice.textContent = formatPrice(totalPrice);
        console.log('✅ تم تحديث cartTotalPrice:', formatPrice(totalPrice));
    } else {
        console.warn('⚠️ cartTotalPrice غير موجود');
    }
    
    // تحديث شريط التقدم
    const priceProgressFill = document.getElementById('priceProgressFill');
    if (priceProgressFill) {
        const progressPercent = Math.min((totalPrice / 150) * 100, 100);
        priceProgressFill.style.width = progressPercent + '%';
        priceProgressFill.style.background = totalPrice >= 150 ? '#2E8B57' : '#ffc107';
        console.log('✅ تم تحديث progress bar:', progressPercent.toFixed(1) + '%');
    } else {
        console.warn('⚠️ priceProgressFill غير موجود');
    }
    
    // تحديث رسالة التحذير والزر
    const priceMsg = document.getElementById('sidebarPriceMsg');
    const checkoutBtn = document.getElementById('cartCheckout');
    const isPriceOk = totalPrice >= 150;
    
    if (priceMsg) {
        if (isPriceOk) {
            priceMsg.style.display = 'none';
            console.log('✅ إخفاء رسالة التحذير');
        } else {
            priceMsg.style.display = 'block';
            console.log('✅ عرض رسالة التحذير');
        }
    }
    
    if (checkoutBtn) {
        checkoutBtn.disabled = !isPriceOk;
        checkoutBtn.style.opacity = isPriceOk ? '1' : '0.5';
        checkoutBtn.style.cursor = isPriceOk ? 'pointer' : 'not-allowed';
        console.log('✅ تحديث الزر - ' + (isPriceOk ? 'مفعل' : 'معطل'));
    }
}

function updateCartSidebar() {
    const sidebar = document.getElementById('cartItems');
    if (!sidebar) return;

    if (cart.length === 0) {
        sidebar.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart fa-3x"></i>
                <p>السلة فارغة</p>
                <a href="products.html" class="btn btn-primary">تصفح المنتجات</a>
            </div>
        `;
        updatePriceIndicator();
        console.log('🛒 السلة فارغة');
        return;
    }

    let html = '';
    
    cart.forEach(item => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;

        let quantityDisplay;
        if (item.unit === 'كيلو' || item.unit === 'kg' || item.unit === 'كجم') {
            quantityDisplay = Math.round(qty) + ' كجم';
        } else {
            quantityDisplay = Math.round(qty) + ' ' + (item.unit || 'وحدة');
        }

        html += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name_fr || item.name}" class="cart-item-img" onerror="this.src='assets/images/default-product.png'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name_fr || item.name}</div>
                    <div class="cart-item-price">${formatPrice(price)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn-sm" onclick="decreaseQuantity(${item.id})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${quantityDisplay}</span>
                        <button class="qty-btn-sm" onclick="increaseQuantity(${item.id})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="حذف المنتج">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });

    sidebar.innerHTML = html;
    updatePriceIndicator();
    console.log('🛒 تم تحديث السلة، المنتجات:', cart.length);
}

function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = cart.length;
        badge.style.display = cart.length > 0 ? 'flex' : 'none';
    }
    console.log('🔔 عداد السلة:', cart.length);
}

function addToCart(product) {
    if (!product || !product.id) return;
    
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        // زيادة الكمية
        if (existing.unit === 'كيلو' || existing.unit === 'kg' || existing.unit === 'كجم') {
            existing.quantity = (parseFloat(existing.quantity) || 0) + 0.5;
            existing.quantity = Math.round(existing.quantity * 2) / 2;
        } else {
            existing.quantity = (parseFloat(existing.quantity) || 0) + 1;
        }
        showToast(`✅ تم زيادة كمية ${product.name_fr || product.name}`, 'success');
    } else {
        // منتج جديد
        let initialQuantity = 1;
        // بدء جميع المنتجات ب 1 (سواء كانت كيلو أو وحدة)
        
        cart.push({ 
            ...product, 
            quantity: initialQuantity 
        });
        showToast(`✅ تم إضافة ${product.name_fr || product.name} إلى السلة`, 'success');
    }

    localStorage.setItem('qoffaCart', JSON.stringify(cart));
    updateCartCount();
    updateCartSidebar();
    updatePriceIndicator();
    console.log('➕ تم إضافة المنتج:', product.name_fr || product.name);
}

function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('qoffaCart', JSON.stringify(cart));
    updateCartCount();
    updateCartSidebar();
    updatePriceIndicator();
    showToast(`🗑️ تم إزالة ${item.name_fr || item.name} من السلة`, 'warning');
    console.log('➖ تم حذف المنتج:', item.name_fr || item.name);
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    let newQuantity;
    
    if (item.unit === 'كيلو' || item.unit === 'kg' || item.unit === 'كجم') {
        newQuantity = (parseFloat(item.quantity) || 0) + change;
        newQuantity = Math.round(newQuantity);
        newQuantity = Math.max(1, newQuantity);
    } else {
        newQuantity = (parseFloat(item.quantity) || 0) + change;
        newQuantity = Math.round(newQuantity);
        newQuantity = Math.max(1, newQuantity);
    }

    item.quantity = newQuantity;
    localStorage.setItem('qoffaCart', JSON.stringify(cart));
    updateCartSidebar();
    updatePriceIndicator();
    console.log('🔄 تحديث الكمية:', item.name_fr || item.name, '=', newQuantity);
}

function increaseQuantity(productId) {
    updateQuantity(productId, 1);
}

function decreaseQuantity(productId) {
    updateQuantity(productId, -1);
}

function clearCart() {
    if (cart.length === 0) {
        showToast('السلة فارغة بالفعل', 'info');
        return;
    }

    if (confirm('هل تريد حقاً حذف جميع المنتجات من السلة؟')) {
        cart = [];
        localStorage.setItem('qoffaCart', JSON.stringify(cart));
        updateCartCount();
        updateCartSidebar();
        showToast('✓ تم حذف جميع المنتجات', 'success');
        console.log('🗑️ تم تفريغ السلة');
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        console.log('🎯 تبديل حالة السلة');
    }
}

// ==================== BASEROW FUNCTIONS ====================
async function fetchProductsFromBaserow() {
    showLoader(true);
    try {
        console.log('🌐 جاري جلب المنتجات من Baserow...');
        const response = await fetch(BASEROW_URL, {
            headers: { 'Authorization': `Token ${BASEROW_TOKEN}` }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log(`✅ تم جلب ${data.results.length} منتج`);
        
        allProducts = data.results.map(product => ({
            id: product.id,
            name: product.name || '',
            name_fr: product.name_fr || product.name || '',
            price: parseFloat(product.price) || 0,
            image: product.product_image?.[0]?.url || 'https://via.placeholder.com/300/2E8B57/ffffff?text=Qoffa',
            category: product.category || '',
            unit: product.unit || 'وحدة'
        }));
        
        renderFeaturedProducts();
        updateCartCount();
        updatePriceIndicator();
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        showToast('حدث خطأ في تحميل المنتجات', 'error');
    } finally {
        showLoader(false);
    }
}

function renderFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    const featured = allProducts.slice(0, 6);
    
    let html = '';
    featured.forEach((product, index) => {
        // حفظ المنتج في window global
        window[`product_${index}`] = product;
        
        html += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name_fr}">
                </div>
                <div class="product-info">
                    <h3>${product.name_fr}</h3>
                    <p class="product-price">${formatPrice(product.price)}</p>
                    <button class="btn btn-primary" onclick="addToCart(window.product_${index})">
                        أضف إلى السلة
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 تم تحميل الصفحة');
    
    fetchProductsFromBaserow();
    updateCartCount();
    updateCartSidebar();  // تحميل السلة المحفوظة
    updatePriceIndicator();

    // زر فتح/إغلاق السلة
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
    }

    // زر حذف الكل
    const clearBtn = document.getElementById('cartClearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }

    // زر الإغلاق
    const closeBtn = document.getElementById('cartClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', toggleCart);
    }

    // زر إتمام الطلب
    const checkoutBtn = document.getElementById('cartCheckout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const totalPrice = calculateTotalPrice();
            if (totalPrice >= 150) {
                console.log('✅ بدء عملية الدفع بمبلغ:', totalPrice);
                window.location.href = 'order.html';
            } else {
                showToast('المبلغ أقل من 150 درهم', 'error');
            }
        });
    }

    // Header scroll effect
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', function() {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    // زر العودة للأعلى
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    console.log('✓ تم تهيئة جميع الأحداث');
});

// ==================== EXPOSE GLOBALLY ====================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.clearCart = clearCart;
window.toggleCart = toggleCart;
window.formatPrice = formatPrice;
window.updateQuantity = updateQuantity;
