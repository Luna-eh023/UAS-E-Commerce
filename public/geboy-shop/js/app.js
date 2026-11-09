const PRODUCTS_KEY = "geboy_products";
const CART_KEY = "bhariq_cart";
const defaultProducts = [
  {id:1,name:"Electric Sander 09",category:"Tools",price:255,image:"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",stock:12,sku:"TOOL-001",sale:false,description:"Waterproofing 123"},
  {id:2,name:"Cordless Drill 01-01",category:"Power Tools",price:290,image:"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",stock:20,sku:"PWR-002",sale:true,description:"Power tools"},
  {id:3,name:"Mitre Saw",category:"Machine Tools",price:220,image:"https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600",stock:0,sku:"MAC-003",sale:false,description:"Power machinery"},
  {id:4,name:"Hammer",category:"Tools",price:120,image:"https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600",stock:8,sku:"TOOL-004",sale:true,description:"Machine tools"},
  {id:5,name:"Adjustable Wrench",category:"Tools",price:45,image:"https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=600",stock:15,sku:"TOOL-005",sale:false,description:"Hand tools"},
  {id:6,name:"Angle Grinder",category:"Power Tools",price:180,image:"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",stock:4,sku:"PWR-006",sale:false,description:"Power tools"},
  {id:7,name:"Impact Drill",category:"Power Tools",price:165,image:"https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",stock:9,sku:"PWR-007",sale:true,description:"Power tools"},
  {id:8,name:"Safety Helmet",category:"Accessories",price:35,image:"https://images.unsplash.com/photo-1516822003754-385fb4c8f7db?w=600",stock:2,sku:"ACC-008",sale:false,description:"Safety equipment"}
];
const money = n => "$" + Number(n).toFixed(2);
const read = (key, fallback) => { try { const value=JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
const getProducts = () => read(PRODUCTS_KEY, defaultProducts);
const getCart = () => read(CART_KEY, []);
const saveCart = cart => localStorage.setItem(CART_KEY, JSON.stringify(cart));
function toast(message){const el=document.getElementById("toast");if(!el)return;el.textContent=message;el.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove("show"),2200);}
function updateCartCount(){const el=document.getElementById("cartCount");if(el)el.textContent=getCart().reduce((sum,item)=>sum+item.quantity,0);}
function addToCart(id){const product=getProducts().find(p=>p.id===id);if(!product||product.stock===0){toast("Produk sedang habis.");return;}const cart=getCart();const found=cart.find(item=>item.id===id);if(found)found.quantity+=1;else cart.push({...product,quantity:1});saveCart(cart);updateCartCount();toast(product.name+" masuk ke keranjang!");}
function renderProducts(){
 const grid=document.getElementById("productGrid");if(!grid)return;
 const query=(document.getElementById("searchInput")?.value||"").toLowerCase();
 const category=document.getElementById("categoryFilter")?.value||"all";
 const products=getProducts().filter(p=>(p.name.toLowerCase().includes(query)||p.sku.toLowerCase().includes(query))&&(category==="all"||p.category===category));
 grid.innerHTML=products.map(p=>`<article class="product-card">
  <div class="product-image"><span class="status-pill">Published</span>${p.sale?'<span class="sale-pill">Sale</span>':''}<img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/500x400/eeeeee/333333?text=Product'"></div>
  <div class="product-info"><h3 class="product-name">${p.name}</h3><div class="product-meta"><span class="price">${money(p.price)}</span><span class="stock ${p.stock===0?'out':''}">${p.stock===0?'Out of Stock':p.stock+' in stock'}</span></div><div class="product-meta"><span>${p.description}</span><span>Store 001</span></div><div class="card-actions"><button class="add-cart" onclick="addToCart(${p.id})" ${p.stock===0?'disabled':''}>＋ Masuk Keranjang</button><span class="details-link">${p.sku}</span></div></div>
 </article>`).join("");
 document.getElementById("shownCount").textContent=products.length;
 document.getElementById("totalProducts").textContent=getProducts().length;
 updateCartCount();
}
function renderCart(){
 const container=document.getElementById("cartItems");if(!container)return;
 const cart=getCart();const empty=document.getElementById("emptyCart");
 empty.hidden=cart.length!==0;container.innerHTML="";
 document.getElementById("cartItemLabel").textContent=cart.length?`(${cart.reduce((s,i)=>s+i.quantity,0)} items)`:"";
 cart.forEach(item=>{const row=document.createElement("article");row.className="cart-item";row.innerHTML=`
  <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/160x160/eeeeee/333333?text=Product'">
  <div><h3>${item.name}</h3><p>${item.description||item.category}</p><div class="quantity-control"><button aria-label="Kurangi" data-action="minus" data-id="${item.id}">−</button><span>${item.quantity}</span><button aria-label="Tambah" data-action="plus" data-id="${item.id}">+</button></div></div>
  <div class="item-end"><strong class="item-price">${money(item.price*item.quantity)}</strong><button class="remove-item" data-action="remove" data-id="${item.id}">♧ Remove</button></div>`;
  container.appendChild(row);
 });
 calculateSummary();updateCartCount();
}
function calculateSummary(){
 const cart=getCart(),subtotal=cart.reduce((s,i)=>s+i.price*i.quantity,0),discount=localStorage.getItem("geboy_promo")==="GEBOY10"?subtotal*.1:0,tax=(subtotal-discount)*.08,total=subtotal-discount+tax;
 document.getElementById("subtotal").textContent=money(subtotal);document.getElementById("taxes").textContent=money(tax);document.getElementById("total").textContent=money(total);
 document.getElementById("discountLine").hidden=discount===0;document.getElementById("discountAmount").textContent="-"+money(discount);
}
document.addEventListener("click",e=>{
 const action=e.target.closest("[data-action]");if(!action)return;
 const id=Number(action.dataset.id),type=action.dataset.action,cart=getCart(),item=cart.find(i=>i.id===id);if(!item)return;
 if(type==="plus")item.quantity++;if(type==="minus")item.quantity--;let next=cart.filter(i=>i.quantity>0);if(type==="remove")next=cart.filter(i=>i.id!==id);saveCart(next);renderCart();
});
document.addEventListener("DOMContentLoaded",()=>{
 if(document.getElementById("productGrid")){
  if(!localStorage.getItem(PRODUCTS_KEY))localStorage.setItem(PRODUCTS_KEY,JSON.stringify(defaultProducts));
  renderProducts();document.getElementById("searchInput").addEventListener("input",renderProducts);document.getElementById("categoryFilter").addEventListener("change",renderProducts);
  document.getElementById("refreshBtn").onclick=()=>{renderProducts();toast("Daftar produk diperbarui.");};
  document.getElementById("syncBtn").onclick=()=>toast("Sinkronisasi selesai.");
  document.getElementById("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(getProducts(),null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="geboy-products.json";a.click();URL.revokeObjectURL(a.href);};
  const dialog=document.getElementById("productDialog");document.getElementById("addProductBtn").onclick=()=>dialog.showModal();
  document.getElementById("productForm").addEventListener("submit",e=>{e.preventDefault();const products=getProducts();products.unshift({id:Date.now(),name:document.getElementById("newName").value,category:document.getElementById("newCategory").value,price:Number(document.getElementById("newPrice").value),image:document.getElementById("newImage").value||"https://placehold.co/500x400/eeeeee/333333?text=New+Product",stock:10,sku:"NEW-"+Date.now().toString().slice(-5),sale:false,description:"New product"});localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));dialog.close();e.target.reset();renderProducts();toast("Produk berhasil ditambahkan.");});
 }
 if(document.getElementById("cartItems")){
  renderCart();document.getElementById("clearCartBtn").onclick=()=>{saveCart([]);renderCart();toast("Keranjang dikosongkan.");};
  document.getElementById("applyPromoBtn").onclick=()=>{const code=document.getElementById("promoInput").value.trim().toUpperCase();if(code==="GEBOY10"){localStorage.setItem("geboy_promo",code);document.getElementById("promoHint").textContent="Kode berhasil digunakan. Diskon 10% aktif.";document.getElementById("promoHint").style.color="#5abc81";}else{localStorage.removeItem("geboy_promo");document.getElementById("promoHint").textContent="Kode promo tidak valid.";document.getElementById("promoHint").style.color="#ef7777";}calculateSummary();};
  document.getElementById("checkoutBtn").onclick=()=>{if(!getCart().length){toast("Keranjang masih kosong.");return;}alert("Checkout berhasil (simulasi). Terima kasih sudah berbelanja di GEBOY SHOP!");saveCart([]);localStorage.removeItem("geboy_promo");renderCart();};
 }
 updateCartCount();
});