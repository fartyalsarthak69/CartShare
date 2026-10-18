// ==========================================
// 1. HTML ELEMENT CONNECTIONS
// ==========================================
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const roomCodeInput = document.getElementById('roomCode');
const displayUsername = document.getElementById('display-username');
const displayRoomCode = document.getElementById('display-room-code');

const productList = document.getElementById('product-list');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');

// NEW: Connect the activity log HTML element
const activityLogContainer = document.getElementById('activity-log');

// ==========================================
// 2. DATA & GLOBAL VARIABLES
// ==========================================
const products = [
    { id: 1, name: "Milk (1 Gal)", price: 4.99 },
    { id: 2, name: "Bread", price: 2.49 },
    { id: 3, name: "Eggs (1 Dozen)", price: 3.99 },
    { id: 4, name: "Bananas (1 lb)", price: 1.29 },
    { id: 5, name: "Coffee", price: 7.99 },
    { id: 6, name: "Toilet Paper", price: 12.50 }
];

let cart = []; 
let activityLog = []; // NEW: Array to hold our log messages

let currentUsername = "";
let currentRoom = "";

// ==========================================
// 3. LOGIN LOGIC
// ==========================================
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    currentUsername = usernameInput.value;
    currentRoom = roomCodeInput.value.toUpperCase(); 

    displayUsername.textContent = currentUsername;
    displayRoomCode.textContent = currentRoom;

    loginScreen.classList.add('d-none');
    dashboardScreen.classList.remove('d-none');

    renderProducts();
    loadCart();
    loadLog(); // NEW: Load the log history when logging in
});

// ==========================================
// 4. DISPLAY PRODUCTS
// ==========================================
function renderProducts() {
    productList.innerHTML = ""; 
    products.forEach(product => {
        const productHTML = `
            <div class="col-sm-6 col-md-4 mb-3">
                <div class="card h-100 shadow-sm">
                    <div class="card-body text-center">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-success fw-bold">$${product.price.toFixed(2)}</p>
                        <button onclick="addToCart(${product.id})" class="btn btn-outline-primary btn-sm w-100">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        productList.innerHTML += productHTML;
    });
}

// ==========================================
// 5. CART & LOG LOGIC
// ==========================================
function addToCart(productId) {
    const productToAdd = products.find(p => p.id === productId);
    cart.push(productToAdd);
    updateCartUI();
    saveCart(); 
    
    // NEW: Log that this person added this item
    addLogMessage(`added ${productToAdd.name}`);
}

function removeFromCart(index) {
    // NEW: Find out the name of the item BEFORE we delete it so we can log it
    const itemToRemove = cart[index]; 
    
    cart.splice(index, 1);
    updateCartUI();
    saveCart(); 
    
    // NEW: Log that this person removed this item
    addLogMessage(`removed ${itemToRemove.name}`);
}

function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let totalCost = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<li class="list-group-item text-center text-muted">Cart is empty</li>`;
        cartCount.textContent = "0 items";
        cartTotal.textContent = "0.00";
        return; 
    }

    cart.forEach((item, index) => {
        totalCost += item.price; 
        const cartItemHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${item.name} <small class="text-success">($${item.price.toFixed(2)})</small></span>
                <button onclick="removeFromCart(${index})" class="btn btn-sm btn-danger py-0 px-2">X</button>
            </li>
        `;
        cartItemsContainer.innerHTML += cartItemHTML;
    });

    cartCount.textContent = `${cart.length} item(s)`;
    cartTotal.textContent = totalCost.toFixed(2);
}

// ==========================================
// 6. ACTIVITY LOG DISPLAY
// ==========================================
function addLogMessage(action) {
    // Get the current time (e.g., "11:30 AM")
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create the message (e.g., "11:30 AM - Alex added Coffee")
    const message = `<strong>${time}</strong> - <em>${currentUsername}</em> ${action}`;
    
    // Add it to our log array
    activityLog.push(message);
    updateLogUI();
    saveLog();
}

function updateLogUI() {
    activityLogContainer.innerHTML = "";
    
    if (activityLog.length === 0) {
        activityLogContainer.innerHTML = `<li class="list-group-item text-center text-muted small">No activity yet</li>`;
        return;
    }

    // We make a copy of the log and reverse it so the newest messages appear at the top
    const reversedLog = [...activityLog].reverse();
    
    reversedLog.forEach(log => {
        activityLogContainer.innerHTML += `<li class="list-group-item small">${log}</li>`;
    });
}

// ==========================================
// 7. LOCAL STORAGE & SYNCING
// ==========================================
function saveCart() {
    localStorage.setItem(`cartshare_${currentRoom}`, JSON.stringify(cart));
}

function loadCart() {
    const savedCartString = localStorage.getItem(`cartshare_${currentRoom}`);
    if (savedCartString) {
        cart = JSON.parse(savedCartString);
        updateCartUI();
    }
}

// NEW: Save and load functions specifically for the Activity Log
function saveLog() {
    localStorage.setItem(`cartshare_log_${currentRoom}`, JSON.stringify(activityLog));
}

function loadLog() {
    const savedLogString = localStorage.getItem(`cartshare_log_${currentRoom}`);
    if (savedLogString) {
        activityLog = JSON.parse(savedLogString);
        updateLogUI();
    }
}

// Listen for changes from other tabs
window.addEventListener('storage', function(event) {
    if (event.key === `cartshare_${currentRoom}`) {
        loadCart();
    }
    // NEW: If the log changes in another tab, reload it here
    if (event.key === `cartshare_log_${currentRoom}`) {
        loadLog();
    }
});
// ==========================================
// 8. LOGOUT / LEAVE ROOM LOGIC
// ==========================================
const btnLeaveRoom = document.getElementById('btn-leave-room');

btnLeaveRoom.addEventListener('click', function() {
    // 1. Clear the global variables
    currentUsername = "";
    currentRoom = "";
    
    // 2. Clear the form inputs so they are empty for the next person
    usernameInput.value = "";
    roomCodeInput.value = "";
    
    // 3. Hide the dashboard and show the login screen again
    dashboardScreen.classList.add('d-none');
    loginScreen.classList.remove('d-none');
});