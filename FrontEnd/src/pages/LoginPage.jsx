import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Login "fake" só pra teste
    if (email === "aluno@teste.com" && senha === "123") {
      setMensagem("Login realizado com sucesso!");
    } else {
      setMensagem("Credenciais inválidas. Use aluno@teste.com / 123 para testar.");
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

        <button type="submit" style={styles.button}>
          Entrar
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
