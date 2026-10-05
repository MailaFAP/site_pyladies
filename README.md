# PyLadies São Paulo

Site comunitário com frontend SPA estático, API Flask e banco SQLite.

## Estrutura

```text
frontend/
  index.html                 shell público
  admin.html                 shell administrativo
  css/                       estilos globais e do admin
  js/
    app/router.js            roteamento SPA por hash
    services/api.js          cliente HTTP compartilhado
    components/              componentes por domínio
    admin/dashboard.js       comportamento do painel
  pages/<rota>/              HTML, CSS e JS próprios de cada rota

backend/
  app.py                     entry point compatível
  pyladies_api/
    __init__.py              factory Flask e registro de blueprints
    config.py                configuração e variáveis de ambiente
    database.py              conexão, schema e inicialização SQLite
    routes/                  endpoints de autenticação e conteúdo
    services/                operações de domínio/CRUD
  tests/                     testes automatizados da API
```

## Instalação inicial

Requisitos: Python instalado e terminal aberto na pasta raiz do projeto. No Windows, crie e ative o ambiente virtual e instale as dependências do backend:

```bat
py -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
```

O arquivo `backend\requirements.txt` instala Flask e Flask-Cors. Ative o ambiente virtual novamente sempre que abrir um novo terminal para trabalhar no backend.

## Executar

Com o ambiente virtual ativado e o terminal na raiz do projeto, inicie a API:

```bat
python backend\app.py
```

Em outro terminal, sirva o frontend estático:

```bat
cd frontend
python -m http.server 5500
```

Acesse `http://localhost:5500`. A Administração abre em `/admin.html`.

O SQLite é criado em `backend/pyladies.db` na primeira inicialização. Para configurar a senha inicial do admin antes de criar o banco, defina `PYLADIES_ADMIN_PASSWORD`; `PYLADIES_DATABASE` e `PYLADIES_SECRET_KEY` também podem ser configuradas pelo ambiente.

Eventos cadastrados devem informar o local (por exemplo, `Auditório Tech SP` ou `Online / Remoto`). Bancos existentes recebem as colunas novas automaticamente; eventos antigos aparecem com local `A definir` até serem atualizados na Administração. Palestras e workshops também exigem nome e URL da foto da palestrante; em minicursos esses dados são opcionais.

Integrantes da comunidade são cadastradas somente com nome e foto; não há campo de função ou papel. Bancos existentes são migrados preservando nome, foto e identificadores dos membros.

## Testes

Na raiz do projeto:

```bat
.venv\Scripts\python.exe -m unittest discover -s backend/tests -v
```
