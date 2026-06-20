// ==========================================================================
// Eventos e Avisos - atualização/renderização (separado do script.js)
// ==========================================================================

const LS_KEYS = (typeof LS_KEYS !== 'undefined') ? LS_KEYS : {
    cultos: 'pages_cultos',
    avisos: 'pages_avisos',
    pedidosOracao: 'pages_pedidos_oracao',
    adminOffline: 'pages_admin_offline'
};

const DEFAULT_CULTOS = (typeof DEFAULT_CULTOS !== 'undefined') ? DEFAULT_CULTOS : [
    { id: 1, horario: 'Domingo - 18:00h', descricao: 'Culto de Celebração e Família' },
    { id: 2, horario: 'Terça-feira - 20:00h', descricao: 'Primeiro o Reino' },
    { id: 3, horario: 'Quinta-feira - 19:30h', descricao: 'Estudo Biblico' }
];

const DEFAULT_AVISOS = (typeof DEFAULT_AVISOS !== 'undefined') ? DEFAULT_AVISOS : [
    { id: 1, data: 'Domingo', titulo: 'Ensaio', texto: 'Equipe de louvor 10:00.' },
    { id: 2, data: 'Quarta', titulo: 'Ensaio', texto: 'Equipe de Danças e Artes 19:30h.' },
    { id: 3, data: '07/06/2026', titulo: 'Jantar de Casais', texto: 'Venha participar do maravilho jantar de casais dia 04/07/2026 19:30h.' }
];

function renderizarEventosEAvisos(dados) {
    const cultosContainer = document.getElementById('cultosContainer');
    const avisosContainer = document.getElementById('avisosContainer');

    const _sanitize = (typeof sanitizeInput === 'function')
        ? sanitizeInput
        : (text) => {
            const element = document.createElement('div');
            element.innerText = String(text ?? '');
            return element.innerHTML;
        };

    // --- RENDERIZAR CULTOS ---
    if (cultosContainer) {
        let htmlCultos = '<h2>Horário dos Cultos</h2>';
        (dados.cultos || []).forEach(culto => {
            const horarioLimpo = _sanitize(culto.horario);
            const descLimpa = _sanitize(culto.descricao);

            htmlCultos += `
                <div class="culto-item">
                    <p class="culto-time">${horarioLimpo}</p>
                    <p>${descLimpa}</p>
                </div>
            `;
        });
        cultosContainer.innerHTML = htmlCultos;
    }

    // --- RENDERIZAR AVISOS ---
    if (avisosContainer) {
        let htmlAvisos = '<h2>Quadro de Avisos Gerais</h2>';
        (dados.avisos || []).forEach(aviso => {
            const dataLimpa = _sanitize(aviso.data);
            const tituloLimpo = _sanitize(aviso.titulo);
            const textoLimpo = _sanitize(aviso.texto);

            htmlAvisos += `
                <div class="notice-item">
                    <p class="notice-date">Publicado em: ${dataLimpa}</p>
                    <p><strong>${tituloLimpo}:</strong> ${textoLimpo}</p>
                </div>
            `;
        });
        avisosContainer.innerHTML = htmlAvisos;
    }
}

function carregarCultosERAvisosDaAPI() {
    const _lsGet = (typeof lsGetJson === 'function')
        ? lsGetJson
        : (key, fallback) => {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return fallback;
                const parsed = JSON.parse(raw);
                return parsed ?? fallback;
            } catch (_) {
                return fallback;
            }
        };

    const cultos = _lsGet(LS_KEYS.cultos, DEFAULT_CULTOS);
    const avisos = _lsGet(LS_KEYS.avisos, DEFAULT_AVISOS);
    return { cultos, avisos };
}

