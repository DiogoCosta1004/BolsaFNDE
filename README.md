# Bolsa FNDE — site estático

Projeto independente em HTML, CSS e JavaScript, baseado na lógica de consulta encontrada no APK de 2016.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie **os arquivos desta pasta diretamente para a raiz do repositório**.
3. Em **Settings > Pages > Build and deployment**, escolha **Deploy from a branch**, branch `main` e pasta `/(root)`.
4. Aguarde o link do GitHub Pages aparecer na tela de Pages.
5. No Safari do iPhone, abra o endereço e use **Compartilhar > Adicionar à Tela de Início**.

## Limitações

- Os endpoints `https://www.fnde.gov.br/digef/rs/spba/publica/pessoa/1/10/{cpf}` e `/pagamento/{hash}` foram extraídos do APK antigo e **não foram validados em produção**.
- O GitHub Pages não executa backend nem proxy. Se o servidor FNDE não permitir CORS, a consulta falhará mesmo que o site carregue corretamente.
- Não armazena CPFs, nomes ou resultados em localStorage, cookies ou cache do service worker. O service worker guarda apenas arquivos estáticos locais.
- Não é um serviço oficial do Governo Federal. Evite inserir CPFs de terceiros sem base legal/autorização.
