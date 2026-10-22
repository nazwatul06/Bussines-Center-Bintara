
// ==========================================
// BUSSINES CENTER BINTARA
// File: script.js
// ==========================================

// GANTI dengan nomor WhatsApp pengelola.
// Format: 62 + nomor HP, tanpa +, spasi, atau tanda -.
// Contoh format: 6281234567890
const NOMOR_WHATSAPP = "6281234567890";

// Data contoh produk.
// Harga dalam rupiah, stok dan batas maksimum bisa diedit.
const products = [
  {
    id: 1,
    name: "Roti Cokelat",
    category: "Makanan",
    price: 5000,
    stock: 20,
    max: 3,
    emoji: "🍞"
  },
  {
    id: 2,
    name: "Mie Cup",
    category: "Makanan",
    price: 7000,
    stock: 15,
    max: 2,
    emoji: "🍜"
  },
  {
    id: 3,
    name: "Air Mineral",
    category: "Minuman",
    price: 3000,
    stock: 30,
    max: 5,
    emoji: "💧"
  },
  {
    id: 4,
    name: "Teh Botol",
    category: "Minuman",
    price: 5000,
    stock: 0,
    max: 3,
    emoji: "🧃"
  },
  {
    id: 5,
    name: "Pulpen Hitam",
    category: "ATK",
    price: 3000,
    stock: 25,
    max: 5,
    emoji: "🖊️"
  },
  {
    id: 6,
    name: "Buku Tulis",
    category: "ATK",
    price: 4500,
    stock: 18,
    max: 4,
    emoji: "📒"
  }
];

// Keranjang menyimpan produk dan jumlah yang dipilih.
const cart = {};
// Jumlah yang sedang dipilih pada kartu produk.
const selectedQty = {};

// Elemen HTML yang akan diperbarui oleh JavaScript.
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const totalElement = document.getElementById("total");
const formTotal = document.getElementById("form-total");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const orderForm = document.getElementById("order-form");
const formMessage = document.getElementById("form-message");

// Format angka menjadi rupiah.
function rupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

// Cari produk berdasarkan ID.
function getProduct(id) {
  return products.find(product => product.id === Number(id));
}

// Hitung jumlah yang telah ada di keranjang.
function cartQty(id) {
  return cart[id] || 0;
}

// Tampilkan katalog produk.
function renderProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  const filtered = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(keyword);
    const matchesCategory =
      category === "Semua" || product.category === category;

    return matchesName && matchesCategory;
  });

  if (filtered.length === 0) {
    productList.innerHTML =
      '<p class="empty-cart">Produk yang dicari tidak ditemukan.</p>';
    return;
  }

  productList.innerHTML = filtered.map(product => {
    const available = product.stock > 0;
    const quantity = selectedQty[product.id] || 1;
    const remainingLimit = Math.max(
      0,
      Math.min(product.max, product.stock) - cartQty(product.id)
    );

    return `
      <article class="product-card">
        <div class="product-visual">
          <span class="product-emoji">${product.emoji}</span>
          <span class="stock-badge ${available ? "" : "sold"}">
            ${available ? "✓ Tersedia" : "Sold Out"}
          </span>
        </div>

        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-category">${product.category}</p>
          <div class="product-price">${rupiah(product.price)}</div>
          <p class="product-limit">
            Maks. ${product.max} per pelanggan · Stok: ${product.stock}
          </p>

          <div class="product-actions">
            <div class="qty-control">
              <button type="button"
                aria-label="Kurangi jumlah ${product.name}"
                onclick="changeSelected(${product.id}, -1)">−</button>
              <span>${quantity}</span>
              <button type="button"
                aria-label="Tambah jumlah ${product.name}"
                onclick="changeSelected(${product.id}, 1)"
                ${!available || quantity >= remainingLimit ? "disabled" : ""}>+</button>
            </div>

            <button class="add-button" type="button"
              onclick="addToCart(${product.id})"
              ${!available || remainingLimit <= 0 ? "disabled" : ""}>
              ${!available ? "Stok Habis" :
                remainingLimit <= 0 ? "Batas Tercapai" : "+ Keranjang"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// Atur jumlah pada kartu produk.
function changeSelected(id, change) {
  const product = getProduct(id);
  const current = selectedQty[id] || 1;
  const maximum = Math.max(
    0,
    Math.min(product.max, product.stock) - cartQty(id)
  );

  selectedQty[id] = Math.max(
    1,
    Math.min(maximum, current + change)
  );

  renderProducts();
}

// Masukkan produk ke keranjang dengan validasi stok dan batas.
function addToCart(id) {
  const product = getProduct(id);
  const quantity = selectedQty[id] || 1;
  const maximum = Math.min(product.max, product.stock);

  if (!product || product.stock <= 0) {
    return;
  }

  if (cartQty(id) + quantity > maximum) {
    alert("Jumlah melebihi batas maksimum atau stok tersedia.");
    return;
  }

  cart[id] = cartQty(id) + quantity;
  selectedQty[id] = 1;

  formMessage.textContent = "";
  renderProducts();
  renderCart();
}

// Hapus produk dari keranjang.
function removeFromCart(id) {
  delete cart[id];
  selectedQty[id] = 1;
  renderProducts();
  renderCart();
}

// Hitung jumlah seluruh item dan total harga.
function getCartSummary() {
  let count = 0;
  let total = 0;

  Object.keys(cart).forEach(id => {
    const product = getProduct(id);
    if (!product) return;

    count += cart[id];
    total += product.price * cart[id];
  });

  return { count, total };
}

// Tampilkan isi keranjang.
function renderCart() {
  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  const summary = getCartSummary();

  cartCount.textContent = summary.count;
  totalElement.textContent = rupiah(summary.total);
  formTotal.textContent = rupiah(summary.total);

  if (ids.length === 0) {
    cartItems.innerHTML =
      '<p class="empty-cart">Keranjangmu masih kosong. Yuk, pilih produk!</p>';
    return;
  }

  cartItems.innerHTML = ids.map(id => {
    const product = getProduct(id);
    const quantity = cart[id];

    return `
      <div class="cart-item">
        <div>
          <strong>${product.name} × ${quantity}</strong>
          <small>${rupiah(product.price * quantity)}</small>
        </div>
        <button class="remove-button" type="button"
          onclick="removeFromCart(${product.id})">
          Hapus
        </button>
      </div>
    `;
  }).join("");
}

// Pencarian dan filter kategori.
searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", renderProducts);

// Validasi ulang stok dan batas maksimum sebelum mengirim.
function validateCart() {
  const ids = Object.keys(cart).filter(id => cart[id] > 0);

  if (ids.length === 0) {
    return "Keranjang masih kosong. Pilih produk terlebih dahulu.";
  }

  for (const id of ids) {
    const product = getProduct(id);

    if (!product || cart[id] > product.stock) {
      return "Stok " + (product?.name || "produk") +
        " tidak mencukupi. Periksa kembali keranjang.";
    }

    if (cart[id] > product.max) {
      return "Jumlah " + product.name +
        " melebihi batas maksimum pembelian.";
    }
  }

  return "";
}

// Proses formulir pesanan.
orderForm.addEventListener("submit", function(event) {
  event.preventDefault();
  formMessage.textContent = "";

  const error = validateCart();

  if (error) {
    formMessage.textContent = error;
    return;
  }

  // Nomor contoh harus diganti dengan nomor pengelola sebenarnya.
  if (!/^62\d{8,13}$/.test(NOMOR_WHATSAPP)) {
    formMessage.textContent =
      "Periksa pengaturan nomor WhatsApp pengelola di script.js.";
    return;
  }

  const formData = new FormData(orderForm);
  const customer = formData.get("customer").trim();
  const group = formData.get("group").trim();
  const location = formData.get("location").trim();
  const method = formData.get("method");
  const payment = formData.get("payment");
  const notes = formData.get("notes").trim();

  if (!customer || !group || !location) {
    formMessage.textContent = "Mohon lengkapi data pemesan.";
    return;
  }

  const summary = getCartSummary();

  // Susun ringkasan pesanan untuk WhatsApp.
  let message = "PESANAN BUSSINES CENTER BINTARA\n\n";
  message += "Nama: " + customer + "\n";
  message += "Kelas/Bagian: " + group + "\n";
  message += "Lokasi: " + location + "\n";
  message += "Metode: " + method + "\n\n";
  message += "DAFTAR PESANAN:\n";

  Object.keys(cart).forEach(id => {
    if (cart[id] <= 0) return;

    const product = getProduct(id);
    message += "- " + product.name + " x " + cart[id] +
      " = " + rupiah(product.price * cart[id]) + "\n";
  });

  message += "\nTotal: " + rupiah(summary.total) + "\n";
  message += "Catatan: " + (notes || "-") + "\n\n";
  message += "Mohon konfirmasi ketersediaan dan pesanan saya. Terima kasih.";

  const whatsappURL =
    "https://wa.me/" + NOMOR_WHATSAPP +
    "?text=" + encodeURIComponent(message);

  // Membuka WhatsApp; pelanggan tetap perlu menekan tombol Kirim.
  window.open(whatsappURL, "_blank", "noopener,noreferrer");
});

// Buat QR code yang mengarah ke alamat website saat ini.
// Setelah website dipublikasikan, QR akan mengarah ke URL GitHub Pages.
const qrContainer = document.getElementById("qrcode");

if (typeof QRCode !== "undefined") {
  const isPublished =
    location.protocol === "https:" || location.protocol === "http:";

  if (isPublished && location.hostname !== "localhost") {
    new QRCode(qrContainer, {
      text: location.href,
      width: 128,
      height: 128,
      colorDark: "#174b35",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    qrContainer.textContent = "QR tersedia setelah publikasi";
  }
} else {
  qrContainer.textContent = "QR tidak dapat dimuat. Periksa koneksi internet.";
}

// Tampilkan katalog dan keranjang saat halaman dibuka.
renderProducts();
renderCart();
