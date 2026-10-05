export function createFormLink(form) {
    const link = document.createElement('a');
    link.className = 'btn-action';
    link.href = form.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = form.titulo;
    link.title = form.descricao;
    return link;
}
