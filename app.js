// Dubai Ultra-Luxury Investment Advisory - Unified Simulator for Tanmay
document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    currency: 'AED', // 'AED' or 'USD'
    usdRate: 3.6725,
    selectedYear: 2028, // Default to intermediate milestone year so Tanmay sees the progression right away!
  };

  // Milestones per year
  const yearMilestones = {
    2026: {
      tag: 'Off-Plan Launch & Entry Baseline (2026)',
      desc: 'Tanmay locks in off-plan pricing. DAMAC includes 4% direct discount + 100% DLD waiver. Minimum initial cash outlay.'
    },
    2027: {
      tag: 'Emaar The Oasis Groundbreaking & Access Corridors (2027)',
      desc: 'Adjacent luxury master community begins active construction, establishing an immediate premium price floor of 2,065 AED/sq.ft.'
    },
    2028: {
      tag: 'Al Maktoum Airport (DWC) Expansion & DEC Exhibition Scaling (2028)',
      desc: 'Government shifts Dubai economic core south. Tanmay crosses the 34-40% equity threshold, unlocking DLD formal resale/flip rights.'
    },
    2029: {
      tag: 'Metro Blue Line Operations & Tilal Binghatti Handover (2029)',
      desc: 'Tilal Binghatti delivers keys in Q2 2029 (fastest exit/rental yield). Direct metro transport connects corridor to Downtown Dubai.'
    },
    2030: {
      tag: 'Full Master Community Handover: DAMAC Islands 2 & Sobha (2030)',
      desc: 'Crystal lagoons and biophilic forests fully operational. Primary-to-secondary market arbitrage reaches 100% maturity.'
    }
  };

  // Property Data with Year-by-Year Price Progression and Equity Payment Plans
  const propertyData = {
    damacTahiti: {
      id: 'damacTahiti',
      name: 'DAMAC Islands 2 (Tahiti 5BR)',
      type: '5 BR Townhouse End Unit',
      saleableArea: 3158.24,
      netPriceAED: 3764160, // 3,921,000 - 4% discount
      entryRateAED: 1191.85,
      handoverYear: 2030,
      // Values year-by-year reaching 2,000 AED/sq.ft (AED 6,316,480) at handover
      yearlyValuations: {
        2026: 3764160,
        2027: 4325000,
        2028: 5020000,
        2029: 5750000,
        2030: 6316480
      },
      // Cash disbursed by Tanmay by year (20% booking, 0.75%/mo = 9%/yr, 50% handover)
      equitySchedule: {
        2026: { pct: 0.20, aed: 752832 },
        2027: { pct: 0.29, aed: 1091606 },
        2028: { pct: 0.38, aed: 1430381 },
        2029: { pct: 0.50, aed: 1882080 },
        2030: { pct: 0.50, aed: 1882080 } // 50% paid pre-keys
      },
      status: {
        2026: '20% Down Payment Booked',
        2027: 'Under Construction (0.75%/mo)',
        2028: 'Under Construction (Flip Eligible)',
        2029: '50% Paid (Final Pre-Handover Phase)',
        2030: 'Handover Completed (June 2030)'
      }
    },
    binghatti: {
      id: 'binghatti',
      name: 'Tilal Binghatti',
      type: '4 BR Independent Villa',
      saleableArea: 2774.51,
      netPriceAED: 4540000,
      entryRateAED: 1636.32,
      handoverYear: 2029,
      // Values reaching 2,000 AED/sq.ft (AED 5,549,020) at Q2 2029 delivery, and 2,100 in 2030
      yearlyValuations: {
        2026: 4540000,
        2027: 4760000,
        2028: 5080000,
        2029: 5549020,
        2030: 5826470
      },
      // Payment plan: 10% 2026, 12% 2027, 12% 2028 = 34%, 50% handover 2029
      equitySchedule: {
        2026: { pct: 0.10, aed: 454000 },
        2027: { pct: 0.22, aed: 998800 },
        2028: { pct: 0.34, aed: 1543600 },
        2029: { pct: 0.50, aed: 2270000 }, // paid pre-keys
        2030: { pct: 1.00, aed: 4540000 }  // completed asset
      },
      status: {
        2026: '10% Booking Deposit',
        2027: 'Construction Phase 1',
        2028: '34% Paid (Fast Flip Window)',
        2029: 'KEYS HANDED OVER (Q2 2029)',
        2030: 'Delivered Villa (Rental Yielding)'
      }
    },
    sobha: {
      id: 'sobha',
      name: 'Sobha Sanctuary (The Willows)',
      type: '4 BR Middle Garden Villa',
      saleableArea: 2459.02,
      netPriceAED: 4057383,
      entryRateAED: 1650.00,
      handoverYear: 2030,
      // Values reaching 2,000 AED/sq.ft (AED 4,918,040) at handover 2030
      yearlyValuations: {
        2026: 4057383,
        2027: 4245000,
        2028: 4490000,
        2029: 4710000,
        2030: 4918040
      },
      // Payment plan: 20% down, 10% 2027, 10% 2028 = 40% paid until handover
      equitySchedule: {
        2026: { pct: 0.20, aed: 811476 },
        2027: { pct: 0.30, aed: 1217215 },
        2028: { pct: 0.40, aed: 1622953 },
        2029: { pct: 0.40, aed: 1622953 },
        2030: { pct: 0.40, aed: 1622953 } // 40% paid pre-keys
      },
      status: {
        2026: '20% Structured Booking',
        2027: '30% Construction Milestone',
        2028: '40% Construction Cap Reached',
        2029: 'Payment Pause Pre-Handover',
        2030: 'Handover Completed (August 2030)'
      }
    }
  };

  // Currency Formatter Helpers
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

  // Update Dynamic Currency Elements
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

    renderYearSimulation();
  }

  // Unified Single-Tool Simulation Engine
  function renderYearSimulation() {
    const yr = state.selectedYear;

    // 1. Update year display & active buttons
    const activeYearIndicator = document.getElementById('unified-active-year');
    if (activeYearIndicator) activeYearIndicator.textContent = yr;

    document.querySelectorAll('.unified-year-btn').forEach(btn => {
      const btnYr = parseInt(btn.getAttribute('data-year'));
      if (btnYr === yr) {
        btn.className = 'unified-year-btn py-2.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm text-center transition-all year-step-active';
      } else {
        btn.className = 'unified-year-btn py-2.5 px-2 sm:px-4 rounded-xl font-medium text-xs sm:text-sm text-center transition-all bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700';
      }
    });

    // 2. Update single milestone description
    const milestoneInfo = yearMilestones[yr];
    const milestoneTagEl = document.getElementById('unified-milestone-title');
    const milestoneDescEl = document.getElementById('unified-milestone-desc');
    if (milestoneTagEl && milestoneInfo) milestoneTagEl.textContent = milestoneInfo.tag;
    if (milestoneDescEl && milestoneInfo) milestoneDescEl.textContent = milestoneInfo.desc;

    // 3. Update the 3 property cards directly
    updateCard('tahiti', propertyData.damacTahiti, yr);
    updateCard('binghatti', propertyData.binghatti, yr);
    updateCard('sobha', propertyData.sobha, yr);
  }

  function updateCard(key, prop, yr) {
    const currentVal = prop.yearlyValuations[yr];
    const initialVal = prop.netPriceAED;
    const profit = currentVal - initialVal;
    const rate = currentVal / prop.saleableArea;
    const gainPct = (profit / initialVal) * 100;

    const equityObj = prop.equitySchedule[yr];
    const equityAED = equityObj.aed;
    const equityPct = equityObj.pct * 100;
    const coc = equityAED > 0 ? (profit / equityAED) * 100 : 0;

    // Calculate visual bar width (2026 = 25%, 2030 = 100%)
    const yearIndex = yr - 2026; // 0 to 4
    const barWidth = 25 + (yearIndex * 18.75); // 25%, 43.75%, 62.5%, 81.25%, 100%

    // DOM Elements
    const valEl = document.getElementById(`sim-${key}-val`);
    const rateEl = document.getElementById(`sim-${key}-rate`);
    const profitEl = document.getElementById(`sim-${key}-profit`);
    const gainPctEl = document.getElementById(`sim-${key}-gain-pct`);
    const equityEl = document.getElementById(`sim-${key}-equity`);
    const cocEl = document.getElementById(`sim-${key}-coc`);
    const statusEl = document.getElementById(`sim-${key}-status`);
    const barEl = document.getElementById(`sim-${key}-bar`);

    if (valEl) valEl.textContent = formatMoney(currentVal);
    if (rateEl) rateEl.textContent = formatSqftRate(rate);
    if (profitEl) {
      profitEl.textContent = (profit > 0 ? '+' : '') + formatMoney(profit);
    }
    if (gainPctEl) {
      gainPctEl.textContent = (gainPct > 0 ? '+' : '') + Math.round(gainPct) + '%';
    }
    if (equityEl) {
      equityEl.textContent = `${formatMoney(equityAED)} (${Math.round(equityPct)}%)`;
    }
    if (cocEl) {
      cocEl.textContent = (coc > 0 ? '+' : '') + Math.round(coc) + '%';
    }
    if (statusEl) {
      statusEl.textContent = prop.status[yr];
      if (yr === prop.handoverYear) {
        statusEl.className = 'text-[11px] font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      } else if (yr > prop.handoverYear) {
        statusEl.className = 'text-[11px] font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40';
      } else {
        statusEl.className = 'text-[11px] font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20';
      }
    }
    if (barEl) {
      barEl.style.width = barWidth + '%';
    }
  }

  // Unified Slider Event
  const unifiedSlider = document.getElementById('unified-year-slider');
  if (unifiedSlider) {
    unifiedSlider.addEventListener('input', (e) => {
      state.selectedYear = parseInt(e.target.value);
      renderYearSimulation();
    });
  }

  // Unified Button Events
  document.querySelectorAll('.unified-year-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const yr = parseInt(btn.getAttribute('data-year'));
      state.selectedYear = yr;
      if (unifiedSlider) unifiedSlider.value = yr;
      renderYearSimulation();
    });
  });

  // Currency Toggles
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
      if (modalTitle) modalTitle.textContent = title || 'Visual Document Inspection';
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

  // Initial load
  updateCurrencyElements();
  console.log('Dubai Unified Simulator initialized smoothly.');
});
