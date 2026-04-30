document.addEventListener("DOMContentLoaded", () => {
  initializeUpsellState();
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-cart-upsell-button]");
  if (!button || button.disabled) return;

  const variantId = button.dataset.variantId;
  if (!variantId) return;

  button.disabled = true;
  button.textContent = "Wird hinzugefügt...";

  try {
    const cartBeforeAdd = await fetchCart();

    if (!canAddUpsellProduct(button, cartBeforeAdd)) {
      button.textContent = "Nicht verfügbar";
      button.disabled = true;
      return;
    }

    const addResponse = await fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id: Number(variantId),
        quantity: 1,
      }),
    });

    if (!addResponse.ok) {
      throw new Error("Produkt konnte nicht hinzugefügt werden");
    }

    sessionStorage.setItem(`upsell-added-${variantId}`, "true");

    await refreshCartDrawer();
    await initializeUpsellState();
  } catch (error) {
    console.error(error);

    button.textContent = "Nicht verfügbar";

    setTimeout(() => {
      button.textContent = "Hinzufügen";
      button.disabled = false;
    }, 2000);
  }
});

async function fetchCart() {
  const response = await fetch("/cart.js", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Cart konnte nicht geladen werden");
  }

  return response.json();
}

async function initializeUpsellState() {
  try {
    const cart = await fetchCart();
    updateUpsellButtonState(cart);
  } catch (error) {
    console.error(error);
  }
}

async function refreshCartDrawer() {
  const response = await fetch(
    `${window.location.pathname}?sections=cart-drawer,cart-icon-bubble`,
  );

  if (!response.ok) {
    throw new Error("Cart Drawer konnte nicht aktualisiert werden");
  }

  const sections = await response.json();

  updateSection("cart-drawer", "#CartDrawer", sections);
  updateSection("cart-icon-bubble", "#cart-icon-bubble", sections);
}

function updateSection(sectionId, selector, sections) {
  if (!sections[sectionId]) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(sections[sectionId], "text/html");

  const newElement = doc.querySelector(selector);
  const currentElement = document.querySelector(selector);

  if (newElement && currentElement) {
    currentElement.innerHTML = newElement.innerHTML;
  }
}

function canAddUpsellProduct(button, cart) {
  const variantId = Number(button.dataset.variantId);
  const inventoryQuantity = Number(button.dataset.inventoryQuantity);
  const inventoryPolicy = button.dataset.inventoryPolicy;

  const cartItem = cart.items.find((item) => item.variant_id === variantId);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const hasLimitedInventory =
    inventoryPolicy !== "continue" && !Number.isNaN(inventoryQuantity);

  if (hasLimitedInventory && cartQuantity >= inventoryQuantity) {
    return false;
  }

  return button.dataset.available === "true";
}

function updateUpsellButtonState(cart) {
  const button = document.querySelector("[data-cart-upsell-button]");
  if (!button) return;

  const variantId = Number(button.dataset.variantId);
  if (!variantId) return;

  const cartItem = cart.items.find((item) => item.variant_id === variantId);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const isAvailable = button.dataset.available === "true";
  const inventoryQuantity = Number(button.dataset.inventoryQuantity);
  const inventoryPolicy = button.dataset.inventoryPolicy;

  const hasLimitedInventory =
    inventoryPolicy !== "continue" && !Number.isNaN(inventoryQuantity);

  const isSoldOut =
    !isAvailable ||
    (hasLimitedInventory && inventoryQuantity <= 0) ||
    (hasLimitedInventory && cartQuantity >= inventoryQuantity);

  if (isSoldOut) {
    button.textContent = "Nicht verfügbar";
    button.disabled = true;
    return;
  }

  const wasAdded =
    sessionStorage.getItem(`upsell-added-${variantId}`) === "true" ||
    cartQuantity > 0;

  if (wasAdded) {
    button.textContent = "Hinzugefügt ✓";
    button.disabled = true;
    return;
  }

  button.textContent = "Hinzufügen";
  button.disabled = false;
}
