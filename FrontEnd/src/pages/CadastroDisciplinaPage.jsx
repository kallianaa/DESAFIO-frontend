import { useState } from "react";

export default function CadastroDisciplinaPage() {
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [creditos, setCreditos] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!codigo || !nome || !creditos) {
      setMensagem("Preencha todos os campos antes de cadastrar.");
      return;
    }

    const novaDisciplina = { id: Date.now(), codigo, nome, creditos };
    setDisciplinas([...disciplinas, novaDisciplina]);

    // Limpa os campos
    setCodigo("");
    setNome("");
    setCreditos("");
    setMensagem("Disciplina cadastrada com sucesso!");
  };

  return (
    <div style={styles.container}>
      <h2>Cadastro de Disciplinas</h2>
      <p>Preencha os dados abaixo para cadastrar uma nova disciplina:</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Código (ex: MAT101)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Nome da disciplina"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Créditos"
          value={creditos}
          onChange={(e) => setCreditos(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Cadastrar
        </button>
      </form>

      {mensagem && <p style={styles.mensagem}>{mensagem}</p>}

      {disciplinas.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Créditos</th>
            </tr>
          </thead>
          <tbody>
            {disciplinas.map((d) => (
              <tr key={d.id}>
                <td>{d.codigo}</td>
                <td>{d.nome}</td>
                <td>{d.creditos}</td>
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
  form: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    margin: "10px 0",
    padding: "10px",
    width: "260px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    marginTop: "10px",
    padding: "10px 24px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#00695c", // tom verde institucional
    color: "white",
    fontWeight: "bold",
  },
  mensagem: {
    marginTop: "10px",
    color: "#004d40",
    fontWeight: "bold",
  },
  table: {
    margin: "30px auto",
    borderCollapse: "collapse",
    minWidth: "60%",
  },
};
