// ==========================================================================
// Palavra Pastoral - atualização/renderização (separado do script.js)
// ==========================================================================

// ==========================================================================
// SIMULAÇÃO DE API - MENSAGEM PASTORAL
// (mantido aqui para o JS principal ficar focado em outras telas)
// ==========================================================================
const bancoDeDadosSimulado = {
    nomePastor: "Pr. Rodrigo Aviles",
    fotoUrl: "imagens/biblia.png",
    dataPublicacao: "Publicado em: 10/06/2026",
    textoPastoral: `Querida comunidade, é com muita alegria que compartilhamos esta palavra semanal de reflexão. Vivemos tempos onde encontrar momentos de paz e conexão genuína tornou-se uma prioridade essencial para manter nosso equilíbrio e nossa esperança renovados.<br><br>Independentemente dos desafios que surjam em sua rotina, lembre-se de que nenhum caminho precisa ser percorrido de forma solitária. Nossas portas e corações estão sempre abertos para ouvir, apoiar e caminhar ao seu lado em cada etapa necessária.<br><br>A graça de Deus é o amor incondicional que oferece perdão e salvação ao pecador, sem que ele mereça. Ela transforma vidas, substituindo a culpa pela paz e o julgamento pela restauração espiritual. Esse favor imerecido serve como uma ponte que reconcilia o ser humano com o Criador. Por meio dela, o arrependimento abre as portas para um recomeço cheio de esperança. É o maior presente divino, acessível a qualquer um que decida acolhê-la de coração.<br><br>"Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus." (Efésios 2:8).<br><br>Deus te abençoe como toda sorte de bençãos!.`
};

function renderizarPalavraPastoral(dados, containerId = 'pastoralPublica') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // sanitizeInput vem do script.js; se ainda não existir, faz fallback básico.
    const _sanitize = (typeof sanitizeInput === 'function')
        ? sanitizeInput
        : (text) => {
            const element = document.createElement('div');
            element.innerText = String(text ?? '');
            return element.innerHTML;
        };

    const cargoLimpo = _sanitize(dados.cargo || 'Pastor');
    const nomeLimpo = _sanitize(dados.nomePastor);
    const dataLimpa = _sanitize(dados.dataPublicacao);
    const textoLimpo = dados.textoPastoral;
    const fotoUrl = dados.fotoUrl || bancoDeDadosSimulado.fotoUrl;

    container.innerHTML = `
        <div class="pastoral-meta">
            <div class="pastor-photo" style="background: #cbd5e1 url('${fotoUrl}') center/cover;"></div>
            <div class="pastor-details">
                <p class="pastor-cargo">${cargoLimpo}</p>
                <p style="color: var(--text-muted); font-style: italic;">Por: ${nomeLimpo} | ${dataLimpa}</p>
            </div>
        </div>
        <h2>Mensagem Pastoral</h2>
        <div class="pastoral-text">
            <p>${textoLimpo}</p>
        </div>
    `;
}

function carregarUltimaPalavraPastoral() {
    const palavraSalva = localStorage.getItem('palavraPastoralAtual');
    if (palavraSalva) {
        try {
            const dados = JSON.parse(palavraSalva);
            renderizarPalavraPastoral(dados, 'pastoralPublica');

            // adminPreview pode não existir no DOM (por isso testamos)
            const adminPrev = document.getElementById('adminPreview');
            if (adminPrev) renderizarPalavraPastoral(dados, 'adminPreview');
        } catch (e) {
            console.error('Erro ao carregar palavra pastoral salva:', e);
            carregarPalavraPastoralDaAPI();
        }
    } else {
        carregarPalavraPastoralDaAPI();
    }
}

function carregarPalavraPastoralDaAPI() {
    new Promise((resolve) => {
        setTimeout(() => { resolve(bancoDeDadosSimulado); }, 1000);
    })
    .then((dadosRecebidos) => {
        renderizarPalavraPastoral(dadosRecebidos, 'pastoralPublica');
    });
}

