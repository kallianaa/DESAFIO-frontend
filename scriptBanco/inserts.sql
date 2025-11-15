USE DesafioFront;

-- =====================================================
-- 1. Cria usuario professor e aluno
-- =====================================================

INSERT INTO Usuario (id, nome, email, senha_hash) VALUES 
('1', 'professor', 'professor@universidade.br', '0000');

INSERT INTO Usuario (id, nome, email, senha_hash) VALUES 
('2', 'aluno', 'aluno@universidade.br', '1234');

-- =====================================================
-- 2. Atribui Roles
-- =====================================================

-- Professor recebe as roles ADMIN (1) e PROFESSOR (2)
INSERT INTO UsuarioRole (usuario_id, role_id) VALUES 
('1', 1), -- ADMIN
('1', 2); -- PROFESSOR

-- Aluno recebe a role ALUNO (3)
INSERT INTO UsuarioRole (usuario_id, role_id) VALUES 
('2', 3); -- ALUNO

-- =====================================================
-- 3. Insere professor e aluno em suas tabelas respectivas
-- =====================================================

-- Inserir na tabela Professor
INSERT INTO Professor (id, siape) VALUES 
('1', '9999');

-- Inserir na tabela Aluno
INSERT INTO Aluno (id, ra) VALUES 
('2', '2024001');

-- =====================================================
-- 4. Cria as disciplinas
-- =====================================================

INSERT INTO Disciplina (id, codigo, nome, creditos) VALUES 
('10', 'PROG1', 'Programação 1', 4),
('11', 'LAB1', 'Laboratório 1', 4);

-- =====================================================
-- 5. Cria as turmas A e B
-- =====================================================
-- Turma A e B usando dia e turno
-- dia: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta
-- turno: 1=Manhã, 2=Tarde, 3=Noite

-- Turma A - Programação 1 - Segunda Manhã
INSERT INTO Turma (id, disciplina_id, professor_id, vagas, dia, turno) VALUES 
('100', '10', '1', 40, 1, 1);

-- Turma B - Laboratório 1 - Terça Tarde
INSERT INTO Turma (id, disciplina_id, professor_id, vagas, dia, turno) VALUES 
('101', '11', '1', 35, 2, 2);