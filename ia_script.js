// Cart array to store rental items
let cart = JSON.parse(localStorage.getItem('rentalCart')) || [];
let selectedDates = {
    checkin: '',
    checkout: ''
};

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
        image: `Assets/villa${propertyId}.jpg`
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
        
        cartHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='Assets/placeholder.jpg'">
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

function handleCheckout(event) {
    event.preventDefault();
    console.log('💳 Processing checkout...');
    
    if (cart.length === 0) {
        showAlert('Your cart is empty. Please add items before checkout.', 'error');
        return;
    }
    
    const form = event.target;
    const formData = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        cardNumber: document.getElementById('card-number').value,
        expiryDate: document.getElementById('expiry-date').value,
        cvv: document.getElementById('cvv').value
    };
    
    // Validate checkout form
    const errors = validateCheckoutForm(formData);
    
    if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        return;
    }
    
    // Process order
    processOrder(formData);
}

function validateCheckoutForm(formData) {
    const errors = [];
    
    if (!formData.fullName || formData.fullName.length < 2) {
        errors.push('Please enter a valid full name');
    }
    
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.address || formData.address.length < 10) {
        errors.push('Please enter a complete address');
    }
    
    if (!formData.phone || !isValidPhone(formData.phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.push('Please enter a valid 16-digit card number');
    }
    
    if (!formData.expiryDate || !isValidExpiryDate(formData.expiryDate)) {
        errors.push('Please enter a valid expiry date (MM/YY)');
    }
    
    if (!formData.cvv || formData.cvv.length !== 3) {
        errors.push('Please enter a valid 3-digit CVV');
    }
    
    return errors;
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

function saveOrderToStorage(order) {
    const orders = JSON.parse(localStorage.getItem('rentalOrders')) || [];
    orders.push(order);
    localStorage.setItem('rentalOrders', JSON.stringify(orders));
    console.log(' Order saved:', order);
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

// Make functions available globally for HTML onclick attributes
window.removeCartItem = removeCartItem;
window.removeDiscount = removeDiscount;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;

console.log('Home Rental IA JavaScript loaded successfully');