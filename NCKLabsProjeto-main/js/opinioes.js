/* ==========================================================================
   Opiniões e Resenhas — formulário, avaliações com filtros e comentários por obra
   Nesta versão, as opiniões ficam salvas no navegador de quem escreveu (localStorage).
   Para que todos os visitantes vejam as opiniões, e para moderá-las antes da
   publicação, será necessário um serviço externo (back-end).
   ========================================================================== */
(function () {
  "use strict";

  var CHAVE = "machado-opinioes";
  var NOTAS = ["Não gostei", "Gostei pouco", "Gostei", "Gostei muito", "Recomendo muito"];
  var obras = window.MACHADO_OBRAS || [];

  var form = document.getElementById("form-opiniao");
  var msgOk = document.getElementById("msg-sucesso");
  var msgErro = document.getElementById("msg-erro");
  var lista = document.getElementById("lista-resenhas");
  var vazio = document.getElementById("resenhas-vazio");
  var filtroObra = document.getElementById("filtro-obra");
  var filtroNota = document.getElementById("filtro-nota");
  if (!form || !lista) return;

  /* ---------- Armazenamento ---------- */
  function carregar() {
    try {
      var dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
      return Array.isArray(dados) ? dados : [];
    } catch (e) {
      return [];
    }
  }
  function salvar(opinioes) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(opinioes));
      return true;
    } catch (e) {
      return false;
    }
  }

  function tituloObra(slug) {
    for (var i = 0; i < obras.length; i++) if (obras[i].slug === slug) return obras[i].titulo;
    return slug;
  }

  /* ---------- Cartão de resenha (texto do leitor sempre via textContent) ---------- */
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function cartao(op, mostrarObra) {
    var fig = el("figure", "resenha");
    var topo = el("div");
    if (mostrarObra) topo.appendChild(el("p", "resenha__obra", tituloObra(op.obra)));
    var nota = el("p", "resenha__nota", "★★★★★".slice(0, op.nota) + "☆☆☆☆☆".slice(0, 5 - op.nota));
    nota.setAttribute("aria-label", op.nota + " de 5 estrelas — " + NOTAS[op.nota - 1]);
    topo.appendChild(nota);
    var bq = el("blockquote");
    bq.appendChild(el("p", null, "“" + op.texto + "”"));
    topo.appendChild(bq);
    fig.appendChild(topo);

    var cap = el("figcaption");
    cap.appendChild(el("p", "resenha__autor", op.nome));
    var data = new Date(op.data);
    var dataTexto = isNaN(data) ? "" : " · " + data.toLocaleDateString("pt-BR");
    cap.appendChild(el("p", "resenha__rec", (op.recomenda === "sim" ? "Recomenda esta obra" : "Não recomenda esta obra") + dataTexto));
    fig.appendChild(cap);
    return fig;
  }

  /* ---------- Renderização ---------- */
  function renderizar() {
    var opinioes = carregar().sort(function (a, b) { return b.data - a.data; });

    // Avaliações com filtros
    var fo = filtroObra ? filtroObra.value : "";
    var fn = filtroNota ? filtroNota.value : "";
    var filtradas = opinioes.filter(function (op) {
      return (!fo || op.obra === fo) && (!fn || String(op.nota) === fn);
    });
    lista.innerHTML = "";
    filtradas.forEach(function (op) { lista.appendChild(cartao(op, true)); });
    if (vazio) {
      vazio.hidden = filtradas.length > 0;
      vazio.textContent = opinioes.length
        ? "Nenhuma avaliação corresponde aos filtros escolhidos."
        : "Ainda não há avaliações. Que tal escrever a primeira?";
    }

    // Comentários organizados por obra
    document.querySelectorAll("details[data-obra]").forEach(function (det) {
      var slug = det.getAttribute("data-obra");
      var daObra = opinioes.filter(function (op) { return op.obra === slug; });
      var alvo = det.querySelector("[data-lista-obra]");
      var contagem = det.querySelector("[data-contagem]");
      if (contagem) contagem.textContent = daObra.length ? "(" + daObra.length + ")" : "";
      if (!daObra.length) return;
      alvo.innerHTML = "";
      var grade = el("div", "resenhas");
      daObra.forEach(function (op) { grade.appendChild(cartao(op, false)); });
      alvo.appendChild(grade);
    });

    if (window.machadoAtualizarRolagem) window.machadoAtualizarRolagem();
  }

  /* ---------- Validação e envio ---------- */
  function marcarErro(elemento, temErro) {
    var alvo = elemento.closest(".campo, .grupo");
    if (alvo) alvo.classList.toggle(alvo.classList.contains("grupo") ? "grupo--erro" : "campo--erro", temErro);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msgOk.hidden = true;
    msgErro.hidden = true;

    var nome = form.nome.value.trim();
    var obra = form.obra.value;
    var notaEl = form.querySelector('input[name="nota"]:checked');
    var texto = form.resenha.value.trim();
    var recEl = form.querySelector('input[name="recomenda"]:checked');

    marcarErro(form.nome, !nome);
    marcarErro(form.obra, !obra);
    marcarErro(form.querySelector('input[name="nota"]'), !notaEl);
    marcarErro(form.resenha, !texto);
    marcarErro(form.querySelector('input[name="recomenda"]'), !recEl);

    if (!nome || !obra || !notaEl || !texto || !recEl) {
      msgErro.hidden = false;
      return;
    }

    var opinioes = carregar();
    opinioes.push({
      nome: nome.slice(0, 60),
      obra: obra,
      nota: Math.min(5, Math.max(1, parseInt(notaEl.value, 10))),
      texto: texto.slice(0, 3000),
      recomenda: recEl.value === "sim" ? "sim" : "nao",
      data: Date.now()
    });

    if (!salvar(opinioes)) {
      msgErro.hidden = false;
      return;
    }
    form.reset();
    msgOk.hidden = false;
    renderizar();
  });

  // Remove o destaque de erro assim que o campo é preenchido
  form.addEventListener("input", function (e) { marcarErro(e.target, false); });
  form.addEventListener("change", function (e) { marcarErro(e.target, false); });

  if (filtroObra) filtroObra.addEventListener("change", renderizar);
  if (filtroNota) filtroNota.addEventListener("change", renderizar);

  renderizar();
})();
