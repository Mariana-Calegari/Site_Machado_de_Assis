/* ==========================================================================
   Converse com Machado — assistente de estudos
   Por enquanto, as respostas vêm do próprio conteúdo do site (documento-base).
   Para ligar um serviço de inteligência artificial de verdade, preencha ENDPOINT
   com o endereço de um back-end que receba { pergunta } e devolva { resposta }.
   ========================================================================== */
(function () {
  "use strict";

  var ENDPOINT = ""; // ex.: "https://seu-servidor.exemplo/api/pergunta"

  var MSG_ERRO = "Não foi possível responder neste momento. Tente reformular a pergunta ou consulte a página de obras e as referências do site.";

  var form = document.getElementById("chat-form");
  var campo = document.getElementById("pergunta");
  var caixa = document.getElementById("chat-mensagens");
  var obras = window.MACHADO_OBRAS || [];
  if (!form || !campo || !caixa) return;

  /* ---------- Utilidades ---------- */
  function normalizar(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  }
  function escapar(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function linkObra(o, texto) {
    return '<a href="obras/' + o.slug + '.html">' + escapar(texto || o.titulo) + "</a>";
  }
  function obra(slug) {
    for (var i = 0; i < obras.length; i++) if (obras[i].slug === slug) return obras[i];
    return null;
  }
  function listaTemas(o) {
    return o.temas.map(function (t) { return t.replace(/\.$/, "").toLowerCase(); }).join("; ");
  }

  /* ---------- Respostas às perguntas sugeridas ---------- */
  var SUGERIDAS = {};
  SUGERIDAS[normalizar("Qual é a importância de Memórias Póstumas de Brás Cubas?")] = function () {
    return "<p>" + linkObra(obra("memorias-postumas")) + " (1881) costuma ser considerado um marco da transformação da escrita machadiana e do início da fase madura do autor.</p>" +
      "<p>O narrador, Brás Cubas, conta suas memórias depois de morto. Ele conversa com o leitor, interrompe a narrativa, comenta sua própria forma de escrever e expõe as contradições de sua posição social. Com humor ácido, o romance desmonta as convenções da autobiografia.</p>";
  };
  SUGERIDAS[normalizar("Quais são as principais características de Dom Casmurro?")] = function () {
    return "<p>" + linkObra(obra("dom-casmurro")) + " (1899) é um romance narrado em primeira pessoa por Bento Santiago, que tenta reconstruir a própria história. A memória dele é atravessada por sentimentos, interesses e suspeitas.</p>" +
      "<p>Temas para leitura: " + escapar(listaTemas(obra("dom-casmurro"))) + ".</p>";
  };
  SUGERIDAS[normalizar("Por que a narrativa de Dom Casmurro é considerada ambígua?")] = function () {
    return "<p>Porque a história é contada apenas por Bento Santiago. A obra não entrega uma interpretação única: é preciso analisar a distância entre os acontecimentos e a versão que o narrador constrói sobre eles.</p>" +
      "<p>Memória, ciúme e suspeita interferem na maneira como ele interpreta sua relação com Capitu. Por isso, o leitor precisa avaliar os silêncios, as contradições e as estratégias do narrador. Veja mais em " + linkObra(obra("dom-casmurro")) + ".</p>";
  };
  SUGERIDAS[normalizar("Qual é a diferença entre a primeira fase e a fase madura de Machado de Assis?")] = respostaFases;
  SUGERIDAS[normalizar("Quem é o narrador de Memorial de Aires?")] = function () {
    return "<p>O narrador é o conselheiro Aires, diplomata aposentado que volta ao Rio de Janeiro e registra em um diário acontecimentos, conversas e reflexões de seu círculo social entre 1888 e 1889.</p>" +
      "<p>A forma de diário aproxima o leitor dos pensamentos dele, mas não elimina a ironia: Aires observa os outros e também revela seus próprios limites e hesitações. O personagem já aparecia em Esaú e Jacó. Veja " + linkObra(obra("memorial-de-aires")) + ".</p>";
  };
  SUGERIDAS[normalizar("O que o Humanitismo representa em Quincas Borba?")] = function () {
    return "<p>O Humanitismo é uma doutrina filosófica fictícia associada ao personagem Quincas Borba, que já aparecia em Memórias Póstumas de Brás Cubas.</p>" +
      "<p>Com ela, Machado constrói uma sátira das explicações que transformam egoísmo e competição em leis naturais. No romance, a doutrina se choca com a ingenuidade de Rubião e com os interesses de quem o cerca. Veja " + linkObra(obra("quincas-borba")) + ".</p>";
  };
  SUGERIDAS[normalizar("Quais temas aparecem em Helena?")] = function () {
    return "<p>Em " + linkObra(obra("helena")) + " (1876) aparecem: " + escapar(listaTemas(obra("helena"))) + ".</p>" +
      "<p>A chegada de Helena à família serve para observar as regras de pertencimento da sociedade do século XIX.</p>";
  };
  SUGERIDAS[normalizar("Qual obra de Machado é recomendada para quem está começando a ler o autor?")] = function () {
    return "<p>O documento-base do site não traz uma recomendação oficial, então aqui vão dois caminhos possíveis:</p>" +
      "<p>— começar pela primeira fase, com " + linkObra(obra("helena")) + " ou " + linkObra(obra("a-mao-e-a-luva")) + ", que giram em torno de conflitos amorosos e familiares;</p>" +
      "<p>— ou ir direto aos marcos da fase madura, " + linkObra(obra("memorias-postumas")) + " e " + linkObra(obra("dom-casmurro")) + ".</p>" +
      "<p>Vale conversar com seu professor e ler as <a href=\"opinioes.html\">opiniões de outros leitores</a>.</p>";
  };

  function respostaFases() {
    return "<p>A <strong>primeira fase</strong> (1872–1878), geralmente associada à aproximação com o Romantismo, reúne Ressurreição, A Mão e a Luva, Helena e Iaiá Garcia: conflitos amorosos, relações familiares, expectativas de casamento e observação dos costumes.</p>" +
      "<p>A <strong>fase madura</strong>, frequentemente relacionada ao Realismo, começa com Memórias Póstumas de Brás Cubas (1881). Nela, a ironia, a crítica social, a complexidade dos narradores e a reflexão sobre a linguagem ganham força.</p>" +
      "<p>A divisão é didática: as obras-primas da fase madura escapam a uma classificação rígida de escola literária. Veja <a href=\"obras.html\">Obras</a>.</p>";
  }

  /* ---------- Respostas por palavra-chave ---------- */
  var CHAVES_OBRA = [
    ["ressurreicao", /ressurreicao|resurreicao|felix e livia/],
    ["a-mao-e-a-luva", /mao e a luva|guiomar/],
    ["helena", /\bhelena\b|estacio/],
    ["iaia-garcia", /iaia|luis garcia/],
    ["memorias-postumas", /memorias postumas|bras cubas|braz cubas/],
    ["quincas-borba", /quincas borba|rubiao|humanitismo/],
    ["dom-casmurro", /casmurro|capitu|bentinho|bento santiago|escobar/],
    ["esau-e-jaco", /esau|jaco|pedro e paulo|gemeos/],
    ["memorial-de-aires", /memorial|fidelia/],
    ["casa-velha", /casa velha|lalau/]
  ];

  function acharPersonagem(q) {
    for (var i = 0; i < obras.length; i++) {
      var ps = obras[i].personagens || [];
      for (var j = 0; j < ps.length; j++) {
        var nome = normalizar(ps[j][0]).replace(/^(dr|d|dona|a|casal|conselheiro) /, "");
        // Só aceita o nome como palavra inteira ("favorita" não deve achar "Rita")
        if (nome.length > 3 && (" " + q + " ").indexOf(" " + nome + " ") !== -1) {
          return { obra: obras[i], nome: ps[j][0], desc: ps[j][1] };
        }
      }
    }
    return null;
  }

  function responderLocal(pergunta) {
    var q = normalizar(pergunta);
    if (SUGERIDAS[q]) return SUGERIDAS[q]();

    var p = acharPersonagem(q);
    if (p && /quem|personagem|fale|sobre/.test(q)) {
      return "<p><strong>" + escapar(p.nome) + "</strong>, em " + linkObra(p.obra) + ": " + escapar(p.desc) + "</p>";
    }

    for (var i = 0; i < CHAVES_OBRA.length; i++) {
      if (CHAVES_OBRA[i][1].test(q)) {
        var o = obra(CHAVES_OBRA[i][0]);
        if (/tema/.test(q)) return "<p>Temas para leitura em " + linkObra(o) + ": " + escapar(listaTemas(o)) + ".</p>";
        if (/personage/.test(q) && o.personagens.length) {
          return "<p>Personagens principais de " + linkObra(o) + ": " + o.personagens.map(function (x) { return "<strong>" + escapar(x[0]) + "</strong> (" + escapar(x[1].replace(/\.$/, "")) + ")"; }).join("; ") + ".</p>";
        }
        return "<p>" + linkObra(o) + " (" + escapar(o.ano) + ") · " + escapar(o.fase) + ".</p><p>" + escapar(o.sinopse) + "</p>";
      }
    }
    if (p) return "<p><strong>" + escapar(p.nome) + "</strong>, em " + linkObra(p.obra) + ": " + escapar(p.desc) + "</p>";

    if (/fase|romantismo|realismo|romantico|realista/.test(q)) return respostaFases();
    if (/nasceu|nascimento|morreu|morte|biografia|quem foi|vida|infancia|familia de machado/.test(q)) {
      return "<p>Joaquim Maria Machado de Assis nasceu no Rio de Janeiro, em 21 de junho de 1839, e morreu na mesma cidade, em 29 de setembro de 1908. Nasceu em uma família de poucos recursos, teve formação escolar irregular e começou como aprendiz de tipógrafo e revisor antes de se tornar jornalista e escritor.</p>" +
        "<p>Foi jornalista, contista, cronista, romancista, poeta, crítico literário e teatrólogo. Leia mais em <a href=\"index.html#sobre\">Sobre Machado</a>.</p>";
    }
    if (/academia|abl|cadeira/.test(q)) {
      return "<p>Em 1897, Machado de Assis participou da instalação da Academia Brasileira de Letras e foi eleito seu primeiro presidente, cargo que ocupou por mais de dez anos. Fundou a cadeira número 23, e a Academia passou a ser conhecida também como “Casa de Machado de Assis”.</p>";
    }
    if (/conto|alienista|cartomante|missa do galo|espelho|pai contra mae|papeis avulsos/.test(q)) {
      return "<p>Entre as coletâneas de contos estão Contos Fluminenses (1870), Histórias da Meia-Noite (1873), Papéis Avulsos (1882), Histórias sem Data (1884), Várias Histórias (1896), Páginas Recolhidas (1899) e Relíquias de Casa Velha (1906). Contos conhecidos: “O Alienista”, “A Cartomante”, “Missa do Galo”, “O Espelho” e “Pai contra Mãe”.</p><p>Veja <a href=\"obras.html#outros-generos\">Outros gêneros</a>.</p>";
    }
    if (/poesia|poema|crisalidas|falenas|americanas|ocidentais/.test(q)) {
      return "<p>Machado publicou Crisálidas (1864), seu primeiro livro, Falenas (1870), Americanas (1875), Ocidentais (1901) e Poesias Completas (1901). Sua poesia passa por elementos românticos, indianistas e parnasianos.</p>";
    }
    if (/teatro|peca|teatral/.test(q)) {
      return "<p>Entre os textos teatrais de Machado estão Desencantos (1861), O Protocolo (1863), O Caminho da Porta (1863), Quase Ministro (1864), Os Deuses de Casaca (1866) e Tu, Só Tu, Puro Amor (1881).</p>";
    }
    if (/caracteristic|estilo|ironia|escrita|narrador/.test(q)) {
      return "<p>Entre as principais características da escrita de Machado estão: ironia, análise psicológica, crítica social, narradores complexos (nem sempre confiáveis), diálogo com o leitor, humor e pessimismo, e atenção à linguagem.</p><p>Leia mais em <a href=\"index.html#sobre\">Sobre Machado</a>.</p>";
    }
    return null;
  }

  /* ---------- Interface ---------- */
  function adicionar(tipo, conteudoHtml) {
    var vazio = caixa.querySelector(".chat__vazio");
    if (vazio) vazio.remove();
    var msg = document.createElement("div");
    msg.className = "msg msg--" + tipo;
    var quem = tipo === "usuario" ? "Você" : "Assistente de estudos";
    msg.innerHTML = '<span class="msg__quem">' + quem + "</span>" + conteudoHtml;
    caixa.appendChild(msg);
    caixa.scrollTop = caixa.scrollHeight;
    return msg;
  }

  function perguntar(texto) {
    texto = texto.trim();
    if (!texto) {
      campo.focus();
      return;
    }
    adicionar("usuario", "<p>" + escapar(texto) + "</p>");
    var digitando = adicionar("assistente msg--digitando", "<p>Pensando</p>");
    form.querySelector("button[type=submit]").disabled = true;

    var concluir = function (respostaHtml) {
      digitando.remove();
      if (respostaHtml) adicionar("assistente", respostaHtml);
      else adicionar("assistente msg--erro", "<p>" + MSG_ERRO + "</p>");
      form.querySelector("button[type=submit]").disabled = false;
    };

    if (ENDPOINT) {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: texto })
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (dados) { concluir(dados && dados.resposta ? "<p>" + escapar(dados.resposta) + "</p>" : null); })
        .catch(function () { concluir(null); });
    } else {
      setTimeout(function () { concluir(responderLocal(texto)); }, 650);
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var texto = campo.value;
    campo.value = "";
    perguntar(texto);
  });

  // Enter envia; Shift+Enter quebra a linha
  campo.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit"));
    }
  });

  // Perguntas sugeridas
  document.querySelectorAll(".pergunta-sugerida").forEach(function (b) {
    b.addEventListener("click", function () {
      var chat = document.querySelector(".chat");
      if (chat && chat.getBoundingClientRect().top < 0) {
        if (window.machadoRolarPara) window.machadoRolarPara(chat);
        else chat.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      perguntar(b.getAttribute("data-pergunta"));
    });
  });
})();
