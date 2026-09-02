#   
CYCY-STORE-PRICE-CHECKER  
------------------------  
  
Files:  
- index.html  
- style.css  
- script.js  
- README.txt  
  
How to use:  
1. Place all files in a single folder named CYCY-STORE-PRICE-CHECKER.  
2. Open index.html in any modern browser (Chrome, Edge, Firefox, Safari).  
   No server, no installation required. Works offline.  
  
Main features:  
- **Price Checker**: Large search bar. Type product name, keyword, SKU, category, or unit. Results filter as you type (case-insensitive, partial matches).  
- **Add to Cart**: Add items from search results to the cart.  
- **Shopping Cart**: Increase/decrease quantity, enter quantity manually, remove items. Subtotals and totals auto-calc.  
- **Checkout**: Enter discount and cash received. Change is calculated automatically. Complete Sale prints a simple receipt and clears the cart.  
- **Manage Products**: Add, edit, delete products. Easy price editing.  
- **Offline storage**: Products and cart are stored in browser localStorage and persist across refreshes, restarts, and offline usage.  
- **Backup / Restore**: Export products to JSON. Import JSON to restore or move products between devices. Clear database option available.  
- **Sample products**: Several sample items are preloaded for testing (Coca-Cola, Pepsi, Lucky Me, etc.). You can delete or replace them.  
  
Notes and tips:  
- Currency formatting uses Philippine Peso (â±) via browser locale formatting.  
- The app is intentionally minimalist and responsive for mobile and desktop.  
- If popups are blocked, allow popups to print receipts (Complete Sale opens a printable receipt in a new window).  
- Exported JSON contains only product data. Importing replaces the current product list.  
- If you accidentally clear products, restore from an exported JSON file.  
  
Troubleshooting:  
- If products disappear, ensure your browser allows localStorage and you didn't clear site data.  
- For long-term backup, export products regularly and keep the JSON file safe.  
  
If you want a ZIP file of this project, save the four files above into a folder and compress it using your OS's "Compress" or "Send to ZIP" feature.  
