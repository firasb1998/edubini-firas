# Cart Drawer Booster – Shopify Developer Challenge

Dieses Projekt implementiert einen **Cart Drawer Booster** für ein Shopify (Dawn) Theme.  
Die Lösung kombiniert eine dynamische Free-Shipping-Progress-Bar mit einem Upsell-Produkt, das asynchron (ohne Page Reload) zum Warenkorb hinzugefügt werden kann.

---

## 🚀 Features

- Dynamische Shipping Progress Bar im Cart Drawer
- Free-Shipping-Schwelle über Theme Settings konfigurierbar
- Upsell-Produkt über Theme Settings auswählbar
- Asynchrones Add-to-Cart via Shopify AJAX Cart API
- Kein Page Reload beim Hinzufügen
- Live-Update der Progress Bar
- Button-State Handling:
  - Laden („Wird hinzugefügt…“)
  - Erfolg („Hinzugefügt ✓“)
  - Fehler / Nicht verfügbar
- Inventory-Validierung vor Add-to-Cart
- Umsetzung komplett in **Vanilla JavaScript**

---

## 📁 Hinzugefügte Dateien

### `snippets/cart-drawer-booster.liquid`

Enthält die Shipping Progress Bar.

Berechnet anhand des Warenkorbwerts und der konfigurierten Free-Shipping-Schwelle:
- verbleibenden Betrag
- Fortschritt in Prozent

---

### `snippets/cart-drawer-booster-upsell.liquid`

Enthält den Upsell-Bereich im Cart Drawer.

Zeigt:
- Produktbild
- Titel
- Preis
- „Hinzufügen“-Button

Zusätzlich werden wichtige Daten über `data-*` Attribute an das JavaScript übergeben (z. B. Variant-ID, Verfügbarkeit, Inventory).

---

### `assets/cart-drawer-booster.css`

Enthält das Styling für:
- Progress Bar
- Upsell-Komponente
- Layout im Cart Drawer

---

### `assets/cart-drawer-booster.js`

Enthält die gesamte Logik in Vanilla JavaScript:

- Add-to-Cart via `fetch('/cart/add.js')`
- Cart neu laden via `fetch('/cart.js')`
- Re-Render des Cart Drawers über Shopify Sections
- State Handling für Button
- Inventory-Prüfung vor dem Hinzufügen

---

## 🛠️ Angepasste Dateien

### `snippets/cart-drawer.liquid`

Integration der neuen Komponenten:

- Shipping Bar unterhalb des Cart Headers
- Upsell-Komponente im unteren Bereich des Drawers

---

### `layout/theme.liquid`

Einbindung der neuen Assets:

```liquid
{{ 'cart-drawer-booster.css' | asset_url | stylesheet_tag }}
<script src="{{ 'cart-drawer-booster.js' | asset_url }}" defer></script>
