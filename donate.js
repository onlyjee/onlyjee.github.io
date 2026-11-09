/* JEE DEV Donasi PanzzPay — No secrets or payment-status decisions in frontend. */
(() => {
  'use strict';
  const API = String(window.JEE_DONATION_API || '').trim().replace(/\/$/, '');
  const $ = (id) => document.getElementById(id);
  const dialog = $('donate-dialog');
  if (!dialog) return;
  const open = $('donate-open'), close = $('donate-close'), create = $('donate-create');
  const amount = $('donate-amount'), message = $('donate-message'), invoice = $('donate-invoice');
  const qr = $('donate-qr'), checkout = $('donate-checkout'), total = $('donate-total');
  const invoiceId = $('donate-invoice-id'), state = $('donate-state'), timer = $('donate-timer');
  const totalCopy = $('donate-copy-total');
  let payment = null, pollTask = null, timerTask = null, inFlight = false, setupReady = false;
  const rupiah = n => new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
  const terminalStates = new Set(['paid','expired','timeout','failed','cancelled']);
  const abortPoll = () => { clearInterval(pollTask); pollTask = null; };
  const abortTimer = () => { clearInterval(timerTask); timerTask = null; };
  const say = (text, error=false) => { message.textContent = text; message.classList.toggle('is-error',error); };
  const setBusy = value => { inFlight=value; create.disabled=value || !setupReady; create.textContent=value?'MEMBUAT INVOICE...':'BUAT QRIS DINAMIS ↗'; };

  function updateClock() {
    if (!payment) return;
    const seconds = Math.max(0, Math.ceil(Number(payment.expires_at) - Date.now()/1000));
    timer.textContent = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    if (seconds===0 && payment.status==='pending') {
      timer.textContent='WAKTU INVOICE HABIS';
      // Server remains authoritative about paid/expired. Never assume paid.
    }
  }

  function showInvoice(data) {
    payment = {...(payment || {}),...data};
    invoice.hidden = false;
    invoiceId.textContent=payment.order_id || '—';
    total.textContent=rupiah(payment.payment_amount || 0);
    if (payment.qr_data_url && /^data:image\/(?:png|jpeg|webp);base64,/.test(payment.qr_data_url)) {
      qr.src=payment.qr_data_url;qr.hidden=false;
    } else { qr.hidden=true; qr.removeAttribute('src'); }
    if (payment.checkout_url && /^https:\/\/panzzpay\.my\.id\//.test(payment.checkout_url)) {
      checkout.href=payment.checkout_url;checkout.hidden=false;
    } else { checkout.hidden=true; checkout.removeAttribute('href'); }
    const statuses = {
      pending:'⏳ MENUNGGU PEMBAYARAN',paid:'✓ PEMBAYARAN BERHASIL',
      expired:'⌛ INVOICE KEDALUWARSA',timeout:'⌛ WAKTU PEMBAYARAN HABIS',
      failed:'✕ PEMBAYARAN GAGAL',cancelled:'✕ INVOICE DIBATALKAN'
    };
    state.textContent = statuses[payment.status] || '⏳ MEMERIKSA STATUS';
    state.classList.toggle('paid',payment.status==='paid');
    state.classList.toggle('expired',terminalStates.has(payment.status)&&payment.status!=='paid');
    updateClock();
    abortTimer();
    if (!terminalStates.has(payment.status)) timerTask=setInterval(updateClock,1000);
    else { abortPoll(); abortTimer(); }
    if (payment.status==='paid') {
      say('Pembayaran telah terverifikasi oleh PanzzPay. Terima kasih sudah mendukung JEE DEV!');
      try {sessionStorage.removeItem('jee-donation-token');}catch(_){}
    } else if (terminalStates.has(payment.status)) {
      say('Invoice sudah selesai atau kedaluwarsa. Kamu bisa membuat invoice baru jika diperlukan.');
      try {sessionStorage.removeItem('jee-donation-token');}catch(_){}
    }
  }

  async function readJson(response) {
    let data={};
    try {data=await response.json();}catch(_){}
    if (!response.ok) {
      throw new Error(typeof data.detail==='string' ? data.detail : `Layanan pembayaran tidak tersedia (HTTP ${response.status}).`);
    }
    return data;
  }

  async function poll() {
    if (!payment || terminalStates.has(payment.status) || inFlight || !dialog.open) return;
    try {
      const res=await fetch(`${API}/api/donations/${encodeURIComponent(payment.token)}`,{cache:'no-store'});
      const data=await readJson(res);
      showInvoice(data);
    } catch (_) { // Lost connections do not imply a failed payment.
      say('Koneksi status terputus sementara. Pengecekan pembayaran akan dicoba kembali.');
    }
  }

  async function initialize() {
    if (!API || !/^https?:\/\//.test(API)) {
      create.disabled=true;
      say('QRIS belom aktif lagi mager setting backend nya wkwk.', true);
      return;
    }
    setBusy(true);
    try {
      const result=await readJson(await fetch(`${API}/api/public-config`,{cache:'no-store'}));
      if (!result.enabled) throw new Error('Backend belum memiliki API key, webhook secret, dan URL webhook PanzzPay yang aktif.');
      setupReady=true;
      amount.min=result.min_amount;amount.max=result.max_amount;
      say('Siap membuat QRIS dinamis. Pembayaran hanya dianggap berhasil setelah diverifikasi gateway.');
      try {
        const oldToken=sessionStorage.getItem('jee-donation-token');
        if (oldToken && /^[a-zA-Z0-9_-]{28,80}$/.test(oldToken)) {
          const old=await fetch(`${API}/api/donations/${encodeURIComponent(oldToken)}`,{cache:'no-store'});
          if (old.ok) {showInvoice(await old.json());if (!terminalStates.has(payment.status)) startPolling();}
        }
      }catch(_){}
    } catch (err) {say(err.message || 'Tidak dapat menghubungi backend.', true);create.disabled=true;}
    finally {setBusy(false);}
  }

  function startPolling() {
    abortPoll();
    if (!payment || terminalStates.has(payment.status)) return;
    pollTask=setInterval(poll,5000);
  }

  open.addEventListener('click',async()=>{
    if (typeof dialog.showModal==='function') dialog.showModal();
    else dialog.setAttribute('open','');
    if (!payment) await initialize(); else if (!terminalStates.has(payment.status)) startPolling();
  });
  function hide() {if (dialog.open)dialog.close(); abortPoll();abortTimer();}
  close.addEventListener('click',hide);
  dialog.addEventListener('close',()=>{abortPoll();abortTimer()});
  dialog.addEventListener('click',e=>{if(e.target===dialog)hide()});

  document.querySelectorAll('.donate-presets button').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.classList.contains('selected')));
    button.addEventListener('click',()=>{
      amount.value=button.dataset.amount;
      document.querySelectorAll('.donate-presets button').forEach(x=>{
        x.classList.toggle('selected',x===button);
        x.setAttribute('aria-pressed',String(x===button));
      });
    });
  });
  amount.addEventListener('input',()=>document.querySelectorAll('.donate-presets button').forEach(x=>{
    const matched=x.dataset.amount===amount.value;
    x.classList.toggle('selected',matched);x.setAttribute('aria-pressed',String(matched));
  }));
  create.addEventListener('click',async()=>{
    if (inFlight || !API) return;
    const n=Number(amount.value);
    const lo=Number(amount.min)||5000,hi=Number(amount.max)||500000;
    if (!Number.isSafeInteger(n) || n<lo || n>hi) {say(`Masukkan nominal antara ${rupiah(lo)} dan ${rupiah(hi)}.`,true);return;}
    if (payment && payment.status==='pending' && Date.now()/1000<payment.expires_at) {
      say('Masih ada invoice aktif. Gunakan QRIS yang sudah tersedia agar tidak membuat tagihan ganda.',true);
      return;
    }
    setBusy(true);say('Sedang meminta QRIS dari PanzzPay...');
    try {
      const data=await readJson(await fetch(`${API}/api/donations`,{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:n}),cache:'no-store'
      }));
      showInvoice(data);
      say('QRIS berhasil dibuat. Perhatikan total dengan kode unik dan batas waktunya.');
      try {sessionStorage.setItem('jee-donation-token',data.token);}catch(_){}
      startPolling();
    } catch (err) {say(err.message || 'Tidak dapat membuat invoice.',true);}
    finally {setBusy(false);}
  });
  totalCopy.addEventListener('click',async()=>{
    if (!payment) return;
    try {await navigator.clipboard.writeText(String(payment.payment_amount));say('Nominal berhasil disalin. Pastikan jumlah tepat sesuai invoice.');}
    catch (_) {say('Gagal menyalin otomatis. Salin nominal yang ditampilkan secara manual.',true);}
  });
})();
