const API_URL = 'http://127.0.0.1:5000/api';

export async function requestApi(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        credentials: 'include',
        ...options,
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Não foi possível concluir a operação.');
    }
    return result;
}

async function getCollection(resource) {
    return (await requestApi(`/${resource}`)).data;
}

export const getEvents = () => getCollection('events');
export const getMembers = () => getCollection('members');
export const getForms = () => getCollection('forms');
