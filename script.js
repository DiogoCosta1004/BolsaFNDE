'use strict';
// Endpoints recuperados do APK original (2016). Não há garantia de disponibilidade ou CORS.
const API_BASE = 'https://www.fnde.gov.br/digef/rs/spba/publica';
const form = document.querySelector('#form');
const cpfInput = document.querySelector('#cpf');
const submit = document.querySelector('#submit');
const statusBox = document.querySelector('#status');
const result = document.querySelector('#result');
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let size = 9; size < 11; size++) {
    const sum = [...cpf.slice(0, size)].reduce((acc, digit, i) => acc + Number(digit) * (size + 1 - i), 0);
    const check = (sum * 10) % 11 % 10;
    if (check !== Number(cpf[size])) return false;
  }
  return true;
}
function showStatus(message, error = false) {
  statusBox.textContent = message;
  statusBox.className = `status${error ? ' error' : ''}`;
  statusBox.hidden = false;
}
function parseAmount(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  let v = value.trim().replace(/[^\d,.-]/g, '');
  if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.');
  return Number(v) || 0;
}
function flattenPayments(data) {
  const found = [];
  const visit = (node, depth = 0) => {
    if (!node || depth > 12 || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(item => visit(item, depth + 1)); return; }
    if (Array.isArray(node.pagamentos)) found.push(...node.pagamentos);
    for (const [key, value] of Object.entries(node)) if (key !== 'pagamentos') visit(value, depth + 1);
  };
  visit(data);
  return found.filter(item => item && typeof item === 'object');
}
async function getJson(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Serviço retornou HTTP ${response.status}.`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}
function render(name, data) {
  const payments = flattenPayments(data);
  document.querySelector('#person').textContent = String(data.nome || name || 'Beneficiário');
  document.querySelector('#total').textContent = money.format(parseAmount(data.total));
  document.querySelector('#count').textContent = 'Valores informados pelo serviço consultado';
  document.querySelector('#quantity').textContent = `${payments.length} registro(s)`;
  const list = document.querySelector('#payment-list');
  list.replaceChildren();
  if (!payments.length) { const p = document.createElement('p'); p.textContent = 'Nenhum pagamento detalhado foi retornado.'; list.append(p); }
  payments.forEach(payment => {
    const row = document.createElement('article'); row.className = 'payment';
    const info = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = `Referência: ${payment.referencia ?? 'Não informada'}`;
    const details = document.createElement('small'); details.textContent = `Pagamento: ${payment.data ?? 'Não informado'} · Ordem bancária: ${payment.ordermBancaria ?? 'Não informada'}`;
    const amount = document.createElement('span'); amount.className = 'amount'; amount.textContent = money.format(parseAmount(payment.valor));
    info.append(title, details); row.append(info, amount); list.append(row);
  });
  result.hidden = false;
}
cpfInput.addEventListener('input', () => {
  const digits = cpfInput.value.replace(/\D/g, '').slice(0, 11);
  cpfInput.value = digits.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const cpf = cpfInput.value.replace(/\D/g, '');
  result.hidden = true;
  if (!cpfValido(cpf)) { showStatus('Digite um CPF válido para realizar a consulta.', true); return; }
  submit.disabled = true;
  showStatus('Consultando beneficiário no serviço do FNDE…');
  try {
    const peopleData = await getJson(`/pessoa/1/10/${encodeURIComponent(cpf)}`);
    const person = peopleData?.pessoas?.[0];
    if (!person?.hash) { showStatus('Nenhum beneficiário foi encontrado ou o serviço não retornou um identificador.'); return; }
    showStatus('Beneficiário localizado. Buscando histórico de pagamentos…');
    const paymentsData = await getJson(`/pagamento/${encodeURIComponent(person.hash)}`);
    render(person.nome, paymentsData);
    statusBox.hidden = true;
  } catch (error) {
    const detail = error.name === 'AbortError' ? 'A consulta excedeu o tempo limite.' : 'O endpoint antigo pode estar indisponível ou bloquear requisições do navegador (CORS).';
    showStatus(`Não foi possível concluir a consulta. ${detail} Nenhum resultado foi confirmado.`, true);
    console.warn('Falha na consulta FNDE:', error);
  } finally { submit.disabled = false; }
});
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});
