// Dubai Ultra-Luxury Investment Advisory - App Logic for Tanmay
document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    currency: 'AED', // 'AED' or 'USD'
    usdRate: 3.6725,
    targetPriceSqft: 1950, // default target exit price in AED/sqft
    rentalYield: 8.0,      // default rental yield %
    holdStrategy: 'handover', // 'handover' or 'post-handover'
  };

  // Property Data
  const properties = {
    damacTahiti: {
      id: 'damacTahiti',
      name: 'DAMAC Islands 2 - Tahiti 2',
      developer: 'DAMAC Properties',
      type: '5 BR Townhouse (End Unit)',
      unitNo: 'A126X10',
      saleableArea: 3158.24,
      plotArea: 2363.75,
      priceAED: 3921000,
      priceSqftAED: 1241.51,
      depositAED: 784200,
      depositPct: 20,
      completionEquityPct: 50,
      handoverDate: 'June 2030',
      handoverYear: 2030,
      badge: 'Highest Absolute Profit & Cash-on-Cash ROI',
      tagColor: 'amber',
      surroundingBenchmarkAED: 1977, // Acres & Athlon avg
    },
    damacAntigua: {
      id: 'damacAntigua',
      name: 'DAMAC Islands 2 - Antigua 1',
      developer: 'DAMAC Properties',
      type: '4 BR Townhouse (Mid Unit)',
      unitNo: 'C026X04',
      saleableArea: 2185.50,
      plotArea: 1550.00,
      priceAED: 3329000,
      priceSqftAED: 1523.22,
      depositAED: 798960,
      depositPct: 24,
      completionEquityPct: 75,
      handoverDate: 'Dec 2030',
      handoverYear: 2030,
      badge: 'Lowest Ticket Entry Price',
      tagColor: 'blue',
      surroundingBenchmarkAED: 1977,
    },
    binghatti: {
      id: 'binghatti',
      name: 'Tilal Binghatti',
      developer: 'Binghatti Developers',
      type: '4 BR Villa',
      unitNo: 'TB-P3-R-CL54-T-6',
      saleableArea: 2774.51,
      plotArea: 1734.44,
      priceAED: 4540000,
      priceSqftAED: 1636.32,
      depositAED: 454000,
      depositPct: 10,
      completionEquityPct: 50,
      handoverDate: 'Q2 2029 (Fastest Delivery)',
      handoverYear: 2029,
      badge: 'Fastest Capital Turnaround & Early Exit',
      tagColor: 'emerald',
      surroundingBenchmarkAED: 1759,
    },
    sobha: {
      id: 'sobha',
      name: 'Sobha Sanctuary - The Willows',
      developer: 'Sobha Realty',
      type: '4 BR Garden Villa (Type B)',
      unitNo: 'TWL-GV-659',
      saleableArea: 2459.02,
      plotArea: 1870.34,
      priceAED: 4057383,
      priceSqftAED: 1650.00,
      depositAED: 811476.60,
      depositPct: 20,
      completionEquityPct: 40, // 40% paid before handover, 60% at handover
      handoverDate: 'August 2030',
      handoverYear: 2030,
      badge: 'Supreme Quality & Long-Term Wealth Preservation',
      tagColor: 'purple',
      surroundingBenchmarkAED: 1736,
    }
  };

  // Format Helper
  function formatMoney(amountAED, showDecimals = false) {
    if (state.currency === 'USD') {
      const val = amountAED / state.usdRate;
      return '$' + Math.round(val).toLocaleString('en-US');
    } else {
      return 'AED ' + Math.round(amountAED).toLocaleString('en-US');
    }
  }

  function formatSqftRate(rateAED) {
    if (state.currency === 'USD') {
      const val = rateAED / state.usdRate;
      return '$' + Math.round(val).toLocaleString('en-US') + '/sq.ft';
    } else {
      return Math.round(rateAED).toLocaleString('en-US') + ' AED/sq.ft';
    }
  }

  // Update Dynamic Currency Across Page
  function updateCurrencyElements() {
    document.querySelectorAll('[data-currency-aed]').forEach(el => {
      const aedVal = parseFloat(el.getAttribute('data-currency-aed'));
      el.textContent = formatMoney(aedVal);
    });

    document.querySelectorAll('[data-sqft-rate-aed]').forEach(el => {
      const aedVal = parseFloat(el.getAttribute('data-sqft-rate-aed'));
      el.textContent = formatSqftRate(aedVal);
    });

    const activeCurrencyBadge = document.getElementById('current-currency-label');
    if (activeCurrencyBadge) {
      activeCurrencyBadge.textContent = state.currency;
    }

    const usdBtn = document.getElementById('btn-currency-usd');
    const aedBtn = document.getElementById('btn-currency-aed');
    if (usdBtn && aedBtn) {
      if (state.currency === 'USD') {
        usdBtn.classList.add('bg-amber-500/20', 'text-amber-300', 'border-amber-500/40');
        usdBtn.classList.remove('text-slate-400');
        aedBtn.classList.remove('bg-amber-500/20', 'text-amber-300', 'border-amber-500/40');
        aedBtn.classList.add('text-slate-400');
      } else {
        aedBtn.classList.add('bg-amber-500/20', 'text-amber-300', 'border-amber-500/40');
        aedBtn.classList.remove('text-slate-400');
        usdBtn.classList.remove('bg-amber-500/20', 'text-amber-300', 'border-amber-500/40');
        usdBtn.classList.add('text-slate-400');
      }
    }

    // Re-run simulator calculations with current currency
    calculateSimulator();
  }

  // Simulator Calculations
  function calculateSimulator() {
    const targetSqft = state.targetPriceSqft;
    const targetSqftEl = document.getElementById('slider-sqft-val');
    if (targetSqftEl) {
      targetSqftEl.textContent = formatSqftRate(targetSqft);
    }

    // DAMAC Tahiti 5BR
    const tahitiExitVal = properties.damacTahiti.saleableArea * targetSqft;
    const tahitiProfit = tahitiExitVal - properties.damacTahiti.priceAED;
    const tahitiROI = (tahitiProfit / properties.damacTahiti.priceAED) * 100;
    const tahitiPaidEquity = properties.damacTahiti.priceAED * 0.50; // 50% paid until handover
    const tahitiCashOnCash = (tahitiProfit / tahitiPaidEquity) * 100;

    // Tilal Binghatti 4BR
    const bingExitVal = properties.binghatti.saleableArea * targetSqft;
    const bingProfit = bingExitVal - properties.binghatti.priceAED;
    const bingROI = (bingProfit / properties.binghatti.priceAED) * 100;
    const bingPaidEquity = properties.binghatti.priceAED * 0.50; // 50% paid until handover 2029
    const bingCashOnCash = (bingProfit / bingPaidEquity) * 100;

    // Sobha Sanctuary 4BR
    const sobhaExitVal = properties.sobha.saleableArea * targetSqft;
    const sobhaProfit = sobhaExitVal - properties.sobha.priceAED;
    const sobhaROI = (sobhaProfit / properties.sobha.priceAED) * 100;
    const sobhaPaidEquity = properties.sobha.priceAED * 0.40; // 40% paid before handover
    const sobhaCashOnCash = (sobhaProfit / sobhaPaidEquity) * 100;

    // Update UI elements
    updateCardMetrics('tahiti', tahitiExitVal, tahitiProfit, tahitiROI, tahitiCashOnCash);
    updateCardMetrics('binghatti', bingExitVal, bingProfit, bingROI, bingCashOnCash);
    updateCardMetrics('sobha', sobhaExitVal, sobhaProfit, sobhaROI, sobhaCashOnCash);
  }

  function updateCardMetrics(key, exitVal, profit, roi, cashOnCash) {
    const exitValEl = document.getElementById(`sim-${key}-exit`);
    const profitEl = document.getElementById(`sim-${key}-profit`);
    const roiEl = document.getElementById(`sim-${key}-roi`);
    const cocEl = document.getElementById(`sim-${key}-coc`);

    if (exitValEl) exitValEl.textContent = formatMoney(exitVal);
    if (profitEl) profitEl.textContent = '+' + formatMoney(profit);
    if (roiEl) roiEl.textContent = '+' + Math.round(roi) + '%';
    if (cocEl) cocEl.textContent = '+' + Math.round(cashOnCash) + '%';
  }

  // Event Listeners for Currency
  const btnUSD = document.getElementById('btn-currency-usd');
  const btnAED = document.getElementById('btn-currency-aed');
  if (btnUSD) {
    btnUSD.addEventListener('click', () => {
      state.currency = 'USD';
      updateCurrencyElements();
    });
  }
  if (btnAED) {
    btnAED.addEventListener('click', () => {
      state.currency = 'AED';
      updateCurrencyElements();
    });
  }

  // Event Listener for Slider
  const sqftSlider = document.getElementById('slider-exit-sqft');
  if (sqftSlider) {
    sqftSlider.addEventListener('input', (e) => {
      state.targetPriceSqft = parseFloat(e.target.value);
      calculateSimulator();
    });
  }

  // Modal Blueprint & Map Viewer
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.getElementById('modal-close');

  window.openImageModal = function(src, title) {
    if (modal && modalImg) {
      modalImg.src = src;
      if (modalTitle) modalTitle.textContent = title || 'Visual Inspection';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  };

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
      }
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Initialize
  updateCurrencyElements();
  calculateSimulator();
  console.log('Dubai Advisory Portal initialized for Tanmay.');
});
