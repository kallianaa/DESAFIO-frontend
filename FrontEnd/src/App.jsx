import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DisciplinasPage from "./pages/DisciplinasPage";
import CadastroDisciplinaPage from "./pages/CadastroDisciplinaPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import { useAuth } from "./context/AuthContext";

import "./App.css";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container-principal">
      <header style={styles.header}>
        {!isAuthenticated ? <h1>Sistema de Matrículas</h1> : <h1>Bem vindo, {localStorage.user}</h1>}
        <Navigation />
      </header>

      <main style={styles.main}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/disciplinas" replace /> : <Navigate to="/login" replace />
            }
          />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/disciplinas"
            element={
              <ProtectedRoute>
                <DisciplinasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastro"
            element={
              <ProtectedRoute>
                <CadastroDisciplinaPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: "#0a625eff",
    color: "white",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  main: {
    padding: "2rem",
    textAlign: "center",
  },
};
