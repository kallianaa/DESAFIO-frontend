import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import { useAuth } from "../context/AuthContext";

export default function CadastroDisciplinaPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [creditos, setCreditos] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(""); 
  const [mensagemTipo, setMensagemTipo] = useState(null); 

  const clearMessages = () => {
    setMensagem("");
    setMensagemTipo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!codigo || !nome || !creditos) {
      setMensagemTipo("error");
      setMensagem("Preencha todos os campos antes de cadastrar.");
      return;
    }

    setLoading(true);

    try {
      const newDisciplina = {
        codigo: String(codigo).trim(),
        nome: String(nome).trim(),
        creditos: Number(creditos),
      };

      const res = await api.post("/disciplines", newDisciplina, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        withCredentials: true,
      });

      // sucesso
      // tenta obter uma mensagem do backend, senão usa texto padrão
      const successMsg =
        res?.data?.message || "Disciplina cadastrada com sucesso!";
      setMensagemTipo("success");
      setMensagem(successMsg);

      // limpa campos
      setCodigo("");
      setNome("");
      setCreditos("");
    } catch (err) {
      console.error("Erro ao cadastrar disciplina:", err);

      const status = err?.response?.status;

      const backendMessage = err?.response?.data?.message;

      if (status === 401) {
        setMensagemTipo("error");
        setMensagem(
          backendMessage ||
            "Sessão expirada ou não autorizada. Você será redirecionado ao login."
        );

        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (status === 409) {
        setMensagemTipo("error");
        setMensagem(
          backendMessage || "Erro: já existe uma disciplina com esse código."
        );
        return;
      }

      setMensagemTipo("error");
      setMensagem(
        backendMessage ||
          (err?.message ? `Erro: ${err.message}` : "Erro ao cadastrar disciplina.")
      );
    } finally {
      setLoading(false);
    }
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

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      {mensagem && (
        <p
          style={
            mensagemTipo === "success"
              ? { ...styles.mensagem, ...styles.success }
              : { ...styles.mensagem, ...styles.error }
          }
        >
          {mensagem}
        </p>
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
    boxSizing: "border-box",
  },
  button: {
    marginTop: "10px",
    padding: "10px 24px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#00695c",
    color: "white",
    fontWeight: "bold",
  },
  mensagem: {
    marginTop: "10px",
    fontWeight: "bold",
  },
  success: {
    color: "#155724",
    backgroundColor: "#d4edda",
    padding: "8px 12px",
    borderRadius: "6px",
    display: "inline-block",
  },
  error: {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    padding: "8px 12px",
    borderRadius: "6px",
    display: "inline-block",
  },
};
