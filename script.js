// =========================================================================
// 📡 Config da API (Python + SQLite)
// =========================================================================
const API_BASE_URL = 'http://127.0.0.1:5000';
let ADMIN_TOKEN = null;
let adminSessionExpiresAt = null;

// =========================================================================
// 0. MODO GITHUB PAGES (OFFLINE)
// =========================================================================
const IS_PAGES = (() => {
    const host = (location && location.hostname) ? location.hostname : '';
    return host && host !== '127.0.0.1' && host !== 'localhost';
})();

const LS_KEYS = {
    cultos: 'pages_cultos',
    avisos: 'pages_avisos',
    pedidosOracao: 'pages_pedidos_oracao',
    adminOffline: 'pages_admin_offline'
};

const DEFAULT_CULTOS = [
    { id: 1, horario: 'Domingo - 18:00h', descricao: 'Culto de Celebração e Família' },
    { id: 2, horario: 'Terça-feira - 20:00h', descricao: 'Primeiro o Reino' },
    { id: 3, horario: 'Quinta-feira - 19:30h', descricao: 'Estudo Biblico' }
];

const DEFAULT_AVISOS = [
    { id: 1, data: 'Domingo', titulo: 'Ensaio', texto: 'Equipe de louvor 10:00.' },
    { id: 2, data: 'Quarta', titulo: 'Ensaio', texto: 'Equipe de Danças e Artes 19:30h.' },
    { id: 3, data: '07/06/2026', titulo: 'Jantar de Casais', texto: 'Venha participar do maravilho jantar de casais dia 04/07/2026 19:30h.' }
];

function lsGetJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch (_) {
        return fallback;
    }
}

function lsSetJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


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
// 4. VALIDAÇÃO E SEGURANÇA (FORMULÁRIO)
// =========================================================================
const form = document.getElementById('prayerForm');
const adminPastoralForm = document.getElementById('adminPastoralForm');

// =========================================================================
// 4.1 WHATSAPP (GitHub Pages não tem backend)
// =========================================================================
const WHATSAPP_PHONE_E164 = '+5514996143354';

function construirMensagemWhatsApp({ nome, pedido, contato, endereco }) {
    const linhas = [
        'Olá! Gostaria de enviar um pedido de oração.',
        '',
        `Nome: ${nome || ''}`,
        `Pedido: ${pedido || ''}`,
        `Contato/E-mail: ${contato || ''}`,
        `Endereço: ${endereco || ''}`
    ];

    return linhas.join('\n').trim();
}

function abrirWhatsAppComMensagem({ nome, pedido, contato, endereco }) {
    const texto = construirMensagemWhatsApp({ nome, pedido, contato, endereco });
    const url = `https://wa.me/${WHATSAPP_PHONE_E164.replace('+', '')}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

function sanitizeInput(text) {
    const element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}

// Pedidos de Oração: enviar via API (SQLite) — sem WhatsApp (mantido como no seu projeto)
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

    const nome = sanitizeInput(document.getElementById('nome').value.trim());
    const pedido = sanitizeInput(document.getElementById('pedido').value.trim());
    const contato = sanitizeInput(document.getElementById('contato').value.trim());
    const endereco = sanitizeInput(document.getElementById('endereco').value.trim());

    abrirWhatsAppComMensagem({ nome, pedido, contato, endereco });

    alert('Abrimos o WhatsApp para você enviar o pedido de oração.');
    form.reset();
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
// 6. DISPARO INICIAL (CARREGAMENTO DA PÁGINA)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    ADMIN_TOKEN = localStorage.getItem(ADMIN_TOKEN_KEY);

    // Palavra Pastoral (funções definidas no pastoral-atualizacao.js)
    if (typeof carregarUltimaPalavraPastoral === 'function') {
        carregarUltimaPalavraPastoral();
    }

    // Renderiza eventos/avisos no modo GitHub Pages (funções definidas no eventos-horarios-atualizacao.js)
    (async () => {
        try {
            if (typeof renderizarEventosEAvisos === 'function') {
                const cultos = lsGetJson(LS_KEYS.cultos, DEFAULT_CULTOS);
                const avisos = lsGetJson(LS_KEYS.avisos, DEFAULT_AVISOS);
                renderizarEventosEAvisos({ cultos, avisos });
            }
        } catch (err) {
            const cultosContainer = document.getElementById('cultosContainer');
            const avisosContainer = document.getElementById('avisosContainer');
            if (cultosContainer) cultosContainer.innerHTML = '<h2>Horário dos Cultos</h2><p style="color: var(--text-muted);">Não foi possível carregar os horários.</p>';
            if (avisosContainer) avisosContainer.innerHTML = '<h2>Quadro de Avisos Gerais</h2><p style="color: var(--text-muted);">Não foi possível carregar os avisos.</p>';
        }
    })();
});

