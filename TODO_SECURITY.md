# TODO_SECURITY.md

## Segurança (prioridade)
- [x] Trocar backend/app.py para autenticação com token por sessão (token randômico) ao invés de FIXED_TOKEN

- [ ] Remover dependência de CORS permissivo no backend (restringir origens)
- [x] Remover credenciais hardcoded do front (script.js) e eliminar validação local por senha fixa

- [ ] Ajustar front para chamar /api/login e só então exibir painel admin
- [ ] Implementar “logout” real no backend (revogar token) e limpar token no front
- [ ] Validar payloads e limites (tamanho máximo) para reduzir risco de DoS

## Qualidade
- [ ] Refatorar renderização de texto para evitar qualquer uso de HTML a partir de dados do usuário
- [ ] Simplificar JS: reduzir duplicação e variáveis globais desnecessárias

