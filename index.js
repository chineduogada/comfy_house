class Storage {
	static GetItem(key, id) {
		const items = JSON.parse(localStorage.getItem(key));
		if (id) return items.find(item => item.id === id);
		return items;
	}
	static SetItem(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}
}

// Create the Products Class
class Products {
	async getProducts() {
		try {
			const response = await fetch("data.json");
			const data = await response.json();
			let { items: products } = data;

			products = products.map(product => {
				const { id } = product.sys;
				const { title, price, image: img } = product.fields;
				const { url: image } = img.fields.file;
				return { id, title, price, image };
			});

			return products;
		} catch (error) {
			console.log(error);
		}
	}
}
// Create the UI Class
const NAV = document.querySelector(".nav");
const CART = document.querySelector(".overlay > .cart");
const CART_OVERLAY = document.querySelector(".overlay");
const CART_SHOW_BTN = document.querySelector(".cart-show-btn");
const CART_CLOSE_BTN = document.querySelector(".cart-close-btn");
const CART_AMOUNT = document.querySelector(".cart-amount");
const CART_CONTENT = document.querySelector(".cart-main");
const CART_TOTAL = document.querySelector(".cart-total");
const CART_CLEAR_BTN = document.querySelector(".cart-clear-btn");
const PRODUCTS = document.querySelector(".products");

Product = ({ title, id, price, image }, index) => `
      <!-- SINGLE PRODUCT -->
      <article class="product p-${index + 1}">
          <img src=${image} alt="product" />
          
          <div class="details">
          <button data-id=${id} class="btn-primary add-to-cart-show-btn">
            add to cart <i class="fa fa-cart-plus"></i>
          </button>
          <h3 class="product-title">${title}</h3>
          <h4>$<span class="product-price">${price}</span></h4>
        </div>
      </article>
      <!-- END OF SINGLE PRODUCT -->
      `;
CartItem = ({ image, id, title, price, amount }) => `
  	<!-- CART ITEM -->
		<article class="cart-item flex-a-i-center">
			<img src=${image} alt="product" />

			<div class="cart-item-info text-a-left">
				<h5 class="cart-item-info-title">${title}</h5>
				<h5>$ <span class="cart-item-info-price">${price}</span></h5>
				<button class="btn-primary cart-remove-btn" data-id=${id}>
					remove item
				</button>
			</div>
			
			<div class="cart-item-qty text-a-center">
				<i 	class="fa fa-angle-up cart-qty-amount-up-btn clickable" data-id=${id}></i>
				<h5 class="cart-item-qty-amount">${amount}</h5>
				<i	class="fa fa-angle-down cart-qty-amount-down-btn clickable" data-id=${id}></i>
			</div>
		</article>
		<!-- END OF CART ITEM -->
`;
const showCart = () => {
	NAV.classList.add("show-cart");
};
const hideCart = () => {
	NAV.classList.remove("show-cart");
};

class UI {
	cart = [];
	addToCartButtons;

	constructor() {
		// GET CART FROM STORAGE OTHERWISE EMPTY ARR
		this.cart = Storage.GetItem("cart") || [];
		// ADD EVENT FOR THE CART (SHOW AND HIDE)
		CART_SHOW_BTN.addEventListener("click", showCart);
		CART_CLOSE_BTN.addEventListener("click", hideCart);
		CART_OVERLAY.addEventListener("click", ({ target }) => {
			if (target.classList.contains("overlay")) hideCart();
		});
		// END OF ADD EVENT FOR THE CART (SHOW AND HIDE)

		this.setUpApp();
	}
	// INITIALIZE EVERYTHING NEEDED FROM THE STORAGE
	setUpApp() {
		// SET CART VALUES
		this.setCartValues();
		// RENDER CART ITEM by "POPULATING IT"
		this.populateCartItem();
	}
	// POPULATE CART ITEM for "RENDERING TO THE DOM"
	populateCartItem() {
		this.cart.forEach(item => this.renderCartItem(item));
	}

	// GET PRODUCTS FROM SOURCE
	getProducts(products) {
		this.renderProducts(products);
		// SAVE PRODUCTS TO STORAGE
		Storage.SetItem("products", products);
	}
	// RENDER PRODUCTS TO THE "DOM"
	renderProducts(products) {
		// FOR EVERY SINGLE PRODUCT
		products.forEach((product, index) => {
			// DEFINE A SINGLE PRODUCT (using the products data)
			const element = Product(product, index);
			// PRODUCTS "DOM" APPENDS "ELEMENT"
			PRODUCTS.innerHTML += element;
		});
		// GET PRODUCTS FROM STORAGE
		products = Storage.GetItem("products") || products;
		// GET ALL ADD TO CART BUTTONS
		this.getAddToCartButtons(products);
		// FUNCTIONALITIES FOR REMOVING CART ITEMS
		this.cartLogic();
	}

	// GET ALL ADD TO CART BUTTONS
	getAddToCartButtons(products) {
		const buttons = [...document.querySelectorAll(".add-to-cart-show-btn")];

		this.addToCartButtons = buttons;
		/**
		 * FOR EACH BUTTON
		 * WE ARE TO FIND A PRODUCT WITH A BUTTON BY IT'S "ID"
		 * AND THEN DISABLE THAT BUTTON
		 */
		buttons.forEach(button => {
			const buttonInCart = this.cart.find(({ id }) => id === button.dataset.id);
			if (buttonInCart) this.buttonLogic(button, true);

			button.addEventListener("click", () => {
				this.buttonLogic(button, true);
				const { id } = button.dataset;
				/**
				 * FIND A PRODUCT WITH A BUTTON BY IT'S "ID"
				 * MODIFY THE PRODUCT TO SATISFACTION eg adding the property "itemAmount"
				 * ADD TO CART :: "ARRAY"
				 * SAVE THE CART TO STORAGE
				 * ADD TO CART :: "DOM"
				 * SET CART VALUES (TOTAL PRICE AND TOTAL AMOUNT)
				 * SHOW CART
				 */
				const product = products.find(product => product.id === id);
				const modProduct = Object.assign({}, product, { amount: 1 });
				this.cart = [...this.cart, modProduct];
				Storage.SetItem("cart", this.cart);
				this.renderCartItem(modProduct);
				this.setCartValues();
				showCart();
			});
		});
	}
	// TO DISABLE THE BUTTON IF THE PRODUCT IS IN CART or OTHERWISE
	buttonLogic(button, inCart) {
		function fn(disabled, content, cList) {
			button.disabled = disabled || false;
			button.innerHTML =
				content || 'add to cart <i class="fas fa-cart-plus"></i>';
			if (cList === "add") button.classList.add("disabled");
			else button.classList.remove("disabled");
		}
		if (inCart) fn(true, "in cart", "add");
		else fn();
	}

	// RENDER CART ITEM TO THE "DOM"
	renderCartItem(item) {
		// DEFINE A SINGLE ITEM (using the CART ITEM data)
		const element = CartItem(item);
		// CART ITEM "DOM" APPENDS "ELEMENT"
		CART_CONTENT.innerHTML += element;
	}

	// SET TOTAL CART ITEMS PRICE AS WELL AS THE TOTAL AMOUNT OF ITEMS
	setCartValues() {
		let totalItems = 0,
			totalItemsPrice = 0;
		this.cart.map(({ price, amount }) => {
			totalItemsPrice += price * amount;
			totalItems += amount;
		});

		CART_TOTAL.textContent = Number.parseFloat(totalItemsPrice.toFixed(2));
		CART_AMOUNT.textContent = totalItems;
	}

	// DELETING CART ITEMS
	cartLogic() {
		CART_CLEAR_BTN.addEventListener("click", this.clearCart.bind(this));
		CART_CONTENT.addEventListener("click", ({ target }) => {
			const { dataset, parentElement } = target;
			if (target.classList.contains("cart-remove-btn")) {
				this.removeCartItem(dataset.id);
				CART_CONTENT.removeChild(parentElement.parentElement);
			}
			if (target.classList.contains("cart-qty-amount-up-btn")) {
				this.getCartItemQty(target, "up");
			}
			if (target.classList.contains("cart-qty-amount-down-btn")) {
				this.getCartItemQty(target);
			}
		});
	}

	getCartItemQty(
		{ previousElementSibling, nextElementSibling, dataset },
		action
	) {
		/**
		 * ACCEPTS TARGET::object AND ACTION::string
		 * FINDS THE ITEM VIA THE TARGET ID
		 * AND CHECKS IF THE ACTION IS TRUTHY : INCREMENT THE ITEM AMOUNT, OTHERWISE DOES THE OPP
		 * SAVE THE CART TO STORAGE
		 * SET CART VALUES
		 */
		let item = this.cart.find(({ id }) => id === dataset.id);
		if (action) {
			item.amount += 1;
			nextElementSibling.textContent = item.amount;
		} else {
			if (item.amount !== 1) item.amount -= 1;
			previousElementSibling.textContent = item.amount;
		}
		Storage.SetItem("cart", this.cart);
		this.setCartValues();
	}

	// CLEAR CART
	clearCart() {
		/**
		 * GET ALL CART ITEMS ID
		 * REMOVE EVERY ITEM FROM THE CART BY IT'S ID
		 * DO SAME FOR THE CART "DOM"
		 */
		const cartItemsIDs = this.cart.map(({ id }) => id);
		cartItemsIDs.forEach(id => this.removeCartItem(id));

		while (CART_CONTENT.children.length > 0)
			CART_CONTENT.removeChild(CART_CONTENT.children[0]);
	}

	// REMOVES EVERY CART ITEM BY IT'S ID
	removeCartItem(id) {
		this.cart = this.cart.filter(item => item.id !== id);
		this.setCartValues();
		Storage.SetItem("cart", this.cart);
		const button = this.getAddToCartButton(id);
		this.buttonLogic(button);
	}

	// FINDS A SINGLE WITH THE PRODUCT'S ID
	getAddToCartButton = id =>
		this.addToCartButtons.find(button => button.dataset.id === id);
}

// Instantiate the Products Class
const { getProducts } = new Products();
// Instantiate the UI Class
const ui = new UI();

// GET PRODUCTS
getProducts().then(data => {
	//DATA IS BEING PASSED TO THE "UI";
	ui.getProducts(data);
});

console.log(
	"%c WFT!! ITZ RiChCoDe coding JS :{}",
	"color: orangered; font-size: 1.5rem; font-weight: bold"
);
