import { appendText } from './dom.js';

export function renderMessage(container, message) {
    container.replaceChildren();
    appendText(container, 'p', 'empty-state', message);
}
