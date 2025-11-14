-- DROP DATABASE IF EXISTS DesafioFront;

-- =====================================================
-- Criação do Banco de Dados
-- =====================================================

CREATE DATABASE DesafioFront 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE DesafioFront;

-- =====================================================
-- Tabela: Usuario
-- =====================================================
CREATE TABLE Usuario (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    INDEX idx_usuario_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: Role
-- =====================================================
CREATE TABLE Role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Inserir Roles Padrão
-- =====================================================
INSERT INTO Role (nome) VALUES 
('ADMIN'),
('PROFESSOR'),
('ALUNO');

-- =====================================================
-- Tabela: UsuarioRole (Junction Table)
-- =====================================================
CREATE TABLE UsuarioRole (
    usuario_id CHAR(36) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (usuario_id, role_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: Professor
-- =====================================================
CREATE TABLE Professor (
    id CHAR(36) PRIMARY KEY,
    siape VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (id) REFERENCES Usuario(id) ON DELETE CASCADE,
    INDEX idx_professor_siape (siape)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: Aluno
-- =====================================================
CREATE TABLE Aluno (
    id CHAR(36) PRIMARY KEY,
    ra VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (id) REFERENCES Usuario(id) ON DELETE CASCADE,
    INDEX idx_aluno_ra (ra)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: Disciplina
-- =====================================================
CREATE TABLE Disciplina (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    codigo VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    creditos INT NOT NULL,
    INDEX idx_disciplina_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: PreRequisito 
-- =====================================================
CREATE TABLE PreRequisito (
    disciplina_id CHAR(36) NOT NULL,
    prerequisito_id CHAR(36) NOT NULL,
    PRIMARY KEY (disciplina_id, prerequisito_id),
    FOREIGN KEY (disciplina_id) REFERENCES Disciplina(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisito_id) REFERENCES Disciplina(id) ON DELETE CASCADE,
    CHECK (disciplina_id != prerequisito_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabela: Turma
-- =====================================================
CREATE TABLE Turma (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    codigo VARCHAR(255) NOT NULL UNIQUE,
    disciplina_id CHAR(36) NOT NULL,
    professor_id CHAR(36) NOT NULL,
    vagas INT NOT NULL,
    dia INT NOT NULL COMMENT 'Dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)',
    turno INT NOT NULL COMMENT 'Turno (ex: 1=Manhã, 2=Tarde, 3=Noite)',
    FOREIGN KEY (disciplina_id) REFERENCES Disciplina(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES Professor(id) ON DELETE CASCADE,
    INDEX idx_turma_codigo (codigo),
    INDEX idx_turma_disciplina (disciplina_id),
    INDEX idx_turma_professor (professor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Trigger para Turma.codigo
-- Regra: codigo = concat(dia, turno)
-- =====================================================
DELIMITER $$

CREATE TRIGGER trigger_codigo_turma_before_insert
BEFORE INSERT ON Turma
FOR EACH ROW
BEGIN
    SET NEW.codigo = CONCAT(NEW.dia, NEW.turno);
END$$

CREATE TRIGGER trigger_codigo_turma_before_update
BEFORE UPDATE ON Turma
FOR EACH ROW
BEGIN
    SET NEW.codigo = CONCAT(NEW.dia, NEW.turno);
END$$

DELIMITER ;

-- =====================================================
-- Tabela: Matricula
-- =====================================================
CREATE TABLE Matricula (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    aluno_id CHAR(36) NOT NULL,
    turma_id CHAR(36) NOT NULL,
    data DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ATIVA', 'CANCELADA', 'CONCLUIDA') NOT NULL DEFAULT 'ATIVA',
    FOREIGN KEY (aluno_id) REFERENCES Aluno(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES Turma(id) ON DELETE CASCADE,
    -- Garante que um aluno não se matricule duas vezes na mesma turma
    UNIQUE KEY uk_aluno_turma (aluno_id, turma_id),
    INDEX idx_matricula_aluno (aluno_id),
    INDEX idx_matricula_turma (turma_id),
    INDEX idx_matricula_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Views Úteis para Consultas
-- =====================================================

-- View: Usuários com suas roles
CREATE OR REPLACE VIEW vw_usuarios_roles AS
SELECT 
    u.id,
    u.nome,
    u.email,
    GROUP_CONCAT(r.nome ORDER BY r.nome SEPARATOR ', ') as roles
FROM Usuario u
LEFT JOIN UsuarioRole ur ON u.id = ur.usuario_id
LEFT JOIN Role r ON ur.role_id = r.id
GROUP BY u.id, u.nome, u.email;

-- View: Turmas com informações completas
CREATE OR REPLACE VIEW vw_turmas_completas AS
SELECT 
    t.id,
    t.codigo,
    d.codigo as disciplina_codigo,
    d.nome as disciplina_nome,
    d.creditos,
    u.nome as professor_nome,
    p.siape as professor_siape,
    t.vagas,
    t.dia,
    t.turno,
    COUNT(m.id) as alunos_matriculados,
    (t.vagas - COUNT(m.id)) as vagas_disponiveis
FROM Turma t
INNER JOIN Disciplina d ON t.disciplina_id = d.id
INNER JOIN Professor p ON t.professor_id = p.id
INNER JOIN Usuario u ON p.id = u.id
LEFT JOIN Matricula m ON t.id = m.turma_id AND m.status = 'ATIVA'
GROUP BY t.id, t.codigo, d.codigo, d.nome, d.creditos, u.nome, p.siape, t.vagas, t.dia, t.turno;

-- View: Matrículas com detalhes
CREATE OR REPLACE VIEW vw_matriculas_detalhadas AS
SELECT 
    m.id,
    m.data,
    m.status,
    ua.nome as aluno_nome,
    a.ra as aluno_ra,
    t.codigo as turma_codigo,
    d.nome as disciplina_nome,
    d.codigo as disciplina_codigo,
    up.nome as professor_nome,
    t.dia,
    t.turno
FROM Matricula m
INNER JOIN Aluno a ON m.aluno_id = a.id
INNER JOIN Usuario ua ON a.id = ua.id
INNER JOIN Turma t ON m.turma_id = t.id
INNER JOIN Disciplina d ON t.disciplina_id = d.id
INNER JOIN Professor p ON t.professor_id = p.id
INNER JOIN Usuario up ON p.id = up.id;

-- =====================================================
-- Stored Procedure: Matricular Aluno
-- =====================================================
DELIMITER $$

CREATE PROCEDURE sp_matricular_aluno(
    IN p_aluno_id CHAR(36),
    IN p_turma_id CHAR(36),
    OUT p_resultado VARCHAR(255)
)
BEGIN
    DECLARE v_vagas INT;
    DECLARE v_matriculados INT;
    DECLARE v_ja_matriculado INT;
    
    -- Verificar se aluno já está matriculado
    SELECT COUNT(*) INTO v_ja_matriculado
    FROM Matricula
    WHERE aluno_id = p_aluno_id 
    AND turma_id = p_turma_id 
    AND status = 'ATIVA';
    
    IF v_ja_matriculado > 0 THEN
        SET p_resultado = 'ERRO: Aluno já matriculado nesta turma';
    ELSE
        -- Verificar vagas disponíveis
        SELECT t.vagas, COUNT(m.id) INTO v_vagas, v_matriculados
        FROM Turma t
        LEFT JOIN Matricula m ON t.id = m.turma_id AND m.status = 'ATIVA'
        WHERE t.id = p_turma_id
        GROUP BY t.vagas;
        
        IF v_matriculados >= v_vagas THEN
            SET p_resultado = 'ERRO: Turma sem vagas disponíveis';
        ELSE
            -- Realizar matrícula
            INSERT INTO Matricula (id, aluno_id, turma_id, status)
            VALUES (UUID(), p_aluno_id, p_turma_id, 'ATIVA');
            
            SET p_resultado = 'SUCESSO: Matrícula realizada com sucesso';
        END IF;
    END IF;
END$$

DELIMITER ;