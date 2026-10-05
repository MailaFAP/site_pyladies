import { requestApi } from '../services/api.js';

const loginView = document.querySelector('#login-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginMessage = document.querySelector('#login-message');
const dashboardMessage = document.querySelector('#dashboard-message');
const eventForm = document.querySelector('#event-form');
const eventCategory = document.querySelector('#event-category');
const speakerNameInput = document.querySelector('#event-speaker-name');
const speakerPhotoInput = document.querySelector('#event-speaker-photo');
const speakerRequiredHint = document.querySelector('#speaker-required-hint');
let events = [];
let members = [];
let forms = [];

const api = requestApi;

function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.className = `form-message ${isError ? 'is-error' : 'is-success'}`;
}

function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function setForm(form, item = {}) {
    Object.keys(item).forEach((key) => { if (form.elements[key]) form.elements[key].value = item[key]; });
    form.elements.id.value = item.id || '';
    if (form === eventForm) updateSpeakerRequirement();
}

function renderEvents() {
    document.querySelector('#events-table').innerHTML = events.length ? `<table><thead><tr><th>Evento</th><th>Data, local e palestrante</th><th>Ações</th></tr></thead><tbody>${events.map((event) => `<tr><td><strong>${event.titulo}</strong><small>${event.tipo}</small></td><td>${event.data}<small>${event.horario}</small><small>${event.local || 'Local não informado'}</small>${event.palestrante ? `<small>${event.palestrante}</small>` : ''}</td><td><button class="table-button" data-action="edit-event" data-id="${event.id}">Editar</button><button class="table-button danger" data-action="delete-event" data-id="${event.id}">Excluir</button></td></tr>`).join('')}</tbody></table>` : '<p class="empty-state">Nenhum evento cadastrado.</p>';
}

function updateSpeakerRequirement() {
    const required = eventCategory.value === 'Palestras & Workshops';
    speakerNameInput.required = required;
    speakerPhotoInput.required = required;
    speakerRequiredHint.textContent = required
        ? 'Nome e imagem são obrigatórios para palestras e workshops.'
        : 'Nome e imagem são opcionais para minicursos.';
}

function renderMembers() {
    document.querySelector('#members-table').innerHTML = members.length ? `<table><thead><tr><th>Membra</th><th>Ações</th></tr></thead><tbody>${members.map((member) => `<tr><td class="member-cell"><img src="${member.foto}" alt=""><span><strong>${member.nome}</strong></span></td><td><button class="table-button" data-action="edit-member" data-id="${member.id}">Editar</button><button class="table-button danger" data-action="delete-member" data-id="${member.id}">Excluir</button></td></tr>`).join('')}</tbody></table>` : '<p class="empty-state">Nenhuma membra cadastrada.</p>';
}

function renderForms() {
    document.querySelector('#forms-table').innerHTML = forms.length ? `<table><thead><tr><th>Formulário</th><th>Link</th><th>Ações</th></tr></thead><tbody>${forms.map((form) => `<tr><td><strong>${form.titulo}</strong><small>${form.descricao}</small></td><td><a href="${form.url}" target="_blank" rel="noopener">Abrir</a></td><td><button class="table-button" data-action="edit-form" data-id="${form.id}">Editar</button><button class="table-button danger" data-action="delete-form" data-id="${form.id}">Excluir</button></td></tr>`).join('')}</tbody></table>` : '<p class="empty-state">Nenhum formulário cadastrado.</p>';
}

async function loadDashboard() {
    [events, members, forms] = await Promise.all([(api('/events')).then((result) => result.data), (api('/members')).then((result) => result.data), (api('/forms')).then((result) => result.data)]);
    renderEvents();
    renderMembers();
    renderForms();
}

async function openDashboard() {
    loginView.hidden = true;
    dashboardView.hidden = false;
    try { await loadDashboard(); } catch (error) { showMessage(dashboardMessage, error.message, true); }
}

document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        await api('/login', { method: 'POST', body: JSON.stringify(formData(event.target)) });
        event.target.reset();
        await openDashboard();
    } catch (error) { showMessage(loginMessage, error.message, true); }
});

document.querySelector('#logout-button').addEventListener('click', async () => {
    await api('/logout', { method: 'POST' });
    dashboardView.hidden = true;
    loginView.hidden = false;
});

async function save(form, resource, cancelButton) {
    const values = formData(form);
    const id = values.id;
    delete values.id;
    try {
        await api(id ? `/${resource}/${id}` : `/${resource}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(values) });
        form.reset();
        form.elements.id.value = '';
        if (form === eventForm) updateSpeakerRequirement();
        cancelButton.hidden = true;
        const resourceLabel = resource === 'events' ? 'Evento' : resource === 'members' ? 'Membra' : 'Formulário';
        showMessage(dashboardMessage, `${resourceLabel} salvo com sucesso.`);
        await loadDashboard();
    } catch (error) { showMessage(dashboardMessage, error.message, true); }
}

eventCategory.addEventListener('change', updateSpeakerRequirement);
updateSpeakerRequirement();
eventForm.addEventListener('submit', (event) => { event.preventDefault(); save(eventForm, 'events', document.querySelector('#cancel-event')); });
document.querySelector('#member-form').addEventListener('submit', (event) => { event.preventDefault(); save(event.target, 'members', document.querySelector('#cancel-member')); });
document.querySelector('#form-form').addEventListener('submit', (event) => { event.preventDefault(); save(event.target, 'forms', document.querySelector('#cancel-form')); });

document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    const type = action.includes('event') ? 'event' : action.includes('member') ? 'member' : 'form';
    const collection = type === 'event' ? events : type === 'member' ? members : forms;
    const item = collection.find((entry) => entry.id === id);
    const form = document.querySelector(`#${type}-form`);
    const cancel = document.querySelector(`#cancel-${type}`);
    if (action.startsWith('edit')) { setForm(form, item); cancel.hidden = false; form.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (window.confirm('Deseja excluir este registro?')) {
        try { await api(`/${type === 'event' ? 'events' : type === 'member' ? 'members' : 'forms'}/${id}`, { method: 'DELETE' }); await loadDashboard(); showMessage(dashboardMessage, 'Registro excluído com sucesso.'); } catch (error) { showMessage(dashboardMessage, error.message, true); }
    }
});

document.querySelector('#cancel-event').addEventListener('click', () => { eventForm.reset(); updateSpeakerRequirement(); document.querySelector('#cancel-event').hidden = true; });
document.querySelector('#cancel-member').addEventListener('click', () => { document.querySelector('#member-form').reset(); document.querySelector('#cancel-member').hidden = true; });
document.querySelector('#cancel-form').addEventListener('click', () => { document.querySelector('#form-form').reset(); document.querySelector('#cancel-form').hidden = true; });

api('/session').then((result) => { if (result.authenticated) openDashboard(); });
