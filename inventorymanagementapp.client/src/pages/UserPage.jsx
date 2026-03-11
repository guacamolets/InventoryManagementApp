import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useTheme } from "../hooks/useTheme";

export default function UserPage() {
    const [owned, setOwned] = useState([]);
    const [writable, setWritable] = useState([]);
    const navigate = useNavigate();

    const { theme } = useTheme();

    useEffect(() => {
        const loadData = async () => {
            const ownedRes = await api.get("/user/owned");
            const writableRes = await api.get("/user/writable");

            setOwned(ownedRes.data);
            setWritable(writableRes.data);
        };

        loadData();
    }, []);

    return (
        <div className="container mt-4">
            <h3 className="mb-3">My inventories</h3>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className={theme === "light" ? "table table-light" : "table table-dark"}>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owned.map(inv => (
                            <tr
                                key={inv.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/inventories/${inv.id}`)}
                            >
                                <td>{inv.title}</td>
                                <td>{inv.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <h3 className="mt-5 mb-3">Inventories with write access</h3>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {writable.map(inv => (
                            <tr
                                key={inv.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/inventories/${inv.id}`)}
                            >
                                <td>{inv.title}</td>
                                <td>{inv.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}