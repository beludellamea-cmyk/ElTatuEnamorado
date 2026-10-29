/* JUGAMOS CON EL TATÚ — tres juegos accesibles (teclado, mouse y pantalla táctil).
   Reutiliza las ilustraciones y los pictogramas ARASAAC del cuento (carpeta img/). */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const E = CUENTO.escenas;
  const raiz = $('juegos');
  const pic = (id, palabra) => ({ id, palabra, src: `img/picto/${id}.png` });
  const hablar = t => { if (window.Tatu) { window.Tatu.detener(); window.Tatu.hablar(t, null, 0.8); } };
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ---------------- Datos de los juegos ---------------- */
  const NIVELES = { 1: 'NIVEL 1 · CON AYUDA', 2: 'NIVEL 2 · PRACTICO', 3: 'NIVEL 3 · DESAFÍO' };

  // Juego 1: números de escena (1 a 8) en cada ronda; el orden correcto es siempre el de la historia.
  const RONDAS_ORDEN = {
    1: [[1, 2, 3], [3, 4, 5], [6, 7, 8]],
    2: [[1, 3, 5, 8], [2, 4, 6, 7], [1, 4, 6, 8], [2, 3, 5, 7]],
    3: [[1, 2, 4, 6, 8], [1, 3, 5, 7, 8], [2, 3, 4, 5, 6]]
  };

  // Juego 2: emociones (pictogramas ARASAAC oficiales)
  const EMO = {
    ENAMORADO: pic(30389, 'ENAMORADO'), FELIZ: pic(35547, 'FELIZ'), ASUSTADO: pic(35535, 'ASUSTADO'),
    ENOJADO: pic(35539, 'ENOJADO'), TRISTE: pic(35545, 'TRISTE'), SORPRENDIDO: pic(35529, 'SORPRENDIDO')
  };
  const SITUACIONES = [
    { escena: 1, corto: 'EL TATÚ ESTÁ ENAMORADO. ¿CÓMO SE SIENTE?',
      largo: 'EL TATÚ CANTA, BAILA Y SUEÑA CON LA IGUANA. ¿CÓMO SE SIENTE?',
      pista: 'MIRÁ EL CORAZÓN QUE FLOTA CERCA DEL TATÚ.',
      principal: 'ENAMORADO', razonables: ['FELIZ'], otros: ['ASUSTADO', 'TRISTE', 'ENOJADO'],
      bien: '¡MUY BIEN! EL TATÚ ESTÁ ENAMORADO DE LA IGUANA.' },
    { escena: 5, corto: 'LOS ANIMALES ESCUCHAN RUIDOS FUERTES. ¿CÓMO SE SIENTEN?',
      largo: 'DE PRONTO SE OYEN RUIDOS MUY FUERTES EN LA LAGUNA. EL MONO, EL ZORRO Y EL TIGRE SALEN CORRIENDO. ¿CÓMO SE SIENTEN?',
      pista: 'MIRÁ LAS CARAS DEL MONO, DEL ZORRO Y DEL TIGRE.',
      principal: 'ASUSTADO', razonables: ['SORPRENDIDO'], otros: ['FELIZ', 'ENAMORADO', 'TRISTE'],
      bien: '¡MUY BIEN! LOS ANIMALES SE ASUSTARON Y SE FUERON.' },
    { escena: 6, corto: 'LA IGUANA DESCUBRE EL TRUCO. ¿CÓMO SE SIENTE?',
      largo: 'LA IGUANA SE DA CUENTA DEL TRUCO DEL TATÚ. ¿CÓMO SE SIENTE AL PRINCIPIO?',
      pista: 'EN EL CUENTO, ELLA PRIMERO SE ENOJÓ.',
      principal: 'ENOJADO', razonables: ['SORPRENDIDO'], otros: ['FELIZ', 'ENAMORADO', 'TRISTE'],
      bien: '¡MUY BIEN! EN EL CUENTO, LA IGUANA PRIMERO SE ENOJÓ.' },
    { escena: 8, corto: 'EL TATÚ Y LA IGUANA SE RECONCILIAN. ¿CÓMO SE SIENTEN?',
      largo: 'EL TATÚ Y LA IGUANA HACEN LAS PACES Y SE HACEN NOVIOS. ¿CÓMO SE SIENTEN?',
      pista: 'MIRÁ LAS SONRISAS Y EL CORAZÓN.',
      principal: 'FELIZ', razonables: ['ENAMORADO'], otros: ['ENOJADO', 'ASUSTADO', 'TRISTE'],
      bien: '¡MUY BIEN! EL TATÚ Y LA IGUANA ESTÁN FELICES.' }
  ];

  // Juego 3: oraciones. Cada palabra tiene su pictograma ARASAAC.
  const P = {
    TATU: pic(8031, 'TATÚ'), AMA: pic(6898, 'AMA'), IGUANA: pic(26134, 'IGUANA'), CANTA: pic(2315, 'CANTA'),
    RANAS: pic(2543, 'RANAS'), AYUDAN: pic(32648, 'AYUDAN'), ANIMALES: pic(6901, 'ANIMALES'),
    MIEDO: pic(39668, 'TIENEN MIEDO'), FLAUTA: pic(37327, 'TOCA LA FLAUTA'), REGALA: pic(16025, 'REGALA'),
    FLOR: pic(3102, 'FLOR'), FELIZ: pic(35547, 'FELIZ')
  };
  const EXTRAS = [pic(2811, 'RÍO'), pic(2248, 'AGUA'), pic(2477, 'MONO'), pic(2590, 'TIGRE'), pic(6022, 'LAGUNA'), pic(2623, 'ZORRO'), pic(2374, 'ENOJADO'), pic(2396, 'FLAUTA')];
  const ORACIONES = [
    { escena: 1, texto: 'EL TATÚ AMA A LA IGUANA.', orden: [P.TATU, P.AMA, P.IGUANA] },
    { escena: 3, texto: 'EL TATÚ CANTA.', orden: [P.TATU, P.CANTA] },
    { escena: 4, texto: 'LAS RANAS AYUDAN AL TATÚ.', orden: [P.RANAS, P.AYUDAN, P.TATU] },
    { escena: 5, texto: 'LOS ANIMALES TIENEN MIEDO.', orden: [P.ANIMALES, P.MIEDO] },
    { escena: 6, texto: 'EL TATÚ TOCA LA FLAUTA.', orden: [P.TATU, P.FLAUTA] },
    { escena: 7, texto: 'EL TATÚ REGALA UNA FLOR.', orden: [P.TATU, P.REGALA, P.FLOR] },
    { escena: 8, texto: 'LA IGUANA ESTÁ FELIZ.', orden: [P.IGUANA, P.FELIZ] }
  ];

  /* ---------------- Estado ---------------- */
  const est = { nivel: 1, vista: 'menu', ronda: 0, hecho: { orden: false, emociones: false, oraciones: false }, juego: null, tablero: null, nota: '' };
  try {
    const g = JSON.parse(localStorage.getItem('tatu-juegos') || '{}');
    if ([1, 2, 3].includes(g.nivel)) est.nivel = g.nivel;
    if (g.hecho) Object.assign(est.hecho, g.hecho);
  } catch (e) {}
  const guardar = () => { try { localStorage.setItem('tatu-juegos', JSON.stringify({ nivel: est.nivel, hecho: est.hecho })); } catch (e) {} };
  const totalHecho = () => Object.values(est.hecho).filter(Boolean).length;

  /* ---------------- Tablero reutilizable: elegir/arrastrar elementos a casilleros numerados ---------------- */
  function Tablero(cfg) {
    // cfg: {items:[{key,html,label}], orden:[keys], onCambio()}
    const t = { items: cfg.items, orden: cfg.orden, pool: shuffle(cfg.items.map(i => i.key)), slots: cfg.orden.map(() => null), bloq: new Set(), sel: null, el: null };
    // evitar que la mezcla inicial ya sea la solución
    if (t.pool.length > 1 && t.pool.slice(0, cfg.orden.length).join() === cfg.orden.join()) t.pool.reverse();
    const item = k => t.items.find(i => i.key === k);
    const quitar = k => { t.pool = t.pool.filter(x => x !== k); t.slots = t.slots.map(s => (s === k ? null : s)); };
    t.colocar = (k, i) => {
      if (t.bloq.has(t.slots[i]) || t.bloq.has(k)) return;
      const previo = t.slots[i];
      quitar(k);
      if (previo && previo !== k) t.pool.push(previo);
      t.slots[i] = k; t.sel = null; t.dibujar(`slot-${i}`);
    };
    t.devolver = k => { if (t.bloq.has(k)) return; quitar(k); t.pool.push(k); t.sel = null; t.dibujar(`it-${k}`); };
    t.lleno = () => t.slots.every(Boolean);
    t.comprobar = () => {
      let bien = 0;
      t.slots.forEach((k, i) => {
        if (k === t.orden[i]) { t.bloq.add(k); bien++; }
        else if (k) { t.pool.push(k); t.slots[i] = null; }
      });
      t.sel = null; t.dibujar();
      return { bien, total: t.orden.length, listo: bien === t.orden.length };
    };
    t.pista = () => {
      const i = t.slots.findIndex((k, n) => k !== t.orden[n]);
      if (i === -1) return false;
      const k = t.orden[i]; quitar(k);
      if (t.slots[i]) t.pool.push(t.slots[i]);
      t.slots[i] = k; t.bloq.add(k); t.sel = null; t.dibujar(`slot-${i}`);
      return true;
    };
    t.dibujar = (foco) => {
      const e = t.el;
      const activo = foco || (document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.f : null);
      e.innerHTML = `<div class="slots" role="group" aria-label="CASILLEROS NUMERADOS">${t.slots.map((k, i) => {
        const it = k && item(k);
        return `<div role="button" tabindex="0" class="slot ${it ? 'lleno' : ''} ${t.bloq.has(k) ? 'ok' : ''}" data-i="${i}" data-f="slot-${i}" ${it ? `draggable="${!t.bloq.has(k)}" data-k="${k}"` : ''}
          aria-label="CASILLERO ${i + 1}${it ? ': ' + esc(it.label) + (t.bloq.has(k) ? ' (CORRECTO)' : '') : ' VACÍO'}">
          <span class="num">${i + 1}</span>${it ? it.html : ''}</div>`;
      }).join('')}</div>
      <div class="pool" role="group" aria-label="ELEMENTOS PARA ORDENAR">${t.pool.map(k => {
        const it = item(k);
        return `<div role="button" tabindex="0" class="item ${t.sel === k ? 'sel' : ''}" draggable="true" data-k="${k}" data-f="it-${k}" aria-pressed="${t.sel === k}" aria-label="${esc(it.label)}">${it.html}</div>`;
      }).join('')}</div>`;
      if (activo) { const f = e.querySelector(`[data-f="${activo}"]`); if (f) f.focus({ preventScroll: true }); }
      if (cfg.onCambio) cfg.onCambio(t);
    };
    t.montar = el => {
      t.el = el;
      el.addEventListener('click', ev => {
        const slot = ev.target.closest('.slot'), it = ev.target.closest('.item');
        if (slot) {
          const i = +slot.dataset.i;
          if (t.sel) t.colocar(t.sel, i);
          else if (t.slots[i] && !t.bloq.has(t.slots[i])) { const k = t.slots[i]; t.devolver(k); t.sel = k; t.dibujar(`it-${k}`); }
        } else if (it) { t.sel = t.sel === it.dataset.k ? null : it.dataset.k; t.dibujar(`it-${it.dataset.k}`); }
      });
      el.addEventListener('keydown', ev => {
        if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.slot, .item')) { ev.preventDefault(); ev.target.click(); }
      });
      el.addEventListener('dragstart', ev => {
        const b = ev.target.closest('[data-k]'); if (!b || t.bloq.has(b.dataset.k)) { ev.preventDefault(); return; }
        ev.dataTransfer.setData('text/plain', b.dataset.k); ev.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragover', ev => { if (ev.target.closest('.slot, .pool')) ev.preventDefault(); });
      el.addEventListener('drop', ev => {
        ev.preventDefault();
        const k = ev.dataTransfer.getData('text/plain'); if (!k || !item(k)) return;
        const slot = ev.target.closest('.slot');
        if (slot) t.colocar(k, +slot.dataset.i); else if (ev.target.closest('.pool')) t.devolver(k);
      });
      t.dibujar();
    };
    return t;
  }

  /* ---------------- Vistas ---------------- */
  function marco(titulo, cuerpo, extraTop) {
    return `<div class="j-wrap nivel-${est.nivel}">
      <div class="j-top">
        <button class="btn btn-sec" data-a="menu">◀ MENÚ DE JUEGOS</button>
        ${extraTop || ''}
        <button class="btn btn-sec" data-a="cuento">VOLVER AL CUENTO</button>
      </div>
      <h2 class="j-titulo">${titulo}</h2>
      ${selectorNivel()}
      ${cuerpo}</div>`;
  }
  function selectorNivel() {
    return `<div class="niveles" role="group" aria-label="NIVEL DE APOYO">${[1, 2, 3].map(n =>
      `<button class="btn nivel-btn ${est.nivel === n ? 'activo' : ''}" data-nivel="${n}" aria-pressed="${est.nivel === n}">${NIVELES[n]}</button>`).join('')}</div>`;
  }

  function menu() {
    est.vista = 'menu'; est.tablero = null;
    const tarjetas = [
      { id: 'orden', titulo: 'ORDENAMOS LA HISTORIA', desc: 'PONÉ LAS IMÁGENES DESDE EL PRINCIPIO HASTA EL FINAL.', img: E[2].img },
      { id: 'emociones', titulo: '¿CÓMO SE SIENTE?', desc: 'ELEGÍ EL PICTOGRAMA DE LA EMOCIÓN.', img: E[4].img },
      { id: 'oraciones', titulo: 'ARMAMOS ORACIONES', desc: 'ORDENÁ LOS PICTOGRAMAS Y ARMÁ LA ORACIÓN.', img: E[6].img }
    ];
    raiz.innerHTML = `<div class="j-wrap nivel-${est.nivel}">
      <div class="j-top"><button class="btn btn-sec" data-a="cuento">◀ VOLVER AL CUENTO</button><button class="btn btn-sec" data-ir-portada>⌂ PORTADA</button></div>
      <h2 class="j-titulo">🎮 JUGAMOS CON EL TATÚ</h2>
      <p class="j-sub">ELEGÍ TU NIVEL Y UN JUEGO. ¡NO HAY TIEMPO NI PUNTOS: JUGÁ TRANQUILO!</p>
      ${selectorNivel()}
      <div class="j-menu">${tarjetas.map(c => `
        <button class="j-card" data-juego="${c.id}">
          <span class="j-card-img"><img src="${c.img}" alt=""></span>
          <span class="j-card-t">${c.titulo}</span>
          <span class="j-card-d">${c.desc}</span>
          ${est.hecho[c.id] ? '<span class="j-ok">★ COMPLETADO</span>' : ''}
        </button>`).join('')}</div>
      ${totalHecho() === 3 ? '<div class="j-fin-menu"><button class="btn btn-grande" data-a="celebra">★ VER MI DIPLOMA</button></div>' : ''}
    </div>`;
  }

  /* ----- Juego 1: ordenar la historia ----- */
  function juegoOrden() {
    const rondas = RONDAS_ORDEN[est.nivel];
    const esenas = rondas[est.ronda];
    const consigna = 'ORDENÁ LAS IMÁGENES DESDE EL PRINCIPIO HASTA EL FINAL';
    const items = esenas.map(n => ({
      key: String(n), label: E[n - 1].alt,
      html: `<img src="${E[n - 1].img}" alt="${esc(E[n - 1].alt)}">${est.nivel === 1 ? `<span class="cap">${esc(E[n - 1].titulo)}</span>` : ''}`
    }));
    raiz.innerHTML = marco('ORDENAMOS LA HISTORIA', `
      <p class="consigna">${consigna}.</p>
      <p class="j-prog">RONDA ${est.ronda + 1} DE ${rondas.length}</p>
      <div class="j-botones">
        <button class="btn btn-azul" data-a="oir">🔊 ESCUCHAR CONSIGNA</button>
        <button class="btn btn-verde" data-a="comprobar" id="btnComprobar">✔ COMPROBAR</button>
        ${est.nivel < 3 ? '<button class="btn btn-sec" data-a="pista">💡 PISTA</button>' : ''}
        <button class="btn btn-sec" data-a="reintentar">↻ VOLVER A INTENTAR</button>
      </div>
      <p id="fb" class="fb" role="status" aria-live="polite">${est.nivel === 1 ? 'TOCÁ UNA IMAGEN Y DESPUÉS TOCÁ UN CASILLERO. TAMBIÉN PODÉS ARRASTRARLA.' : 'ELEGÍ UNA IMAGEN Y UN CASILLERO, O ARRASTRALA.'}</p>
      <div id="tablero" class="tablero orden"></div>`);
    est.tablero = Tablero({ items, orden: esenas.map(String) });
    est.tablero.montar($('tablero'));
    est.consigna = consigna;
    if (est.nivel === 1) hablar(consigna);
  }

  /* ----- Juego 2: ¿cómo se siente? ----- */
  function juegoEmociones() {
    const s = SITUACIONES[est.ronda];
    const pregunta = est.nivel === 3 ? s.largo : s.corto;
    let claves;
    if (est.nivel === 1) claves = [s.principal, s.otros[0]];
    else if (est.nivel === 2) claves = [s.principal, ...s.otros.slice(0, 2)];
    else claves = [s.principal, s.razonables[0], ...s.otros.slice(0, 2)];
    claves = shuffle(claves);
    est.sit = s; est.pregunta = pregunta;
    raiz.innerHTML = marco('¿CÓMO SE SIENTE?', `
      <p class="j-prog">SITUACIÓN ${est.ronda + 1} DE ${SITUACIONES.length}</p>
      <div class="img-marco j-img"><img src="${E[s.escena - 1].img}" alt="${esc(E[s.escena - 1].alt)}"></div>
      <p class="consigna">${pregunta}</p>
      <div class="j-botones">
        <button class="btn btn-azul" data-a="oir">🔊 ESCUCHAR LA PREGUNTA</button>
        ${est.nivel < 3 ? '<button class="btn btn-sec" data-a="pista">💡 PISTA</button>' : ''}
      </div>
      <p id="fb" class="fb" role="status" aria-live="polite"></p>
      <div class="opciones" role="group" aria-label="RESPUESTAS">${claves.map(k => `
        <div class="opcion">
          <button class="opc-main" data-resp="${k}" aria-label="${EMO[k].palabra}"><img src="${EMO[k].src}" alt=""><span>${EMO[k].palabra}</span></button>
          <button class="opc-oir" data-oir="${k}" aria-label="ESCUCHAR: ${EMO[k].palabra}">🔊</button>
        </div>`).join('')}</div>
      <div id="sigWrap" class="j-botones oculto"><button class="btn btn-grande" data-a="siguiente">${est.ronda === SITUACIONES.length - 1 ? 'TERMINAR ★' : 'SIGUIENTE ▶'}</button></div>`);
    if (est.nivel === 1) hablar(pregunta);
  }

  /* ----- Juego 3: armamos oraciones ----- */
  function juegoOraciones() {
    const o = ORACIONES[est.ronda];
    const nExtra = est.nivel === 1 ? 0 : est.nivel === 2 ? 1 : 2;
    const ids = new Set(o.orden.map(p => p.id));
    const extras = sample(EXTRAS.filter(p => !ids.has(p.id)), nExtra);
    const items = [...o.orden, ...extras].map(p => ({
      key: String(p.id), label: p.palabra,
      html: `<img src="${p.src}" alt=""><span class="pw">${p.palabra}</span>`
    }));
    const modelo = `<div class="modelo-pictos">${o.orden.map(p => `<span><img src="${p.src}" alt=""><b>${p.palabra}</b></span>`).join('')}</div>`;
    raiz.innerHTML = marco('ARMAMOS ORACIONES', `
      <p class="j-prog">ORACIÓN ${est.ronda + 1} DE ${ORACIONES.length}</p>
      <div class="img-marco j-img"><img src="${E[o.escena - 1].img}" alt="${esc(E[o.escena - 1].alt)}"></div>
      <p class="consigna">ORDENÁ LOS PICTOGRAMAS PARA ARMAR LA ORACIÓN.</p>
      ${est.nivel === 1 ? `<div class="modelo"><p>MODELO:</p>${modelo}<p class="modelo-t">${o.texto}</p></div>` : ''}
      ${est.nivel === 2 ? `<div id="modeloWrap" class="modelo oculto"><p>MODELO:</p>${modelo}<p class="modelo-t">${o.texto}</p></div>` : ''}
      <div class="j-botones">
        <button class="btn btn-azul" data-a="oir">🔊 ESCUCHAR CONSIGNA</button>
        <button class="btn btn-verde" data-a="comprobar">✔ COMPROBAR</button>
        ${est.nivel === 2 ? '<button class="btn btn-sec" data-a="modelo">👁 MOSTRAR MODELO</button>' : ''}
        ${est.nivel < 3 ? '<button class="btn btn-sec" data-a="pista">💡 PISTA</button>' : ''}
        <button class="btn btn-sec" data-a="reintentar">↻ VOLVER A INTENTAR</button>
      </div>
      <p id="fb" class="fb" role="status" aria-live="polite">${nExtra ? 'ATENCIÓN: ¡SOBRAN ALGUNOS PICTOGRAMAS!' : 'TOCÁ UN PICTOGRAMA Y DESPUÉS UN CASILLERO. TAMBIÉN PODÉS ARRASTRARLO.'}</p>
      <div id="tablero" class="tablero oraciones"></div>
      <p id="oracionFinal" class="oracion-final oculto"></p>
      <div id="sigWrap" class="j-botones oculto"><button class="btn btn-grande" data-a="siguiente">${est.ronda === ORACIONES.length - 1 ? 'TERMINAR ★' : 'SIGUIENTE ▶'}</button></div>`);
    est.tablero = Tablero({ items, orden: o.orden.map(p => String(p.id)) });
    est.tablero.montar($('tablero'));
    est.consigna = 'Ordená los pictogramas para armar la oración.';
    if (est.nivel === 1) hablar(est.consigna);
  }

  function celebracion() {
    est.vista = 'celebra'; est.tablero = null;
    raiz.innerHTML = `<div class="j-wrap celebra">
      <h2 class="j-titulo grande">¡FELICITACIONES!</h2>
      <p class="j-sub grande">¡SOS UN GRAN LECTOR!</p>
      <div class="img-marco j-img"><img src="${E[7].img}" alt="El tatú y la iguana, felices"></div>
      <div class="j-botones">
        <button class="btn btn-grande" data-a="rejugar">VOLVER A JUGAR</button>
        <button class="btn btn-azul" data-a="cuento">VOLVER AL CUENTO</button>
        <button class="btn btn-verde" data-a="diploma">🖨 IMPRIMIR MI DIPLOMA</button>
      </div></div>`;
    hablar('¡Felicitaciones! ¡Sos un gran lector!');
  }

  function finJuego() {
    est.hecho[est.juego] = true; guardar();
    if (totalHecho() === 3) { celebracion(); return; }
    raiz.innerHTML = `<div class="j-wrap"><h2 class="j-titulo grande">¡MUY BIEN!</h2>
      <p class="j-sub grande">¡COMPLETASTE ESTE JUEGO!</p>
      <div class="img-marco j-img"><img src="${E[7].img}" alt="El tatú y la iguana, felices"></div>
      <div class="j-botones"><button class="btn btn-grande" data-a="menu">ELEGIR OTRO JUEGO</button>
      <button class="btn btn-sec" data-a="rejugarJuego">JUGAR DE NUEVO</button></div></div>`;
    hablar('¡Muy bien! ¡Completaste este juego!');
  }

  function iniciar(juego) {
    est.juego = juego; est.vista = 'juego'; est.ronda = 0; mostrarJuego();
  }
  function mostrarJuego() {
    ({ orden: juegoOrden, emociones: juegoEmociones, oraciones: juegoOraciones })[est.juego]();
    window.scrollTo(0, 0);
  }

  /* ---------------- Eventos ---------------- */
  const fb = (t, tono) => { const e = $('fb'); if (e) { e.textContent = t; e.className = 'fb ' + (tono || ''); } };
  function siguienteRonda(total) {
    est.ronda++;
    if (est.ronda >= total) finJuego(); else mostrarJuego();
  }
  raiz.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.nivel) { est.nivel = +b.dataset.nivel; guardar(); if (est.vista === 'juego') { est.ronda = 0; mostrarJuego(); } else menu(); return; }
    if (b.dataset.juego) { iniciar(b.dataset.juego); return; }
    if (b.hasAttribute('data-ir-portada')) { window.Tatu.ir('portada'); return; }
    if (b.dataset.resp) { responder(b.dataset.resp); return; }
    if (b.dataset.oir) { hablar(EMO[b.dataset.oir].palabra); return; }
    const a = b.dataset.a; if (!a) return;
    const t = est.tablero;
    if (a === 'menu') menu();
    else if (a === 'cuento') window.Tatu.irLector(0);
    else if (a === 'oir') hablar(est.juego === 'emociones' ? est.pregunta : est.consigna);
    else if (a === 'reintentar') mostrarJuego();
    else if (a === 'rejugarJuego') iniciar(est.juego);
    else if (a === 'rejugar') { est.hecho = { orden: false, emociones: false, oraciones: false }; guardar(); menu(); }
    else if (a === 'celebra') celebracion();
    else if (a === 'diploma') window.Tatu.imprimir('diploma');
    else if (a === 'modelo') { $('modeloWrap').classList.toggle('oculto'); }
    else if (a === 'pista') pista();
    else if (a === 'comprobar') comprobar();
    else if (a === 'siguiente') siguienteRonda(est.juego === 'emociones' ? SITUACIONES.length : ORACIONES.length);
    else if (a === 'siguienteOrden') siguienteRonda(RONDAS_ORDEN[est.nivel].length);
  });

  function pista() {
    if (est.juego === 'emociones') { fb('PISTA: ' + est.sit.pista, 'pista'); hablar(est.sit.pista); return; }
    const t = est.tablero; if (!t) return;
    if (t.pista()) fb('¡TE AYUDÉ A PONER UNA! SEGUÍ VOS.', 'pista'); else fb('¡YA ESTÁ TODO EN SU LUGAR!', 'ok');
  }

  function comprobar() {
    const t = est.tablero; if (!t) return;
    if (!t.lleno()) { fb('TODAVÍA FALTAN CASILLEROS POR COMPLETAR. ¡SEGUÍ!', 'pista'); hablar('Todavía faltan casilleros por completar.'); return; }
    const r = t.comprobar();
    if (r.listo) {
      if (est.juego === 'orden') {
        const ult = est.ronda === RONDAS_ORDEN[est.nivel].length - 1;
        fb('¡MUY BIEN! ¡ORDENASTE LA HISTORIA!', 'ok'); hablar('¡Muy bien! ¡Ordenaste la historia!');
        if (document.querySelector('[data-a="siguienteOrden"]')) return;
        const bt = document.createElement('div'); bt.className = 'j-botones';
        bt.innerHTML = `<button class="btn btn-grande" data-a="siguienteOrden">${ult ? 'TERMINAR ★' : 'SIGUIENTE ▶'}</button>`;
        $('tablero').after(bt);
      } else {
        const o = ORACIONES[est.ronda];
        const e = $('oracionFinal'); e.textContent = o.texto; e.classList.remove('oculto');
        fb('¡MUY BIEN! ARMASTE LA ORACIÓN.', 'ok'); hablar(o.texto);
        $('sigWrap').classList.remove('oculto');
      }
    } else {
      const msg = r.bien === 0
        ? '¡SEGUÍ PROBANDO! PENSÁ QUÉ PASA PRIMERO EN EL CUENTO Y QUÉ PASA DESPUÉS.'
        : `¡CASI! ${r.bien} ${r.bien === 1 ? 'ESTÁ' : 'ESTÁN'} EN SU LUGAR (EN VERDE). PROBÁ CON LAS DEMÁS.`;
      fb(msg, 'casi'); hablar(r.bien === 0 ? 'Seguí probando. Pensá qué pasa primero en el cuento.' : '¡Casi! Probá de nuevo con las demás.');
    }
  }

  function responder(k) {
    const s = est.sit;
    document.querySelectorAll('.opc-main').forEach(b => b.classList.remove('elegida', 'bien', 'razon'));
    const btn = document.querySelector(`[data-resp="${k}"]`);
    hablar(EMO[k].palabra);
    if (k === s.principal) {
      btn.classList.add('bien'); fb(s.bien, 'ok'); setTimeout(() => hablar(s.bien.replace('¡MUY BIEN! ', '¡Muy bien! ').toLowerCase()), 900);
      $('sigWrap').classList.remove('oculto');
    } else if (s.razonables.includes(k)) {
      btn.classList.add('razon');
      const t = `¡BUENA IDEA! TAMBIÉN PUEDE SENTIR ${EMO[k].palabra}. ${s.bien.replace('¡MUY BIEN! ', 'EN EL CUENTO: ')}`;
      fb(t, 'ok'); setTimeout(() => hablar(t.toLowerCase()), 900); $('sigWrap').classList.remove('oculto');
    } else {
      btn.classList.add('elegida'); fb('PENSÁ OTRA VEZ. ¡PODÉS ELEGIR DE NUEVO!', 'casi');
    }
  }

  if (!raiz.classList.contains('oculto')) menu();
  document.addEventListener('tatu:vista', e => { if (e.detail === 'juegos') { est.vista = 'menu'; menu(); } });
})();
