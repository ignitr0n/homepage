# ignitr0n homepage

Source for [ignitron.org](https://ignitron.org).

The site is a static page with an interactive hexadecimal navigation field, theme music, a Web Audio frequency visualizer, and an intentionally hidden toybox.

## Toybox

- The bottom control deck contains music, the Wiby Webring, and the visitor counter.
- Press `?` for the field manual or <code>~</code> for the command deck.
- Keyboard effects include phosphor palettes, glitch/degauss, RF noise, starfield, inversion, mirroring, and byte-stream pause.
- Clicking empty terminal space inspects a synthetic packet and throws pixel sparks.
- Packet Catcher is available from the command deck, the `A` key, or a classic cheat code.
- A lone green scout activates the Tron battle when clicked. Cyan and amber three-ship formations arrive intermittently, hold formation until their first loss, then break and attack at full speed. Click any unit and use the arrow keys and Space to pilot it.
- Further key sequences, logo clicks, console commands, and achievements are deliberately undocumented.

The original terminal and music logic remain inline in `index.html`. The optional interaction layer is isolated in `toys.css` and `toys.js`.

The third-party visitor script runs inside `counter.html`, preventing its synchronous `document.write()` chain from blocking the main document.
