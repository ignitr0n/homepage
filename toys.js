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
      <li>Click a roaming Tron unit to pilot it. Use <kbd>←</kbd>/<kbd>→</kbd> to steer, <kbd>↑</kbd>/<kbd>↓</kbd> for thrust, and <kbd>SPACE</kbd> to fire.</li>
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

  function startWireframeSphere() {
    const canvas = el("canvas", "webgl-sphere");
    canvas.setAttribute("aria-hidden", "true");
    body.appendChild(canvas);
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) {
      canvas.remove();
      return;
    }

    const vertexSource = `
      attribute vec3 a_position;
      uniform vec2 u_center;
      uniform vec2 u_scale;
      uniform vec2 u_rotation;
      void main() {
        float cx = cos(u_rotation.x);
        float sx = sin(u_rotation.x);
        float cy = cos(u_rotation.y);
        float sy = sin(u_rotation.y);
        vec3 p = a_position;
        p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
        p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);
        gl_Position = vec4(u_center + p.xy * u_scale, 0.0, 1.0);
      }`;
    const fragmentSource = `
      precision mediump float;
      void main() { gl_FragColor = vec4(0.0, 1.0, 0.0, 0.82); }`;

    function shader(type, source) {
      const result = gl.createShader(type);
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
        gl.deleteShader(result);
        return null;
      }
      return result;
    }

    const vertexShader = shader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = shader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) {
      canvas.remove();
      return;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.remove();
      return;
    }

    const vertices = [];
    const rings = 12;
    const segments = 24;
    const point = (latitude, longitude) => {
      const phi = latitude * Math.PI / rings - Math.PI / 2;
      const theta = longitude * Math.PI * 2 / segments;
      const cosPhi = Math.cos(phi);
      return [cosPhi * Math.cos(theta), Math.sin(phi), cosPhi * Math.sin(theta)];
    };
    const line = (a, b) => vertices.push(...a, ...b);
    for (let latitude = 1; latitude < rings; latitude += 1) {
      for (let longitude = 0; longitude < segments; longitude += 1) {
        line(point(latitude, longitude), point(latitude, (longitude + 1) % segments));
      }
    }
    for (let longitude = 0; longitude < segments; longitude += 1) {
      for (let latitude = 0; latitude < rings; latitude += 1) {
        line(point(latitude, longitude), point(latitude + 1, longitude));
      }
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    const center = gl.getUniformLocation(program, "u_center");
    const scale = gl.getUniformLocation(program, "u_scale");
    const rotation = gl.getUniformLocation(program, "u_rotation");
    const radius = 64;
    const sphere = { x: innerWidth * .3, y: radius + 20, vx: 145, vy: 40 };
    let previous = performance.now();
    let spin = 0;

    function resizeSphere() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(innerWidth * ratio));
      canvas.height = Math.max(1, Math.floor(innerHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      sphere.x = Math.max(radius, Math.min(innerWidth - radius, sphere.x));
      sphere.y = Math.max(radius, Math.min(innerHeight - radius, sphere.y));
    }

    function drawSphere(now) {
      const elapsed = Math.min((now - previous) / 1000, .035);
      previous = now;
      sphere.vy += 430 * elapsed;
      sphere.x += sphere.vx * elapsed;
      sphere.y += sphere.vy * elapsed;
      if (sphere.x + radius >= innerWidth || sphere.x - radius <= 0) {
        sphere.x = Math.max(radius, Math.min(innerWidth - radius, sphere.x));
        sphere.vx *= -.92;
      }
      if (sphere.y + radius >= innerHeight) {
        sphere.y = innerHeight - radius;
        sphere.vy *= -.88;
        if (Math.abs(sphere.vy) < 105) sphere.vy = -285;
      } else if (sphere.y - radius <= 0) {
        sphere.y = radius;
        sphere.vy = Math.abs(sphere.vy) * .9;
      }
      spin += elapsed;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
      gl.uniform2f(center, sphere.x / innerWidth * 2 - 1, 1 - sphere.y / innerHeight * 2);
      gl.uniform2f(scale, radius * 2 / innerWidth, radius * 2 / innerHeight);
      gl.uniform2f(rotation, spin * .73, spin * 1.11);
      gl.drawArrays(gl.LINES, 0, vertices.length / 3);
      requestAnimationFrame(drawSphere);
    }

    addEventListener("resize", resizeSphere, { passive: true });
    resizeSphere();
    if (!reduceMotion) requestAnimationFrame(drawSphere);
  }

  startWireframeSphere();

  function startTronBattle() {
    const canvas = el("canvas", "tron-battlefield");
    canvas.setAttribute("aria-hidden", "true");
    body.appendChild(canvas);
    const context = canvas.getContext("2d");
    if (!context) {
      canvas.remove();
      return;
    }
    const hud = el("div", "tron-hud", "TRON GRID // CLICK A UNIT TO PILOT");
    body.appendChild(hud);
    const units = [];
    const shots = [];
    const keys = new Set();
    const colors = ["#00ffff", "#ff9d00"];
    let selected = null;
    let previous = performance.now();
    let pixelRatio = 1;

    function makeUnit(type, team, index) {
      const margin = 75;
      const unit = {
        type,
        team,
        x: margin + Math.random() * Math.max(1, innerWidth - margin * 2),
        y: margin + Math.random() * Math.max(1, innerHeight - margin * 2),
        angle: Math.random() * Math.PI * 2,
        speed: type === "plane" ? 72 : 42,
        radius: type === "plane" ? 20 : 18,
        hp: 3,
        cooldown: .4 + Math.random(),
        brain: Math.random() * 2,
        name: `${team === 0 ? "CYAN" : "AMBER"}-${type === "tank" ? "T" : "V"}${index + 1}`
      };
      units.push(unit);
    }
    for (let index = 0; index < 4; index += 1) {
      makeUnit(index % 2 ? "plane" : "tank", 0, index);
      makeUnit(index % 2 ? "tank" : "plane", 1, index);
    }

    function resizeBattlefield() {
      pixelRatio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(innerWidth * pixelRatio));
      canvas.height = Math.max(1, Math.floor(innerHeight * pixelRatio));
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      units.forEach(unit => {
        unit.x = Math.max(unit.radius, Math.min(innerWidth - unit.radius, unit.x));
        unit.y = Math.max(unit.radius, Math.min(innerHeight - unit.radius, unit.y));
      });
    }

    function fire(unit) {
      if (unit.cooldown > 0) return;
      unit.cooldown = unit.type === "plane" ? .28 : .55;
      const muzzle = unit.radius + 7;
      shots.push({
        team: unit.team,
        x: unit.x + Math.cos(unit.angle) * muzzle,
        y: unit.y + Math.sin(unit.angle) * muzzle,
        vx: Math.cos(unit.angle) * 310,
        vy: Math.sin(unit.angle) * 310,
        life: 2
      });
    }

    function wrapAngle(angle) {
      return Math.atan2(Math.sin(angle), Math.cos(angle));
    }

    function nearestEnemy(unit) {
      let target = null;
      let distance = Infinity;
      units.forEach(candidate => {
        if (candidate.team === unit.team) return;
        const next = Math.hypot(candidate.x - unit.x, candidate.y - unit.y);
        if (next < distance) { distance = next; target = candidate; }
      });
      return { target, distance };
    }

    function updateUnit(unit, elapsed) {
      unit.cooldown -= elapsed;
      if (unit === selected) {
        if (keys.has("ArrowLeft")) unit.angle -= 2.8 * elapsed;
        if (keys.has("ArrowRight")) unit.angle += 2.8 * elapsed;
        if (keys.has("ArrowUp")) unit.speed += 90 * elapsed;
        if (keys.has("ArrowDown")) unit.speed -= 110 * elapsed;
        const limit = unit.type === "plane" ? 170 : 105;
        unit.speed = Math.max(-limit * .35, Math.min(limit, unit.speed));
        if (keys.has("Space")) fire(unit);
      } else {
        const enemy = nearestEnemy(unit);
        if (enemy.target) {
          const desired = Math.atan2(enemy.target.y - unit.y, enemy.target.x - unit.x);
          unit.angle += Math.max(-1, Math.min(1, wrapAngle(desired - unit.angle))) * elapsed * (unit.type === "plane" ? 1.25 : .8);
          if (Math.abs(wrapAngle(desired - unit.angle)) < .18 && enemy.distance < 420) fire(unit);
        }
        unit.brain -= elapsed;
        if (unit.brain <= 0) {
          unit.brain = 1.2 + Math.random() * 2.4;
          unit.angle += (Math.random() - .5) * .9;
        }
      }
      unit.x += Math.cos(unit.angle) * unit.speed * elapsed;
      unit.y += Math.sin(unit.angle) * unit.speed * elapsed;
      if (unit.x < unit.radius || unit.x > innerWidth - unit.radius) {
        unit.x = Math.max(unit.radius, Math.min(innerWidth - unit.radius, unit.x));
        unit.angle = Math.PI - unit.angle;
      }
      if (unit.y < unit.radius || unit.y > innerHeight - unit.radius) {
        unit.y = Math.max(unit.radius, Math.min(innerHeight - unit.radius, unit.y));
        unit.angle = -unit.angle;
      }
    }

    function drawTank(unit) {
      context.strokeRect(-15, -10, 25, 20);
      context.beginPath();
      context.moveTo(-17, -13); context.lineTo(10, -13);
      context.moveTo(-17, 13); context.lineTo(10, 13);
      context.stroke();
      context.strokeRect(-7, -6, 13, 12);
      context.beginPath();
      context.moveTo(3, 0); context.lineTo(22, 0);
      context.stroke();
    }

    function drawPlane(unit) {
      context.beginPath();
      context.moveTo(22, 0);
      context.lineTo(-12, -7);
      context.lineTo(-4, 0);
      context.lineTo(-12, 7);
      context.closePath();
      context.moveTo(3, 0); context.lineTo(-9, -18);
      context.moveTo(3, 0); context.lineTo(-9, 18);
      context.stroke();
    }

    function drawUnit(unit) {
      context.save();
      context.translate(unit.x, unit.y);
      context.rotate(unit.angle);
      context.strokeStyle = colors[unit.team];
      context.lineWidth = unit === selected ? 2.2 : 1.3;
      context.shadowColor = colors[unit.team];
      context.shadowBlur = unit === selected ? 14 : 7;
      if (unit.type === "tank") drawTank(unit); else drawPlane(unit);
      context.restore();
      context.save();
      context.translate(unit.x, unit.y);
      context.strokeStyle = colors[unit.team];
      context.lineWidth = 1;
      if (unit === selected) {
        context.setLineDash([4, 4]);
        context.beginPath();
        context.arc(0, 0, unit.radius + 8, 0, Math.PI * 2);
        context.stroke();
      }
      for (let hp = 0; hp < unit.hp; hp += 1) context.strokeRect(-12 + hp * 9, unit.radius + 7, 6, 2);
      context.restore();
    }

    function respawn(unit) {
      unit.hp = 3;
      unit.x = unit.radius + Math.random() * Math.max(1, innerWidth - unit.radius * 2);
      unit.y = unit.radius + Math.random() * Math.max(1, innerHeight - unit.radius * 2);
      unit.angle = Math.random() * Math.PI * 2;
      unit.speed = unit.type === "plane" ? 72 : 42;
    }

    function battleLoop(now) {
      const elapsed = Math.min((now - previous) / 1000, .04);
      previous = now;
      units.forEach(unit => updateUnit(unit, elapsed));
      shots.forEach(shot => {
        shot.x += shot.vx * elapsed;
        shot.y += shot.vy * elapsed;
        shot.life -= elapsed;
        units.forEach(unit => {
          if (shot.life <= 0 || unit.team === shot.team) return;
          if (Math.hypot(unit.x - shot.x, unit.y - shot.y) < unit.radius) {
            shot.life = 0;
            unit.hp -= 1;
            if (unit.hp <= 0) {
              if (unit === selected) selected = null;
              respawn(unit);
            }
          }
        });
      });
      for (let index = shots.length - 1; index >= 0; index -= 1) {
        const shot = shots[index];
        if (shot.life <= 0 || shot.x < 0 || shot.x > innerWidth || shot.y < 0 || shot.y > innerHeight) shots.splice(index, 1);
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, innerWidth, innerHeight);
      context.globalCompositeOperation = "lighter";
      shots.forEach(shot => {
        context.fillStyle = colors[shot.team];
        context.shadowColor = colors[shot.team];
        context.shadowBlur = 9;
        context.fillRect(shot.x - 2, shot.y - 2, 4, 4);
      });
      units.forEach(drawUnit);
      context.globalCompositeOperation = "source-over";
      hud.textContent = selected
        ? `PILOTING ${selected.name} // ARROWS: DRIVE // SPACE: FIRE // HP ${selected.hp}/3`
        : "TRON GRID // CLICK A UNIT TO PILOT";
      requestAnimationFrame(battleLoop);
    }

    addEventListener("pointerdown", event => {
      if (event.target.closest("a, button, input, iframe, .toy-panel")) return;
      const hit = units
        .map(unit => ({ unit, distance: Math.hypot(unit.x - event.clientX, unit.y - event.clientY) }))
        .filter(hitTest => hitTest.distance <= hitTest.unit.radius + 10)
        .sort((a, b) => a.distance - b.distance)[0];
      if (hit) {
        selected = hit.unit;
        achievement("tron-pilot", "GRID PILOT");
      }
    }, { passive: true });
    addEventListener("keydown", event => {
      if (event.target.matches("input")) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
        keys.add(event.code);
        if (selected) event.preventDefault();
      }
      if (event.code === "Escape") selected = null;
    });
    addEventListener("keyup", event => keys.delete(event.code));
    addEventListener("resize", resizeBattlefield, { passive: true });
    resizeBattlefield();
    if (!reduceMotion) requestAnimationFrame(battleLoop);
  }

  startTronBattle();

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
