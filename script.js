// =========================================================================
// 📋 ÁREA DE ATUALIZAÇÃO RÁPIDA (MODIFIQUE APENAS OS TEXTOS ABAIXO)
// =========================================================================
const DADOS_IGREJA = {
  "cultos": [
    { "horario": "Domingo - 18:00h", "descricao": "Culto de Celebração e Família" },
    { "horario": "Terça-feira - 20:00h", "descricao": "Primeiro o Reino" },
    { "horario": "Quinta-feira - 19:30h", "descricao": "Estudo Biblico" }
    // Você pode adicionar ou remover linhas aqui seguindo o mesmo padrão!
  ],
  "avisos": [
    { "data": "Domingo", "titulo": "Ensaio", "texto": "Equipe de louvor 10:00." },
    { "data": "Quarta", "titulo": "Ensaio", "texto": "Equipe de Danças e Artes 19:30h." },
    { "data": "07/06/2026", "titulo": "Jantar de Casais", "texto": "Venha participar do maravilho jantar de casais dia 04/07/2026 19:30h." }

  ]
};

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
// 6. SIMULAÇÃO DE API - MENSAGEM PASTORAL
// =========================================================================
const bancoDeDadosSimulado = {
    nomePastor: "Pr. Rodrigo Aviles",
    fotoUrl: "imagens/biblia.png", 
    dataPublicacao: "Publicado em: 10/06/2026",
    textoPastoral: `Querida comunidade, é com muita alegria que compartilhamos esta palavra semanal de reflexão. Vivemos tempos onde encontrar momentos de paz e conexão genuína tornou-se uma prioridade essencial para manter nosso equilíbrio e nossa esperança renovados.<br><br>Independentemente dos desafios que surjam em sua rotina, lembre-se de que nenhum caminho precisa ser percorrido de forma solitária. Nossas portas e corações estão sempre abertos para ouvir, apoiar e caminhar ao seu lado em cada etapa necessária.<br><br>A graça de Deus é o amor incondicional que oferece perdão e salvação ao pecador, sem que ele mereça. Ela transforma vidas, substituindo a culpa pela paz e o julgamento pela restauração espiritual. Esse favor imerecido serve como uma ponte que reconcilia o ser humano com o Criador. Por meio dela, o arrependimento abre as portas para um recomeço cheio de esperança. É o maior presente divino, acessível a qualquer um que decida acolhê-la de coração.<br><br>"Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus." (Efésios 2:8).<br><br>Deus te abençoe como toda sorte de bençãos!.`
};

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
    new Promise((resolve) => {
        setTimeout(() => { resolve(bancoDeDadosSimulado); }, 1000);
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
                    <p class="notice-date">Publicado em: ${dataLimpa}</p>
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
    // Puxa as informações direto do topo deste arquivo, sem usar Fetch/Rede
    renderizarEventosEAvisos(DADOS_IGREJA); 
});


