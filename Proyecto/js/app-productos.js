document.querySelectorAll('.carousel-container').forEach(container => {
    const carousel = container.querySelector('.carousel');
    const cards = carousel.querySelectorAll('.producto-card');
    const nextBtn = container.querySelector('.next');
    const prevBtn = container.querySelector('.prev');
    const cardWidth = cards[0].offsetWidth + 16; // 16px = gap (1rem)
    const visibleCount = 3;
    let index = 0;

    nextBtn.addEventListener('click', () => {
        if (index < cards.length - visibleCount) {
            index += visibleCount;
            if (index > cards.length - visibleCount) index = cards.length - visibleCount;
            carousel.style.transform = `translateX(-${index * cardWidth}px)`;
        }
    });

    prevBtn.addEventListener('click', () => {
        if (index > 0) {
            index -= visibleCount;
            if (index < 0) index = 0;
            carousel.style.transform = `translateX(-${index * cardWidth}px)`;
        }
    });
});







const DB_NAME = 'secureVisionDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'cart';
    let db;

    function openDB() {
      return new Promise((res, rej) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
          db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
        req.onsuccess = e => {
          db = e.target.result;
          res(db);
        };
        req.onerror = e => rej(e.target.error);
      });
    }

    function addToCart(item) {
      return openDB().then(db => new Promise((res, rej) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.get(item.id).onsuccess = e => {
          const existing = e.target.result;
          if (existing) {
            existing.quantity++;
            store.put(existing);
          } else {
            store.add({ ...item, quantity: 1 });
          }
        };
        tx.oncomplete = () => { renderCart(); res(); };
        tx.onerror = () => rej(tx.error);
      }));
    }

    function removeFromCart(id) {
      return openDB().then(db => new Promise((res, rej) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => { renderCart(); res(); };
        tx.onerror = () => rej(tx.error);
      }));
    }

    function getAllCartItems() {
      return openDB().then(db => new Promise((res, rej) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      }));
    }

    function renderCart() {
      getAllCartItems().then(items => {
        const tbody = document.getElementById('cart-items');
        tbody.innerHTML = '';
        items.forEach(item => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><img src="${item.img}" alt="${item.name}"/></td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td><button class="remove-btn" data-id="${item.id}">X</button></td>
          `;
          tbody.appendChild(tr);
        });
        tbody.querySelectorAll('.remove-btn').forEach(btn => {
          btn.addEventListener('click', e => {
            removeFromCart(Number(e.target.dataset.id));
          });
        });
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      renderCart();
      document.querySelectorAll('.btn-producto').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const card = e.target.closest('.producto-card');
          addToCart({
            id: Number(e.target.dataset.id),
            img: card.querySelector('img').src,
            name: card.querySelector('h3').textContent
          });
        });
      });
    });
