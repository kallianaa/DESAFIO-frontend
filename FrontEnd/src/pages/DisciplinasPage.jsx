import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function DisciplinasPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchDisciplinas = async () => {
      setLoading(true);
      setErro("");

      try {
        const res = await api.get("/disciplines", {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          withCredentials: true,
        });

        if (res?.data?.data) {
          setDisciplinas(res.data.data);
        } else {
          setDisciplinas([]);
        }
      } catch (err) {
        console.error("Erro ao carregar disciplinas:", err);

        const status = err?.response?.status;

        if (status === 401) {
          setErro("Sessão expirada. Faça login novamente.");
          logout();
          navigate("/login", { replace: true });
          return;
        }

        setErro(err?.response?.data?.message || "Erro ao carregar disciplinas.");
      } finally {
        setLoading(false);
      }
    };

    fetchDisciplinas();
  }, [token, logout, navigate]);

  const handleMatricular = (disciplina) => {
    alert(`Simulando matrícula em: ${disciplina.nome}`);
  };

  return (
    <div style={styles.container}>
      <h2>Disciplinas Disponíveis</h2>
      <p>Consulte as disciplinas ofertadas e selecione aquelas em que deseja se matricular.</p>

      {loading && <p>Carregando disciplinas...</p>}

      {erro && <p style={styles.error}>{erro}</p>}

      {!loading && !erro && disciplinas.length === 0 && (
        <p>Não há disciplinas cadastradas.</p>
      )}

      {!loading && !erro && disciplinas.length > 0 && (
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
  error: {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    padding: "10px",
    borderRadius: "6px",
    display: "inline-block",
  },
};
