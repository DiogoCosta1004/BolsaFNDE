# Bolsa FNDE — GitHub Pages + Cloudflare Worker

Site estático HTML/CSS/JS. O frontend chama o Worker em https://bolsa-fnde-api.diogocosta.workers.dev; o Worker encaminha requisições à API antiga do FNDE.

## Publicar

Envie os arquivos desta pasta **diretamente para a raiz** do repositório GitHub Pages (não a pasta externa). Aguarde a publicação e faça atualização completa da página.

## Rotas usadas
- `GET /pessoa?cpf=XXXXXXXXXXX`
- `GET /pagamento?hash=...`

## Limitações
O sucesso de `GET /` no Worker comprova apenas que o Worker está online, não que o FNDE responde corretamente às rotas. O JSON legado pode exigir ajustes no parser. Não exponha CPF ou respostas reais em screenshots/logs, e considere requisitos de privacidade e uso do serviço.
