// =========================================================================
// 📡 Config da API (Python + SQLite)
// =========================================================================
const API_BASE_URL = 'http://127.0.0.1:5000';
let ADMIN_TOKEN = null;
let adminSessionExpiresAt = null;



// =========================================================================
// 1. NAVEGAÇÃO SPA (TROCA DE ABAS)
// =========================================================================
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
const navbar = document.getElementById('navbar');

tabLinks.forEach(link => {
    link.addEventListener('click', () => {
        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(item => item.classList.remove('active'));

        link.classList.add('active');
        const targetTab = link.getAttribute('data-tab');
        document.getElementById(targetTab).classList.add('active');

        navbar.classList.remove('open');
    });
});

// =========================================================================
// 2. MENU HAMBÚRGUER MOBILE
// =========================================================================
const menuToggle = document.getElementById('menuToggle');
menuToggle.addEventListener('click', () => {
    navbar.classList.toggle('open');
});

// =========================================================================
// 3. AUTENTICAÇÃO E LOGIN MODAL
// =========================================================================
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginModalClose = document.getElementById('loginModalClose');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminSection = document.getElementById('admin');
const logoutBtn = document.getElementById('logoutBtn');

const ADMIN_AUTH_KEY = 'adminAccessGranted';
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_TOKEN_EXP_KEY = 'adminTokenExpiresAt';

// credentials NÃO ficam hardcoded no front (segurança)



loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('hidden');
});


loginModalClose.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.add('hidden');
    }
});

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = document.getElementById('adminUsuario').value.trim();
        const senha = document.getElementById('adminSenha').value.trim();

        try {
            const data = await autenticarNoBackend({ usuario, senha });
            // só abre UI se o backend autorizou
            if (!data || !data.token) throw new Error('Token não recebido');

            localStorage.setItem(ADMIN_AUTH_KEY, 'true');
            localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
            localStorage.setItem(ADMIN_TOKEN_EXP_KEY, String(Date.now() + (data.ttl_seconds * 1000)));

            loginModal.classList.add('hidden');
            adminLoginForm.reset();
            mostrarPainelAdmin();
        } catch (err) {
            console.error(err);
            alert('Usuário ou senha inválidos. Tente novamente.');
        }
    });
}


function mostrarPainelAdmin() {
    adminSection.classList.remove('hidden');
    main.style.display = 'none';
    tabContents.forEach(item => item.classList.remove('active'));

    // Monta listas do admin vindas do SQLite (protegidas)
    carregarAdminCultosEAvisos().catch(() => {});
}


async function carregarAdminCultosEAvisos() {
    const token = obterTokenBackend();
    if (!token) {
        // ainda não logado na API; tenta emitir token e recarregar
        try {
            await autenticarNoBackend();
        } catch (e) {
            return;
        }
    }

    const t = obterTokenBackend();
    if (!t) return;

    const cultosResp = await fetch(`${API_BASE_URL}/api/cultos`, {
        headers: { 'Authorization': `Bearer ${t}` }
    });
    const avisosResp = await fetch(`${API_BASE_URL}/api/avisos`, {
        headers: { 'Authorization': `Bearer ${t}` }
    });

    const cultosData = await cultosResp.json();
    const avisosData = await avisosResp.json();

    adminEstado.cultos = (cultosData.items || []);
    adminEstado.avisos = (avisosData.items || []);

    renderAdminCultos();
    renderAdminAvisos();
}


const adminEstado = {
    cultos: [],
    avisos: []
};

function renderAdminCultos() {
    const lista = document.getElementById('adminCultosLista');
    if (!lista) return;
    lista.innerHTML = '';

    (adminEstado.cultos || []).forEach((culto, idx) => {
        const card = document.createElement('div');
        card.style.border = '1px solid var(--border)';
        card.style.borderRadius = '8px';
        card.style.padding = '0.75rem';
        card.style.background = 'var(--bg-light)';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; gap: 1rem; align-items:flex-start;">
                <div>
                    <div style="font-weight:700; color: var(--primary);">${sanitizeInput(culto.horario || '')}</div>
                    <div style="color: var(--text-muted); margin-top: .25rem;">${sanitizeInput(culto.descricao || '')}</div>
                </div>
                <button class="btn-logout" data-remove-culto-index="${idx}" style="background:#e53e3e; padding: .5rem .75rem; border-radius:6px; border:none; cursor:pointer;">Remover</button>
            </div>
        `;

        card.querySelector('[data-remove-culto-index]').addEventListener('click', () => {
            const i = Number(card.querySelector('[data-remove-culto-index]').getAttribute('data-remove-culto-index'));
            adminEstado.cultos.splice(i, 1);
            renderAdminCultos();
        });

        lista.appendChild(card);
    });
}

function renderAdminAvisos() {
    const lista = document.getElementById('adminAvisosLista');
    if (!lista) return;
    lista.innerHTML = '';

    (adminEstado.avisos || []).forEach((aviso, idx) => {
        const card = document.createElement('div');
        card.style.border = '1px solid var(--border)';
        card.style.borderRadius = '8px';
        card.style.padding = '0.75rem';
        card.style.background = 'var(--bg-light)';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; gap: 1rem; align-items:flex-start;">
                <div>
                    <div style="font-weight:700; color: var(--primary);">${sanitizeInput(aviso.titulo || '')}</div>
                    <div style="color: var(--text-muted); margin-top: .25rem;">${sanitizeInput(aviso.data || '')}</div>
                    <div style="margin-top: .5rem; color: var(--text-main);">${sanitizeInput(aviso.texto || '')}</div>
                </div>
                <button class="btn-logout" data-remove-aviso-index="${idx}" style="background:#e53e3e; padding: .5rem .75rem; border-radius:6px; border:none; cursor:pointer;">Remover</button>
            </div>
        `;

        card.querySelector('[data-remove-aviso-index]').addEventListener('click', () => {
            const i = Number(card.querySelector('[data-remove-aviso-index]').getAttribute('data-remove-aviso-index'));
            adminEstado.avisos.splice(i, 1);
            renderAdminAvisos();
        });

        lista.appendChild(card);
    });
}



function ocultarPainelAdmin() {
    adminSection.classList.add('hidden');
    main.style.display = 'flex';
    tabContents.forEach(item => item.classList.remove('active'));
    document.getElementById('home').classList.add('active');
    tabLinks.forEach(link => link.classList.remove('active'));
    document.querySelector('[data-tab="home"]').classList.add('active');
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(ADMIN_AUTH_KEY);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_TOKEN_EXP_KEY);
        ADMIN_TOKEN = null;
        ocultarPainelAdmin();
    });
}


function verificaAutenticacaoAdmin() {
    if (localStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
        // valida token (expiração) apenas pelo front;
        // endpoints continuarão protegidos no backend.
        const token = obterTokenBackend();
        if (!token) {
            localStorage.removeItem(ADMIN_AUTH_KEY);
            return false;
        }
        mostrarPainelAdmin();
        carregarUltimaPalavraPastoral();
        return true;
    }
    return false;
}


// =========================================================================
// 3. CARROSSEL DE IMAGENS
// =========================================================================
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slides = document.querySelectorAll('.carousel-slide');

let currentIndex = 0;

function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
});

// =========================================================================
// 4. VALIDAÇÃO E SEGURANÇA CONTRA XSS (FORMULÁRIO)
// =========================================================================
const form = document.getElementById('prayerForm');
const adminPastoralForm = document.getElementById('adminPastoralForm');
const main = document.querySelector('main');

function sanitizeInput(text) {
    const element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}

// Pedidos de Oração: enviar via API (SQLite) — sem WhatsApp
function montarPayloadPedidoOracao({ nome, pedido, contato, endereco }) {
    return {
        nome: nome || '',
        pedido: pedido || '',
        contato: contato || '',
        endereco: endereco || ''
    };
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeSemXss = sanitizeInput(document.getElementById('nome').value.trim());
    const pedidoSemXss = sanitizeInput(document.getElementById('pedido').value.trim());
    const contatoSemXss = sanitizeInput(document.getElementById('contato').value.trim());
    const enderecoSemXss = sanitizeInput(document.getElementById('endereco').value.trim());

    const payload = montarPayloadPedidoOracao({
        nome: nomeSemXss,
        pedido: pedidoSemXss,
        contato: contatoSemXss,
        endereco: enderecoSemXss
    });

    try {
        const resp = await fetch(`${API_BASE_URL}/api/pedidos-oracao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) throw new Error('Falha ao salvar pedido');

        alert(`Obrigado, ${nomeSemXss}. Seu pedido de oração foi registrado com segurança!`);
        form.reset();
    } catch (err) {
        alert('Não foi possível enviar seu pedido agora. Tente novamente mais tarde.');
        console.error(err);
    }
});


if (adminPastoralForm) {
    adminPastoralForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const cargo = sanitizeInput(document.getElementById('adminCargoPastor').value.trim());
        const nome = sanitizeInput(document.getElementById('adminNomePastor').value.trim());
        const data = document.getElementById('adminDataPastoral').value.trim();
        const palavra = sanitizeInput(document.getElementById('adminTextoPastoral').value.trim()).replace(/\n/g, '<br>');

        if (!cargo || !nome || !data || !palavra) {
            alert('Por favor, preencha todos os campos para publicar a palavra pastoral.');
            return;
        }

        const novapalavra = {
            cargo,
            nomePastor: nome,
            dataPublicacao: formatarData(data),
            textoPastoral: palavra,
            fotoUrl: bancoDeDadosSimulado.fotoUrl
        };

        localStorage.setItem('palavraPastoralAtual', JSON.stringify(novapalavra));

        renderizarPalavraPastoral(novapalavra, 'adminPreview');
        renderizarPalavraPastoral(novapalavra, 'pastoralPublica');

        alert('Palavra pastoral publicada com sucesso! Os leitores já podem visualizá-la.');
        adminPastoralForm.reset();
    });
}

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

// =========================================================================
// 5. GESTÃO DO BANNER LGPD
// =========================================================================
const lgpdBanner = document.getElementById('lgpdBanner');
const lgpdAccept = document.getElementById('lgpdAccept');

if (localStorage.getItem('lgpdAceito') === 'true') {
    lgpdBanner.style.display = 'none';
}

lgpdAccept.addEventListener('click', () => {
    localStorage.setItem('lgpdAceito', 'true');
    lgpdBanner.style.transform = 'translateY(100%)';
    setTimeout(() => lgpdBanner.style.display = 'none', 300);
});

// =========================================================================
// 6. SIMULAÇÃO DE API - MENSAGEM PASTORAL
// =========================================================================
const bancoDeDadosSimulado = {
    nomePastor: "Pr. Rodrigo Aviles",
    fotoUrl: "imagens/biblia.png",
    dataPublicacao: "Publicado em: 10/06/2026",
    textoPastoral: `Querida comunidade, é com muita alegria que compartilhamos esta palavra semanal de reflexão. Vivemos tempos onde encontrar momentos de paz e conexão genuína tornou-se uma prioridade essencial para manter nosso equilíbrio e nossa esperança renovados.<br><br>Independentemente dos desafios que surjam em sua rotina, lembre-se de que nenhum caminho precisa ser percorrido de forma solitária. Nossas portas e corações estão sempre abertos para ouvir, apoiar e caminhar ao seu lado em cada etapa necessária.<br><br>A graça de Deus é o amor incondicional que oferece perdão e salvação ao pecador, sem que ele mereça. Ela transforma vidas, substituindo a culpa pela paz e o julgamento pela restauração espiritual. Esse favor imerecido serve como uma ponte que reconcilia o ser humano com o Criador. Por meio dela, o arrependimento abre as portas para um recomeço cheio de esperança. É o maior presente divino, acessível a qualquer um que decida acolhê-la de coração.<br><br>"Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus." (Efésios 2:8).<br><br>Deus te abençoe como toda sorte de bençãos!.`
};

function renderizarPalavraPastoral(dados, containerId = 'pastoralPublica') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cargoLimpo = sanitizeInput(dados.cargo || 'Pastor');
    const nomeLimpo = sanitizeInput(dados.nomePastor);
    const dataLimpa = sanitizeInput(dados.dataPublicacao);
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
            renderizarPalavraPastoral(dados, 'adminPreview');
        } catch (e) {
            console.error('Erro ao carregar palavra pastoral salva:', e);
            carregarPalavraPastoralDaAPI();
        }
    } else {
        carregarPalavraPastoralDaAPI();
    }
}

async function autenticarNoBackend({ usuario, senha }) {
    const resp = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
    });

    if (!resp.ok) throw new Error('Falha no login da API');
    const data = await resp.json();
    if (!data.ok || !data.token) throw new Error('Token inválido');

    ADMIN_TOKEN = data.token;
    adminSessionExpiresAt = Date.now() + (data.ttl_seconds * 1000);
    return data;
}

function obterTokenBackend() {
    const token = ADMIN_TOKEN || localStorage.getItem(ADMIN_TOKEN_KEY);
    const exp = localStorage.getItem(ADMIN_TOKEN_EXP_KEY);

    if (!token) return null;
    if (exp && Number(exp) < Date.now()) {
        localStorage.removeItem(ADMIN_AUTH_KEY);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_TOKEN_EXP_KEY);
        ADMIN_TOKEN = null;
        return null;
    }

    return token;
}



function carregarPalavraPastoralDaAPI() {
    new Promise((resolve) => {
        setTimeout(() => { resolve(bancoDeDadosSimulado); }, 1000);
    })
    .then((dadosRecebidos) => {
        renderizarPalavraPastoral(dadosRecebidos, 'pastoralPublica');
    });
}

// =========================================================================
// 7. RENDERIZAÇÃO LOCAL DE EVENTOS E AVISOS (COMPATÍVEL COM ABERTURA DIRETA)
// =========================================================================
function renderizarEventosEAvisos(dados) {
    const cultosContainer = document.getElementById('cultosContainer');
    const avisosContainer = document.getElementById('avisosContainer');

    // --- RENDERIZAR CULTOS ---
    if (cultosContainer) {
        let htmlCultos = '<h2>Horário dos Cultos</h2>';
        (dados.cultos || []).forEach(culto => {
            const horarioLimpo = sanitizeInput(culto.horario);
            const descLimpa = sanitizeInput(culto.descricao);

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
            const dataLimpa = sanitizeInput(aviso.data);
            const tituloLimpo = sanitizeInput(aviso.titulo);
            const textoLimpo = sanitizeInput(aviso.texto);

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

async function carregarCultosERAvisosDaAPI() {
    const cultosResp = await fetch(`${API_BASE_URL}/api/cultos`);
    const avisosResp = await fetch(`${API_BASE_URL}/api/avisos`);

    const cultosData = await cultosResp.json();
    const avisosData = await avisosResp.json();

    return {
        cultos: cultosData.items || [],
        avisos: avisosData.items || []
    };
}


// =========================================================================
// 8. DISPARO INICIAL (CARREGAMENTO DA PÁGINA)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // token pode ter ficado salvo da última sessão
ADMIN_TOKEN = localStorage.getItem(ADMIN_TOKEN_KEY);


    verificaAutenticacaoAdmin();
    carregarUltimaPalavraPastoral();

    // UI admin - handlers
    const adminCultosForm = document.getElementById('adminCultosForm');
    const adminAvisosForm = document.getElementById('adminAvisosForm');
    const adminCultosSalvar = document.getElementById('adminCultosSalvar');
    const adminAvisosSalvar = document.getElementById('adminAvisosSalvar');
    const adminPedidosOracaoBaixar = document.getElementById('adminPedidosOracaoBaixar');

    if (adminCultosForm) {
        adminCultosForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const horario = sanitizeInput(document.getElementById('adminCultoHorario').value.trim());
            const descricao = sanitizeInput(document.getElementById('adminCultoDescricao').value.trim());

            if (!horario || !descricao) return;

            // adiciona em memória; persiste ao clicar em Salvar
            adminEstado.cultos.push({ horario, descricao });
            renderAdminCultos();
            adminCultosForm.reset();
        });
    }

    if (adminAvisosForm) {
        adminAvisosForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = sanitizeInput(document.getElementById('adminAvisoData').value.trim());
            const titulo = sanitizeInput(document.getElementById('adminAvisoTitulo').value.trim());
            const texto = sanitizeInput(document.getElementById('adminAvisoTexto').value.trim());

            if (!data || !titulo || !texto) return;

            adminEstado.avisos.push({ data, titulo, texto });
            renderAdminAvisos();
            adminAvisosForm.reset();
        });
    }

    async function salvarCultos() {
        const token = obterTokenBackend();
        if (!token) return alert('Faça login no admin para salvar.');

        const payload = {
            items: (adminEstado.cultos || []).map(c => ({
                horario: c.horario,
                descricao: c.descricao
            }))
        };

        const resp = await fetch(`${API_BASE_URL}/api/cultos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) throw new Error('Falha ao salvar cultos');
        alert('Horários dos cultos atualizados com sucesso!');
    }

    async function salvarAvisos() {
        const token = obterTokenBackend();
        if (!token) return alert('Faça login no admin para salvar.');

        const payload = {
            items: (adminEstado.avisos || []).map(a => ({
                data: a.data,
                titulo: a.titulo,
                texto: a.texto
            }))
        };

        const resp = await fetch(`${API_BASE_URL}/api/avisos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) throw new Error('Falha ao salvar avisos');
        alert('Avisos atualizados com sucesso!');
    }

    async function baixarPedidosOracaoTxt() {
        const token = obterTokenBackend();
        if (!token) return alert('Faça login no admin para baixar.');

        const resp = await fetch(`${API_BASE_URL}/api/pedidos-oracao/txt`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resp.ok) throw new Error('Falha ao baixar TXT');

        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        const contentDisposition = resp.headers.get('content-disposition') || '';
        const match = contentDisposition.match(/filename="?([^\"]+)"?/i);
        const filename = match && match[1] ? match[1] : 'pedidos-oracao.txt';

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    if (adminCultosSalvar) {
        adminCultosSalvar.addEventListener('click', async () => {
            try { await salvarCultos(); } catch (e) { alert('Erro ao salvar cultos.'); }
        });
    }

    if (adminAvisosSalvar) {
        adminAvisosSalvar.addEventListener('click', async () => {
            try { await salvarAvisos(); } catch (e) { alert('Erro ao salvar avisos.'); }
        });
    }

    if (adminPedidosOracaoBaixar) {
        adminPedidosOracaoBaixar.addEventListener('click', async () => {
            try { await baixarPedidosOracaoTxt(); } catch (e) { alert('Erro ao baixar pedidos de oração.'); }
        });
    }

    // Renderiza eventos/avisos vindos do SQLite via API
    carregarCultosERAvisosDaAPI()
        .then(dados => renderizarEventosEAvisos(dados))
        .catch(() => {
            const cultosContainer = document.getElementById('cultosContainer');
            const avisosContainer = document.getElementById('avisosContainer');
            if (cultosContainer) cultosContainer.innerHTML = '<h2>Horário dos Cultos</h2><p style="color: var(--text-muted);">Erro ao carregar horários (API offline).</p>';
            if (avisosContainer) avisosContainer.innerHTML = '<h2>Quadro de Avisos Gerais</h2><p style="color: var(--text-muted);">Erro ao carregar avisos (API offline).</p>';
        });
});

