// ─── CONFIGURAÇÃO ────────────────────────────────────────
// 👇 Coloque aqui o número do WhatsApp da Yasmin (com DDI e DDD, sem espaços ou símbolos)
const WHATSAPP_NUMBER = '55999981007191'; // Ex: 5599912345678


const SERVICES = [
  { id: 1, icon: '💅', name: 'Esmaltação Simples', price: 25, time: '20min' },
  { id: 2, icon: '💅🦶🏻', name: 'Esmaltação Mãos e Pés', price: 50, time: '45min' },
  { id: 3, icon: ' 🧽', name: 'Spar dos Pés', price: 20, time: '20min' },
  { id: 4, icon: '💅✨', name: 'Somente as Mão', price: 25, time: '20min' },
  { id: 5, icon: '🦶🏻✨', name: 'Somente os Pés', price: 25, time: '20min' }


];

const HORARIOS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

// horários fake ocupados por dia
const OCUPADOS = { 3: ['09:00', '11:00', '14:30'], 5: ['08:00', '10:00', '15:00'], 10: ['09:30', '13:00'] };

// ─── STATE ───────────────────────────────────────────────
let selectedServices = [];
let selectedDate = null;
let selectedTime = null;
let currentMonth, currentYear;
let currentStep = 1;

// ─── INIT ────────────────────────────────────────────────
const today = new Date();
currentMonth = today.getMonth();
currentYear = today.getFullYear();

function init() {
  renderServices();
  renderCalendar();
  updateStepUI(1);
}

// ─── SERVIÇOS ────────────────────────────────────────────
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = SERVICES.map(s => `
    <div class="service-card ${selectedServices.includes(s.id) ? 'selected' : ''}" onclick="toggleService(${s.id})">
      <div class="service-icon">${s.icon}</div>
      <div class="service-name">${s.name}</div>
      <div class="service-price">R$ ${s.price}</div>
      <div class="service-time">⏱ ${s.time}</div>
    </div>`).join('');
}

function toggleService(id) {
  if (selectedServices.includes(id)) {
    selectedServices = selectedServices.filter(s => s !== id);
  } else {
    selectedServices.push(id);
  }
  renderServices();
}

// ─── CALENDÁRIO ──────────────────────────────────────────
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function renderCalendar() {
  document.getElementById('monthLabel').textContent = `${MESES[currentMonth]} ${currentYear}`;
  const grid = document.getElementById('calendarGrid');

  const headers = DIAS.map(d => `<div class="day-header">${d}</div>`).join('');
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="day-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isSun = date.getDay() === 0;
    const isTod = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    const isSel = selectedDate && selectedDate.d === d && selectedDate.m === currentMonth && selectedDate.y === currentYear;
    let cls = 'day-cell';
    if (isPast || isSun) cls += ' disabled';
    else if (isTod) cls += ' today';
    if (isSel) cls += ' selected';
    const onclick = (!isPast && !isSun) ? `onclick="selectDay(${d})"` : '';
    cells += `<div class="${cls}" ${onclick}>${d}</div>`;
  }

  grid.innerHTML = headers + cells;
}

function changeMonth(dir) {
  currentMonth += dir;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
}

function selectDay(d) {
  selectedDate = { d, m: currentMonth, y: currentYear };
  selectedTime = null;
  renderCalendar();
  renderTimeSlots(d);
}

// ─── HORÁRIOS ────────────────────────────────────────────
function renderTimeSlots(day) {
  const title = document.getElementById('timeTitle');
  const grid = document.getElementById('timeGrid');
  title.style.display = 'block';

  const ocupados = OCUPADOS[day] || [];
  grid.innerHTML = HORARIOS.map(h => {
    const taken = ocupados.includes(h);
    const sel = selectedTime === h;
    let cls = 'time-slot' + (taken ? ' taken' : '') + (sel ? ' selected' : '');
    const onclick = !taken ? `onclick="selectTime('${h}')"` : '';
    return `<div class="${cls}" ${onclick}>${h}</div>`;
  }).join('');
}

function selectTime(t) {
  selectedTime = t;
  renderTimeSlots(selectedDate.d);
}

// ─── NAVEGAÇÃO ───────────────────────────────────────────
function goToStep(step) {
  if (step === 2 && selectedServices.length === 0) {
    alert('Por favor, selecione pelo menos um serviço.');
    return;
  }
  if (step === 3 && (!selectedDate || !selectedTime)) {
    alert('Por favor, selecione uma data e horário.');
    return;
  }
  if (step === 4) {
    const name = document.getElementById('inputName').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    let ok = true;
    if (!name) { showErr('errName', true); ok = false; } else { showErr('errName', false); }
    if (phone.length < 14) { showErr('errPhone', true); ok = false; } else { showErr('errPhone', false); }
    if (!ok) return;
    renderSummary();
  }
  currentStep = step;
  updateStepUI(step);
}

function showErr(id, show) {
  document.getElementById(id).classList.toggle('show', show);
}

function updateStepUI(step) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`panel${step}`);
  if (panel) panel.classList.add('active');

  [1, 2, 3, 4].forEach(i => {
    const el = document.getElementById(`step-ind-${i}`);
    if (el) {
      el.classList.remove('active', 'done');
      if (i < step) el.classList.add('done');
      else if (i === step) el.classList.add('active');
    }
  });

  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`line-${i}`);
    if (el) el.classList.toggle('done', i < step);
  });

  const stepsBar = document.getElementById('stepsBar');
  if (stepsBar) stepsBar.style.display = step === 5 ? 'none' : 'flex';
}

// ─── RESUMO ──────────────────────────────────────────────
function renderSummary() {
  const servicos = selectedServices.map(id => SERVICES.find(s => s.id === id));
  const total = servicos.reduce((a, s) => a + s.price, 0);
  const dateStr = `${String(selectedDate.d).padStart(2, '0')}/${String(selectedDate.m + 1).padStart(2, '0')}/${selectedDate.y}`;
  const name = document.getElementById('inputName').value.trim();
  const phone = document.getElementById('inputPhone').value.trim();

  document.getElementById('summaryBox').innerHTML = `
    <div class="summary-row"><span class="label">👤 Nome</span><span class="value">${name}</span></div>
    <div class="summary-row"><span class="label">📱 Telefone</span><span class="value">${phone}</span></div>
    <div class="summary-row"><span class="label">📅 Data</span><span class="value">${dateStr}</span></div>
    <div class="summary-row"><span class="label">⏰ Horário</span><span class="value">${selectedTime}</span></div>
    <div class="summary-row"><span class="label">💅 Serviços</span><span class="value">${servicos.map(s => s.name).join(', ')}</span></div>
    <div class="summary-row total"><span class="label">Total</span><span class="value">R$ ${total}</span></div>`;
}

// ─── CONFIRMAR ───────────────────────────────────────────
function confirmarAgendamento() {
  const code = 'SN' + Math.random().toString(36).substring(2, 7).toUpperCase();
  document.getElementById('bookingCode').textContent = code;

  // Monta mensagem para o WhatsApp
  const servicos = selectedServices.map(id => SERVICES.find(s => s.id === id));
  const total = servicos.reduce((a, s) => a + s.price, 0);
  const dateStr = `${String(selectedDate.d).padStart(2, '0')}/${String(selectedDate.m + 1).padStart(2, '0')}/${selectedDate.y}`;
  const name = document.getElementById('inputName').value.trim();
  const phone = document.getElementById('inputPhone').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const notes = document.getElementById('inputNotes').value.trim();

  const servicosList = servicos.map(s => `  • ${s.name} — R$ ${s.price} (${s.time})`).join('\n');

  let msg = `🌸 *Novo Agendamento*\n\n`;
  msg += `*Código:* ${code}\n`;
  msg += `*Nome:* ${name}\n`;
  msg += `*Telefone:* ${phone}\n`;
  if (email) msg += `*E-mail:* ${email}\n`;
  msg += `*Data:* ${dateStr}\n`;
  msg += `*Horário:* ${selectedTime}\n\n`;
  msg += `*Serviços:*\n${servicosList}\n\n`;
  msg += `*Total:* R$ ${total}`;
  if (notes) msg += `\n\n*Observações:* ${notes}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');

  // Mostra tela de sucesso
  currentStep = 5;
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panelSuccess').classList.add('active');
  document.getElementById('stepsBar').style.display = 'none';
}

// ─── RESET ───────────────────────────────────────────────
function resetForm() {
  selectedServices = [];
  selectedDate = null;
  selectedTime = null;
  document.getElementById('inputName').value = '';
  document.getElementById('inputPhone').value = '';
  document.getElementById('inputEmail').value = '';
  document.getElementById('inputNotes').value = '';
  document.getElementById('timeGrid').innerHTML = '';
  document.getElementById('timeTitle').style.display = 'none';
  renderServices();
  renderCalendar();
  currentStep = 1;
  document.getElementById('stepsBar').style.display = 'flex';
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel1').classList.add('active');
  updateStepUI(1);
}

// ─── MÁSCARA TELEFONE ────────────────────────────────────
function maskPhone(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  else if (v.length > 0) v = `(${v}`;
  el.value = v;
}

// ─── START ───────────────────────────────────────────────
init();