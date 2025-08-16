"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

type Comptable = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
};

const styles = {
  container: {
    maxWidth: 900,
    margin: "40px auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#d32f2f",
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center" as const, // pour TS
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 15,
    fontWeight: 600,
    textAlign: "center" as const,
  },
  form: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 15,
    marginBottom: 30,
    justifyContent: "center",
  },
  input: {
    flex: "1 1 200px",
    padding: "10px 12px",
    fontSize: "1rem",
    borderRadius: 6,
    border: "1.5px solid #ccc",
    transition: "border-color 0.3s",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 600,
    cursor: "pointer",
    color: "#555",
  },
  button: {
    backgroundColor: "#d32f2f",
    color: "white",
    padding: "10px 24px",
    fontWeight: 700,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    transition: "background-color 0.3s",
    flexShrink: 0,
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
    cursor: "not-allowed",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: 20,
    fontSize: "1rem",
  },
  th: {
    borderBottom: "2px solid #d32f2f",
    padding: "12px 15px",
    textAlign: "left" as const,
    backgroundColor: "#f2f2f2",
  },
  td: {
    borderBottom: "1px solid #ddd",
    padding: "10px 15px",
  },
  noDataRow: {
    textAlign: "center" as const,
    fontStyle: "italic",
    color: "#777",
  },
};

const Page = () => {
  const [comptables, setComptables] = useState<Comptable[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const authHeader = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const fetchComptables = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comptables/`, authHeader);
      setComptables(res.data);
      setError(null);
    } catch {
      setError("Erreur lors du chargement des comptables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComptables();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comptables/`, formData, authHeader);
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        is_active: true,
      });
      fetchComptables();
    } catch {
      setError("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number, currentState: boolean) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/comptables/${id}/`,
        { is_active: !currentState },
        authHeader
      );
      fetchComptables();
    } catch {
      setError("Erreur lors de la mise à jour");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestion des Comptables</h2>

      {error && <p style={styles.errorText}>{error}</p>}

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          name="username"
          placeholder="Nom d'utilisateur"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="first_name"
          placeholder="Prénom"
          value={formData.first_name}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="last_name"
          placeholder="Nom"
          value={formData.last_name}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="password"
          placeholder="Mot de passe"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          Actif
        </label>

        <button
          type="submit"
          disabled={loading}
          style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
        >
          Créer Comptable
        </button>
      </form>

      <hr />

      <h3 style={{ textAlign: "center", marginTop: 0 }}>Liste des Comptables</h3>
      {loading && <p style={{ textAlign: "center" }}>Chargement...</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Nom complet</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Activé</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {comptables.length > 0 ? (
            comptables.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.username}</td>
                <td style={styles.td}>
                  {c.first_name} {c.last_name}
                </td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{c.is_active ? "Oui" : "Non"}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => toggleActive(c.id, c.is_active)}
                    style={{ cursor: "pointer" }}
                  >
                    {c.is_active ? "Désactiver" : "Activer"}
                  </button>
                </td>
              </tr>
            ))
          ) : !loading ? (
            <tr>
              <td style={styles.td} colSpan={5}>
                Aucun comptable trouvé.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
