-- =====================================================
-- Ver os usuários criados com suas roles
-- =====================================================

SELECT 
    u.id,
    u.nome,
    u.email,
    u.senha_hash as senha,
    GROUP_CONCAT(r.nome ORDER BY r.nome SEPARATOR ', ') as roles
FROM Usuario u
LEFT JOIN UsuarioRole ur ON u.id = ur.usuario_id
LEFT JOIN Role r ON ur.role_id = r.id
WHERE u.nome IN ('professor', 'aluno')
GROUP BY u.id, u.nome, u.email, u.senha_hash;

-- =====================================================
-- Ver as disciplinas criadas
-- =====================================================

SELECT id, codigo, nome, creditos FROM Disciplina;

-- =====================================================
-- Ver as turmas criadas
-- =====================================================

SELECT 
    t.id,
    CASE 
        WHEN t.id = '100' THEN 'Turma A'
        WHEN t.id = '101' THEN 'Turma B'
    END as turma,
    t.codigo as codigo_turma,
    d.nome as disciplina,
    u.nome as professor,
    t.vagas,
    CASE t.dia
        WHEN 1 THEN 'Segunda'
        WHEN 2 THEN 'Terça'
        WHEN 3 THEN 'Quarta'
        WHEN 4 THEN 'Quinta'
        WHEN 5 THEN 'Sexta'
    END as dia_semana,
    CASE t.turno
        WHEN 1 THEN 'Manhã'
        WHEN 2 THEN 'Tarde'
        WHEN 3 THEN 'Noite'
    END as turno
FROM Turma t
INNER JOIN Disciplina d ON t.disciplina_id = d.id
INNER JOIN Professor p ON t.professor_id = p.id
INNER JOIN Usuario u ON p.id = u.id
WHERE t.id IN ('100', '101');