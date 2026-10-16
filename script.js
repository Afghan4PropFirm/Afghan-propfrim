const langSwitch = document.getElementById('langSwitch');
let currentLang = 'en';
const year = document.getElementById('year');
year.textContent = new Date().getFullYear();

function setLanguage(lang) {
  currentLang = lang;
  document.body.classList.toggle('fa', lang === 'fa');
  document.documentElement.lang = lang === 'fa' ? 'fa' : 'en';
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en][data-fa]').forEach((el) => {
    el.innerHTML = lang === 'fa' ? el.dataset.fa : el.dataset.en;
  });
  langSwitch.textContent = lang === 'fa' ? 'English' : 'دری';
}
langSwitch.addEventListener('click', () => setLanguage(currentLang === 'en' ? 'fa' : 'en'));


// Demo form intentionally does not submit or persist any data.
const demoForm = document.getElementById('demoForm');
if (demoForm) {
  demoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = document.getElementById('formMessage');
    message.textContent = currentLang === 'fa'
      ? 'این فقط پیش‌نمایش است؛ اطلاعات ارسال یا ذخیره نشد.'
      : 'Preview only — nothing was submitted or saved.';
  });
}

const demoAccount = document.getElementById('demoAccount');
if (demoAccount) {
  const data = {'1000':{balance:1000,equity:1030.5,profit:30.5,target:80},'10000':{balance:10000,equity:10245,profit:245,target:800}};
  const money = n => (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  function updateDashboard(){
    const d=data[demoAccount.value], pct=Math.min(100,Math.max(0,d.profit/d.target*100));
    document.getElementById('dashBalance').textContent=money(d.balance);
    document.getElementById('dashEquity').textContent=money(d.equity);
    document.getElementById('dashEquityChange').textContent='+'+money(d.profit)+' ('+(d.profit/d.balance*100).toFixed(2)+'%)';
    document.getElementById('dashProfit').textContent='+'+money(d.profit);
    document.getElementById('dashTargetLabel').textContent=pct.toFixed(1)+'%';
    document.getElementById('dashTargetBar').style.width=pct+'%';
    document.getElementById('dashCurrentProfit').textContent=money(d.profit)+' / '+money(d.target);
  }
  demoAccount.addEventListener('change',updateDashboard); updateDashboard();
}


// Static/manual payment flow. No payment is automatically verified and no customer data is stored.
const PAYMENT_WALLET = '0x1aa73058cc4b78ddc91a23522b3f7122a98ea0e5';
const PAYMENT_NETWORK = 'BNB Smart Chain (BEP20)';
const ADMIN_EMAIL = ''; // Optional: set your business email here to prefill the recipient. Do not use a private key here.
const paymentModal = document.getElementById('paymentModal');
const planDetails = { '1000': { label: '$1,000 account', amount: 25 }, '10000': { label: '$10,000 account', amount: 80 } };
let selectedPlan = '1000';
function openPayment(plan) {
  selectedPlan = planDetails[plan] ? plan : '1000';
  const p = planDetails[selectedPlan];
  document.getElementById('paymentPlan').textContent = p.label;
  document.getElementById('paymentAmount').textContent = p.amount + ' USDT';
  document.getElementById('walletAddress').value = PAYMENT_WALLET;
  document.getElementById('copyStatus').textContent = '';
  paymentModal.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closePayment() { paymentModal.hidden = true; document.body.style.overflow = ''; }
document.querySelectorAll('[data-buy-plan]').forEach(btn => btn.addEventListener('click', () => openPayment(btn.dataset.buyPlan)));
document.querySelectorAll('[data-close-payment]').forEach(el => el.addEventListener('click', closePayment));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && paymentModal && !paymentModal.hidden) closePayment(); });
document.getElementById('copyWallet').addEventListener('click', async () => {
  const status = document.getElementById('copyStatus');
  try { await navigator.clipboard.writeText(PAYMENT_WALLET); status.textContent = currentLang === 'fa' ? 'آدرس کاپی شد.' : 'Wallet address copied.'; }
  catch { const input = document.getElementById('walletAddress'); input.select(); status.textContent = currentLang === 'fa' ? 'آدرس را انتخاب و کاپی کنید.' : 'Select and copy the address manually.'; }
});
document.getElementById('sendProof').addEventListener('click', () => {
  const email = document.getElementById('customerEmail').value.trim();
  const txHash = document.getElementById('txHash').value.trim();
  const fa = currentLang === 'fa';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert(fa ? 'لطفاً ایمیل معتبر خود را وارد کنید.' : 'Please enter a valid email address.'); return; }
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) { alert(fa ? 'لطفاً هش معتبر تراکنش را وارد کنید (۰x و ۶۴ رقم هگزادسیمال).' : 'Please enter a valid transaction hash (0x followed by 64 hexadecimal characters).'); return; }
  const p = planDetails[selectedPlan];
  const subject = `Afghan4PropFirm payment proof - ${p.label}`;
  const body = [
    'Afghan4PropFirm manual payment confirmation', '',
    `Challenge: ${p.label}`, `Amount: ${p.amount} USDT`, `Network: ${PAYMENT_NETWORK}`,
    `Receiving wallet: ${PAYMENT_WALLET}`, `Customer email: ${email}`, `Transaction hash: ${txHash}`, '',
    'Please manually verify the transaction and email the MT5 account details after confirmation.'
  ].join('\n');
  const recipient = ADMIN_EMAIL && ADMIN_EMAIL.includes('@') ? ADMIN_EMAIL : '';
  const url = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
  if (!recipient) alert(fa ? 'ایمیل شما آماده شد. آن را به ایمیل رسمی مدیر که در اختیار دارید ارسال کنید؛ آدرس مدیر هنوز در سایت تنظیم نشده است.' : 'Your email draft is ready. Send it to the manager’s official email address you have been given. The manager email is not configured on this website yet.');
});
