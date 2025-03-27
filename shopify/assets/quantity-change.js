class QuantityChange extends HTMLElement {

    constructor() {
        super();
    }


    connectedCallback() {
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

}

customElements.define("quantity-change", QuantityChange)