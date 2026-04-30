document.addEventListener("DOMContentLoaded", () => {
  restoreUpsellState();
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-cart-upsell-button]");
  if (!button) return;

  const variantId = button.dataset.variantId;
  if (!variantId) return;

  button.disabled = true;
  button.textContent = "Wird hinzugefügt...";

  try {
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
    restoreUpsellState();
  } catch (error) {
    console.error(error);

    button.textContent = "Nicht verfügbar";

    setTimeout(() => {
      button.textContent = "Hinzufügen";
      button.disabled = false;
    }, 2000);

    setTimeout(() => {
      button.textContent = "Hinzufügen";
      button.disabled = false;
    }, 1500);
  }
});

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

function restoreUpsellState() {
  const button = document.querySelector("[data-cart-upsell-button]");
  if (!button) return;

  const variantId = button.dataset.variantId;
  if (!variantId) return;

  const isAdded = sessionStorage.getItem(`upsell-added-${variantId}`);

  if (isAdded) {
    button.textContent = "Hinzugefügt ✓";
    button.disabled = true;
  }
}
