import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useTranslation } from "react-i18next";

export default function SearchPage() {
    const { t } = useTranslation();
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search).get("q") || "";

    useEffect(() => {
        const loadResults = async () => {
            if (!query) return;
            try {
                const res = await api.get(`/inventories/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        loadResults();
    }, [query]);

    return (
        <div className="container mt-3">
            <h2 className="mb-4">
                {t("search.title", { query })}
            </h2>

            {results.length === 0 ? (
                <p className="text-muted">{t("search.noResults")}</p>
            ) : (
                <ul className="list-group shadow-sm">
                    {results.map(inv => (
                        <li
                            key={inv.id}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/inventories/${inv.id}`)}
                        >
                            <div>
                                <strong className="d-block">{inv.title}</strong>
                                <small className="text-muted">{inv.description}</small>
                            </div>
                            <span className="badge bg-primary rounded-pill">
                                {t("search.viewBtn")}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}