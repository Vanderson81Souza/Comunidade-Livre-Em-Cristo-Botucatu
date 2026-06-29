// =========================================================================
// 📋 DADOS CARREGADOS DE ARQUIVOS EXTERNOS
// dadosPalavra - palavra.js (nome do pastor, foto, data, texto)
// dadosEventos - eventos.js (cultos e avisos)
// =========================================================================

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

function sanitizeInput(text) {
    const element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
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
// 6. CARREGAR DADOS DA PALAVRA PASTORAL (palavra.js)
// =========================================================================

function renderizarPalavraPastoral(dados) {
    const container = document.getElementById('pastoralContainer');
    if (!container) return;
    
    const nomeLimpo = sanitizeInput(dados.nomePastor);
    const dataLimpa = sanitizeInput(dados.dataPublicacao);
    
    container.innerHTML = `
        <div style="display: inline-block;">
            <div class="pastor-photo" style="background: #cbd5e1 url('${dados.fotoUrl}') center/cover;"></div>
        </div>
        <h2>Mensagem do Pastor</h2>
        <p style="color: var(--text-muted); font-style: italic;">Por: ${nomeLimpo} | ${dataLimpa}</p>
        <div class="pastoral-text">
            <p>${dados.textoPastoral}</p>
        </div>
    `;
}

function carregarPalavraPastoralDaAPI() {
    // Carrega dados do arquivo palavra.js
    new Promise((resolve) => {
        setTimeout(() => { resolve(dadosPalavra); }, 500);
    })
    .then((dadosRecebidos) => { renderizarPalavraPastoral(dadosRecebidos); });
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
        dados.cultos.forEach(culto => {
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
        dados.avisos.forEach(aviso => {
            const dataLimpa = sanitizeInput(aviso.data);
            const tituloLimpo = sanitizeInput(aviso.titulo);
            const textoLimpo = sanitizeInput(aviso.texto);
            
            htmlAvisos += `
                <div class="notice-item">
                    <p class="notice-date">Em: ${dataLimpa}</p>
                    <p><strong>${tituloLimpo}:</strong> ${textoLimpo}</p>
                </div>
            `;
        });
        avisosContainer.innerHTML = htmlAvisos;
    }
}

// =========================================================================
// 8. DISPARO INICIAL (CARREGAMENTO DA PÁGINA)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    carregarPalavraPastoralDaAPI();
    // Carrega dados do arquivo eventos.js
    renderizarEventosEAvisos(dadosEventos); 
});


