# Calculadora científica

Calculadora web en HTML, CSS y JavaScript puro, sin dependencias. Abre `index.html` en el navegador.

## Funciones

| Grupo | Teclas |
|---|---|
| Operaciones | `+ − × ÷`, `xʸ`, `x²`, `%`, `x!`, `1/x`, paréntesis |
| Trigonometría | `sin cos tan`, `sin⁻¹ cos⁻¹ tan⁻¹` |
| Logaritmos y raíces | `ln`, `log` (base 10), `√`, `\|x\|` |
| Constantes | `π`, `e` |
| Notación científica | `EXP` (por ejemplo `1E3`) |
| Memoria | `MC`, `MR`, `M+`, `Ans` (último resultado) |
| Ángulos | `DEG` / `RAD` (por defecto grados) |

Las expresiones respetan la precedencia de operadores y admiten multiplicación implícita (`2π`, `2(3)`). Los paréntesis abiertos se cierran solos al pulsar `=`. Los errores (división por cero, dominio inválido, sintaxis) muestran `Error`.

## Teclado

Dígitos, `+ - * / ^ ( ) ! % .`, `e`, `p` (π), `Enter` o `=` para calcular, `Backspace` para borrar y `Esc` para limpiar.

## Estructura

- `evaluator.js`: tokenizer y parser de descenso recursivo (sin `eval`). Funciona en el navegador y en Node: `Evaluator.evaluate(expresion, { angle: 'deg' | 'rad' })`.
- `script.js`: estado y manejo de la interfaz.
- `index.html`, `style.css`: teclado y display responsive.
