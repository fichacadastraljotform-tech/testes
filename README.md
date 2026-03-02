# Zelo | Captação Interna

Aplicativo interno (web responsivo e mobile-friendly) para rotina diária de captação de imóveis para locação em Campinas/SP.

## Como executar

```bash
python3 -m http.server 4173
```

Acesse: `http://localhost:4173`

## Usuários seed

- **Admin (Gestor):** `admin` / `123456`
- **Usuário (Funcionário):** `bruno` / `123456`

## Módulos implementados

- Login com usuário/senha + fluxo simples de “esqueci a senha”.
- Home com resumo diário, notificações e progresso do mês.
- Rotina com scroll de 30 cards (Dia 1…30) já cadastrados.
- Tela do Dia com mapa OSM (Leaflet), filtro de bairros e checklist executável.
- Novo Lead com validações obrigatórias.
- Notificações com criação pelo admin + campanhas.
- Relatórios admin com KPIs e exportação CSV.
- Trilha de auditoria de ações (login, tarefas, leads, notificações, export).

## Regras de validação implementadas

- Finalizar dia exige no mínimo **70%** das tarefas com status válido (`feito/sem resultado/precisa ajuda`).
- Finalizar dia exige **1 resultado por origem usada** no dia (`Imoview/Fisgar/Eemovel/Concorrentes`).
- Tarefa de origem **Concorrentes** exige `link` e `print/observação`.
- Todo lead exige `bairro + origem + link/evidência + faixa de valor`.

## Estrutura de dados (localStorage)

- `users(id, name, username, password, role, team)`
- `campaigns(id, title, description, createdBy, createdAt)`
- `notifications(id, title, text, date, pinnedDays, targetUsers, createdBy, createdAt)`
- `routines(id, day, theme, bairros[], objectives, tasks[])`
- `taskResults(day, taskIndex, userId, source, status, resultado, link, printObs, updatedAt)`
- `leads(id, day, userId, origem, bairro, tipo, faixaValor, proprietario, contato, condicoes, link, status, proximosPassos, createdAt)`
- `dayNotes(day, userId, text)`
- `dayFinalizations(day, userId, at)`
- `auditLogs(id, action, payload, by, at)`
