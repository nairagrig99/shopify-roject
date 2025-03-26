class CartUpdateDrawer extends HTMLElement {
    constructor() {
        super();
        if (window.location.pathname != '/cart'){
            this.cartInteraction = this.cartInteraction.bind(this);
            this.handleClickOutside = this.handleClickOutside.bind(this);
            this.cartLayer = document.querySelector('.drawer__cart-section');
            this.overflow = document.querySelector('html');
            this.connectedCallback();
            this.connectedCallbackCartInteraction();
        }
    }

    emptyCart() {
        let cartItem = document.querySelector('.cart-items')?.innerHTML;
        if (!cartItem) {
            document.querySelector('.cart-drawer-content').innerHTML = `
            <div class="empty-drawer-cart">
        <div class="empty-drawer-cart__svg">
          <svg role="presentation" stroke-width="1" focusable="false" width="32" height="32" class="icon icon-cart"
               viewBox="0 0 22 22">
            <path
              d="M9.182 18.454a.91.91 0 1 1-1.818 0 .91.91 0 0 1 1.818 0Zm7.272 0a.91.91 0 1 1-1.818 0 .91.91 0 0 1 1.819 0Z"
              fill="currentColor"></path>
            <path
              d="M5.336 6.636H21l-3.636 8.182H6.909L4.636 3H1m8.182 15.454a.91.91 0 1 1-1.818 0 .91.91 0 0 1 1.818 0Zm7.272 0a.91.91 0 1 1-1.818 0 .91.91 0 0 1 1.819 0Z"
              fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          <span class="count-bubble count-bubble--lg">0</span>
        </div>

        <div class="empty-drawer-cart__prose">
          <p class="h5" style="text-align: center">Your bag is empty</p>
          <a class=" btn btn-fill btn-fw checkout-btn" href="/collections/products">Continue shopping</a>
        </div>
      </div>
      `
        } else {
            this.cartUpdate()
        }
    }

    handleClickOutside(event) {
        const isClickOutside = !document.getElementById('cart-drawer')?.contains(event.target)
            && !event.target.classList.contains('cart-icon')
        const isClick = event.target.classList.contains('close-cart-drawer')
        if (isClickOutside || isClick) {
            this.closeCartDrawer();
        }
    }

    connectedCallback() {
        document.body.addEventListener('click', this.handleClickOutside);
    }

    disconnectedCallback() {
        document.body.removeEventListener('click', this.handleClickOutside);
    }

    connectedCallbackCartInteraction() {
        const icon = document.querySelector('.cart-icon');
        console.log('icon',icon)
        if (icon) {
            icon.removeEventListener('click', this.cartInteraction);
            icon.addEventListener('click', this.cartInteraction);
        }
    }

    disconnectedCallbackCartInteraction() {
        const icon = document.querySelector('.cart-icon');
        if (icon) {
            console.log('disconnect')
            icon.removeEventListener('click', this.cartInteraction);
        }
    }

    cartInteraction(event) {
        event.stopPropagation();

        if (event.isTrusted) {
            this.openCartDrawer();
        }

        fetch('/cart.js', {
            method: 'GET'
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to update the cart.');
                return response.json();
            })
            .then((data) => {
                if (data["item_count"] === 0) {
                    return null;
                }
                return fetch(`/?sections=cart-drawer`);
            })
            .then((response) => {
                if (!response) return
                return response.json()
            })
            .then((data) => {
                if (data) {
                    this.drawCart(data, true);
                    this.openCartDrawer();
                    this.disconnectedCallbackCartInteraction()
                } else {
                    this.emptyCart();
                }
            })
            .catch((error) => {
            });
    }

    cartUpdate() {
        const quantityInput = this.querySelectorAll('.quantity-input__drawer');
        console.log('quantityInput',quantityInput);
        if (quantityInput.length > 0) {
            console.log('quantityInput',quantityInput)
            this.quantityUpdate(quantityInput);
            this.removeCartItem(quantityInput);

            quantityInput.forEach((input) => {
                input.addEventListener('change', (event) => {
                    console.log('change input',input);
                    // Disable all forms while updating
                    quantityInput.forEach((inp) => {
                        inp.closest('form').style.pointerEvents = 'none'
                        inp.closest('form').style.opacity = '0.5';
                    });
                    const form = input.closest("form");
                    const productId = +input.getAttribute('cart-item-id')
                    const quantity = new FormData(form).get('quantity')
                    const updates = {
                        [productId]: +quantity
                    }

                        fetch('/cart/update.js', {
                            method: 'POST',
                            headers: {
                                'Content-type': 'application/json'
                            },
                            body: JSON.stringify({updates})
                        })
                            .then((response) => {
                                if (!response.ok) throw new Error('Failed to update the cart.');
                                return response.json();
                            })
                            .then((response) => {
                                return fetch(`/?sections=cart-drawer`);
                            })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data) {
                                    this.drawCart(data, false);
                                    this.disconnectedCallbackCartInteraction()
                                }
                            })
                });
            });
        }
    }

    quantityUpdate(quantityInput) {
        const quantityDecrease = document.querySelectorAll('.quantity-decrease');
        const quantityIncrease = document.querySelectorAll('.quantity-increase');

        // Remove existing event listeners first (to prevent duplicates)
        quantityDecrease.forEach((decrease) => {
            const newDecrease = decrease.cloneNode(true);
            decrease.parentNode.replaceChild(newDecrease, decrease);
        });

        quantityIncrease.forEach((increase) => {
            const newIncrease = increase.cloneNode(true);
            increase.parentNode.replaceChild(newIncrease, increase);
        });

        // Add fresh event listeners
        document.querySelectorAll('.quantity-decrease').forEach((decrease, index) => {
            decrease.addEventListener('click', () => {
                if (quantityInput[index] && quantityInput[index].value > 1) {
                    quantityInput[index].value = +quantityInput[index].value - 1;
                    quantityInput[index].dispatchEvent(new Event('change', {bubbles: true}));
                }
            });
        });

        document.querySelectorAll('.quantity-increase').forEach((increase, index) => {
            increase.addEventListener('click', () => {
                if (quantityInput[index]) {
                    quantityInput[index].value = +quantityInput[index].value + 1;
                    quantityInput[index].dispatchEvent(new Event('change', {bubbles: true}));
                }
            });
        });
    }

    drawCart(data, isInteraction = false) {
        const newDrawer = data['cart-drawer'];
        const tempDiv = document.createElement('div');

        tempDiv.innerHTML = newDrawer;

        const header = tempDiv.querySelector('.cart-drawer-header');
        const content = tempDiv.querySelector('.cart-drawer-content');
        const cartCount = tempDiv.querySelector('#updateCartCount');
        const dataCartCount = document.querySelector('[data-cart-counter]');
        const cartDrawer = document.getElementById('cart-drawer');

        if (dataCartCount && cartCount) {
            dataCartCount.innerHTML = cartCount.value;
        }

        if (cartDrawer) {
            cartDrawer.innerHTML = '';
            if (header) cartDrawer.appendChild(header);
            if (content) cartDrawer.appendChild(content);
        }

        if (!document.querySelectorAll('.quantity-input__drawer').length > 0) {
            this.emptyCart();
        } else {
            this.cartUpdate();
        }
    }

    removeCartItem(quantity) {
        const removeButtons = document.querySelectorAll('.remove-cart-item');

        // Remove existing event listeners first (to prevent duplicates)
        removeButtons.forEach((button) => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });

        document.querySelectorAll('.remove-cart-item').forEach((removeElement, index) => {
            removeElement.addEventListener('click', () => {
                if (quantity[index]) {
                    const originalValue = quantity[index].value;
                    quantity[index].value = 0;
                    quantity[index].dispatchEvent(new Event('change', {bubbles: true}));
                    quantity[index].value = originalValue;
                }
            });
        });
    }

    openCartDrawer() {
        document.querySelector('#cart-drawer').classList.remove('hidden');
        document.querySelector('#cart-drawer').classList.add('activeMenu');
        this.cartLayer.classList.add('cart-drawer__overlay');
        this.overflow.style.overflow = "hidden";
    }

    closeCartDrawer() {
        document.querySelector('#cart-drawer').classList.remove('activeMenu');
        document.querySelector('#cart-drawer').classList.add('hidden');
        this.cartLayer.classList.remove('cart-drawer__overlay');
        this.overflow.style.overflow = "auto";
    }
}

customElements.define('cart-update-drawer', CartUpdateDrawer);
