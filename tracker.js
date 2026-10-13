// Dubai Private Advisory - Invisible Telemetry & Live Visitor Duration Engine
(function () {
  const CONFIG = {
    supabaseUrl: 'https://jyrqzjctkmzdvmraqrcv.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cnF6amN0a216ZHZtcmFxcmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI4MTU3NCwiZXhwIjoyMTAxODU3NTc0fQ.jpzy38i_JqhKiLZwNFXESJo62kk4vWvwCVPLpFIyLjc',
    excludedIPs: ['176.205.16.195'],
    excludedSubnets: ['176.205.'],
    heartbeatIntervalMs: 15000, // 15 seconds
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isAdminView = urlParams.get('admin') === 'david' || urlParams.get('view') === 'spy';

  // 1. Advisor Exclusion Mode
  if (isAdminView) {
    localStorage.setItem('dubai_advisor_excluded', 'true');
    localStorage.setItem('dubai_advisor_ip', '176.205.16.195');
  }

  const isExcludedDevice = localStorage.getItem('dubai_advisor_excluded') === 'true';

  // State
  let sessionId = sessionStorage.getItem('dubai_adv_sess_id');
  let sessionStartTime = parseInt(sessionStorage.getItem('dubai_adv_start_time') || Date.now());
  let lastPingTime = Date.now();
  let sectionsViewed = new Set(JSON.parse(sessionStorage.getItem('dubai_adv_sections') || '["hero"]'));
  let simulatorInteractions = parseInt(sessionStorage.getItem('dubai_adv_sim_count') || '0');
  let clientGeo = null;
  let isTrackingActive = false;

  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let device = 'Desktop PC';
    if (/iPhone/i.test(ua)) device = 'Apple iPhone';
    else if (/iPad/i.test(ua)) device = 'Apple iPad';
    else if (/Android/i.test(ua)) device = 'Android Device';
    else if (/Macintosh/i.test(ua)) device = 'Apple Mac';
    else if (/Windows/i.test(ua)) device = 'Windows PC';
    return device;
  }

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  }

  // 2. Secret Admin Dashboard Loader
  if (isAdminView) {
    window.addEventListener('DOMContentLoaded', initAdminDashboard);
  }

  // 3. Telemetry Engine for External Visitors
  async function initTelemetry() {
    if (isExcludedDevice) {
      console.log('[Telemetry] Advisor device recognized. Tracking disabled.');
      return;
    }

    try {
      // Fetch Client IP & Geo
      let ipData = null;
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) ipData = await res.json();
      } catch (e) {
        try {
          const res2 = await fetch('https://ipwho.is/');
          if (res2.ok) ipData = await res2.json();
        } catch (e2) {}
      }

      if (!ipData || !ipData.ip) return;
      clientGeo = ipData;

      // Check if IP matches David's IP
      const clientIp = ipData.ip;
      if (CONFIG.excludedIPs.includes(clientIp) || CONFIG.excludedSubnets.some(sub => clientIp.startsWith(sub))) {
        localStorage.setItem('dubai_advisor_excluded', 'true');
        console.log('[Telemetry] Advisor IP recognized (' + clientIp + '). Session ignored.');
        return;
      }

      // Start Tracking Session
      if (!sessionId) {
        sessionId = (crypto.randomUUID ? crypto.randomUUID() : 'sess_' + Math.random().toString(36).substring(2) + Date.now());
        sessionStorage.setItem('dubai_adv_sess_id', sessionId);
        sessionStorage.setItem('dubai_adv_start_time', sessionStartTime.toString());
      }

      isTrackingActive = true;
      await createInitialSession();

      // Start periodic heartbeat
      setInterval(sendHeartbeat, CONFIG.heartbeatIntervalMs);

      // Section visibility observer
      setupSectionObserver();

      // Listen for exit
      window.addEventListener('beforeunload', sendFinalUpdate);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') sendFinalUpdate();
      });

      // Simulator engagement observer
      const simSlider = document.getElementById('unified-year-slider');
      if (simSlider) {
        simSlider.addEventListener('change', () => {
          simulatorInteractions++;
          sessionStorage.setItem('dubai_adv_sim_count', simulatorInteractions.toString());
        });
      }
    } catch (err) {
      // Silent error handling (never disrupts page for visitor)
    }
  }

  async function createInitialSession() {
    const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);
    const device = getDeviceInfo();
    const city = clientGeo.city || 'UAE';
    const country = clientGeo.country_name || clientGeo.country || 'United Arab Emirates';

    const payload = {
      id: sessionId,
      full_name: 'Tanmay (Visitor Session)',
      platform: 'Dubai-Advisory-Tracker',
      campaign_name: 'dubai-investor-tanmay',
      ad_name: `${city}, ${country} | ${device}`,
      lead_status: 'ACTIVE_NOW',
      budget_aed: durationSec,
      comments: JSON.stringify({
        ip: clientGeo.ip,
        city: city,
        country: country,
        device: device,
        userAgent: navigator.userAgent,
        startTime: new Date(sessionStartTime).toISOString(),
        durationSeconds: durationSec,
        durationFormatted: formatDuration(durationSec),
        sectionsViewed: Array.from(sectionsViewed),
        simulatorUsed: simulatorInteractions > 0,
        simulatorInteractions: simulatorInteractions,
        active: true,
        lastPing: new Date().toISOString()
      }),
      notes: [
        `Started at ${new Date(sessionStartTime).toLocaleTimeString()}`,
        `Location: ${city}, ${country} (${device})`
      ]
    };

    try {
      await fetch(`${CONFIG.supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
  }

  async function sendHeartbeat() {
    if (!isTrackingActive || !sessionId) return;
    const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);

    const payload = {
      budget_aed: durationSec,
      lead_status: 'ACTIVE_NOW',
      comments: JSON.stringify({
        ip: clientGeo ? clientGeo.ip : '',
        city: clientGeo ? (clientGeo.city || 'UAE') : 'UAE',
        country: clientGeo ? (clientGeo.country_name || 'UAE') : 'UAE',
        device: getDeviceInfo(),
        startTime: new Date(sessionStartTime).toISOString(),
        durationSeconds: durationSec,
        durationFormatted: formatDuration(durationSec),
        sectionsViewed: Array.from(sectionsViewed),
        simulatorUsed: simulatorInteractions > 0,
        simulatorInteractions: simulatorInteractions,
        active: true,
        lastPing: new Date().toISOString()
      })
    };

    try {
      await fetch(`${CONFIG.supabaseUrl}/rest/v1/leads?id=eq.${sessionId}`, {
        method: 'PATCH',
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
  }

  function sendFinalUpdate() {
    if (!isTrackingActive || !sessionId) return;
    const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);

    const payload = {
      budget_aed: durationSec,
      lead_status: 'COMPLETED',
      comments: JSON.stringify({
        ip: clientGeo ? clientGeo.ip : '',
        city: clientGeo ? (clientGeo.city || 'UAE') : 'UAE',
        country: clientGeo ? (clientGeo.country_name || 'UAE') : 'UAE',
        device: getDeviceInfo(),
        startTime: new Date(sessionStartTime).toISOString(),
        durationSeconds: durationSec,
        durationFormatted: formatDuration(durationSec),
        sectionsViewed: Array.from(sectionsViewed),
        simulatorUsed: simulatorInteractions > 0,
        simulatorInteractions: simulatorInteractions,
        active: false,
        endedAt: new Date().toISOString()
      })
    };

    // Use keepalive fetch so it completes even if tab closes
    try {
      fetch(`${CONFIG.supabaseUrl}/rest/v1/leads?id=eq.${sessionId}`, {
        method: 'PATCH',
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (e) {}
  }

  function setupSectionObserver() {
    const sectionIds = ['verdict', 'market-map', 'comparison', 'simulator', 'catalysts', 'developers', 'portfolio', 'blueprints'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sectionsViewed.add(entry.target.id);
          sessionStorage.setItem('dubai_adv_sections', JSON.stringify(Array.from(sectionsViewed)));
        }
      });
    }, { threshold: 0.3 });

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // 4. Private Spy Dashboard (Only rendered when ?admin=david is passed)
  async function initAdminDashboard() {
    // Create Secret Admin Panel Modal
    const panel = document.createElement('div');
    panel.id = 'advisor-spy-panel';
    panel.className = 'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[9999] bg-[#0c1017]/98 border border-amber-500/40 rounded-2xl shadow-2xl p-5 backdrop-blur-xl text-white font-sans text-xs transition-all duration-300';
    panel.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center space-x-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="font-bold text-amber-300 tracking-wider uppercase text-[11px]">Centro de Telemetr?a ? Asesor David</span>
        </div>
        <button id="close-spy-panel" class="text-slate-400 hover:text-white p-1">&times;</button>
      </div>

      <div class="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300">
        <div class="flex justify-between items-center">
          <span class="text-slate-400">Tu IP actual:</span>
          <span class="font-bold text-emerald-400">176.205.16.195 (Descartada)</span>
        </div>
        <div class="text-[10px] text-slate-400 mt-1">Tus visitas en esta laptop y m?vil no se contabilizan.</div>
      </div>

      <div class="mt-4">
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold text-slate-300 uppercase text-[10px] tracking-wider">Sesiones Externas Registradas</span>
          <button id="refresh-spy-data" class="text-[10px] text-amber-400 hover:underline">Actualizar datos</button>
        </div>
        <div id="spy-sessions-list" class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          <div class="text-center py-4 text-slate-500">Cargando registros...</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    document.getElementById('close-spy-panel').onclick = () => panel.remove();
    document.getElementById('refresh-spy-data').onclick = fetchAndRenderAdminData;

    await fetchAndRenderAdminData();
  }

  async function fetchAndRenderAdminData() {
    const container = document.getElementById('spy-sessions-list');
    if (!container) return;
    container.innerHTML = '<div class="text-center py-3 text-slate-400">Consultando base de datos...</div>';

    try {
      const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/leads?platform=eq.Dubai-Advisory-Tracker&order=created_at.desc&limit=20`, {
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch data');
      const sessions = await res.json();

      if (sessions.length === 0) {
        container.innerHTML = `
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            <span class="block text-amber-300 font-bold mb-1">0 Visitas Externas A?n</span>
            <span class="text-[10px]">El sistema est? activo y esperando a que Tanmay abra el enlace. Tus visitas ya est?n descartadas.</span>
          </div>
        `;
        return;
      }

      container.innerHTML = sessions.map(s => {
        let details = {};
        try { details = JSON.parse(s.comments || '{}'); } catch (e) {}
        const durationSec = s.budget_aed || details.durationSeconds || 0;
        const durFormatted = formatDuration(durationSec);
        const isActive = s.lead_status === 'ACTIVE_NOW' && (Date.now() - new Date(details.lastPing || s.created_at).getTime()) < 60000;
        const dateStr = new Date(s.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

        return `
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="font-bold text-white text-[11px]">${details.device || 'Dispositivo'}</span>
              <span class="px-2 py-0.5 rounded text-[9px] font-bold ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
                ${isActive ? '?? En l?nea ahora' : 'Finalizada'}
              </span>
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-400">Ubicaci?n:</span>
              <span class="text-slate-200">${details.city || 'UAE'}, ${details.country || 'EAU'}</span>
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-400">Tiempo en la web:</span>
              <span class="font-bold text-amber-300">${durFormatted} (${durationSec} seg)</span>
            </div>
            <div class="flex justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1 mt-1">
              <span>Fecha: ${dateStr}</span>
              <span>Simulador: ${details.simulatorUsed ? 'S? prob?' : 'No'}</span>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      container.innerHTML = '<div class="text-center py-2 text-rose-400 text-[10px]">Error al consultar registros.</div>';
    }
  }

  // Start silently
  initTelemetry();
})();
