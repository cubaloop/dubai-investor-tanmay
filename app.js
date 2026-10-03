// Dubai Ultra-Luxury Investment Advisory - App Logic for Tanmay
document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    currency: 'AED', // 'AED' or 'USD'
    usdRate: 3.6725,
    selectedYear: 2030, // 2026, 2027, 2028, 2029, 2030
    growthScenario: 'moderate', // 'conservative' (8%), 'moderate' (11%), 'optimistic' (14%)
    targetPriceSqft: 1950, // default target exit price at 2030
  };

  // Milestones per year
  const yearMilestones = {
    2026: {
      tag: 'Off-Plan Launch & Entry Baseline',
      desc: 'Initial booking at developer off-plan pricing. Minimum cash outlay with maximum future upside.'
    },
    2027: {
      tag: 'Emaar The Oasis Groundbreaking & Access Corridors',
      desc: 'Adjacent luxury mega-developments break ground. Area price benchmarks rise +15% to +22%.'
    },
    2028: {
      tag: 'Al Maktoum Airport (DWC) Expansion & DEC Center',
      desc: 'Global logistics and airport expansion shifts Dubai center of gravity south. Flip threshold unlocked.'
    },
    2029: {
      tag: 'Metro Blue Line Operations & Tilal Binghatti Handover',
      desc: 'Tilal Binghatti delivers keys in Q2 2029 (fastest exit). Direct metro connectivity goes live.'
    },
    2030: {
      tag: 'Handover of DAMAC Islands 2 & Sobha Sanctuary',
      desc: 'Lagoon master communities mature. Full capital appreciation and primary-to-secondary market premium realized.'
    }
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
      grossPriceAED: 3921000,
      discountPct: 4,
      netPriceAED: 3764160,       // 3,921,000 - 4%
      priceSqftAED: 1191.85,      // 3,764,160 / 3158.24
      dldWaiverPct: 100,
      // Equity progression by year (% of net price paid)
      equitySchedule: {
        2026: 0.20, // 20% booking
        2027: 0.29, // +9% (0.75%/month)
        2028: 0.38, // +9%
        2029: 0.50, // +12% milestone
        2030: 0.50  // 50% paid pre-handover (50% balance on keys)
      },
      handoverYear: 2030
    },
    binghatti: {
      id: 'binghatti',
      name: 'Tilal Binghatti',
      developer: 'Binghatti Developers',
      type: '4 BR Villa',
      unitNo: 'TB-P3-R-CL54-T-6',
      saleableArea: 2774.51,
      grossPriceAED: 4540000,
      netPriceAED: 4540000,
      priceSqftAED: 1636.32,
      equitySchedule: {
        2026: 0.10, // 10% booking
        2027: 0.22, // 12% in 2027
        2028: 0.34, // 12% in 2028
        2029: 0.50, // 50% pre-handover (delivered Q2 2029)
        2030: 1.00  // 100% paid (completed property)
      },
      handoverYear: 2029
    },
    sobha: {
      id: 'sobha',
      name: 'Sobha Sanctuary - The Willows',
      developer: 'Sobha Realty',
      type: '4 BR Garden Villa (Type B)',
      unitNo: 'TWL-GV-659',
      saleableArea: 2459.02,
      grossPriceAED: 4057383,
      netPriceAED: 4057383,
      priceSqftAED: 1650.00,
      equitySchedule: {
        2026: 0.20, // 20% down
        2027: 0.30, // +10%
        2028: 0.40, // +10%
        2029: 0.40, // pauses until handover
        2030: 0.40  // 40% pre-handover (60% balance on keys)
      },
      handoverYear: 2030
    }
  };

  // Format Helpers
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

  // Progress factors by year (intercalating market growth towards 2030 exit target)
  const progressFactors = {
    2026: 0.00, // baseline
    2027: 0.22, // The Oasis launch
    2028: 0.50, // DWC Airport expansion
    2029: 0.78, // Metro Blue line & Binghatti handover
    2030: 1.00  // Full masterplan delivery
  };

  // Main Simulator Engine
  function calculateSimulator() {
    const yr = state.selectedYear;
    const targetSqft = state.targetPriceSqft;

    // Update target sqft indicator
    const targetSqftEl = document.getElementById('slider-sqft-val');
    if (targetSqftEl) {
      targetSqftEl.textContent = formatSqftRate(targetSqft);
    }

    // Update active year displays
    const displayYearEl = document.getElementById('active-sim-year');
    if (displayYearEl) displayYearEl.textContent = yr;

    const milestoneTagEl = document.getElementById('active-milestone-tag');
    const milestoneDescEl = document.getElementById('active-milestone-desc');
    if (milestoneTagEl && yearMilestones[yr]) {
      milestoneTagEl.textContent = `${yr} Catalyst: ${yearMilestones[yr].tag}`;
    }
    if (milestoneDescEl && yearMilestones[yr]) {
      milestoneDescEl.textContent = yearMilestones[yr].desc;
    }

    // Update year pill buttons visual state
    document.querySelectorAll('.btn-year-select').forEach(btn => {
      const btnYr = parseInt(btn.getAttribute('data-year'));
      if (btnYr === yr) {
        btn.classList.add('bg-amber-500', 'text-slate-950', 'font-extrabold', 'shadow-lg');
        btn.classList.remove('bg-slate-900', 'text-slate-300');
      } else {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'font-extrabold', 'shadow-lg');
        btn.classList.add('bg-slate-900', 'text-slate-300');
      }
    });

    const factor = progressFactors[yr];

    // Compute for each property for the SELECTED year
    // DAMAC Tahiti
    const tahitiBase = properties.damacTahiti.netPriceAED;
    const tahitiFinal = properties.damacTahiti.saleableArea * targetSqft;
    const tahitiVal = tahitiBase + (tahitiFinal - tahitiBase) * factor;
    const tahitiProfit = tahitiVal - tahitiBase;
    const tahitiRate = tahitiVal / properties.damacTahiti.saleableArea;
    const tahitiEquityPct = properties.damacTahiti.equitySchedule[yr];
    const tahitiEquityAED = tahitiBase * tahitiEquityPct;
    const tahitiCashOnCash = tahitiEquityAED > 0 ? (tahitiProfit / tahitiEquityAED) * 100 : 0;
    const tahitiAssetGain = (tahitiProfit / tahitiBase) * 100;

    // Binghatti
    const bingBase = properties.binghatti.netPriceAED;
    const bingFinal = properties.binghatti.saleableArea * targetSqft;
    const bingVal = bingBase + (bingFinal - bingBase) * factor;
    const bingProfit = bingVal - bingBase;
    const bingRate = bingVal / properties.binghatti.saleableArea;
    const bingEquityPct = properties.binghatti.equitySchedule[yr];
    const bingEquityAED = bingBase * bingEquityPct;
    const bingCashOnCash = bingEquityAED > 0 ? (bingProfit / bingEquityAED) * 100 : 0;
    const bingAssetGain = (bingProfit / bingBase) * 100;

    // Sobha
    const sobhaBase = properties.sobha.netPriceAED;
    const sobhaFinal = properties.sobha.saleableArea * targetSqft;
    const sobhaVal = sobhaBase + (sobhaFinal - sobhaBase) * factor;
    const sobhaProfit = sobhaVal - sobhaBase;
    const sobhaRate = sobhaVal / properties.sobha.saleableArea;
    const sobhaEquityPct = properties.sobha.equitySchedule[yr];
    const sobhaEquityAED = sobhaBase * sobhaEquityPct;
    const sobhaCashOnCash = sobhaEquityAED > 0 ? (sobhaProfit / sobhaEquityAED) * 100 : 0;
    const sobhaAssetGain = (sobhaProfit / sobhaBase) * 100;

    // Update Cards
    updatePropertyCard('tahiti', tahitiVal, tahitiRate, tahitiProfit, tahitiAssetGain, tahitiCashOnCash, tahitiEquityAED, tahitiEquityPct, yr, 2030);
    updatePropertyCard('binghatti', bingVal, bingRate, bingProfit, bingAssetGain, bingCashOnCash, bingEquityAED, bingEquityPct, yr, 2029);
    updatePropertyCard('sobha', sobhaVal, sobhaRate, sobhaProfit, sobhaAssetGain, sobhaCashOnCash, sobhaEquityAED, sobhaEquityPct, yr, 2030);

    // Update Bottom Full Trajectory Table (all years 2026-2030)
    updateFullTrajectoryTable(targetSqft, tahitiFinal, bingFinal, sobhaFinal);
  }

  function updatePropertyCard(key, val, rate, profit, assetGain, coc, equityAED, equityPct, curYr, handoverYr) {
    const valEl = document.getElementById(`sim-${key}-exit`);
    const rateEl = document.getElementById(`sim-${key}-rate`);
    const profitEl = document.getElementById(`sim-${key}-profit`);
    const roiEl = document.getElementById(`sim-${key}-roi`);
    const cocEl = document.getElementById(`sim-${key}-coc`);
    const equityEl = document.getElementById(`sim-${key}-equity`);
    const statusEl = document.getElementById(`sim-${key}-status`);

    if (valEl) valEl.textContent = formatMoney(val);
    if (rateEl) rateEl.textContent = formatSqftRate(rate);
    if (profitEl) profitEl.textContent = (profit >= 0 ? '+' : '') + formatMoney(profit);
    if (roiEl) roiEl.textContent = '+' + Math.round(assetGain) + '%';
    if (cocEl) cocEl.textContent = '+' + Math.round(coc) + '%';
    if (equityEl) equityEl.textContent = `${formatMoney(equityAED)} (${Math.round(equityPct * 100)}%)`;

    if (statusEl) {
      if (curYr < handoverYr) {
        statusEl.textContent = `Under Construction (${curYr})`;
        statusEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30';
      } else if (curYr === handoverYr) {
        statusEl.textContent = `Handover Year (${curYr})`;
        statusEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      } else {
        statusEl.textContent = `Post-Handover / Matured`;
        statusEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30';
      }
    }
  }

  function updateFullTrajectoryTable(targetSqft, tahitiFinal, bingFinal, sobhaFinal) {
    const years = [2026, 2027, 2028, 2029, 2030];
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

  // Year Selection Listeners (Slider and Buttons)
  const sliderYear = document.getElementById('slider-sim-year');
  if (sliderYear) {
    sliderYear.addEventListener('input', (e) => {
      state.selectedYear = parseInt(e.target.value);
      calculateSimulator();
    });
  }

  document.querySelectorAll('.btn-year-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const yr = parseInt(btn.getAttribute('data-year'));
      state.selectedYear = yr;
      if (sliderYear) sliderYear.value = yr;
      calculateSimulator();
    });
  });

  // Target Exit Price Slider
  const sqftSlider = document.getElementById('slider-exit-sqft');
  if (sqftSlider) {
    sqftSlider.addEventListener('input', (e) => {
      state.targetPriceSqft = parseFloat(e.target.value);
      calculateSimulator();
    });
  }

  // Growth Scenario Buttons
  const scenarioButtons = document.querySelectorAll('.btn-scenario');
  scenarioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioButtons.forEach(b => {
        b.classList.remove('bg-amber-500/30', 'text-amber-200', 'border-amber-400');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('bg-amber-500/30', 'text-amber-200', 'border-amber-400');
      btn.classList.remove('text-slate-400');

      const val = parseFloat(btn.getAttribute('data-target-sqft'));
      state.targetPriceSqft = val;
      if (sqftSlider) sqftSlider.value = val;
      calculateSimulator();
    });
  });

  // Hamburger Drawer Logic
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
});
