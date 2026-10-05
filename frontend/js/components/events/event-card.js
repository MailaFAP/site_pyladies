import { appendText } from '../shared/dom.js';

const SYMPLA_URL = 'https://www.sympla.com.br/produtor/PyLadiesSP';

function createHomeDateBadge(date) {
    const badge = document.createElement('span');
    badge.className = 'event-badge home-event-date';
    const dateParts = date.match(/^(\d{1,2})\s+de\s+(\p{L}+)/iu);
    if (!dateParts) {
        badge.textContent = date;
        return badge;
    }

    appendText(badge, 'span', 'event-month', dateParts[2].slice(0, 3).toUpperCase());
    appendText(badge, 'span', 'event-day', dateParts[1]);
    return badge;
}

function createRegistrationLink() {
    const link = document.createElement('a');
    link.className = 'event-register';
    link.href = SYMPLA_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Inscrever-se';
    return link;
}

function createSpeakerDetails(event) {
    const isWorkshop = event.tipo === 'Palestras & Workshops';
    if (!isWorkshop && !event.palestrante && !event.foto_palestrante) return null;

    const details = document.createElement('div');
    details.className = 'event-speaker';
    if (event.foto_palestrante) {
        const image = document.createElement('img');
        image.src = event.foto_palestrante;
        image.alt = event.palestrante ? `Foto de ${event.palestrante}` : 'Foto da palestrante';
        details.appendChild(image);
    }
    const name = document.createElement('span');
    name.className = 'event-speaker-name';
    name.textContent = event.palestrante || 'Palestrante a definir';
    details.appendChild(name);
    return details;
}

export function createEventCard(event, { home = false } = {}) {
    const card = document.createElement('article');
    card.className = home ? 'event-row home-event-row' : 'event-page-card event-row';
    if (home) {
        card.title = event.titulo;
        card.appendChild(createHomeDateBadge(event.data));
    } else {
        appendText(card, 'span', 'event-badge event-page-date', event.data);
    }

    const info = document.createElement('div');
    info.className = 'event-info';
    if (home) {
        appendText(info, 'h2', '', event.tipo);
        appendText(info, 'span', '', `${event.data} - ${event.horario}`);
    } else {
        appendText(info, 'h2', '', event.titulo);
        const location = event.local || 'A definir';
        appendText(info, 'span', 'event-page-time', `Horário: ${event.horario} · Local: ${location}`);
    }
    card.appendChild(info);

    if (!home) {
        const speakerDetails = createSpeakerDetails(event);
        if (speakerDetails) info.appendChild(speakerDetails);
    }

    if (!home) card.appendChild(createRegistrationLink());
    return card;
}
