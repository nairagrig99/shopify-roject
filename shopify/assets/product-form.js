window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.main-page__product-form').forEach((el) => {
    const button = el.querySelector('input[type="submit"]')
    button.addEventListener('click', (event) => {

      if (window.location.pathname != '/cart') {
        event.preventDefault()

        const form = el.querySelector('form')
        const productID = form.querySelector('input[name="id"]').value;

        button.disabled = true;
        button.value = 'Adding...';

        const paths = window.location.pathname.split('/')
        const productPath = paths.find((path) => path === 'products');

        let cartItemData = {}

        if (productPath) {
          const quantityValue = el.querySelector('input[type="number"]').value;

          cartItemData = {
            quantity: +quantityValue,
            id: parseInt(productID)
          }
        } else {
          cartItemData = {
            quantity: 1,
            id: parseInt(productID)
          }
        }
        console.log('cartItemData',cartItemData)
        const data = {
          items: [
            cartItemData
          ]
        }

        fetch('/cart/add.js', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          }
        })
          .then((res) => res.json())
          .then((data) => {
            button.disabled = false;
            button.value = 'Add To Cart';
            document.querySelector('.cart-icon').dispatchEvent(new MouseEvent('click', {bubbles: true}))
          })
      }
    })
  })
})
