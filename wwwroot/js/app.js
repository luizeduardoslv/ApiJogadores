/**
 * ApiJogadores - Gerenciador de Atletas
 * Frontend integrado à API ASP.NET Core e SQLite via fetch()
 * Vanilla JavaScript (Zero Dependências / Zero CDN)
 */

// ==========================================================================
// 1. CONFIGURAÇÕES E ENDPOINTS DA API
// ==========================================================================
const API_URL = "/api/jogadores";

// Estado da aplicação mantido em memória (sincronizado com a API)
let jogadoresCache = [];
let idEmEdicao = null;
let jogadorPendenteExclusao = null;

// ==========================================================================
// 2. REFERÊNCIAS DO DOM
// ==========================================================================
const elementos = {
  // Formulário
  form: document.getElementById("jogador-form"),
  formTitulo: document.getElementById("form-titulo"),
  formDescricao: document.getElementById("form-descricao"),
  modoIndicador: document.getElementById("modo-indicador"),
  inputNome: document.getElementById("nome"),
  inputNumero: document.getElementById("numero"),
  selectPosicao: document.getElementById("posicao"),
  inputId: document.getElementById("jogador-id"),
  btnSubmit: document.getElementById("btn-submit"),
  btnSubmitTexto: document.getElementById("btn-submit-texto"),
  btnCancelar: document.getElementById("btn-cancelar"),

  // Mensagens de erro de validação do formulário
  erroNome: document.getElementById("erro-nome"),
  erroNumero: document.getElementById("erro-numero"),
  erroPosicao: document.getElementById("erro-posicao"),

  // Tabela e estados da listagem
  tabela: document.getElementById("tabela-jogadores"),
  tabelaWrapper: document.getElementById("table-wrapper"),
  tabelaCorpo: document.getElementById("tabela-corpo"),
  emptyState: document.getElementById("empty-state"),
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  errorStateText: document.getElementById("error-state-text"),
  btnTentarNovamente: document.getElementById("btn-tentar-novamente"),
  totalJogadores: document.getElementById("total-jogadores"),
  btnRecarregar: document.getElementById("btn-recarregar"),

  // Modal de Exclusão
  modalExclusao: document.getElementById("modal-confirmacao"),
  modalJogadorNome: document.getElementById("modal-jogador-nome"),
  modalJogadorNumero: document.getElementById("modal-jogador-numero"),
  modalBtnCancelar: document.getElementById("modal-btn-cancelar"),
  modalBtnConfirmar: document.getElementById("modal-btn-confirmar"),
  modalBtnConfirmarTexto: document.getElementById("modal-btn-confirmar-texto"),

  // Container de Toasts
  toastContainer: document.getElementById("toast-container")
};

// ==========================================================================
// 3. ÍCONES SVG ESTÁTICOS (Seguros e livres de dados de entrada)
// ==========================================================================
const icones = {
  editar: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`,
  excluir: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>`,
  check: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`,
  aviso: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>`,
  erro: `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`
};

// ==========================================================================
// 4. FUNÇÕES DE RENDERIZAÇÃO SEGURA (USO EXCLUSIVO DE textContent)
// ==========================================================================

/**
 * Retorna a classe CSS correspondente para cada posição em campo
 */
function obterClassePosicao(posicao) {
  const mapa = {
    "Goleiro": "badge-goleiro",
    "Zagueiro": "badge-zagueiro",
    "Lateral": "badge-lateral",
    "Meio-campo": "badge-meio-campo",
    "Atacante": "badge-atacante"
  };
  return mapa[posicao] || "badge-meio-campo";
}

/**
 * Renderiza a lista de atletas criando nós do DOM e atribuindo dados
 * via textContent para proteção estrita contra injeção de HTML.
 */
function renderizarTabela(lista) {
  elementos.tabelaCorpo.innerHTML = "";
  const total = lista.length;
  elementos.totalJogadores.textContent = String(total);

  if (total === 0) {
    setEstadoVisual("vazio");
    return;
  }

  setEstadoVisual("tabela");

  // Ordena por número da camisa de forma crescente
  const ordenados = [...lista].sort((a, b) => {
    const numA = a.numero ?? a.Numero ?? 0;
    const numB = b.numero ?? b.Numero ?? 0;
    return numA - numB;
  });

  ordenados.forEach(jogador => {
    const id = jogador.id ?? jogador.Id;
    const nome = jogador.nome ?? jogador.Nome ?? "";
    const numero = jogador.numero ?? jogador.Numero ?? 0;
    const posicao = jogador.posicao ?? jogador.Posicao ?? "";

    const tr = document.createElement("tr");
    tr.dataset.id = String(id);
    if (idEmEdicao === id) {
      tr.classList.add("row-editing");
    }

    // 1. Coluna Camisa
    const tdCamisa = document.createElement("td");
    tdCamisa.className = "td-camisa";
    const jerseyBadge = document.createElement("span");
    jerseyBadge.className = "jersey-badge";
    jerseyBadge.title = `Camisa nº ${numero}`;
    // Inserção estrita com textContent
    jerseyBadge.textContent = String(numero);
    tdCamisa.appendChild(jerseyBadge);

    // 2. Coluna Nome
    const tdNome = document.createElement("td");
    const playerName = document.createElement("span");
    playerName.className = "player-name";
    // Inserção estrita com textContent
    playerName.textContent = String(nome);
    tdNome.appendChild(playerName);

    // 3. Coluna Posição
    const tdPosicao = document.createElement("td");
    const posBadge = document.createElement("span");
    posBadge.className = `position-badge ${obterClassePosicao(posicao)}`;
    // Inserção estrita com textContent
    posBadge.textContent = String(posicao);
    tdPosicao.appendChild(posBadge);

    // 4. Coluna Ações
    const tdAcoes = document.createElement("td");
    tdAcoes.className = "td-acoes";
    const actionsCell = document.createElement("div");
    actionsCell.className = "table-actions-cell";

    // Botão Editar
    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "btn-action btn-action-edit";
    btnEdit.title = "Editar atleta";
    btnEdit.setAttribute("aria-label", `Editar ${nome}`);
    btnEdit.innerHTML = icones.editar;
    btnEdit.addEventListener("click", () => iniciarEdicao(id));

    // Botão Excluir
    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.className = "btn-action btn-action-delete";
    btnDelete.title = "Excluir atleta";
    btnDelete.setAttribute("aria-label", `Excluir ${nome}`);
    btnDelete.innerHTML = icones.excluir;
    btnDelete.addEventListener("click", () => solicitarExclusao(jogador));

    actionsCell.appendChild(btnEdit);
    actionsCell.appendChild(btnDelete);
    tdAcoes.appendChild(actionsCell);

    tr.appendChild(tdCamisa);
    tr.appendChild(tdNome);
    tr.appendChild(tdPosicao);
    tr.appendChild(tdAcoes);

    elementos.tabelaCorpo.appendChild(tr);
  });
}

// ==========================================================================
// 5. OPERAÇÕES COM A API (FETCH: GET, POST, PUT, DELETE)
// ==========================================================================

/**
 * Controla os estados visuais da tabela (carregando, erro, vazio, tabela)
 */
function setEstadoVisual(estado, mensagemErro = "") {
  // Esconde todos os containers por padrão
  if (elementos.loadingState) elementos.loadingState.style.display = "none";
  if (elementos.errorState) elementos.errorState.style.display = "none";
  if (elementos.emptyState) elementos.emptyState.style.display = "none";
  if (elementos.tabela) elementos.tabela.style.display = "none";
  if (elementos.tabelaWrapper) elementos.tabelaWrapper.style.display = "none";

  if (estado === "carregando") {
    if (elementos.loadingState) elementos.loadingState.style.display = "flex";
  } else if (estado === "erro") {
    if (elementos.errorState) elementos.errorState.style.display = "block";
    if (elementos.errorStateText) {
      elementos.errorStateText.textContent = mensagemErro || "Não foi possível carregar os dados da API.";
    }
  } else if (estado === "vazio") {
    if (elementos.emptyState) elementos.emptyState.style.display = "block";
  } else if (estado === "tabela") {
    if (elementos.tabelaWrapper) elementos.tabelaWrapper.style.display = "block";
    if (elementos.tabela) elementos.tabela.style.display = "table";
  }
}

/**
 * GET /api/jogadores
 * Carrega a lista de todos os jogadores do servidor
 */
async function carregarJogadores() {
  setEstadoVisual("carregando");
  if (elementos.btnRecarregar) elementos.btnRecarregar.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const msg = `Falha ao listar jogadores (HTTP ${response.status}).`;
      setEstadoVisual("erro", msg);
      mostrarToast(msg, "erro");
      return;
    }

    const dados = await response.json();
    jogadoresCache = Array.isArray(dados) ? dados : [];
    renderizarTabela(jogadoresCache);
  } catch (erro) {
    const msg = "Erro de conexão ao acessar a API de jogadores. Verifique se o servidor está ativo.";
    setEstadoVisual("erro", msg);
    mostrarToast(msg, "erro");
  } finally {
    if (elementos.btnRecarregar) elementos.btnRecarregar.disabled = false;
    // Garantia adicional de encerramento do spinner
    if (elementos.loadingState && elementos.loadingState.style.display === "flex") {
      elementos.loadingState.style.display = "none";
    }
  }
}

/**
 * GET /api/jogadores/{id}
 * Busca o jogador pelo ID e preenche o formulário para edição
 */
async function iniciarEdicao(id) {
  limparErros();

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        mostrarToast("Jogador não encontrado na API (404).", "erro");
      } else {
        mostrarToast(`Erro ao carregar dados do jogador (HTTP ${response.status}).`, "erro");
      }
      return;
    }

    const jogador = await response.json();
    const jId = jogador.id ?? jogador.Id;
    const jNome = jogador.nome ?? jogador.Nome ?? "";
    const jNumero = jogador.numero ?? jogador.Numero ?? "";
    const jPosicao = jogador.posicao ?? jogador.Posicao ?? "";

    idEmEdicao = jId;

    elementos.inputId.value = String(jId);
    elementos.inputNome.value = jNome;
    elementos.inputNumero.value = jNumero;
    elementos.selectPosicao.value = jPosicao;

    elementos.formTitulo.textContent = "Editar Jogador";
    elementos.formDescricao.textContent = `Atualizando informações de #${jNumero} - ${jNome}`;
    elementos.btnSubmitTexto.textContent = "Salvar Alterações";
    elementos.btnCancelar.style.display = "inline-flex";

    elementos.modoIndicador.textContent = "Modo Edição";
    elementos.modoIndicador.classList.add("edit-mode");

    // Destaca a linha correspondente na tabela
    const linhas = elementos.tabelaCorpo.querySelectorAll("tr");
    linhas.forEach(linha => {
      if (linha.dataset.id === String(jId)) {
        linha.classList.add("row-editing");
      } else {
        linha.classList.remove("row-editing");
      }
    });

    document.getElementById("form-section").scrollIntoView({ behavior: "smooth" });
    elementos.inputNome.focus();
  } catch (erro) {
    mostrarToast("Erro de conexão ao buscar dados do jogador para edição.", "erro");
  }
}

/**
 * Submete o formulário:
 * - Se idEmEdicao === null: POST /api/jogadores
 * - Se idEmEdicao !== null: PUT /api/jogadores/{id}
 */
async function salvarJogador(event) {
  event.preventDefault();

  const nome = elementos.inputNome.value.trim();
  const numeroStr = elementos.inputNumero.value;
  const posicao = elementos.selectPosicao.value;

  if (!validarFormulario(nome, numeroStr, posicao)) {
    return;
  }

  const payload = {
    nome: nome,
    numero: parseInt(numeroStr, 10),
    posicao: posicao
  };

  // Bloqueia botão durante envio
  elementos.btnSubmit.disabled = true;

  try {
    if (idEmEdicao === null) {
      // --------------------------------------------------------------------
      // POST /api/jogadores (Cadastrar)
      // --------------------------------------------------------------------
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let detalheErro = `Erro ${response.status} ao cadastrar jogador.`;
        try {
          const erroJson = await response.json();
          if (erroJson && erroJson.mensagem) detalheErro = erroJson.mensagem;
        } catch (_) {}
        // Não exibe mensagem de sucesso
        mostrarToast(detalheErro, "erro");
        return;
      }

      const jogadorCriado = await response.json();
      const nomeCriado = jogadorCriado.nome ?? jogadorCriado.Nome ?? nome;

      // Sucesso confirmado
      mostrarToast(`Jogador "${nomeCriado}" cadastrado com sucesso!`, "sucesso");
      resetarFormulario();
      await carregarJogadores();

    } else {
      // --------------------------------------------------------------------
      // PUT /api/jogadores/{id} (Editar)
      // --------------------------------------------------------------------
      const response = await fetch(`${API_URL}/${idEmEdicao}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let detalheErro = `Erro ${response.status} ao atualizar jogador.`;
        if (response.status === 404) {
          detalheErro = "Jogador não encontrado no servidor (404).";
        } else {
          try {
            const erroJson = await response.json();
            if (erroJson && erroJson.mensagem) detalheErro = erroJson.mensagem;
          } catch (_) {}
        }
        // Não exibe mensagem de sucesso
        mostrarToast(detalheErro, "erro");
        return;
      }

      const jogadorAtualizado = await response.json();
      const nomeAtualizado = jogadorAtualizado.nome ?? jogadorAtualizado.Nome ?? nome;

      // Sucesso confirmado
      mostrarToast(`Jogador "${nomeAtualizado}" atualizado com sucesso!`, "sucesso");
      cancelarEdicao();
      await carregarJogadores();
    }
  } catch (erro) {
    mostrarToast("Falha de comunicação com a API. Verifique a conexão com o servidor.", "erro");
  } finally {
    elementos.btnSubmit.disabled = false;
  }
}

/**
 * DELETE /api/jogadores/{id}
 * Exclui o jogador selecionado
 */
async function confirmarExclusao() {
  if (!jogadorPendenteExclusao) return;

  const id = jogadorPendenteExclusao.id ?? jogadorPendenteExclusao.Id;
  const nome = jogadorPendenteExclusao.nome ?? jogadorPendenteExclusao.Nome ?? "";

  elementos.modalBtnConfirmar.disabled = true;
  elementos.modalBtnConfirmarTexto.textContent = "Excluindo...";

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      let detalheErro = `Erro ${response.status} ao remover jogador.`;
      if (response.status === 404) {
        detalheErro = "Jogador não encontrado para exclusão (404).";
      } else {
        try {
          const erroJson = await response.json();
          if (erroJson && erroJson.mensagem) detalheErro = erroJson.mensagem;
        } catch (_) {}
      }
      // Não exibe mensagem de sucesso
      mostrarToast(detalheErro, "erro");
      return;
    }

    // 204 No Content -> Sucesso
    fecharModalExclusao();

    if (idEmEdicao === id) {
      cancelarEdicao();
    }

    mostrarToast(`Jogador "${nome}" excluído com sucesso.`, "aviso");
    await carregarJogadores();
  } catch (erro) {
    mostrarToast("Falha ao comunicar com a API durante a exclusão.", "erro");
  } finally {
    elementos.modalBtnConfirmar.disabled = false;
    elementos.modalBtnConfirmarTexto.textContent = "Excluir";
  }
}

// ==========================================================================
// 6. VALIDAÇÕES DO FORMULÁRIO (CLIENT-SIDE)
// ==========================================================================

function limparErros() {
  elementos.erroNome.textContent = "";
  elementos.erroNumero.textContent = "";
  elementos.erroPosicao.textContent = "";

  elementos.inputNome.classList.remove("input-error");
  elementos.inputNumero.classList.remove("input-error");
  elementos.selectPosicao.classList.remove("input-error");
}

function validarFormulario(nome, numero, posicao) {
  limparErros();
  let valido = true;

  if (!nome || nome.trim().length < 2) {
    elementos.erroNome.textContent = "Informe o nome completo do jogador (mínimo 2 caracteres).";
    elementos.inputNome.classList.add("input-error");
    valido = false;
  }

  const num = parseInt(numero, 10);
  if (isNaN(num) || num < 1 || num > 99) {
    elementos.erroNumero.textContent = "O número da camisa deve ser um número entre 1 e 99.";
    elementos.inputNumero.classList.add("input-error");
    valido = false;
  }

  if (!posicao) {
    elementos.erroPosicao.textContent = "Selecione a posição do atleta.";
    elementos.selectPosicao.classList.add("input-error");
    valido = false;
  }

  return valido;
}

function cancelarEdicao() {
  idEmEdicao = null;
  resetarFormulario();

  elementos.formTitulo.textContent = "Cadastrar Jogador";
  elementos.formDescricao.textContent = "Preencha os dados abaixo para adicionar um novo atleta ao time.";
  elementos.btnSubmitTexto.textContent = "Cadastrar Jogador";
  elementos.btnCancelar.style.display = "none";

  elementos.modoIndicador.textContent = "Novo Registro";
  elementos.modoIndicador.classList.remove("edit-mode");

  limparErros();

  // Remove destaque da linha em edição
  const linhas = elementos.tabelaCorpo.querySelectorAll("tr");
  linhas.forEach(l => l.classList.remove("row-editing"));
}

function resetarFormulario() {
  elementos.form.reset();
  elementos.inputId.value = "";
}

// ==========================================================================
// 7. MODAL DE EXCLUSÃO (COM USO DE textContent)
// ==========================================================================

function solicitarExclusao(jogador) {
  jogadorPendenteExclusao = jogador;
  const nome = jogador.nome ?? jogador.Nome ?? "";
  const numero = jogador.numero ?? jogador.Numero ?? "";

  // Atribuição segura com textContent
  elementos.modalJogadorNome.textContent = String(nome);
  elementos.modalJogadorNumero.textContent = String(numero);
  elementos.modalExclusao.style.display = "flex";
}

function fecharModalExclusao() {
  elementos.modalExclusao.style.display = "none";
  jogadorPendenteExclusao = null;
}

// ==========================================================================
// 8. NOTIFICAÇÕES TOAST
// ==========================================================================

function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = document.createElement("div");
  toast.className = "toast";

  let iconeSvg = icones.check;
  if (tipo === "aviso") {
    toast.classList.add("toast-warning");
    iconeSvg = icones.aviso;
  } else if (tipo === "erro") {
    toast.classList.add("toast-danger");
    iconeSvg = icones.erro;
  } else if (tipo === "info") {
    toast.classList.add("toast-info");
    iconeSvg = icones.check;
  }

  const iconDiv = document.createElement("div");
  iconDiv.className = "toast-icon";
  iconDiv.innerHTML = iconeSvg;

  const contentDiv = document.createElement("div");
  contentDiv.className = "toast-content";

  const msgDiv = document.createElement("div");
  msgDiv.className = "toast-message";
  // Inserção estrita de mensagem via textContent
  msgDiv.textContent = String(mensagem);

  contentDiv.appendChild(msgDiv);
  toast.appendChild(iconDiv);
  toast.appendChild(contentDiv);

  elementos.toastContainer.appendChild(toast);

  // Remove automaticamente após 4 segundos
  setTimeout(() => {
    toast.style.animation = "toastSlideOut 250ms ease-in forwards";
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 250);
  }, 4000);
}

// ==========================================================================
// 9. INICIALIZAÇÃO E EVENT LISTENERS
// ==========================================================================

function inicializar() {
  // Envio e cancelamento do formulário
  elementos.form.addEventListener("submit", salvarJogador);
  elementos.btnCancelar.addEventListener("click", cancelarEdicao);

  // Limpeza de erros em tempo real
  elementos.inputNome.addEventListener("input", () => {
    elementos.erroNome.textContent = "";
    elementos.inputNome.classList.remove("input-error");
  });
  elementos.inputNumero.addEventListener("input", () => {
    elementos.erroNumero.textContent = "";
    elementos.inputNumero.classList.remove("input-error");
  });
  elementos.selectPosicao.addEventListener("change", () => {
    elementos.erroPosicao.textContent = "";
    elementos.selectPosicao.classList.remove("input-error");
  });

  // Ações de recarga da lista
  if (elementos.btnRecarregar) {
    elementos.btnRecarregar.addEventListener("click", carregarJogadores);
  }
  if (elementos.btnTentarNovamente) {
    elementos.btnTentarNovamente.addEventListener("click", carregarJogadores);
  }

  // Ações do Modal de Exclusão
  elementos.modalBtnCancelar.addEventListener("click", fecharModalExclusao);
  elementos.modalBtnConfirmar.addEventListener("click", confirmarExclusao);

  elementos.modalExclusao.addEventListener("click", (e) => {
    if (e.target === elementos.modalExclusao) {
      fecharModalExclusao();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && elementos.modalExclusao.style.display === "flex") {
      fecharModalExclusao();
    }
  });

  // Carga inicial dos dados a partir da API
  carregarJogadores();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}
