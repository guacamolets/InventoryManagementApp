import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function SearchPage() {
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
            <h2>Search results for "{query}"</h2>
            {results.length === 0 && <p>No results found.</p>}
            <ul className="list-group">
                {results.map(inv => (
                    <li
                        key={inv.id}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/inventories/${inv.id}`)}
                    >
                        {inv.title} — {inv.description}
                    </li>
                ))}
            </ul>
        </div>
    );
}