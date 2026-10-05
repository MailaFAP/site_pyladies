import { appendText } from '../shared/dom.js';

export function createMemberCard(member, { home = false } = {}) {
    const card = document.createElement('article');
    card.className = home ? 'member-item home-member-item' : 'member-item';
    const image = document.createElement('img');
    image.src = member.foto;
    image.alt = `Foto de ${member.nome}`;
    card.appendChild(image);
    appendText(card, 'h3', '', member.nome);
    return card;
}
