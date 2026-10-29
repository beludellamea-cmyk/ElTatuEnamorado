(() => {
  const $ = id => document.getElementById(id);
  const esc = CUENTO.escenas;
  let actual = 0;
  let lecturaId = 0;
  const cfg = { letra: 0, narracion: false, pictosGrandes: false, sinAnim: false };

  /* ---------- Preferencias (localStorage opcional) ---------- */
  function cargarCfg() {
    try { Object.assign(cfg, JSON.parse(localStorage.getItem('tatu-cfg') || '{}')); } catch (e) {}
    try { if (matchMedia('(prefers-reduced-motion: reduce)').matches && !localStorage.getItem('tatu-cfg')) cfg.sinAnim = true; } catch (e) {}
  }
  function guardarCfg() { try { localStorage.setItem('tatu-cfg', JSON.stringify(cfg)); } catch (e) {} }
  function aplicarCfg() {
    const base = window.innerWidth <= 640 ? 1.5 : 2.1;
    document.documentElement.style.setProperty('--fs-texto', (base + cfg.letra * 0.25) + 'rem');
    document.body.classList.toggle('pictos-grandes', cfg.pictosGrandes);
    document.body.classList.toggle('sin-anim', cfg.sinAnim);
    $('optNarracion').checked = cfg.narracion;
    $('optPictosGrandes').checked = cfg.pictosGrandes;
    $('optSinAnim').checked = cfg.sinAnim;
  }

  /* ---------- Voz ---------- */
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voz = null;
  function elegirVoz() {
    if (!synth) return;
    const vs = synth.getVoices();
    const orden = [/es[-_]AR/i, /es[-_]419/i, /es[-_](US|MX|UY|CL|CO)/i, /^es/i];
    for (const re of orden) { const v = vs.find(v => re.test(v.lang)); if (v) { voz = v; break; } }
    const aviso = $('avisoVoz');
    if (!voz && vs.length) { aviso.textContent = 'TU NAVEGADOR NO TIENE UNA VOZ EN ESPAÑOL. PROBÁ CON CHROME, EDGE O SAFARI.'; aviso.classList.remove('oculto'); }
    else if (voz && !/es[-_]AR/i.test(voz.lang)) { aviso.classList.add('oculto'); }
  }
  if (synth) { elegirVoz(); synth.onvoiceschanged = elegirVoz; }
  else document.addEventListener('DOMContentLoaded', () => { $('avisoVoz').textContent = 'ESTE NAVEGADOR NO PERMITE LA NARRACIÓN CON VOZ.'; $('avisoVoz').classList.remove('oculto'); });

  function hablar(texto, onFin, rate = 0.8) {
    if (!synth) { onFin && onFin(); return; }
    const u = new SpeechSynthesisUtterance(texto.toLowerCase());
    u.lang = voz ? voz.lang : 'es-AR'; if (voz) u.voice = voz;
    u.rate = rate; u.pitch = 1.05;
    u.onend = () => onFin && onFin();
    u.onerror = () => onFin && onFin();
    synth.speak(u);
  }
  function detener() {
    lecturaId++;
    if (synth) synth.cancel();
    document.querySelectorAll('.or.activa').forEach(e => e.classList.remove('activa'));
    limpiarLectura();
  }
  const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,;:!?¡¿]/g, '').toUpperCase();
  let mapa = []; // por oración: {palabra índice global → [índices de picto]}
  function asignarClaves(e) {
    const ws = [...document.querySelectorAll('#texto .w')];
    const normas = ws.map(w => norm(w.textContent));
    let desde = 0;
    mapa = e.pictos.map(p => {
      const kw = norm(p.clave || p.palabra).split(' ');
      const buscar = ini => { for (let i = ini; i < normas.length; i++) if (kw.every((k, j) => normas[i + j] === k)) return i; return -1; };
      let i = buscar(desde);
      if (i !== -1) { desde = i + 1; return i; }
      return buscar(0); // pictograma cuya palabra aparece antes en el texto
    });
  }
  function encender(palabraIdx) {
    const ws = [...document.querySelectorAll('#texto .w')];
    ws.forEach((w, i) => w.classList.toggle('leyendo', i === palabraIdx));
    mapa.forEach((idx, k) => {
      if (idx !== -1 && idx === palabraIdx) {
        document.querySelectorAll('#pictos .picto').forEach((b, j) => b.classList.toggle('sonando', j === k));
      }
    });
  }
  function limpiarLectura() {
    document.querySelectorAll('.w.leyendo').forEach(w => w.classList.remove('leyendo'));
    document.querySelectorAll('.picto.sonando').forEach(b => b.classList.remove('sonando'));
  }
  function leerEscena() {
    detener();
    const id = lecturaId;
    const ors = [...document.querySelectorAll('#texto .or')];
    let base = 0; // índice global de palabra al comenzar cada oración
    const paso = i => {
      if (id !== lecturaId) return;
      ors.forEach(o => o.classList.remove('activa'));
      if (i >= ors.length) { setTimeout(() => { if (id === lecturaId) limpiarLectura(); }, 900); return; }
      const or = ors[i];
      const palabras = [...or.querySelectorAll('.w')];
      const inicio = base; base += palabras.length;
      or.classList.add('activa');
      const texto = palabras.map(w => w.textContent).join(' ');
      const offs = []; let pos = 0;
      palabras.forEach(w => { offs.push(pos); pos += w.textContent.length + 1; });
      let ultimo = -1, huboEvento = false, timers = [];
      const marcar = n => { if (n !== ultimo && id === lecturaId) { ultimo = n; encender(inicio + n); } };
      const fin = () => { timers.forEach(clearTimeout); if (id === lecturaId) setTimeout(() => paso(i + 1), 300); };
      if (!synth) { marcar(0); setTimeout(fin, 1500); return; }
      const u = new SpeechSynthesisUtterance(texto.toLowerCase());
      u.lang = voz ? voz.lang : 'es-AR'; if (voz) u.voice = voz;
      u.rate = 0.8; u.pitch = 1.05;
      u.onboundary = ev => {
        if (ev.name && ev.name !== 'word') return;
        huboEvento = true;
        let n = 0; offs.forEach((o, k) => { if (ev.charIndex >= o) n = k; });
        marcar(n);
      };
      u.onstart = () => {
        marcar(0);
        // Respaldo: si el navegador no emite eventos de palabra, se estima el tiempo por cantidad de letras
        setTimeout(() => {
          if (huboEvento || id !== lecturaId) return;
          let t = 0;
          palabras.forEach((w, k) => { timers.push(setTimeout(() => marcar(k), t)); t += (w.textContent.length * 95 + 120); });
        }, 700);
      };
      u.onend = fin; u.onerror = fin;
      synth.speak(u);
    };
    paso(0);
  }

  /* ---------- Render ---------- */
  function mostrar(i, leer) {
    detener();
    actual = Math.max(0, Math.min(esc.length - 1, i));
    const e = esc[actual];
    const img = $('escenaImg'), err = $('imgError');
    err.classList.add('oculto');
    img.onerror = () => err.classList.remove('oculto');
    img.src = e.img; img.alt = e.alt;
    $('escenaTitulo').textContent = e.titulo;
    $('texto').innerHTML = e.oraciones.map(o => `<span class="or">${o.split(' ').map(w => `<span class="w">${w}</span>`).join(' ')}</span>`).join('');
    asignarClaves(e);
    const cont = $('pictos'); cont.innerHTML = '';
    e.pictos.forEach(p => {
      const b = document.createElement('button');
      b.className = 'picto'; b.setAttribute('role', 'listitem');
      b.setAttribute('aria-label', 'PICTOGRAMA ' + p.palabra + '. TOCAR PARA ESCUCHAR');
      const im = document.createElement('img');
      im.src = p.src; im.alt = ''; im.loading = 'eager';
      im.onerror = () => { im.replaceWith(Object.assign(document.createElement('div'), { textContent: '…', style: 'height:var(--picto);display:flex;align-items:center;justify-content:center;font-size:2rem' })); };
      const s = document.createElement('span'); s.textContent = p.palabra;
      b.append(im, s);
      b.onclick = () => abrirPicto(p);
      cont.appendChild(b);
    });
    $('indicador').textContent = `${actual + 1} DE ${esc.length}`;
    $('btnAnterior').disabled = actual === 0;
    $('btnSiguiente').textContent = actual === esc.length - 1 ? 'FIN ★' : 'SIGUIENTE ▶';
    $('btnSiguiente').disabled = false;
    try { history.replaceState(null, '', '#p' + (actual + 1)); } catch (x) {}
    if (leer && cfg.narracion) leerEscena();
  }
  const VISTAS = ['portada', 'lector', 'fin', 'juegos'];
  function ir(id) {
    detener();
    VISTAS.forEach(v => $(v).classList.toggle('oculto', v !== id));
    if (id === 'portada') { try { history.replaceState(null, '', location.pathname); } catch (x) {} }
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent('tatu:vista', { detail: id }));
  }
  function irPortada() { ir('portada'); }
  function irLector(i) { ir('lector'); mostrar(i, true); }
  function siguiente() { if (actual === esc.length - 1) { ir('fin'); return; } mostrar(actual + 1, true); window.scrollTo(0, 0); }
  function anterior() { if (actual > 0) { mostrar(actual - 1, true); window.scrollTo(0, 0); } }

  /* ---------- Pictograma ampliado (no cambia la escena) ---------- */
  let pictoActual = null, foco = null;
  function abrirPicto(p) {
    pictoActual = p; foco = document.activeElement;
    $('modalImg').src = p.src; $('modalImg').alt = p.palabra;
    $('modalPalabra').textContent = p.palabra;
    $('modal').classList.remove('oculto');
    $('modalRepetir').focus();
    detener(); hablar(p.palabra, null, 0.7);
  }
  function cerrarPicto() { $('modal').classList.add('oculto'); if (synth) synth.cancel(); if (foco && foco.focus) foco.focus(); }

  /* ---------- Versión imprimible (todo local, sin conexión) ---------- */
  function construirImprimible(modo) {
    modo = modo || 'completo';
    if (modo === 'diploma') {
      $('imprimible').innerHTML = `<div class="p-pag p-diploma"><div class="dip-marco">
        <div class="dip-sub">E.P.E.E N° 3</div><h1>DIPLOMA DE LECTOR</h1>
        <img class="p-img" src="${esc[7].img}" alt="">
        <p class="dip-texto">PARTICIPÉ EN LAS AVENTURAS DE<br><b>EL TATÚ ENAMORADO</b></p>
        <div class="dip-nombre"><div class="dip-linea"></div><span>NOMBRE DEL ESTUDIANTE</span></div>
        <div class="p-autoria">CREADO POR BELÉN DELLAMEA · E.P.E.E N° 3</div></div></div>`;
      return;
    }
    const aut = '<div class="p-autoria">CREADO POR BELÉN DELLAMEA · E.P.E.E N° 3</div>';
    const cred = '<div class="p-credito">PICTOGRAMAS: ARASAAC (arasaac.org) — AUTOR: SERGIO PALAO — ORIGEN: ARASAAC, GOBIERNO DE ARAGÓN — LICENCIA CC BY-NC-SA 4.0</div>';
    let h = '';
    if (modo !== 'recortar') {
      h += `<div class="p-pag p-portada"><h1>${CUENTO.titulo}</h1><div class="sub">UN CUENTO PARA LEER, MIRAR Y ESCUCHAR</div>
      <img class="p-img" src="${CUENTO.portadaImg}" alt=""><div class="lema">LECTURA ACCESIBLE CON APOYOS VISUALES Y PICTOGRAMAS</div>${aut}${modo === 'completo' ? cred : ''}</div>`;
      esc.forEach((e, i) => {
        const tarjetas = e.pictos.map(p => modo === 'pegar'
          ? `<div class="p-picto vacio"><div class="hueco"></div><span>${p.palabra}</span></div>`
          : `<div class="p-picto"><img src="${p.src}" alt=""><span>${p.palabra}</span></div>`).join('');
        h += `<div class="p-pag"><div class="p-titulo">${e.titulo}</div><img class="p-img" src="${e.img}" alt="">
        <div class="p-texto">${e.oraciones.map(o => `<p>${o}</p>`).join('')}</div>
        <div class="p-pictos">${tarjetas}</div>
        <div class="p-num">${i + 1} DE ${esc.length}</div>${aut}${modo === 'completo' ? cred : ''}</div>`;
      });
    } else {
      const todos = [];
      esc.forEach((e, i) => e.pictos.forEach(p => todos.push({ ...p, pag: i + 1 })));
      for (let k = 0; k < todos.length; k += 18) {
        h += `<div class="p-pag p-recorte"><div class="p-titulo">PICTOGRAMAS PARA RECORTAR Y PEGAR</div><div class="p-grilla">` +
          todos.slice(k, k + 18).map(p => `<div class="p-picto"><div class="pg">PÁG. ${p.pag}</div><img src="${p.src}" alt=""><span>${p.palabra}</span></div>`).join('') +
          `</div>${aut}${cred}</div>`;
      }
    }
    $('imprimible').innerHTML = h;
  }
  window.construirImprimible = construirImprimible;
  function imprimir(modo) {
    detener();
    construirImprimible(modo);
    const imgs = [...$('imprimible').querySelectorAll('img')];
    Promise.all(imgs.map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; }))).then(() => setTimeout(() => window.print(), 150));
  }

  /* ---------- Eventos ---------- */
  function iniciar() {
    cargarCfg(); aplicarCfg();
    $('portadaImg').src = CUENTO.portadaImg;
    $('btnComenzar').onclick = () => irLector(0);
    document.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => ir(b.dataset.ir));
    $('btnVolverLeer').onclick = () => irLector(0);
    $('btnEscucharFin').onclick = () => { detener(); hablar('¡Terminamos el cuento! ¿Jugamos con el tatú?'); };
    $('btnPortada').onclick = irPortada;
    $('btnAnterior').onclick = anterior;
    $('btnSiguiente').onclick = siguiente;
    $('btnEscuchar').onclick = leerEscena;
    $('btnRepetir').onclick = leerEscena;
    $('btnDetener').onclick = detener;
    document.querySelectorAll('[data-imprimir]').forEach(b => b.onclick = () => imprimir(b.dataset.imprimir));
    $('btnAjustes').onclick = () => { const p = $('panelAjustes'); const a = p.classList.toggle('oculto'); $('btnAjustes').setAttribute('aria-expanded', String(!a)); };
    $('letraMas').onclick = () => { cfg.letra = Math.min(4, cfg.letra + 1); guardarCfg(); aplicarCfg(); };
    $('letraMenos').onclick = () => { cfg.letra = Math.max(-3, cfg.letra - 1); guardarCfg(); aplicarCfg(); };
    $('optNarracion').onchange = e => { cfg.narracion = e.target.checked; guardarCfg(); if (!cfg.narracion) detener(); };
    $('optPictosGrandes').onchange = e => { cfg.pictosGrandes = e.target.checked; guardarCfg(); aplicarCfg(); };
    $('optSinAnim').onchange = e => { cfg.sinAnim = e.target.checked; guardarCfg(); aplicarCfg(); };
    $('modalRepetir').onclick = () => pictoActual && (synth && synth.cancel(), hablar(pictoActual.palabra, null, 0.7));
    $('modalCerrar').onclick = cerrarPicto;
    $('modal').onclick = e => { if (e.target === $('modal')) cerrarPicto(); };
    window.addEventListener('resize', aplicarCfg);
    window.addEventListener('beforeprint', detener);
    document.addEventListener('keydown', e => {
      if (!$('modal').classList.contains('oculto')) { if (e.key === 'Escape') cerrarPicto(); return; }
      if ($('lector').classList.contains('oculto')) return;
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); siguiente(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
      else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); leerEscena(); }
      else if (e.key === 'Escape') detener();
    });
    const m = /^#p(\d)$/.exec(location.hash);
    if (m && +m[1] >= 1 && +m[1] <= esc.length) irLector(+m[1] - 1);
    else if (location.hash === '#juegos') ir('juegos');
  }
  window.Tatu = { hablar, detener, ir, irLector, imprimir, cfg: () => cfg };
  iniciar();
})();
