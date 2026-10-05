const pageContent = document.querySelector('#page-content');
const pageStylesheet = document.querySelector('#page-stylesheet');
const pagesDirectory = new URL('../../pages/', import.meta.url);
const pageDefinitions = {
    home: { title: 'PyLadies SP - Aprender, Compartilhar, Liderar' },
    workshops: { title: 'Palestras & Workshops - PyLadies SP' },
    minicourses: { title: 'Mini Cursos - PyLadies SP' },
    about: { title: 'Quem Somos - PyLadies SP' },
    agenda: { title: 'Agenda - PyLadies SP' },
    contact: { title: 'Contato - PyLadies SP' },
    historia: { title: 'Nossa História - PyLadies SP' },
};
let navigationVersion = 0;

function currentPageKey() {
    const route = window.location.hash.slice(1);
    return Object.hasOwn(pageDefinitions, route) ? route : 'home';
}

function setActiveNavigation(page) {
    document.querySelectorAll('.nav-link[data-page]').forEach((link) => {
        const isActive = link.dataset.page === page;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function showLoadError() {
    pageContent.replaceChildren();
    const message = document.createElement('p');
    message.className = 'empty-state page-load-error';
    message.textContent = 'Não foi possível carregar esta página. Atualize o navegador e tente novamente.';
    pageContent.appendChild(message);
}

async function renderCurrentPage() {
    const version = ++navigationVersion;
    const page = currentPageKey();
    const pageBase = new URL(`${page}/`, pagesDirectory);
    const htmlUrl = new URL(`${page}.html`, pageBase);
    const cssUrl = new URL(`${page}.css`, pageBase);
    const scriptUrl = new URL(`${page}.js`, pageBase);

    setActiveNavigation(page);
    document.title = pageDefinitions[page].title;
    pageContent.setAttribute('aria-busy', 'true');

    try {
        const response = await fetch(htmlUrl);
        if (!response.ok) throw new Error(`Falha ao carregar ${htmlUrl.pathname}.`);
        const markup = await response.text();
        if (version !== navigationVersion) return;

        pageContent.innerHTML = markup;
        pageStylesheet.href = cssUrl.href;

        const pageModule = await import(scriptUrl.href);
        if (version !== navigationVersion) return;
        await pageModule.initPage(pageContent);
        if (version !== navigationVersion) return;

        pageContent.dataset.page = page;
        pageContent.removeAttribute('aria-busy');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        if (version !== navigationVersion) return;
        console.error(error);
        showLoadError();
        pageContent.removeAttribute('aria-busy');
    }
}

window.addEventListener('hashchange', renderCurrentPage);
renderCurrentPage();
