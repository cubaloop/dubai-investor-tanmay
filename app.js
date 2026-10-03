// Dubai Ultra-Luxury Investment Advisory - App Logic for Tanmay
document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    currency: 'AED', // 'AED' or 'USD'
    usdRate: 3.6725,
    targetPriceSqft: 1950, // default target exit price in AED/sqft at 2030
  };

  // Property Data (with DAMAC 4% direct discount + 100% DLD waiver)
  const properties = {
    damacTahiti: {
      id: 'damacTahiti',
      name: 'DAMAC Islands 2 - Tahiti 2',
      developer: 'DAMAC Properties',
      type: '5 BR Townhouse (End Unit)',
      unitNo: 'A126X10',
      saleableArea: 3158.24,
      plotArea: 2363.75,
      grossPriceAED: 3921000,
      discountPct: 4,
      discountAED: 156840,
      netPriceAED: 3764160,       // 3,921,000 - 4%
      priceSqftAED: 1191.85,      // 3,764,160 / 3158.24
      dldWaiverPct: 100,          // 4% DLD Waived
      dldSavingsAED: 156840,
      totalIncentiveAED: 313680,  // Discount + DLD Waiver
      depositPct: 20,
      depositAED: 752832,         // 20% of net
      completionEquityPct: 50,    // 50% paid until handover
      handoverDate: 'June 2030',
      handoverYear: 2030,
    },
    damacAntigua: {
      id: 'damacAntigua',
      name: 'DAMAC Islands 2 - Antigua 1',
      developer: 'DAMAC Properties',
      type: '4 BR Townhouse (Mid Unit)',
      unitNo: 'C026X04',
      saleableArea: 2185.50,
      plotArea: 1550.00,
      grossPriceAED: 3329000,
      discountPct: 4,
      discountAED: 133160,
      netPriceAED: 3195840,
      priceSqftAED: 1462.29,
      dldWaiverPct: 100,
      dldSavingsAED: 133160,
      totalIncentiveAED: 266320,
      depositPct: 24,
      depositAED: 767000,
      completionEquityPct: 75,
      handoverDate: 'Dec 2030',
      handoverYear: 2030,
    },
    binghatti: {
      id: 'binghatti',
      name: 'Tilal Binghatti',
      developer: 'Binghatti Developers',
      type: '4 BR Villa',
      unitNo: 'TB-P3-R-CL54-T-6',
      saleableArea: 2774.51,
      plotArea: 1734.44,
      grossPriceAED: 4540000,
      netPriceAED: 4540000,
      priceSqftAED: 1636.32,
      depositAED: 454000,
      depositPct: 10,
      completionEquityPct: 50,
      handoverDate: 'Q2 2029 (Fastest Delivery)',
      handoverYear: 2029,
    },
    sobha: {
      id: 'sobha',
      name: 'Sobha Sanctuary - The Willows',
      developer: 'Sobha Realty',
      type: '4 BR Garden Villa (Type B)',
      unitNo: 'TWL-GV-659',
      saleableArea: 2459.02,
      plotArea: 1870.34,
      grossPriceAED: 4057383,
      netPriceAED: 4057383,
      priceSqftAED: 1650.00,
      depositAED: 811476.60,
      depositPct: 20,
      completionEquityPct: 40,
      handoverDate: 'August 2030',
      handoverYear: 2030,
    }
  };

  // Format Helper
  function formatMoney(amountAED) {
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

    calculateSimulator();
  }

  // Simulator Calculations & Year-by-Year Projections
  function calculateSimulator() {
    const targetSqft = state.targetPriceSqft;
    const targetSqftEl = document.getElementById('slider-sqft-val');
    if (targetSqftEl) {
      targetSqftEl.textContent = formatSqftRate(targetSqft);
    }

    // DAMAC Tahiti 5BR End Unit
    const tahitiExitVal = properties.damacTahiti.saleableArea * targetSqft;
    const tahitiProfit = tahitiExitVal - properties.damacTahiti.netPriceAED;
    const tahitiROI = (tahitiProfit / properties.damacTahiti.netPriceAED) * 100;
    const tahitiPaidEquity = properties.damacTahiti.netPriceAED * 0.50; // 50% paid until handover
    const tahitiCashOnCash = (tahitiProfit / tahitiPaidEquity) * 100;

    // Tilal Binghatti 4BR
    const bingExitVal = properties.binghatti.saleableArea * targetSqft;
    const bingProfit = bingExitVal - properties.binghatti.netPriceAED;
    const bingROI = (bingProfit / properties.binghatti.netPriceAED) * 100;
    const bingPaidEquity = properties.binghatti.netPriceAED * 0.50;
    const bingCashOnCash = (bingProfit / bingPaidEquity) * 100;

    // Sobha Sanctuary 4BR
    const sobhaExitVal = properties.sobha.saleableArea * targetSqft;
    const sobhaProfit = sobhaExitVal - properties.sobha.netPriceAED;
    const sobhaROI = (sobhaProfit / properties.sobha.netPriceAED) * 100;
    const sobhaPaidEquity = properties.sobha.netPriceAED * 0.40;
    const sobhaCashOnCash = (sobhaProfit / sobhaPaidEquity) * 100;

    // Update Overall Cards
    updateCardMetrics('tahiti', tahitiExitVal, tahitiProfit, tahitiROI, tahitiCashOnCash);
    updateCardMetrics('binghatti', bingExitVal, bingProfit, bingROI, bingCashOnCash);
    updateCardMetrics('sobha', sobhaExitVal, sobhaProfit, sobhaROI, sobhaCashOnCash);

    // Calculate Year-by-Year Valuation Trajectory (2026 - 2030)
    updateYearlyTrajectory(targetSqft, tahitiExitVal, bingExitVal, sobhaExitVal);
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

  // Yearly Growth Curve Engine
  function updateYearlyTrajectory(targetSqft, tahitiFinal, bingFinal, sobhaFinal) {
    const years = [2026, 2027, 2028, 2029, 2030];
    
    // Proportional progress curves towards handover
    // 2026: Base 0%
    // 2027: +22% of total gain (Corridor launch & The Oasis start)
    // 2028: +48% of total gain (DWC early phases & DEC expansion)
    // 2029: +78% of total gain (Metro Blue Line opening & Binghatti delivery)
    // 2030: 100% of target value at handover
    const progressFactors = {
      2026: 0.00,
      2027: 0.22,
      2028: 0.50,
      2029: 0.78,
      2030: 1.00
    };

    const tahitiBase = properties.damacTahiti.netPriceAED;
    const bingBase = properties.binghatti.netPriceAED;
    const sobhaBase = properties.sobha.netPriceAED;

    years.forEach(yr => {
      const f = progressFactors[yr];
      const valTahiti = tahitiBase + (tahitiFinal - tahitiBase) * f;
      const valBing = bingBase + (bingFinal - bingBase) * f;
      const valSobha = sobhaBase + (sobhaFinal - sobhaBase) * f;

      const elTahiti = document.getElementById(`yr-${yr}-tahiti`);
      const elBing = document.getElementById(`yr-${yr}-bing`);
      const elSobha = document.getElementById(`yr-${yr}-sobha`);

      if (elTahiti) elTahiti.textContent = formatMoney(valTahiti);
      if (elBing) elBing.textContent = formatMoney(valBing);
      if (elSobha) elSobha.textContent = formatMoney(valSobha);
    });
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

  // Side Drawer Navigation Logic (Hamburger Button)
  const btnHamburger = document.getElementById('btn-hamburger');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const sideDrawer = document.getElementById('side-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  function openDrawer() {
    if (sideDrawer && drawerBackdrop) {
      sideDrawer.classList.remove('drawer-closed');
      sideDrawer.classList.add('drawer-open');
      drawerBackdrop.classList.remove('backdrop-closed');
      drawerBackdrop.classList.add('backdrop-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (sideDrawer && drawerBackdrop) {
      sideDrawer.classList.remove('drawer-open');
      sideDrawer.classList.add('drawer-closed');
      drawerBackdrop.classList.remove('backdrop-open');
      drawerBackdrop.classList.add('backdrop-closed');
      document.body.style.overflow = 'auto';
    }
  }

  if (btnHamburger) btnHamburger.addEventListener('click', openDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // Close drawer when any nav link is clicked
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

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
  console.log('Dubai Advisory Portal updated with sliding drawer and yearly valuation engine for Tanmay.');
});
