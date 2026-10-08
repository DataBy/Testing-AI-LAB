(function (root) {
  const ALIASES = { '×': '*', '÷': '/', '−': '-' };

  function tokenize(src) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
      const ch = ALIASES[src[i]] || src[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < src.length && /[0-9.]/.test(src[j])) j++;
        const text = src.slice(i, j);
        if (!/^(\d+\.?\d*|\.\d+)$/.test(text)) throw new Error('Número inválido: ' + text);
        tokens.push({ type: 'num', value: parseFloat(text) });
        i = j;
      } else if ('+-*/^%()'.includes(ch)) {
        tokens.push({ type: ch });
        i++;
      } else {
        throw new Error('Carácter inesperado: ' + ch);
      }
    }
    return tokens;
  }

  // Descenso recursivo:
  //   expr    = term (('+'|'-') term)*
  //   term    = unary (('*'|'/') unary)*
  //   unary   = ('-'|'+') unary | power
  //   power   = postfix ('^' unary)?        (asociativo a la derecha)
  //   postfix = primary '%'*
  //   primary = num | '(' expr ')'
  function parse(tokens) {
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
      while (peek() === '*' || peek() === '/') {
        const op = take().type;
        const r = unary();
        if (op === '/' && r === 0) throw new Error('División por cero');
        v = op === '*' ? v * r : v / r;
      }
      return v;
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
      while (peek() === '%') { take(); v /= 100; }
      return v;
    }

    function primary() {
      const t = take();
      if (!t) throw new Error('Expresión incompleta');
      if (t.type === 'num') return t.value;
      if (t.type === '(') {
        const v = expr();
        if (take()?.type !== ')') throw new Error('Paréntesis sin cerrar');
        return v;
      }
      throw new Error('Token inesperado: ' + t.type);
    }

    const result = expr();
    if (pos < tokens.length) throw new Error('Token inesperado: ' + tokens[pos].type);
    return result;
  }

  function evaluate(src) {
    const v = parse(tokenize(src));
    if (!Number.isFinite(v)) throw new Error('Resultado no finito');
    return v;
  }

  const api = { tokenize, parse, evaluate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Evaluator = api;
})(typeof window !== 'undefined' ? window : globalThis);
