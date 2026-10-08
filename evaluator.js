(function (root) {
  const ALIASES = { '×': '*', '÷': '/', '−': '-' };
  const CONSTANTS = { pi: Math.PI, 'π': Math.PI, e: Math.E };
  const EPS = 1e-12;

  function tokenize(src) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
      const ch = ALIASES[src[i]] || src[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        const m = /^[0-9.]+(E[+-]?\d+)?/.exec(src.slice(i));
        if (!/^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?$/.test(m[0])) throw new Error('Número inválido: ' + m[0]);
        tokens.push({ type: 'num', value: parseFloat(m[0]) });
        i += m[0].length;
      } else if (/[a-z]/i.test(ch)) {
        const m = /^[a-z]+/i.exec(src.slice(i));
        tokens.push({ type: 'id', name: m[0].toLowerCase() });
        i += m[0].length;
      } else if (ch === 'π') {
        tokens.push({ type: 'id', name: 'π' });
        i++;
      } else if ('+-*/^%!()√'.includes(ch)) {
        tokens.push({ type: ch });
        i++;
      } else {
        throw new Error('Carácter inesperado: ' + ch);
      }
    }
    return tokens;
  }

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error('Factorial inválido');
    let r = 1;
    for (let k = 2; k <= n; k++) r *= k;
    return r;
  }

  function positive(x) {
    if (!(x > 0)) throw new Error('Dominio inválido');
    return x;
  }

  function inUnit(x) {
    if (Math.abs(x) > 1) throw new Error('Dominio inválido');
    return x;
  }

  // Los resultados trigonométricos ínfimos (sin(180°) = 1.2e-16) se limpian a 0.
  const clean = (v) => (Math.abs(v) < EPS ? 0 : v);

  function makeFunctions(angle) {
    const deg = angle !== 'rad';
    const toRad = (x) => (deg ? (x * Math.PI) / 180 : x);
    const fromRad = (x) => (deg ? (x * 180) / Math.PI : x);
    return {
      sin: (x) => clean(Math.sin(toRad(x))),
      cos: (x) => clean(Math.cos(toRad(x))),
      tan: (x) => {
        if (clean(Math.cos(toRad(x))) === 0) throw new Error('Tangente indefinida');
        return clean(Math.tan(toRad(x)));
      },
      asin: (x) => fromRad(Math.asin(inUnit(x))),
      acos: (x) => fromRad(Math.acos(inUnit(x))),
      atan: (x) => fromRad(Math.atan(x)),
      ln: (x) => Math.log(positive(x)),
      log: (x) => clean(Math.log10(positive(x))),
      sqrt: (x) => {
        if (x < 0) throw new Error('Dominio inválido');
        return Math.sqrt(x);
      },
      abs: Math.abs,
    };
  }

  // Descenso recursivo:
  //   expr    = term (('+'|'-') term)*
  //   term    = unary (('*'|'/') unary | implicit)*   implicit: id, '(' o '√' a continuación
  //   unary   = ('-'|'+') unary | power
  //   power   = postfix ('^' unary)?                  (asociativo a la derecha)
  //   postfix = primary ('%'|'!')*
  //   primary = num | const | fn '(' expr ')' | '√' postfix | '(' expr ')'
  function parse(tokens, options = {}) {
    const fns = makeFunctions(options.angle);
    let pos = 0;
    const peek = () => (pos < tokens.length ? tokens[pos].type : null);
    const take = () => tokens[pos++];

    function expr() {
      let v = term();
      while (peek() === '+' || peek() === '-') {
        const op = take().type;
        const r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }

    function term() {
      let v = unary();
      for (;;) {
        const t = peek();
        if (t === '*' || t === '/') {
          take();
          const r = unary();
          if (t === '/' && r === 0) throw new Error('División por cero');
          v = t === '*' ? v * r : v / r;
        } else if (t === 'id' || t === '(' || t === '√') {
          v *= unary();
        } else {
          return v;
        }
      }
    }

    function unary() {
      if (peek() === '-') { take(); return -unary(); }
      if (peek() === '+') { take(); return unary(); }
      return power();
    }

    function power() {
      const base = postfix();
      if (peek() === '^') { take(); return Math.pow(base, unary()); }
      return base;
    }

    function postfix() {
      let v = primary();
      while (peek() === '%' || peek() === '!') {
        v = take().type === '%' ? v / 100 : factorial(v);
      }
      return v;
    }

    function primary() {
      const t = take();
      if (!t) throw new Error('Expresión incompleta');
      if (t.type === 'num') return t.value;
      if (t.type === '√') return fns.sqrt(postfix());
      if (t.type === '(') return closeParen();
      if (t.type === 'id') {
        if (t.name in CONSTANTS) return CONSTANTS[t.name];
        const fn = fns[t.name];
        if (!fn) throw new Error('Identificador desconocido: ' + t.name);
        if (take()?.type !== '(') throw new Error('Falta "(" tras ' + t.name);
        return fn(closeParen());
      }
      throw new Error('Token inesperado: ' + t.type);
    }

    function closeParen() {
      const v = expr();
      if (take()?.type !== ')') throw new Error('Paréntesis sin cerrar');
      return v;
    }

    const result = expr();
    if (pos < tokens.length) throw new Error('Token inesperado: ' + tokens[pos].type);
    return result;
  }

  // options.angle: 'deg' (por defecto) o 'rad'.
  function evaluate(src, options) {
    const v = parse(tokenize(src), options);
    if (!Number.isFinite(v)) throw new Error('Resultado no finito');
    return v;
  }

  const api = { tokenize, parse, evaluate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Evaluator = api;
})(typeof window !== 'undefined' ? window : globalThis);
