class QuantityChange extends HTMLElement {

    constructor() {
        super();
    }


    connectedCallback() {
        console.log('HTMLElement', this.querySelector('.quantity-decrease'))
        this.querySelector('.quantity-decrease')?.addEventListener("click", () => this.updateQuantity(-1))
        this.querySelector('.quantity-increase')?.addEventListener("click", () => this.updateQuantity(1))
    }

    updateQuantity(amount) {
        const quantityEl = this.querySelector("#quantity");
        const quantityElValue = quantityEl.value;
        let quantity = parseInt(quantityElValue) + amount;
        if (quantity < 1) quantity = 1;
        quantityEl.value = quantity;
    }

    disconnectedCallback() {
        console.log("Custom element removed from page.");
    }

    adoptedCallback() {
        console.log("Custom element moved to new page.");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed.`);
    }

}

customElements.define("quantity-change", QuantityChange)