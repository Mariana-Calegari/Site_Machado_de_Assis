/* ==========================================================================
   Machado de Assis: Vida, Obras e Pensamento — comportamento comum a todas as páginas
   - rolagem suave (Lenis, carregado via CDN; se não carregar, a página funciona normalmente)
   - revelação de títulos por linha e de textos palavra por palavra
   - parallax das imagens das obras
   - menu em tela cheia
   - acordeões (<details>) com altura animada
   ========================================================================== */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var telaPequena = window.matchMedia("(max-width: 768px)");
  window.__machadoPronto = true;

  /* ---------- Rolagem suave ---------- */
  // O Lenis é carregado de forma assíncrona: a página não espera por ele.
  var lenis = null;
  function iniciarLenis() {
    if (lenis || reduzirMovimento || typeof window.Lenis !== "function") return;
    lenis = new window.Lenis({ smoothWheel: true });
    var loop = function (tempo) {
      lenis.raf(tempo);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  if (typeof window.Lenis === "function") {
    iniciarLenis();
  } else {
    var scriptLenis = document.getElementById("lenis-js");
    if (scriptLenis) scriptLenis.addEventListener("load", iniciarLenis);
  }

  function alturaCabecalho() {
    return parseFloat(getComputedStyle(raiz).fontSize) * 6;
  }

  function rolarPara(alvo) {
    if (lenis) {
      lenis.scrollTo(alvo, { offset: -alturaCabecalho() });
    } else {
      alvo.scrollIntoView({ behavior: reduzirMovimento ? "auto" : "smooth" });
    }
  }

  // Links para âncoras da própria página usam a rolagem suave
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href*="#"]');
    if (!link) return;
    var url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var alvo = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!alvo) return;
    e.preventDefault();
    fecharMenu();
    rolarPara(alvo);
    history.pushState(null, "", url.hash);
  });

  /* ---------- Divisão de textos em palavras ---------- */
  // Percorre o elemento e embrulha cada palavra em <span>. Elementos internos
  // (itálicos, links de referência) viram uma unidade só, para não quebrar o HTML.
  function dividir(el, classe) {
    var unidades = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (no) {
      if (no.nodeType === 3) {
        var partes = no.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        partes.forEach(function (parte) {
          if (!parte) return;
          if (/^\s+$/.test(parte)) {
            frag.appendChild(document.createTextNode(parte));
          } else {
            frag.appendChild(embrulhar(document.createTextNode(parte), classe, unidades));
          }
        });
        el.replaceChild(frag, no);
      } else if (no.nodeType === 1) {
        if (no.tagName === "BR") return;
        if (no.tagName === "SPAN" && no.classList.contains("hero__kicker")) return;
        var marcador = document.createComment("");
        el.replaceChild(marcador, no);
        el.replaceChild(embrulhar(no, classe, unidades), marcador);
      }
    });
    return unidades;
  }

  function embrulhar(conteudo, classe, lista) {
    var span = document.createElement("span");
    if (classe === "linha-clip") {
      span.className = "linha-clip";
      var interno = document.createElement("span");
      interno.appendChild(conteudo);
      span.appendChild(interno);
    } else {
      span.className = "palavra";
      span.appendChild(conteudo);
    }
    lista.push(span);
    return span;
  }

  function prepararLinhas(el) {
    dividir(el, "linha-clip");
    agruparLinhas(el);
  }

  // Agrupa as palavras por linha visual (mesma posição vertical) para escalonar a entrada
  function agruparLinhas(el) {
    var topoAtual = null;
    var linha = -1;
    el.querySelectorAll(".linha-clip").forEach(function (c) {
      var topo = Math.round(c.offsetTop);
      if (topoAtual === null || Math.abs(topo - topoAtual) > 4) {
        linha++;
        topoAtual = topo;
      }
      c.firstChild.style.setProperty("--l", linha);
    });
  }

  function prepararPalavras(el) {
    dividir(el, "palavra").forEach(function (p, i) {
      p.style.setProperty("--w", i);
    });
  }

  /* ---------- Revelações ao entrar na tela ---------- */
  var animados = document.querySelectorAll("[data-anim]");

  function prepararTudo() {
    animados.forEach(function (el) {
      var atraso = el.getAttribute("data-atraso");
      var passo = el.getAttribute("data-passo");
      if (atraso) el.style.setProperty("--delay", atraso + "ms");
      if (passo) el.style.setProperty("--passo", passo + "ms");
      if (el.getAttribute("data-anim") === "linhas") prepararLinhas(el);
      if (el.getAttribute("data-anim") === "palavras") prepararPalavras(el);
    });

    if (!raiz.classList.contains("anim") || !("IntersectionObserver" in window)) {
      animados.forEach(function (el) { el.classList.add("visivel"); });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });

    // O que já está na tela ao carregar começa a animar logo (sem esperar o observador)
    var alturaTela = window.innerHeight;
    var naTela = [];
    animados.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < alturaTela * 0.9 && r.bottom > 0) naTela.push(el);
      else observador.observe(el);
    });
    setTimeout(function () {
      naTela.forEach(function (el) { el.classList.add("visivel"); });
    }, 30);
  }

  prepararTudo();
  // Quando as fontes terminam de carregar, as quebras de linha podem mudar
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      document.querySelectorAll('[data-anim="linhas"]:not(.visivel)').forEach(agruparLinhas);
    });
  }

  /* ---------- Parallax das imagens ---------- */
  var paralaxes = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));

  function atualizarParallax() {
    if (reduzirMovimento || telaPequena.matches) {
      paralaxes.forEach(function (el) { el.style.transform = ""; });
      return;
    }
    var rem = parseFloat(getComputedStyle(raiz).fontSize);
    var alturaTela = window.innerHeight;
    paralaxes.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > alturaTela + 200) return;
      // 0 quando o topo encosta na base da tela; 1 quando a base passa do topo
      var progresso = (alturaTela - r.top) / (alturaTela + r.height);
      progresso = Math.min(1, Math.max(0, progresso));
      var y = (2.5 - progresso * 5) * rem;
      el.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
    });
  }

  if (paralaxes.length) {
    window.addEventListener("scroll", atualizarParallax, { passive: true });
    window.addEventListener("resize", atualizarParallax);
    atualizarParallax();
  }

  /* ---------- Menu em tela cheia ---------- */
  var botaoMenu = document.querySelector(".botao-menu");
  var navPrincipal = document.querySelector(".cabecalho__nav");
  var modal = null;
  var ultimoFoco = null;

  function construirMenu() {
    var links = Array.prototype.slice.call(navPrincipal.querySelectorAll("a"));
    var inicio = links[0].getAttribute("href");
    var itens = links.map(function (a) {
      return { href: a.getAttribute("href"), texto: a.textContent.trim(), atual: a.getAttribute("aria-current") };
    });
    // "Sobre Machado" é uma seção da página inicial
    itens.splice(1, 0, { href: inicio + "#sobre", texto: "Sobre Machado" });

    modal = document.createElement("div");
    modal.className = "menu-modal";
    modal.id = "menu-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Menu");

    var html = '<div class="menu-modal__painel"></div><div class="menu-modal__conteudo">' +
      '<div class="menu-modal__topo"><span class="menu-modal__rotulo">Menu</span>' +
      '<button type="button" class="menu-modal__fechar">Fechar ✕</button></div>' +
      '<nav aria-label="Menu em tela cheia"><ul>';
    itens.forEach(function (item, i) {
      html += '<li><a href="' + item.href + '" style="--i:' + i + '"' +
        (item.atual ? ' aria-current="page"' : "") + '>' +
        '<span class="menu-modal__num">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<span class="menu-modal__rotulo-link">' + item.texto + '</span></a></li>';
    });
    html += '</ul></nav><div class="menu-modal__base"><div>' +
      '<p>Machado de Assis</p><p>Rio de Janeiro · 1839–1908</p></div>' +
      '<a href="' + inicio + '#referencias">Referências e créditos</a></div></div>';
    modal.innerHTML = html;
    document.body.appendChild(modal);

    modal.querySelector(".menu-modal__fechar").addEventListener("click", fecharMenu);
    modal.querySelector(".menu-modal__painel").addEventListener("click", fecharMenu);
    modal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fecharMenu();
      if (e.key === "Tab") prenderFoco(e);
    });
    modal.querySelectorAll("nav a").forEach(function (a) {
      a.addEventListener("click", function () { fecharMenu(); });
    });
  }

  function prenderFoco(e) {
    var focaveis = modal.querySelectorAll("a, button");
    var primeiro = focaveis[0];
    var ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  }

  function abrirMenu() {
    ultimoFoco = document.activeElement;
    modal.classList.add("aberto");
    botaoMenu.setAttribute("aria-expanded", "true");
    raiz.classList.add("menu-aberto");
    if (lenis) lenis.stop();
    setTimeout(function () { modal.querySelector(".menu-modal__fechar").focus(); }, 50);
  }

  function fecharMenu() {
    if (!modal || !modal.classList.contains("aberto")) return;
    modal.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    raiz.classList.remove("menu-aberto");
    if (lenis) lenis.start();
    if (ultimoFoco) ultimoFoco.focus();
  }

  if (botaoMenu && navPrincipal) {
    construirMenu();
    botaoMenu.addEventListener("click", abrirMenu);
  }

  /* ---------- Acordeões (<details>) com altura animada ---------- */
  document.querySelectorAll("details.acordeao").forEach(function (det) {
    var resumo = det.querySelector("summary");
    var painel = det.querySelector(".acordeao__painel");
    if (!resumo || !painel || reduzirMovimento) return;
    var animando = false;

    resumo.addEventListener("click", function (e) {
      e.preventDefault();
      if (animando) return;
      animando = true;
      var abrindo = !det.open;
      if (abrindo) det.open = true;
      var altura = painel.scrollHeight;
      var animacao = painel.animate(
        abrindo
          ? [{ height: "0px", opacity: 0 }, { height: altura + "px", opacity: 1 }]
          : [{ height: altura + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
        { duration: 550, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
      var concluido = false;
      var concluir = function () {
        if (concluido) return;
        concluido = true;
        animacao.cancel();
        if (!abrindo) det.open = false;
        animando = false;
        if (lenis) lenis.resize();
      };
      animacao.onfinish = concluir;
      // Segurança: se a animação não terminar (ex.: aba em segundo plano), conclui mesmo assim
      setTimeout(concluir, 700);
    });
  });

  // Recalcula o tamanho da página quando o conteúdo muda (ex.: novas resenhas)
  window.machadoAtualizarRolagem = function () { if (lenis) lenis.resize(); };
  window.machadoRolarPara = rolarPara;
})();
