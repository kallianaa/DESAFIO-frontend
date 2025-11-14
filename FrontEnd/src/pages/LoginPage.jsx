import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, senha }, { withCredentials: true });

      if (data?.token && data?.usuario) {
        login(data.token, data.usuario);

        navigate("/disciplinas", { replace: true });
        return;
      }

      if (data?.token) {
        login(data.token, null);
        navigate("/disciplinas", { replace: true });
        return;
      }

      setMensagem(data?.message || "Login realizado com sucesso!");
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        setMensagem(err.response?.data?.message || "Credenciais inválidas.");
      } else {
        setMensagem("Erro ao conectar com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {mensagem && <p style={styles.msg}>{mensagem}</p>}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "8%",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "inline-block",
    marginTop: "20px",
  },
  input: {
    display: "block",
    margin: "10px auto",
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
    backgroundColor: "#0a6221ff",
    color: "white",
    fontWeight: "bold",
  },
  msg: {
    marginTop: "15px",
  },
};
