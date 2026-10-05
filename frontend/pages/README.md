# Páginas da SPA

Cada rota da aplicação tem uma pasta com seus três arquivos de apresentação e comportamento:

```text
pages/<rota>/<rota>.html
pages/<rota>/<rota>.css
pages/<rota>/<rota>.js
```

O HTML é um fragmento inserido em `#page-content`; não deve incluir outro `html`, `head`, header ou footer. O CSS contém somente os estilos específicos daquela página. O módulo JS exporta `initPage(root)`, chamado pelo roteador após o fragmento ser inserido.

A infraestrutura compartilhada fica em `js/app/router.js` (roteamento) e `js/services/api.js` (requisições ao backend). Os componentes ficam em `js/components/`, separados por responsabilidade:

```text
components/
	events/    event-card.js, event-list.js
	forms/     form-link.js, form-link-list.js
	members/  member-card.js, member-grid.js
	shared/   dom.js, empty-state.js
```

`js/components/index.js` é a fachada pública que reexporta as listas e mensagens usadas pelas páginas. Componentes unitários e helpers devem ser importados dentro dos módulos da sua respectiva área. O painel administrativo inicializa por `js/admin/dashboard.js`.

Para adicionar uma rota:

1. Crie os três arquivos na pasta `pages/<rota>/`.
2. Adicione a rota e o título em `pageDefinitions`, em `js/app/router.js`.
3. Adicione o link com `href="#<rota>"` e `data-page="<rota>"` ao menu de `index.html`.
4. Exporte `initPage(root)` do módulo JS da página.
