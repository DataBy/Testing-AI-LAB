const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const angleEl = document.getElementById('angle-mode');
const angleBtn = document.querySelector('[data-action="angle"]');
const memoryFlag = document.getElementById('memory-flag');

// Tras "=" estos textos continúan sobre el resultado; cualquier otro empieza una expresión nueva.
const CONTINUATIONS = ['+', '−', '×', '÷', '^', '^2', '!', '%'];
const KEY_MAP = { '*': '×', '/': '÷', '-': '−', p: 'π' };
const KEY_INSERTS = new Set(['+', '^', '(', ')', '!', '%', '.', 'e']);

let expr = '';
let historyText = '';
let angle = 'deg';
let memory = 0;
let ans = 0;
let justEvaluated = false;
let hasError = false;

function format(n) {
  return String(parseFloat(n.toPrecision(12))).replace('e', 'E');
}

function asOperand(n) {
  const s = format(n);
  return s.startsWith('-') ? `(${s})` : s;
}

function evaluateExpr() {
  const open = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
  const closed = expr + ')'.repeat(Math.max(open, 0));
  return { closed, value: Evaluator.evaluate(closed, { angle }) };
}

function render() {
  currentEl.textContent = hasError ? 'Error' : expr || '0';
  historyEl.textContent = historyText;
  angleEl.textContent = angle.toUpperCase();
  angleBtn.textContent = angle.toUpperCase();
  memoryFlag.hidden = memory === 0;
}

function clearAll() {
  expr = '';
  historyText = '';
  justEvaluated = false;
  hasError = false;
}

function insert(text) {
  if (hasError) clearAll();
  if (justEvaluated) {
    const keep = CONTINUATIONS.includes(text);
    historyText = '';
    justEvaluated = false;
    if (!keep) expr = '';
  }
  expr += text;
}

function deleteLast() {
  if (hasError || justEvaluated) return clearAll();
  expr = expr.replace(/(?:[a-z]+\(|√\()$|.$/, '');
}

function equals() {
  if (hasError || justEvaluated || !expr) return;
  try {
    const { closed, value } = evaluateExpr();
    historyText = `${closed} =`;
    ans = value;
    expr = format(value);
    justEvaluated = true;
  } catch {
    historyText = expr;
    hasError = true;
  }
}

function memoryAdd() {
  if (hasError || !expr) return;
  try {
    memory += evaluateExpr().value;
  } catch {
    hasError = true;
  }
}

const actions = {
  clear: clearAll,
  delete: deleteLast,
  equals,
  angle: () => { angle = angle === 'deg' ? 'rad' : 'deg'; },
  ans: () => insert(asOperand(ans)),
  mc: () => { memory = 0; },
  mr: () => insert(asOperand(memory)),
  mplus: memoryAdd,
};

document.querySelector('.keys').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const { insert: text, action } = btn.dataset;
  if (text !== undefined) insert(text);
  else actions[action]?.();
  render();
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (/^[0-9]$/.test(k) || KEY_INSERTS.has(k) || k in KEY_MAP) insert(KEY_MAP[k] || k);
  else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); }
  else if (k === 'Backspace') deleteLast();
  else if (k === 'Escape') clearAll();
  else return;
  if (k === '/') e.preventDefault();
  render();
});

render();
