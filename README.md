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

# Planning Poker

`poker.html` permite estimar story points en SCRUM votando en un solo dispositivo. Ábrelo en el navegador, igual que la calculadora; hay un enlace en cada página hacia la otra.

## Cómo se usa

1. Agrega al menos dos participantes. Los nombres se guardan en el navegador (`localStorage`).
2. Pulsa **Empezar ronda**. Cada participante ve una pantalla "Pasa el dispositivo a X"; al confirmar, elige su carta y el dispositivo pasa al siguiente. Los votos no se muestran hasta el final.
3. Pulsa **Revelar cartas** para ver los votos y el resumen: promedio, mediana, moda, mínimo y máximo, con un aviso de consenso o de votos muy separados.
4. **Nueva ronda** conserva a los participantes; **Cambiar participantes** vuelve a la configuración.

Baraja: `0, 1, 2, 3, 5, 8, 13, 21, ?, ☕`. Las cartas `?` y `☕` no cuentan en las estadísticas.

Teclado durante la votación: `1`–`9` y `0` eligen la carta por posición (`1` = 0, `2` = 1, … `9` = ?, `0` = ☕) y las flechas mueven el foco entre cartas.

## Estructura

- `poker.js`: lógica pura (baraja y `Poker.summarize(votos)`). Funciona en el navegador y en Node.
- `poker-ui.js`: estado de la ronda, turnos y manejo del DOM.
- `poker.html`, `poker.css`: pantallas de configuración, relevo, votación y resultado.
