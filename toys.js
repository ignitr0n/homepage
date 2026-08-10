(() => {
  "use strict";

  const body = document.body;
  const terminal = document.getElementById("terminal");
  const logo = document.querySelector(".page-bg-logo");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const palettes = ["green", "amber", "ice", "violet", "red-alert"];
  const unlocked = new Set();
  let paletteIndex = 0;
  let starfield = null;
  let noise = null;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const toastRack = el("div", "toast-rack");
  toastRack.setAttribute("aria-live", "polite");
  body.appendChild(toastRack);

  function toast(message) {
    const note = el("div", "toy-toast", `> ${message}`);
    toastRack.appendChild(note);
    window.setTimeout(() => note.remove(), 3200);
  }

  function achievement(id, label) {
    if (unlocked.has(id)) return;
    unlocked.add(id);
    toast(`ACHIEVEMENT UNLOCKED: ${label}`);
  }

  function pulse(className, duration = 750) {
    body.classList.remove(className);
    void body.offsetWidth;
    body.classList.add(className);
    window.setTimeout(() => body.classList.remove(className), duration);
  }

  function cyclePalette() {
    paletteIndex = (paletteIndex + 1) % palettes.length;
    const palette = palettes[paletteIndex];
    body.dataset.palette = palette;
    toast(`PHOSPHOR PROFILE: ${palette.toUpperCase()}`);
    if (paletteIndex === palettes.length - 1) achievement("rainbow", "FULL SPECTRUM OPERATOR");
  }

  function toggleClass(className, label) {
    body.classList.toggle(className);
    toast(`${label}: ${body.classList.contains(className) ? "ENGAGED" : "DISENGAGED"}`);
  }

  function sparks(x, y, count = 7) {
    if (reduceMotion) return;
    const glyphs = ["+", "*", "·", "0", "1"];
    for (let i = 0; i < count; i += 1) {
      const spark = el("span", "click-spark", glyphs[Math.floor(Math.random() * glyphs.length)]);
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty("--dx", `${(Math.random() - .5) * 100}px`);
      spark.style.setProperty("--dy", `${(Math.random() - .5) * 100}px`);
      body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 700);
    }
  }

  function inspectPacket(event) {
    if (event.target.closest("a, button, input, .toy-panel")) return;
    sparks(event.clientX, event.clientY);
    const packet = el("div", "packet-readout");
    const address = ((event.clientX * 257 + event.clientY * 17 + Date.now()) >>> 0)
      .toString(16).toUpperCase().padStart(8, "0");
    const value = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0");
    packet.textContent = `0x${address} :: ${value} :: ${event.clientX},${event.clientY}`;
    packet.style.left = `${Math.min(event.clientX + 10, innerWidth - 230)}px`;
    packet.style.top = `${Math.min(event.clientY + 10, innerHeight - 30)}px`;
    body.appendChild(packet);
    window.setTimeout(() => packet.remove(), 1500);
  }

  function toggleNoise(force) {
    if (!noise) {
      noise = el("div", "screen-noise");
      noise.hidden = true;
      body.appendChild(noise);
    }
    noise.hidden = force === undefined ? !noise.hidden : !force;
    toast(`RF INTERFERENCE: ${noise.hidden ? "FILTERED" : "DETECTED"}`);
  }

  function toggleStars(force) {
    const shouldEnable = force ?? !starfield;
    if (!shouldEnable && starfield) {
      starfield.remove();
      starfield = null;
      toast("STAR MAP: CLOSED");
      return;
    }
    if (starfield) return;

    const canvas = el("canvas", "starfield");
    body.prepend(canvas);
    starfield = canvas;
    const context = canvas.getContext("2d");
    let stars = [];

    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * ratio;
      canvas.height = innerHeight * ratio;
      stars = Array.from({ length: Math.min(240, Math.floor(innerWidth / 5)) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2 + .2
      }));
    }

    function draw() {
      if (starfield !== canvas) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = getComputedStyle(body).getPropertyValue("--green");
      for (const star of stars) {
        star.y += star.z;
        if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
        context.globalAlpha = Math.min(1, star.z / 2.2);
        context.fillRect(star.x, star.y, star.z, star.z);
      }
      context.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    addEventListener("resize", resize, { passive: true });
    resize();
    if (!reduceMotion) draw();
    toast("STAR MAP: ONLINE");
    achievement("stars", "VOID GAZER");
  }

  function makePanel(className, title) {
    const panel = el("section", `toy-panel ${className}`);
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    const bar = el("header", "toy-panel-bar");
    bar.appendChild(el("h2", "", title));
    const close = el("button", "toy-close", "[X]");
    close.type = "button";
    close.addEventListener("click", () => { panel.hidden = true; });
    bar.appendChild(close);
    panel.appendChild(bar);
    body.appendChild(panel);
    return panel;
  }

  const manual = makePanel("field-manual", "IGNITR0N FIELD MANUAL // ?");
  const manualBody = el("div", "toy-panel-body");
  manualBody.innerHTML = `
    <p>This machine rewards unauthorized curiosity.</p>
    <ul>
      <li><kbd>~</kbd> opens the command deck.</li>
      <li><kbd>C</kbd> cycles phosphor colors; <kbd>G</kbd> glitches; <kbd>D</kbd> degausses.</li>
      <li><kbd>S</kbd> maps the stars; <kbd>N</kbd> adds RF noise; <kbd>I</kbd> inverts reality.</li>
      <li><kbd>M</kbd> mirrors the terminal; <kbd>P</kbd> pauses the byte stream.</li>
      <li><kbd>A</kbd> opens Packet Catcher; <kbd>?</kbd> toggles this manual.</li>
      <li>Click empty terminal space to inspect packets. Click the watermark repeatedly.</li>
      <li>Old spells and famous cheat codes may still work.</li>
    </ul>
    <p>Command deck vocabulary: <b>help effects status palette glitch degauss noise stars invert mirror pause game clear reboot root</b></p>`;
  manual.appendChild(manualBody);

  const launcher = el("button", "toy-button toy-launcher dvd-bouncer", "[?] FIELD MANUAL");
  launcher.type = "button";
  launcher.addEventListener("click", () => {
    manual.hidden = !manual.hidden;
    if (!manual.hidden) achievement("manual", "READ THE MANUAL");
  });
  body.appendChild(launcher);

  function startDvdBouncers() {
    const nodes = [...document.querySelectorAll(".dvd-bouncer")];
    if (!nodes.length) return;

    const padding = 6;
    const bouncers = nodes.map((node, index) => {
      const rect = node.getBoundingClientRect();
      const maxX = Math.max(padding, innerWidth - rect.width - padding);
      const maxY = Math.max(padding, innerHeight - rect.height - padding);
      const angle = .47 + index * 1.19;
      return {
        node,
        width: rect.width,
        height: rect.height,
        x: padding + ((index * 173 + 31) % Math.max(1, maxX - padding)),
        y: padding + ((index * 109 + 67) % Math.max(1, maxY - padding)),
        vx: Math.cos(angle) * (42 + index * 4),
        vy: Math.sin(angle) * (42 + index * 4)
      };
    });

    let previous = performance.now();
    function move(now) {
      const elapsed = Math.min((now - previous) / 1000, .05);
      previous = now;

      for (const item of bouncers) {
        item.x += item.vx * elapsed;
        item.y += item.vy * elapsed;
        const maxX = Math.max(padding, innerWidth - item.width - padding);
        const maxY = Math.max(padding, innerHeight - item.height - padding);

        if (item.x <= padding || item.x >= maxX) {
          item.x = Math.max(padding, Math.min(maxX, item.x));
          item.vx *= -1;
        }
        if (item.y <= padding || item.y >= maxY) {
          item.y = Math.max(padding, Math.min(maxY, item.y));
          item.vy *= -1;
        }
        item.node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
      }
      requestAnimationFrame(move);
    }

    if (reduceMotion) {
      bouncers.forEach((item, index) => {
        item.x = padding + index * 8;
        item.y = padding + index * (item.height + 5);
        item.node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
      });
      return;
    }
    requestAnimationFrame(move);
  }

  startDvdBouncers();

  const deck = makePanel("command-deck", "LOCAL CONSOLE // TTY7");
  const deckBody = el("div", "toy-panel-body");
  const output = el("div", "command-output", "ignitr0n toybox 1.0\nType 'help' or press ? for field manual.\n");
  const line = el("form", "command-line");
  const prompt = el("label", "", "root@earthstation:~# ");
  const input = document.createElement("input");
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", "Toybox command");
  line.append(prompt, input);
  deckBody.append(output, line);
  deck.appendChild(deckBody);

  function print(text) {
    output.textContent += `${text}\n`;
    output.scrollTop = output.scrollHeight;
  }

  function toggleDeck() {
    deck.hidden = !deck.hidden;
    if (!deck.hidden) {
      input.focus();
      achievement("console", "FOUND THE SHELL");
    }
  }

  const commands = {
    help: () => print("effects status palette glitch degauss noise stars invert mirror pause game clear reboot root exit"),
    effects: () => print("C phosphor | G glitch | D degauss | N noise | S stars | I invert | M mirror"),
    status: () => print(`palette=${palettes[paletteIndex]} stars=${Boolean(starfield)} noise=${Boolean(noise && !noise.hidden)} uptime=${Math.floor(performance.now() / 1000)}s achievements=${unlocked.size}`),
    palette: () => cyclePalette(),
    glitch: () => pulse("fx-glitch"),
    degauss: () => pulse("fx-degauss", 900),
    noise: () => toggleNoise(),
    stars: () => toggleStars(),
    invert: () => toggleClass("fx-invert", "POLARITY"),
    mirror: () => toggleClass("fx-mirror", "MIRROR UNIVERSE"),
    pause: () => window.ignitronTerminal?.togglePause?.(),
    game: () => openGame(),
    clear: () => { output.textContent = ""; },
    reboot: () => { pulse("fx-degauss", 900); print("warm reboot simulated; no processes were harmed"); },
    root: () => { body.classList.add("secret-root"); print("uid=0(root) gid=0(root) groups=0(root),31337(signal)"); achievement("root", "SUPERUSER"); },
    xyzzy: () => { print("A hollow voice says: PLUGH."); toggleStars(true); achievement("xyzzy", "COLOSSAL CAVE OPERATOR"); },
    exit: () => { deck.hidden = true; }
  };

  line.addEventListener("submit", event => {
    event.preventDefault();
    const raw = input.value.trim();
    input.value = "";
    if (!raw) return;
    print(`root@earthstation:~# ${raw}`);
    const command = raw.toLowerCase().split(/\s+/)[0];
    if (commands[command]) commands[command]();
    else print(`${command}: command not found (the machine snickers)`);
  });

  const arcade = makePanel("arcade", "PACKET CATCHER // ARROWS OR POINTER");
  const arcadeBody = el("div", "toy-panel-body");
  const gameHud = el("div", "game-hud");
  const scoreNode = el("span", "", "SCORE 0000");
  const livesNode = el("span", "", "LINK 100%");
  gameHud.append(scoreNode, livesNode);
  const gameField = el("div", "game-field");
  const player = el("div", "game-player");
  gameField.appendChild(player);
  arcadeBody.append(gameHud, gameField);
  arcade.appendChild(arcadeBody);
  let gameRunning = false;
  let gameFrame = 0;
  let playerX = 45;
  let gameScore = 0;
  let gameLives = 100;
  let packets = [];
  const held = new Set();

  function endGame() {
    gameRunning = false;
    packets.forEach(packet => packet.node.remove());
    packets = [];
    toast(`PACKET CATCHER HALTED // SCORE ${gameScore}`);
  }

  function gameLoop(frame) {
    if (!gameRunning) return;
    const dt = Math.min(40, frame - gameFrame || 16);
    gameFrame = frame;
    if (held.has("ArrowLeft")) playerX -= dt * .05;
    if (held.has("ArrowRight")) playerX += dt * .05;
    playerX = Math.max(0, Math.min(90, playerX));
    player.style.left = `${playerX}%`;

    if (Math.random() < dt / 310) {
      const node = el("span", "game-packet", Math.random() > .16 ? Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase() : "XX");
      const packet = { node, x: Math.random() * 94, y: -5, bad: node.textContent === "XX" };
      node.style.left = `${packet.x}%`;
      gameField.appendChild(node);
      packets.push(packet);
    }

    for (const packet of packets) {
      packet.y += dt * .025;
      packet.node.style.top = `${packet.y}%`;
      if (packet.y > 88 && packet.y < 98 && Math.abs(packet.x - playerX) < 12) {
        if (packet.bad) gameLives -= 20;
        else gameScore += 10;
        packet.y = 120;
      } else if (packet.y > 102) {
        if (!packet.bad) gameLives -= 5;
      }
    }
    packets.filter(packet => packet.y > 102).forEach(packet => packet.node.remove());
    packets = packets.filter(packet => packet.y <= 102);
    scoreNode.textContent = `SCORE ${String(gameScore).padStart(4, "0")}`;
    livesNode.textContent = `LINK ${Math.max(0, gameLives)}%`;
    if (gameLives <= 0) { endGame(); return; }
    if (gameScore >= 250) achievement("packet-game", "PACKET WRANGLER");
    requestAnimationFrame(gameLoop);
  }

  function openGame() {
    arcade.hidden = false;
    if (gameRunning) return;
    gameRunning = true;
    gameScore = 0;
    gameLives = 100;
    playerX = 45;
    requestAnimationFrame(gameLoop);
  }

  arcade.querySelector(".toy-close").addEventListener("click", endGame);
  gameField.addEventListener("pointermove", event => {
    const rect = gameField.getBoundingClientRect();
    playerX = ((event.clientX - rect.left) / rect.width) * 100 - 5;
  });

  addEventListener("keydown", event => held.add(event.key));
  addEventListener("keyup", event => held.delete(event.key));

  const sequences = [];
  function remember(key) {
    sequences.push(key.toLowerCase());
    if (sequences.length > 12) sequences.shift();
    const recent = sequences.join(" ");
    if (recent.endsWith("arrowup arrowup arrowdown arrowdown arrowleft arrowright arrowleft arrowright b a")) {
      openGame();
      achievement("konami", "KONAMI PACKET PROTOCOL");
    }
    if (recent.endsWith("i d d q d")) {
      body.classList.add("secret-root");
      toast("GOD MODE: PROBABLY");
      achievement("iddqd", "DOOMED OPERATOR");
    }
  }

  addEventListener("keydown", event => {
    if (event.target.matches("input")) {
      if (event.key === "Escape") deck.hidden = true;
      return;
    }
    remember(event.key);
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "~" || key === "`") toggleDeck();
    else if (key === "?") launcher.click();
    else if (key === "c") cyclePalette();
    else if (key === "g") pulse("fx-glitch");
    else if (key === "d") pulse("fx-degauss", 900);
    else if (key === "n") toggleNoise();
    else if (key === "s") toggleStars();
    else if (key === "i") toggleClass("fx-invert", "POLARITY");
    else if (key === "m") toggleClass("fx-mirror", "MIRROR UNIVERSE");
    else if (key === "p") window.ignitronTerminal?.togglePause?.();
    else if (key === "a") openGame();
    else if (key === "escape") [manual, deck, arcade].forEach(panel => { panel.hidden = true; });
  });

  let logoClicks = 0;
  logo?.addEventListener("click", event => {
    logoClicks += 1;
    sparks(event.clientX, event.clientY, 12);
    if (logoClicks % 2 === 0) cyclePalette();
    if (logoClicks === 5) {
      pulse("fx-glitch");
      achievement("logo", "FIVE-FOLD SIGIL");
    }
    if (logoClicks === 8) toggleStars(true);
  });
  if (logo) logo.style.pointerEvents = "auto";

  terminal?.addEventListener("click", inspectPacket);
  document.querySelector(".counter-box")?.addEventListener("click", () => achievement("counter", "NUMBER STATION LISTENER"));
  document.querySelector(".webring-link")?.addEventListener("click", () => achievement("wiby", "SURF THE SMALL WEB"));

  window.addEventListener("online", () => toast("UPLINK RESTORED"));
  window.addEventListener("offline", () => toast("UPLINK LOST // LOCAL SYSTEMS NOMINAL"));

  window.ignitronToybox = { cyclePalette, toggleStars, toggleNoise, openGame, toggleDeck, toast };
  console.log("%cTOYBOX LOADED", "color:#ff3b30;background:#000;font:14px monospace", "Try ~, ?, or the Konami code.");
  window.setTimeout(() => toast("TOYBOX ARMED // PRESS ? FOR FIELD MANUAL"), 1100);
})();
