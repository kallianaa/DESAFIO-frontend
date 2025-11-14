// src/pages/DisciplinasPage.jsx
import { useState } from "react";

export default function DisciplinasPage() {
  // Dados de exemplo (mock). Depois podem vir da API do back-end.
  const [disciplinas] = useState([
    { id: 1, codigo: "MAT101", nome: "Cálculo I", creditos: 4 },
    { id: 2, codigo: "PROG1", nome: "Programação I", creditos: 6 },
    { id: 3, codigo: "BD1", nome: "Banco de Dados I", creditos: 4 },
  ]);

  const handleMatricular = (disciplina) => {
    alert(`Simulando matrícula em: ${disciplina.nome}`);
  };

  return (
    <div style={styles.container}>
      <h2>Disciplinas Disponíveis</h2>
      <p>
        Consulte as disciplinas ofertadas e selecione aquelas em que deseja se
        matricular.
      </p>

      {disciplinas.length === 0 ? (
        <p>Não há disciplinas cadastradas.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Créditos</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {disciplinas.map((disciplina) => (
              <tr key={disciplina.id}>
                <td>{disciplina.codigo}</td>
                <td>{disciplina.nome}</td>
                <td>{disciplina.creditos}</td>
                <td>
                  <button
                    style={styles.button}
                    onClick={() => handleMatricular(disciplina)}
                  >
                    Matricular
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "40px",
    fontFamily: "Arial, sans-serif",
  },
  table: {
    margin: "20px auto",
    borderCollapse: "collapse",
    minWidth: "70%",
  },
  button: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#0a625eff",
    color: "white",
    fontWeight: "bold",
  },
};
