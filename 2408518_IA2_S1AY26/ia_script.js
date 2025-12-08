// Cart array to store rental items
let cart = JSON.parse(localStorage.getItem('rentalCart')) || [];
let selectedDates = {
    checkin: '',
    checkout: ''
};

const ALL_INVOICES_KEY = 'AllInvoices';
const LAST_INVOICE_NUMBER_KEY = 'LastInvoiceNumber';

// Product storage key
const ALL_PRODUCTS_KEY = 'AllProducts';

// Default properties list (aligned with your original theme)
const DEFAULT_PRODUCTS = [
    {
        //Property 1
        id: 1,
        name: 'Ocean Breeze Villa',
        location: 'Montego Bay, Jamaica',
        price: 1200,
        description: 'Spacious seaside villa with private balcony and ocean views.'
    },
    {
        //Property 2
        id: 2,
        name: 'Sunset Paradise Villa',
        location: 'Ocho Rios, Jamaica',
        price: 1500,
        description: 'Modern cliffside property perfect for sunset watching.'
    },
    {
        //Property 3
        id: 3,
        name: 'Coral Reef House',
        location: 'Negril, Jamaica',
        price: 1000,
        description: 'Cozy retreat close to world-famous beaches and nightlife.'
    },
    {
        //Property 4
        id: 4,
        name: 'Tropical Haven',
        location: 'Kingston, Jamaica',
        price: 900,
        description: 'City escape with lush garden and easy access to amenities.'
    },
    {
        //Property 5
        id: 5,
        name: 'Island Escape Villa',
        location: 'Port Antonio, Jamaica',
        price: 1300,
        description: 'Hidden gem surrounded by nature and quiet beaches.'
    },
    {
        //Property 6
        id: 6,
        name: 'Lagoon View House',
        location: 'Falmouth, Jamaica',
        price: 1100,
        description: 'Charming home overlooking the lagoon, ideal for families.'
    }
];
// Retrieve products from localStorage or seed defaults
function getOrSeedAllProducts() {
    let products = JSON.parse(localStorage.getItem(ALL_PRODUCTS_KEY));
// If no products found, seed with defaults
    if (!Array.isArray(products) || products.length === 0) {
        products = DEFAULT_PRODUCTS;
        localStorage.setItem(ALL_PRODUCTS_KEY, JSON.stringify(products));
    }

    return products;
}


function readMoneyFromElement(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const text = el.textContent || '';
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
}

function generateInvoiceNumber() {
    const now = new Date();
    const rand = Math.floor(Math.random() * 900) + 100;
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `INV${yy}${mm}${dd}-${rand}`;
}


// Available discount codes
const discountCodes = {
    'WELCOME10': {
        type: 'percentage',
        value: 10,
        description: '10% off your first booking'
    },
    'CARIBBEAN20': {
        type: 'percentage',
        value: 20,
        description: '20% off stays longer than 2 months'
    },
    'SUMMER15': {
        type: 'percentage',
        value: 15,
        description: '15% off summer bookings'
    }
};

let appliedDiscounts = JSON.parse(localStorage.getItem('appliedDiscounts')) || [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Caribbean Home Rentals Application...');
    initializeApp();
});

function initializeApp() {
    // Load cart from localStorage
    loadCartFromStorage();
    
    // If we are on the properties page, render products first
    const propertiesContent = document.getElementById('properties-content');
    if (propertiesContent) {
        renderProducts();
    }
    
    // Set up all event listeners
    setupEventListeners();
    
    // Set minimum dates for date inputs
    setMinimumDates();
    
    // Update cart count in navigation
    updateCartCount();
    
    // Initialize specific pages
    if (isCartPage()) {
        initializeCartPage();
    }
    
    if (isCheckoutPage()) {
        initializeCheckoutPage();
    }
    
    if (isLoginPage()) {
        initializeLoginPage();
    }
    
    if (isSignupPage()) {
        initializeSignupPage();
    }
    
    console.log('Application initialized successfully');
    console.log('Current cart:', cart);
}

function isCartPage() {
    return window.location.pathname.includes('cart.html') || 
           window.location.pathname.includes('iacart.html');
}

function isCheckoutPage() {
    return window.location.pathname.includes('checkout.html') || 
           window.location.pathname.includes('iacheckout.html');
}

function isLoginPage() {
    return window.location.pathname.includes('login.html') || 
           window.location.pathname.includes('loginpage.html');
}

function isSignupPage() {
    return window.location.pathname.includes('index.html');
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('rentalCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log('Cart loaded from localStorage:', cart);
    }
}

function saveCartToStorage() {
    localStorage.setItem('rentalCart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cart.length;
    });
    console.log('Cart count updated:', cart.length);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Date form submission
    const datesForm = document.getElementById('dates-form');
    if (datesForm) {
        datesForm.addEventListener('submit', handleDatesSubmit);
        console.log('Dates form event listener added');
    }
    
    // Add to cart buttons on properties page
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
    console.log('Add to cart buttons event listeners added:', addToCartButtons.length);
    
    // Navigation menu toggle for mobile
    const menuCheckbox = document.getElementById('menu');
    if (menuCheckbox) {
        menuCheckbox.addEventListener('change', handleMenuToggle);
    }
    
    // Real-time date validation
    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');
    if (checkinInput) checkinInput.addEventListener('change', validateDates);
    if (checkoutInput) checkoutInput.addEventListener('change', validateDates);
}

function setMinimumDates() {
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkin-date');
    const checkoutInput = document.getElementById('checkout-date');
    
    if (checkinInput) checkinInput.min = today;
    if (checkoutInput) checkoutInput.min = today;
    
    console.log('Minimum dates set to:', today);
}

function validateDates() {
    const checkinDate = document.getElementById('checkin-date').value;
    const checkoutDate = document.getElementById('checkout-date').value;
    
    if (checkinDate && checkoutDate && new Date(checkinDate) >= new Date(checkoutDate)) {
        showAlert('Check-out date must be after check-in date.', 'error');
        return false;
    }
    
    return true;
}

function handleDatesSubmit(event) {
    event.preventDefault();
    console.log('Date form submitted');
    
    const checkinDate = document.getElementById('checkin-date').value;
    const checkoutDate = document.getElementById('checkout-date').value;
    
    // Form validation
    if (!checkinDate || !checkoutDate) {
        showAlert('Please select both check-in and check-out dates.', 'error');
        return;
    }
    
    if (!validateDates()) {
        return;
    }
    
    selectedDates = {
        checkin: checkinDate,
        checkout: checkoutDate
    };
    
    updatePropertyDatesDisplay();
    showAlert('Dates applied successfully! You can now add properties to your cart.', 'success');
}

function updatePropertyDatesDisplay() {
    for (let i = 1; i <= 6; i++) {
        const dateElement = document.getElementById(`dates-${i}`);
        if (dateElement) {
            dateElement.textContent = `${selectedDates.checkin} to ${selectedDates.checkout}`;
        }
    }
}

function handleAddToCart(event) {
    console.log(' Add to cart button clicked');
    
    // Check if dates are selected
    if (!selectedDates.checkin || !selectedDates.checkout) {
        showAlert('Please select dates first before adding to cart.', 'error');
        return;
    }
    
    const button = event.target;
    const propertyId = button.getAttribute('data-id') || generatePropertyId(button);
    const propertyName = button.getAttribute('data-name');
    const propertyPrice = parseFloat(button.getAttribute('data-price'));
    const propertyLocation = button.getAttribute('data-location') || 'Caribbean';
    
    // Calculate duration and total price
    const duration = calculateDuration(selectedDates.checkin, selectedDates.checkout);
    const totalPrice = propertyPrice * duration.months;
    
    // Create cart item object
    const cartItem = {
        id: propertyId,
        name: propertyName,
        price: propertyPrice,
        totalPrice: totalPrice,
        location: propertyLocation,
        checkin: selectedDates.checkin,
        checkout: selectedDates.checkout,
        duration: duration,
        quantity: 1,
        image: `assets/villa${propertyId}.jpg`
    };
    
    // Add item to cart
    addItemToCart(cartItem);
    
    // Show success message
    showAlert(`${propertyName} added to cart for ${duration.months} month(s)! Total: $${totalPrice}`, 'success');
}

function generatePropertyId(button) {
    // Generate an ID based on the property name if data-id is missing
    const propertyName = button.getAttribute('data-name');
    return propertyName ? propertyName.replace(/\s+/g, '-').toLowerCase() : 'prop-' + Date.now();
}

function calculateDuration(checkin, checkout) {
    const start = new Date(checkin);
    const end = new Date(checkout);
    
    // Calculate difference in milliseconds
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.ceil(diffDays / 30);
    
    return {
        days: diffDays,
        months: diffMonths
    };
}
// Render products on properties page
function renderProducts() {
    const container = document.getElementById('properties-content');
    // Safety check
    if (!container) {
        console.warn('renderProducts: #properties-content not found');
        return;
    }
    // Get products
    const products = getOrSeedAllProducts();
    // Build HTML
    const html = products.map(prod => {
        const imgSrc = `assets/villa${prod.id}.jpg`;
        // Return product HTML
        return `
            <div class="property-box" data-id="${prod.id}">
                <img src="${imgSrc}" alt="${prod.name}">
                <h3>${prod.name}</h3>
                <p class="property-location">${prod.location}</p>
                <p class="property-price">$${prod.price}/month</p>
                <p class="property-description">${prod.description}</p>
                <button 
                    class="btn add-to-cart"
                    data-id="${prod.id}"
                    data-name="${prod.name}"
                    data-price="${prod.price}"
                    data-location="${prod.location}">
                    Add to Cart
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}


function addItemToCart(item) {
    // Check if item already exists in cart with same dates
    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.name === item.name && 
        cartItem.checkin === item.checkin && 
        cartItem.checkout === item.checkout
    );
    
    if (existingItemIndex > -1) {
        // Update existing item
        cart[existingItemIndex] = item;
        console.log('Cart item updated:', item);
    } else {
        // Add new item
        cart.push(item);
        console.log('New item added to cart:', item);
    }
    
    // Update UI and save to storage
    updateCartCount();
    saveCartToStorage();
    
    // If we're on cart page, refresh the display
    if (isCartPage()) {
        displayCartItems();
        updateCartSummary();
    }
}


function initializeCartPage() {
    console.log('🛒 Initializing cart page...');
    displayCartItems();
    updateCartSummary();
    setupCartEventListeners();
}

function setupCartEventListeners() {
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    const closeModal = document.querySelector('.close-modal');
    const cancelDiscount = document.getElementById('cancel-discount');
    const applyModalDiscount = document.getElementById('apply-modal-discount');

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }

    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', openDiscountModal);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeDiscountModal);
    }

    if (cancelDiscount) {
        cancelDiscount.addEventListener('click', closeDiscountModal);
    }

    if (applyModalDiscount) {
        applyModalDiscount.addEventListener('click', applyDiscountCode);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const discountModal = document.getElementById('discount-modal');
        if (event.target === discountModal) {
            closeDiscountModal();
        }
    });
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const itemCountElement = document.getElementById('item-count');
    
    if (!cartItemsContainer) {
        console.log('Cart items container not found');
        return;
    }
    
    // Update cart count
    updateCartCount();
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `  
            <div class="empty-cart-message">
                <i class='bx bx-cart'></i>
                <h3>Your cart is empty</h3>
                <p>Browse our properties and add some amazing Caribbean rentals to your cart!</p>
                <a href="iaindex.html#properties" class="btn">Explore Properties</a>
            </div>
        `;
        if (itemCountElement) itemCountElement.textContent = '0';
        return;
    }

    let cartHTML = '';
    
    cart.forEach((item, index) => {
        const durationText = item.duration ? 
            `${item.duration.months} month(s)` : 
            'Duration not set';
        
        //To fix NaN issue if totalPrice is undefined
        cartHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/placeholder.jpg'">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-location">${item.location}</p>
                    <p class="item-dates">
                        <i class='bx bx-calendar'></i>
                        ${item.checkin} to ${item.checkout}
                    </p>
                    <p class="item-duration">
                        <i class='bx bx-time'></i>
                        ${durationText}
                    </p>
                </div>
                <div class="item-pricing">
                    <div class="item-price">$${item.totalPrice ? item.totalPrice.toFixed(2) : '0.00'}</div>
                    <div class="item-quantity">
                        <span>Monthly: $${item.price}/month</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="remove-item-btn" onclick="removeCartItem('${item.id}')">
                        <i class='bx bx-trash'></i> Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    if (itemCountElement) {
        itemCountElement.textContent = cart.length;
    }
    
    console.log('Cart items displayed:', cart.length, 'items');
}


function removeCartItem(itemId) {
    console.log('🗑️ Removing item from cart:', itemId);
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('rentalCart', JSON.stringify(cart));
    displayCartItems();
    updateCartSummary();
    showAlert('Item removed from cart', 'success');
}

function clearCart() {
    if (cart.length === 0) {
        showAlert('Your cart is already empty', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear your entire cart?')) {
        cart = [];
        appliedDiscounts = [];
        localStorage.setItem('rentalCart', JSON.stringify(cart));
        localStorage.setItem('appliedDiscounts', JSON.stringify(appliedDiscounts));
        displayCartItems();
        updateCartSummary();
        showAlert('Cart cleared successfully', 'success');
    }
}

function updateCartSummary() {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount(subtotal);
    const taxRate = 0.15;
    const taxAmount = (subtotal - discountAmount) * taxRate;
    const total = subtotal - discountAmount + taxAmount;

    // Update summary elements
    const subtotalElement = document.getElementById('summary-subtotal');
    const discountElement = document.getElementById('summary-discount');
    const taxElement = document.getElementById('summary-tax');
    const totalElement = document.getElementById('summary-total');

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (discountElement) discountElement.textContent = `-$${discountAmount.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${taxAmount.toFixed(2)}`;
    if (totalElement) totalElement.innerHTML = `<strong>$${total.toFixed(2)}</strong>`;

    updateAppliedDiscountsDisplay();
}

function calculateSubtotal() {
    return cart.reduce((total, item) => {
        return total + (item.totalPrice || 0);
    }, 0);
}

function calculateDiscountAmount(subtotal) {
    let totalDiscount = 0;
    
    appliedDiscounts.forEach(discount => {
        if (discount.type === 'percentage') {
            totalDiscount += subtotal * (discount.value / 100);
        } else if (discount.type === 'fixed') {
            totalDiscount += discount.value;
        }
    });
    
    return Math.min(totalDiscount, subtotal);
}


function updateAppliedDiscountsDisplay() {
    const appliedDiscountsContainer = document.getElementById('applied-discounts');
    if (!appliedDiscountsContainer) return;
    
    if (appliedDiscounts.length === 0) {
        appliedDiscountsContainer.innerHTML = '<p class="no-discounts">No discounts applied</p>';
        return;
    }
    
    let discountsHTML = '';
    
    appliedDiscounts.forEach(discount => {
        discountsHTML += `
            <div class="applied-discount">
                <span class="discount-code">${discount.code}</span>
                <span class="discount-value">
                    ${discount.type === 'percentage' ? `${discount.value}% off` : `$${discount.value} off`}
                </span>
                <button class="remove-discount" onclick="removeDiscount('${discount.code}')">
                    <i class='bx bx-x'></i>
                </button>
            </div>
        `;
    });
    
    appliedDiscountsContainer.innerHTML = discountsHTML;
}

function openDiscountModal() {
    const discountModal = document.getElementById('discount-modal');
    const modalDiscountCode = document.getElementById('modal-discount-code');
    const discountMessage = document.getElementById('discount-message');
    
    if (discountModal) discountModal.style.display = 'block';
    if (modalDiscountCode) modalDiscountCode.value = '';
    if (discountMessage) discountMessage.textContent = '';
}

function closeDiscountModal() {
    const discountModal = document.getElementById('discount-modal');
    if (discountModal) discountModal.style.display = 'none';
}

function applyDiscountCode() {
    const modalDiscountCode = document.getElementById('modal-discount-code');
    const discountMessage = document.getElementById('discount-message');
    
    if (!modalDiscountCode || !discountMessage) return;
    
    const code = modalDiscountCode.value.trim().toUpperCase();
    
    if (!code) {
        discountMessage.textContent = 'Please enter a discount code';
        discountMessage.className = 'discount-message error';
        return;
    }
    
    if (!discountCodes[code]) {
        discountMessage.textContent = 'Invalid discount code';
        discountMessage.className = 'discount-message error';
        return;
    }
    
    if (appliedDiscounts.some(d => d.code === code)) {
        discountMessage.textContent = 'Discount code already applied';
        discountMessage.className = 'discount-message error';
        return;
    }
    
    const discount = discountCodes[code];
    
    appliedDiscounts.push({
        code: code,
        type: discount.type,
        value: discount.value,
        description: discount.description
    });
    
    localStorage.setItem('appliedDiscounts', JSON.stringify(appliedDiscounts));
    updateCartSummary();
    closeDiscountModal();
    showAlert(`Discount code "${code}" applied successfully!`, 'success');
}

function removeDiscount(code) {
    appliedDiscounts = appliedDiscounts.filter(d => d.code !== code);
    localStorage.setItem('appliedDiscounts', JSON.stringify(appliedDiscounts));
    updateCartSummary();
    showAlert(`Discount code "${code}" removed`, 'info');
}

function initializeCheckoutPage() {
    console.log('Initializing checkout page');
    displayCheckoutSummary();
    setupCheckoutEventListeners();
}

function setupCheckoutEventListeners() {
    const checkoutForm = document.getElementById('checkout-form');
    const cancelBtn = document.getElementById('cancel-order');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel your order?')) {
                window.location.href = 'iacart.html';
            }
        });
    }
}

function displayCheckoutSummary() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    if (!checkoutItemsContainer) return;
    
    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p>No items in cart.</p>';
        return;
    }
    
    let summaryHTML = '';
    const totals = calculateCartTotals();
    
    cart.forEach(item => {
        summaryHTML += `
            <div class="checkout-item">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.checkin} to ${item.checkout}</p>
                    <small>${item.location} • ${item.duration.months} month(s)</small>
                </div>
                <div class="item-total">$${item.totalPrice.toFixed(2)}</div>
            </div>
        `;
    });
    
    summaryHTML += `
        <div class="checkout-totals">
            <div class="total-line">
                <span>Subtotal:</span>
                <span>$${totals.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>Discount:</span>
                <span>-$${totals.discount.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>Tax (15%):</span>
                <span>$${totals.tax.toFixed(2)}</span>
            </div>
            <div class="total-line grand-total">
                <span>Total:</span>
                <span>$${totals.total.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    checkoutItemsContainer.innerHTML = summaryHTML;
}

function calculateCartTotals() {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscountAmount(subtotal);
    const taxRate = 0.15;
    const tax = (subtotal - discount) * taxRate;
    const total = subtotal - discount + tax;
    
    return {
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total
    };
}
//change
// Handle Checkout submit: validate, build order, create invoice, redirect
function handleCheckout(event) {
    event.preventDefault();

    const messageEl = document.getElementById('checkout-message');
    if (messageEl) {
        messageEl.textContent = '';
    }

    const validation = validateCheckoutForm();
    if (!validation.valid) {
        const msg = validation.errors.join('\n');
        alert(msg);
        if (messageEl) {
            messageEl.textContent = msg;
        }
        return;
    }

    const order = buildOrderFromCart(validation.data);
    if (!order) {
        alert('Your cart is empty. Please add items before checking out.');
        if (messageEl) {
            messageEl.textContent = 'Your cart is empty.';
        }
        return;
    }

    // Save order + invoice
    saveOrderToStorage(order);
    const invoice = createInvoiceFromOrder(order);
    saveInvoiceToStorage(invoice);

    // Clear cart
    localStorage.removeItem('rentalCart');

    if (messageEl) {
        messageEl.textContent = 'Checkout successful! Redirecting to invoice...';
    }

    // Go to invoice page
    window.location.href = 'invoice.html';
}



// Validate checkout form and return { valid, errors, data }
function validateCheckoutForm() {
    const fullName = document.getElementById('full-name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const trn = document.getElementById('trn')?.value.trim() || '';
    const address = document.getElementById('address')?.value.trim() || '';
    const cardNumber = document.getElementById('card-number')?.value.trim() || '';
    const expiryDate = document.getElementById('expiry-date')?.value.trim() || '';
    const cvv = document.getElementById('cvv')?.value.trim() || '';

    const errors = [];

    if (!fullName) errors.push('Full name is required.');
    if (!email) errors.push('Email is required.');
    if (!phone) errors.push('Phone number is required.');
    if (!trn) errors.push('TRN is required.');
    if (!address) errors.push('Shipping address is required.');
    if (!cardNumber) errors.push('Card number is required.');
    if (!expiryDate) errors.push('Expiry date is required.');
    if (!cvv) errors.push('CVV is required.');

    // Very light format checks (just enough for assignment)
    const trnPattern = /^\d{3}-\d{3}-\d{3}$/;
    if (trn && !trnPattern.test(trn)) {
        errors.push('TRN must be in the format 000-000-000.');
    }

    if (cardNumber && cardNumber.replace(/\s+/g, '').length < 12) {
        errors.push('Card number looks too short.');
    }

    if (cvv && cvv.length < 3) {
        errors.push('CVV must be at least 3 digits.');
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Do NOT include card details in returned data (we won't store them)
    return {
        valid: true,
        data: {
            fullName,
            email,
            phone,
            trn,
            address
        }
    };
}


function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function isValidExpiryDate(expiryDate) {
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    return parseInt(year) > currentYear || (parseInt(year) === currentYear && parseInt(month) >= currentMonth);
}

function processOrder(orderData) {
    console.log('Processing order:', orderData);
    
    // Calculate order totals
    const totals = calculateCartTotals();
    
    // Create order object
    const order = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        customer: orderData,
        items: [...cart],
        totals: totals,
        status: 'confirmed'
    };
    
    // Save order to localStorage (simulating database)
    saveOrderToStorage(order);
    
    // Clear cart
    cart = [];
    appliedDiscounts = [];
    localStorage.setItem('rentalCart', JSON.stringify(cart));
    localStorage.setItem('appliedDiscounts', JSON.stringify(appliedDiscounts));
    updateCartCount();
    
    // Show success message
    showAlert(' Order confirmed! Thank you for your booking. A confirmation email has been sent.', 'success');
    
    // Redirect to home page after 3 seconds
    setTimeout(() => {
        window.location.href = 'iaindex.html';
    }, 3000);
}

function generateOrderId() {
    return 'ORD-' + Date.now().toString(36).toUpperCase();
}

// Build an order object from cart + customer data + totals
function buildOrderFromCart(customerData) {
    const cartItems = JSON.parse(localStorage.getItem('rentalCart')) || [];
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return null;
    }

    const totals = {
        subtotal: readMoneyFromElement('checkout-subtotal'),
        discount: readMoneyFromElement('checkout-discount'),
        tax: readMoneyFromElement('checkout-tax'),
        total: readMoneyFromElement('checkout-total')
    };

    const today = new Date().toISOString().split('T')[0];

    return {
        id: `ORDER-${Date.now()}`,
        date: today,
        customer: {
            fullName: customerData.fullName,
            email: customerData.email,
            phone: customerData.phone,
            trn: customerData.trn,
            address: customerData.address
        },
        items: cartItems,
        totals
    };
}

// Save order into your existing rentalOrders list
function saveOrderToStorage(order) {
    const existing = JSON.parse(localStorage.getItem('rentalOrders')) || [];
    existing.push(order);
    localStorage.setItem('rentalOrders', JSON.stringify(existing));
}

// Convert an order to a rubric-style invoice object
function createInvoiceFromOrder(order) {
    const invoiceNumber = generateInvoiceNumber();

    const invoiceItems = (order.items || []).map(item => {
        const name = item.name || item.propertyName || 'Rental Property';
        const quantity = item.months || item.durationMonths || item.quantity || 1;
        const price = item.price || item.monthlyPrice || 0;
        const discount = item.discount || 0;
        return { name, quantity, price, discount };
    });

    return {
        invoiceNumber,
        date: order.date,
        trn: order.customer.trn || 'N/A',
        customerName: order.customer.fullName || '',
        shippingAddress: order.customer.address || '',
        items: invoiceItems,
        subtotal: order.totals.subtotal || 0,
        discount: order.totals.discount || 0,
        tax: order.totals.tax || 0,
        total: order.totals.total || 0
    };
}

// Save invoice into AllInvoices and remember the last one
function saveInvoiceToStorage(invoice) {
    const all = JSON.parse(localStorage.getItem(ALL_INVOICES_KEY)) || [];
    all.push(invoice);
    localStorage.setItem(ALL_INVOICES_KEY, JSON.stringify(all));
    localStorage.setItem(LAST_INVOICE_NUMBER_KEY, invoice.invoiceNumber);
}


function proceedToCheckout() {
    if (cart.length === 0) {
        showAlert('Your cart is empty. Please add items before checkout.', 'error');
        return;
    }
    
    localStorage.setItem('rentalCart', JSON.stringify(cart));
    localStorage.setItem('appliedDiscounts', JSON.stringify(appliedDiscounts));
    window.location.href = 'iacheckout.html';
}

function initializeLoginPage() {
    console.log('Initializing login page...');
    const loginForm = document.querySelector('.login-container form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function initializeSignupPage() {
    console.log('Initializing signup page...');
    const signupForm = document.querySelector('.login-container form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

function handleLogin(event) {
    event.preventDefault();
    console.log('Login form submitted');
    
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    const errors = validateLoginForm(email, password);
    
    if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        return;
    }
    
    // Simulate login process
    showAlert('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'iaindex.html';
    }, 2000);
}

function handleSignup(event) {
    event.preventDefault();
    console.log('Signup form submitted');
    
    const form = event.target;
    const username = form.querySelector('input[type="text"]')?.value || '';
    const phone = form.querySelector('input[type="tel"]')?.value || '';
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    const errors = validateSignupForm(username, phone, email, password);
    
    if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        return;
    }
    
    // Simulate signup process
    showAlert('Account created successfully! Redirecting to login...', 'success');
    
    setTimeout(() => {
        window.location.href = 'loginpage.html';
    }, 2000);
}

function validateLoginForm(email, password) {
    const errors = [];
    
    if (!email || !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    return errors;
}

function validateSignupForm(username, phone, email, password) {
    const errors = [];
    
    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    
    if (!phone || !isValidPhone(phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    return errors;
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Style the alert
    alertDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    alertDiv.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

function handleMenuToggle(event) {
    console.log('Menu toggled:', event.target.checked);
}


/* 
   ADDITIONAL FUNCTIONALITY – USER STATS & INVOICE LIST
   Q6: ShowUserFrequency(), ShowInvoices(), GetUserInvoices()
*/

// Safely read RegistrationData / RegisterData
function getRegistrationData() {
    let data =
        JSON.parse(localStorage.getItem('RegistrationData')) ||
        JSON.parse(localStorage.getItem('RegisterData')) ||
        [];

    if (!Array.isArray(data)) return [];
    return data;
}

// Safely read all invoices from AllInvoices
function getAllInvoices() {
    let invoices = JSON.parse(localStorage.getItem('AllInvoices')) || [];
    if (!Array.isArray(invoices)) return [];
    return invoices;
}

// Helper: calculate age from DOB string (YYYY-MM-DD)
function calculateAge(dobString) {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

//Test Data for RegistrationData and AllInvoices *Bradd Codner
localStorage.setItem('RegistrationData', JSON.stringify([
  {
    firstName: 'Alex',
    lastName: 'Test',
    dateOfBirth: '2000-01-01',
    gender: 'Male',
    trn: '123-456-789',
    invoices: []
  },
  {
    firstName: 'Jamie',
    lastName: 'Demo',
    dateOfBirth: '1985-06-15',
    gender: 'Female',
    trn: '222-333-444',
    invoices: []
  }
]));

localStorage.setItem('AllInvoices', JSON.stringify([
  { invoiceNumber: 'INV001', trn: '123-456-789', date: '2025-01-01', total: 5000 },
  { invoiceNumber: 'INV002', trn: '222-333-444', date: '2025-01-02', total: 7500 }
]));


/**
 * ShowUserFrequency()
 * - Shows user frequency by Gender and Age Group
 *   Uses RegistrationData from localStorage.
 *   Output is displayed on dashboard.html in #user-frequency-container
 */
function ShowUserFrequency() {
    const users = getRegistrationData();
    const container = document.getElementById('user-frequency-container');

    if (!container) {
        console.warn('ShowUserFrequency: container not found');
        return;
    }

    if (users.length === 0) {
        container.innerHTML = '<p>No registered users found.</p>';
        return;
    }

    // Count by gender
    const genderCounts = {
        Male: 0,
        Female: 0,
        Other: 0
    };

    // Count by age group
    const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-50': 0,
        '50+': 0
    };

    users.forEach(user => {
        const g = (user.gender || '').trim();
        if (genderCounts[g] !== undefined) {
            genderCounts[g]++;
        } else {
            // Anything else falls into "Other"
            genderCounts.Other++;
        }

        const age = calculateAge(user.dateOfBirth);
        if (age === null || age < 18) {
            // Spec only cares about 18+; ignore under 18 just in case
            return;
        }
        if (age >= 18 && age <= 25) {
            ageGroups['18-25']++;
        } else if (age >= 26 && age <= 35) {
            ageGroups['26-35']++;
        } else if (age >= 36 && age <= 50) {
            ageGroups['36-50']++;
        } else if (age > 50) {
            ageGroups['50+']++;
        }
    });

    // Find the largest count to scale bar widths
    const maxGender = Math.max(...Object.values(genderCounts));
    const maxAge = Math.max(...Object.values(ageGroups));

    function buildBarRows(title, counts, maxCount) {
        let html = `<div class="chart-group"><h4>${title}</h4>`;
        for (const [label, count] of Object.entries(counts)) {
            const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
            html += `
                <div class="chart-row">
                    <span class="chart-label">${label} (${count})</span>
                    <div class="chart-bar">
                        <div class="chart-bar-fill" style="width:${widthPercent}%;"></div>
                    </div>
                </div>
            `;
        }
        html += `</div>`;
        return html;
    }

    const genderHtml = buildBarRows('By Gender', genderCounts, maxGender);
    const ageHtml = buildBarRows('By Age Group', ageGroups, maxAge);

    // Use innerHTML as the spec hints
    container.innerHTML = genderHtml + ageHtml;
}

/**
 * ShowInvoices()
 * - Displays all invoices from AllInvoices
 * - Allows search by TRN
 * - Logs search results to console.log(), as required.
 */
function ShowInvoices() {
    const invoices = getAllInvoices();
    const listContainer = document.getElementById('invoice-list-container');
    const searchInput = document.getElementById('search-trn');
    const searchBtn = document.getElementById('search-invoices-btn');

    if (!listContainer) {
        console.warn('ShowInvoices: invoice list container not found');
        return;
    }

    // Helper to render a list of invoices
    function renderInvoiceList(list, headingText) {
        if (!list || list.length === 0) {
            listContainer.innerHTML =
                '<p>No invoices found.</p>';
            return;
        }

        let html = '';
        if (headingText) {
            html += `<h4>${headingText}</h4>`;
        }

        html += '<div class="invoice-list">';
        list.forEach(inv => {
            html += `
                <div class="invoice-card">
                    <p><strong>Invoice #:</strong> ${inv.invoiceNumber || inv.id || 'N/A'}</p>
                    <p><strong>TRN:</strong> ${inv.trn || 'N/A'}</p>
                    <p><strong>Date:</strong> ${inv.date || inv.invoiceDate || 'N/A'}</p>
                    <p><strong>Total:</strong> $${(inv.total || (inv.totals && inv.totals.total)) ?? '0.00'}</p>
                </div>
            `;
        });
        html += '</div>';
        listContainer.innerHTML = html;
    }

    // Initial display of all invoices
    renderInvoiceList(invoices, 'All Invoices');

    // Wire up search button
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
            const trn = searchInput.value.trim();
            if (!trn) {
                renderInvoiceList(invoices, 'All Invoices');
                console.log('ShowInvoices: empty search, showing all invoices', invoices);
                return;
            }
            const matches = invoices.filter(inv => (inv.trn || '').trim() === trn);
            console.log('ShowInvoices: search results for TRN', trn, matches);
            renderInvoiceList(matches, `Invoices for TRN: ${trn}`);
            // Also call GetUserInvoices to satisfy part (c)
            GetUserInvoices(trn);
        });
    }
}

/**
 * GetUserInvoices(trn)
 * - Displays all invoices for a user based on TRN
 * - Uses the localStorage key RegistrationData / RegisterData
 */
function GetUserInvoices(trn) {
    const listContainer = document.getElementById('invoice-list-container');
    const users = getRegistrationData();

    if (!trn) {
        console.log('GetUserInvoices: no TRN provided');
        return;
    }

    const user = users.find(u => (u.trn || '').trim() === trn.trim());

    if (!user) {
        console.log('GetUserInvoices: no user found with TRN', trn);
        if (listContainer) {
            listContainer.innerHTML += `<p>No user found with TRN ${trn}.</p>`;
        }
        return;
    }

    const invoices = Array.isArray(user.invoices) ? user.invoices : [];
    console.log('GetUserInvoices: invoices for TRN', trn, invoices);

    if (!listContainer) return;

    if (invoices.length === 0) {
        listContainer.innerHTML += `<p>This user has no invoices yet.</p>`;
        return;
    }

    let html = '<h4>User Invoices (from RegistrationData)</h4><div class="invoice-list">';
    invoices.forEach(inv => {
        html += `
            <div class="invoice-card">
                <p><strong>Invoice #:</strong> ${inv.invoiceNumber || inv.id || 'N/A'}</p>
                <p><strong>Date:</strong> ${inv.date || inv.invoiceDate || 'N/A'}</p>
                <p><strong>Total:</strong> $${(inv.total || (inv.totals && inv.totals.total)) ?? '0.00'}</p>
            </div>
        `;
    });
    html += '</div>';

    // Append beneath any existing ShowInvoices output
    listContainer.innerHTML += html;
}

//  DOMContentLoaded hook JUST for dashboard.html
document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;

    // Dashboard: user stats + all invoices
    if (path.includes('dashboard.html')) {
        ShowUserFrequency();
        ShowInvoices();
    }

    // Checkout: attach submit + cancel
    if (path.includes('checkout.html')) {
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', handleCheckout);
        }
        const cancelBtn = document.getElementById('cancel-checkout-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                window.location.href = 'cart.html';
            });
        }
    }

    // Invoice page: display latest invoice Idea Abandoned mayne
    //if (path.includes('invoice.html')) {
      //  displayLatestInvoice();}
});


// Expose functions globally in case the marker calls them manually
window.ShowUserFrequency = ShowUserFrequency;
window.ShowInvoices = ShowInvoices;
window.GetUserInvoices = GetUserInvoices;



// Make functions available globally for HTML onclick attributes
window.removeCartItem = removeCartItem;
window.removeDiscount = removeDiscount;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;

console.log('Home Rental IA JavaScript loaded successfully');

