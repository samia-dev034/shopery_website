/**
 * SHOPERY / EcoBazar E-Commerce Frontend JavaScript
 * Handles cart, wishlist, product modals, search filtering, footer, and responsiveness.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State Management ---
  let cart = JSON.parse(localStorage.getItem('shopery_cart')) || []
  let wishlist = JSON.parse(localStorage.getItem('shopery_wishlist')) || []
  let currentModalProduct = null

  // Bootstrap Toast Instance
  const toastEl = document.getElementById('shoperyToast')
  const toastMessage = document.getElementById('toastMessage')
  const bsToast = toastEl ? new bootstrap.Toast(toastEl, { delay: 3000 }) : null

  function showToast (msg, bgClass = 'bg-success') {
    if (toastEl && bsToast) {
      toastEl.className = `toast align-items-center text-white ${bgClass} border-0`
      toastMessage.textContent = msg
      bsToast.show()
    }
  }

  // --- Cart Functions ---
  function saveCart () {
    localStorage.setItem('shopery_cart', JSON.stringify(cart))
    updateCartUI()
  }

  function updateCartUI () {
    const cartItemCount = document.getElementById('cartItemCount')
    const headerCartTotal = document.getElementById('headerCartTotal')
    const cartItemsContainer = document.getElementById('cartItemsContainer')
    const cartSubtotal = document.getElementById('cartSubtotal')

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    if (cartItemCount) cartItemCount.textContent = totalCount
    if (headerCartTotal) headerCartTotal.textContent = `$${subtotal.toFixed(2)}`
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`

    // Render Cart Items
    if (cartItemsContainer) {
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <i class="bi bi-cart-x fs-1 d-block mb-2"></i>
                        <p class="mb-0">Your shopping cart is empty</p>
                    </div>
                `
      } else {
        cartItemsContainer.innerHTML = cart
          .map(
            (item, index) => `
                    <div class="cart-item d-flex align-items-center justify-content-between border-bottom py-3">
                        <img src="${item.image}" alt="${
              item.name
            }" style="width: 50px; height: 50px; object-fit: contain;" class="rounded border p-1 me-2">
                        <div class="flex-grow-1">
                            <h6 class="mb-1 text-truncate" style="max-width: 140px; font-size: 14px;">${
                              item.name
                            }</h6>
                            <div class="small text-muted">$${item.price.toFixed(
                              2
                            )} x ${
              item.quantity
            } = <strong class="text-success">$${(
              item.price * item.quantity
            ).toFixed(2)}</strong></div>
                        </div>
                        <div class="d-flex align-items-center gap-1">
                            <button class="btn btn-sm btn-outline-secondary px-2 py-0 dec-qty" data-index="${index}">-</button>
                            <span class="px-2 fw-semibold" style="font-size: 14px;">${
                              item.quantity
                            }</span>
                            <button class="btn btn-sm btn-outline-secondary px-2 py-0 inc-qty" data-index="${index}">+</button>
                            <button class="btn btn-sm btn-link text-danger ms-2 remove-item" data-index="${index}"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                `
          )
          .join('')

        // Add event listeners for +/- and delete buttons inside cart drawer
        cartItemsContainer.querySelectorAll('.inc-qty').forEach(btn => {
          btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'))
            cart[idx].quantity += 1
            saveCart()
          })
        })

        cartItemsContainer.querySelectorAll('.dec-qty').forEach(btn => {
          btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'))
            if (cart[idx].quantity > 1) {
              cart[idx].quantity -= 1
            } else {
              cart.splice(idx, 1)
            }
            saveCart()
          })
        })

        cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
          btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'))
            const removedName = cart[idx].name
            cart.splice(idx, 1)
            saveCart()
            showToast(`${removedName} removed from cart`, 'bg-danger')
          })
        })
      }
    }
  }
  function placeOrder() {
  if (cart.length === 0) {
    alert('Your cart is empty')
    return
  }

  const name = prompt('Enter your name:')
  const email = prompt('Enter your email:')
  const address = prompt('Enter your address:')

  if (!name || !email || !address) {
    alert('Please enter all details')
    return
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  fetch('http://127.0.0.1:8000/api/orders/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      email: email,
      address: address,
      total: total
    })
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message)

      if (data.success) {
        cart = []
        saveCart()
      }
    })
    .catch(error => {
      console.log('Error:', error)
      alert('Something went wrong')
    })
}

  function addToCart (product, qty = 1) {
    const existingIndex = cart.findIndex(item => item.id === product.id)
    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity: qty
      })
    }
    saveCart()
    showToast(`Added "${product.name}" to cart!`)
  }

  // --- Wishlist Functions ---
  function saveWishlist () {
    localStorage.setItem('shopery_wishlist', JSON.stringify(wishlist))
    updateWishlistUI()
  }

  function updateWishlistUI () {
    const wishlistBadge = document.getElementById('wishlistBadge')
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlist.length
      wishlistBadge.style.display =
        wishlist.length > 0 ? 'inline-block' : 'none'
    }

    // Update all heart icons across product cards
    document.querySelectorAll('[data-product-id]').forEach(card => {
      const pid = card.getAttribute('data-product-id')
      const heartIcon = card.querySelector('.wishlist-toggle i')
      if (heartIcon) {
        if (wishlist.includes(pid)) {
          heartIcon.className = 'bi bi-heart-fill text-danger'
        } else {
          heartIcon.className = 'bi bi-heart'
        }
      }
    })
  }

  function toggleWishlist (productId, productName) {
    const index = wishlist.indexOf(productId)
    if (index > -1) {
      wishlist.splice(index, 1)
      showToast(`Removed "${productName}" from wishlist`, 'bg-secondary')
    } else {
      wishlist.push(productId)
      showToast(`Added "${productName}" to wishlist!`, 'bg-danger')
    }
    saveWishlist()
  }

  // --- Attach Product Card Listeners ---
  function attachProductListeners () {
    document.querySelectorAll('[data-product-id]').forEach(card => {
      const id = card.getAttribute('data-product-id')
      const name =
        card.getAttribute('data-name') ||
        card.querySelector('.img-name, p, h6')?.textContent?.trim() ||
        'Product'
      const priceStr =
        card.getAttribute('data-price') ||
        card
          .querySelector('.price, b')
          ?.textContent?.replace('$', '')
          ?.trim() ||
        '10.00'
      const image =
        card.getAttribute('data-image') ||
        card.querySelector('img')?.getAttribute('src') ||
        ''
      const category = card.getAttribute('data-category') || 'Fresh Food'
      const price = parseFloat(priceStr) || 10.0

      const productData = { id, name, price, image, category }

      // 1. Add to Cart button click
      const addCartBtn = card.querySelector(
        '.add-cart, .add-to-cart-btn, .cart'
      )
      if (addCartBtn) {
        addCartBtn.style.cursor = 'pointer'
        addCartBtn.addEventListener('click', e => {
          e.stopPropagation()
          addToCart(productData, 1)
        })
      }

      // 2. Wishlist Heart click
      const wishlistBtn = card.querySelector('.wishlist-toggle')
      if (wishlistBtn) {
        wishlistBtn.addEventListener('click', e => {
          e.stopPropagation()
          toggleWishlist(id, name)
        })
      }

      // 3. Click image or title to open Product Details Modal
      const clickableImg = card.querySelector('img')
      const clickableTitle = card.querySelector('.img-name, p, h6')

      ;[clickableImg, clickableTitle].forEach(elem => {
        if (elem) {
          elem.style.cursor = 'pointer'
          elem.addEventListener('click', e => {
            e.stopPropagation()
            openProductModal(productData)
          })
        }
      })
    })
  }

  // --- Product Modal ---
  function openProductModal (product) {
    currentModalProduct = product
    const modalProductImg = document.getElementById('modalProductImg')
    const modalProductName = document.getElementById('modalProductName')
    const modalProductPrice = document.getElementById('modalProductPrice')
    const modalProductCategory = document.getElementById('modalProductCategory')
    const modalQtyInput = document.getElementById('modalQtyInput')

    if (modalProductImg) modalProductImg.src = product.image
    if (modalProductName) modalProductName.textContent = product.name
    if (modalProductPrice)
      modalProductPrice.textContent = `$${product.price.toFixed(2)}`
    if (modalProductCategory)
      modalProductCategory.textContent = product.category
    if (modalQtyInput) modalQtyInput.value = 1

    const productModalElem = document.getElementById('productModal')
    if (productModalElem) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(productModalElem)
      bsModal.show()
    }
  }

  // Modal Qty buttons
  const modalQtyMinus = document.getElementById('modalQtyMinus')
  const modalQtyPlus = document.getElementById('modalQtyPlus')
  const modalQtyInput = document.getElementById('modalQtyInput')
  const modalAddToCartBtn = document.getElementById('modalAddToCartBtn')

  if (modalQtyMinus && modalQtyInput) {
    modalQtyMinus.addEventListener('click', () => {
      let val = parseInt(modalQtyInput.value) || 1
      if (val > 1) modalQtyInput.value = val - 1
    })
  }

  if (modalQtyPlus && modalQtyInput) {
    modalQtyPlus.addEventListener('click', () => {
      let val = parseInt(modalQtyInput.value) || 1
      modalQtyInput.value = val + 1
    })
  }

  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (currentModalProduct) {
        const qty = parseInt(modalQtyInput?.value) || 1
        addToCart(currentModalProduct, qty)
        const productModalElem = document.getElementById('productModal')
        if (productModalElem) {
          const bsModal = bootstrap.Modal.getInstance(productModalElem)
          if (bsModal) bsModal.hide()
        }
      }
    })
  }

  // --- Header Cart & Wishlist Triggers ---
  const cartIconBtn = document.getElementById('cartIconBtn')
  if (cartIconBtn) {
    cartIconBtn.addEventListener('click', () => {
      const cartOffcanvasElem = document.getElementById('cartOffcanvas')
      if (cartOffcanvasElem) {
        const bsOffcanvas =
          bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvasElem)
        bsOffcanvas.show()
      }
    })
  }

  const wishlistIconBtn = document.getElementById('wishlistIconBtn')
  if (wishlistIconBtn) {
    wishlistIconBtn.addEventListener('click', () => {
      if (wishlist.length === 0) {
        showToast('Your wishlist is empty!', 'bg-info')
      } else {
        showToast(
          `You have ${wishlist.length} item(s) in your wishlist!`,
          'bg-info'
        )
      }
    })
  }

  // --- Header Auth Trigger ---
  const authBtn = document.getElementById('authBtn')
  if (authBtn) {
    authBtn.addEventListener('click', e => {
      e.preventDefault()
      const authModalElem = document.getElementById('authModal')
      if (authModalElem) {
        const bsModal = bootstrap.Modal.getOrCreateInstance(authModalElem)
        bsModal.show()
      }
    })
  }

  // Forms submission demo
  const signInForm = document.getElementById('signInForm')
  const signUpForm = document.getElementById('signUpForm')

  if (signInForm) {
    signInForm.addEventListener('submit', e => {
      e.preventDefault()
      const authModalElem = document.getElementById('authModal')
      if (authModalElem) bootstrap.Modal.getInstance(authModalElem)?.hide()
      showToast('Signed in successfully!')
    })
  }

  if (signUpForm) {
    signUpForm.addEventListener('submit', e => {
      e.preventDefault()
      const authModalElem = document.getElementById('authModal')
      if (authModalElem) bootstrap.Modal.getInstance(authModalElem)?.hide()
      showToast('Account created successfully!')
    })
  }

  // --- Footer Handlers ---
  const newsletterForm = document.getElementById('newsletterForm')
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault()
      const input = newsletterForm.querySelector('input')
      if (input && input.value) {
        showToast(`Thank you for subscribing (${input.value})!`)
        input.value = ''
      }
    })
  }

  document.querySelectorAll('.footer-link-auth').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const authModalElem = document.getElementById('authModal')
      if (authModalElem)
        bootstrap.Modal.getOrCreateInstance(authModalElem).show()
    })
  })

  document.querySelectorAll('.footer-link-cart').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const cartOffcanvasElem = document.getElementById('cartOffcanvas')
      if (cartOffcanvasElem)
        bootstrap.Offcanvas.getOrCreateInstance(cartOffcanvasElem).show()
    })
  })

  document.querySelectorAll('.footer-link-wishlist').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      showToast(
        wishlist.length === 0
          ? 'Your wishlist is empty!'
          : `You have ${wishlist.length} item(s) in wishlist!`,
        'bg-info'
      )
    })
  })

  document.querySelectorAll('.footer-link-shop').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const sec = document.querySelector('.five-col')?.closest('.container')
      if (sec) sec.scrollIntoView({ behavior: 'smooth' })
    })
  })

  document.querySelectorAll('.footer-link-toast').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const msg = link.getAttribute('data-msg') || 'Link clicked!'
      showToast(msg, 'bg-info')
    })
  })

  // --- Search Filtering ---
  const searchInput = document.querySelector('.search-box input')
  const searchBtn = document.querySelector('.search-box button')

  function performSearch () {
    const query = searchInput?.value?.toLowerCase()?.trim() || ''
    let matchCount = 0

    document.querySelectorAll('[data-product-id]').forEach(card => {
      const name =
        card.getAttribute('data-name')?.toLowerCase() ||
        card.textContent?.toLowerCase()
      if (query === '' || name.includes(query)) {
        card.style.display = ''
        matchCount++
      } else {
        card.style.display = 'none'
      }
    })

    if (query !== '') {
      showToast(
        `Found ${matchCount} product(s) matching "${query}"`,
        matchCount > 0 ? 'bg-success' : 'bg-warning'
      )
    }
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', e => {
      if (e.key === 'Enter') performSearch()
      else performSearch()
    })
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch)
  }

  // --- Shop Now Buttons Smooth Scroll ---
  document.querySelectorAll('.shop-btn, .shop-now-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const popularProductsSec = document
        .querySelector('.five-col')
        ?.closest('.container')
      if (popularProductsSec) {
        popularProductsSec.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })

  // --- Initialize ---
  updateCartUI()
  updateWishlistUI()
  attachProductListeners()
})
fetch('http://127.0.0.1:8000/api/products/')
  .then(response => response.json())
  .then(data => {
    console.log('Django Products:', data)

    const cards = document.querySelectorAll('[data-product-id]')

    data.forEach((product, index) => {
      if (cards[index]) {
        const card = cards[index]

        card.setAttribute('data-product-id', product.id)
        card.setAttribute('data-name', product.name)
        card.setAttribute('data-price', product.price)
        card.setAttribute('data-category', product.category)
        card.setAttribute('data-image', product.image)

        const nameElement = card.querySelector('.img-name')
        if (nameElement) {
          nameElement.textContent = product.name
        }

        const priceElement = card.querySelector('.price')
        if (priceElement) {
          priceElement.innerHTML = '$' + product.price
        }

        const imageElement = card.querySelector('img')
        if (imageElement && product.image) {
          imageElement.src = product.image
        }
      }
    })

    console.log('Products connected successfully!')
  })
  .catch(error => {
    console.log('Django API Error:', error)
  })
