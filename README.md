# Escola Zelo (mock funcional)

Aplicação web responsiva (desktop + mobile) para treinamento interno da Zelo Imóveis.

## Como executar

```bash
python3 -m http.server 4173
```

Abra `http://localhost:4173`.

## Usuários mock

- Aluno: `aluno@zelo.com` / `123456`
- Admin: `admin@zelo.com` / `123456`

## Fluxo de teste

1. Login (aluno)
2. Dashboard → continuar curso
3. Aula com rolagem + progresso
4. Concluir aulas e fazer avaliação
5. Concluir curso e baixar certificado
6. Ver notificações
7. Login admin para criar usuários/notificações e ver auditoria

## Schema de referência

Tabelas modeladas no estado local em memória/localStorage:

- `users(id, name, email, password_hash, role, sector, position, created_at, last_login)`
- `tracks(id, title, description, is_mandatory, created_at)`
- `courses(id, track_id, title, description, workload_hours, passing_score, max_attempts)`
- `lessons(id, course_id, title, content_html, video_url, min_watch_percent, min_time_seconds, order_index)`
- `materials(id, lesson_id, title, type, url_or_file_path)`
- `progress(user_id, lesson_id, status, watched_percent, time_spent, completed_at)`
- `quizzes(id, course_id, title)`
- `questions(id, quiz_id, type, prompt, options_json, correct_answer_json)`
- `attempts(id, quiz_id, user_id, score, passed, attempt_number, started_at, finished_at)`
- `certificates(id, user_id, course_id, code, issued_at, pdf_path)`
