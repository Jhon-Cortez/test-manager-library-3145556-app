import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { LoginPage } from "./auth/LoginPage";
import { Layout } from "./components/Layout";
import { BooksPage } from "./books/BooksPage";
import { MembersPage } from "./members/MembersPage";

export function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {isAuthenticated ? (
        <Route element={<Layout />}>
          <Route path="/books" element={<BooksPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}
