const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const symbols = { '/': '÷', '*': '×', '-': '−', '+': '+' };

let current = '0';
let previous = null;
let operator = null;
let justEvaluated = false;

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
  }
}

function format(n) {
  if (!Number.isFinite(n)) return 'Error';
  return String(parseFloat(n.toPrecision(12)));
}

function render() {
  currentEl.textContent = current;
  historyEl.textContent = operator ? `${previous} ${symbols[operator]}` : '';
}

function inputNumber(d) {
  if (current === 'Error' || justEvaluated) {
    current = '0';
    justEvaluated = false;
  }
  if (d === '.') {
    if (!current.includes('.')) current += '.';
  } else {
    current = current === '0' ? d : current + d;
  }
}

function chooseOperator(op) {
  if (current === 'Error') return;
  if (operator && !justEvaluated) equals(true);
  previous = current;
  operator = op;
  current = '0';
  justEvaluated = false;
  if (previous === 'Error') { operator = null; current = 'Error'; }
}

function equals(chain = false) {
  if (!operator || current === 'Error') return;
  const result = format(compute(parseFloat(previous), parseFloat(current), operator));
  if (chain) {
    previous = result;
    current = result;
  } else {
    current = result;
    operator = null;
    previous = null;
    justEvaluated = true;
  }
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
}

function deleteLast() {
  if (current === 'Error' || justEvaluated) return clearAll();
  current = current.length > 1 ? current.slice(0, -1) : '0';
}

function percent() {
  if (current === 'Error') return;
  current = format(parseFloat(current) / 100);
}

document.querySelector('.keys').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const { num, op, action } = btn.dataset;
  if (num !== undefined) inputNumber(num);
  else if (op) chooseOperator(op);
  else if (action === 'equals') equals();
  else if (action === 'clear') clearAll();
  else if (action === 'delete') deleteLast();
  else if (action === 'percent') percent();
  render();
});

document.addEventListener('keydown', (e) => {
  if (/^[0-9.]$/.test(e.key)) inputNumber(e.key);
  else if ('+-*/'.includes(e.key)) chooseOperator(e.key);
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '%') percent();
  else return;
  render();
});
