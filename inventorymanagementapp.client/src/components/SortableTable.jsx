import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/theme/useTheme";
import { useTranslation } from "react-i18next";

export default function SortableTable({ data, onDelete, isOwner }) {
    const { t } = useTranslation();
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState({ column: null, asc: true });

    const navigate = useNavigate();
    const { theme } = useTheme();

    const sortData = (data) => {
        if (!sort.column) return data;

        return [...data].sort((a, b) => {
            const v1 = a[sort.column] || "";
            const v2 = b[sort.column] || "";

            if (v1 < v2) return sort.asc ? -1 : 1;
            if (v1 > v2) return sort.asc ? 1 : -1;
            return 0;
        });
    };

    const filtered = sortData(data).filter(i =>
        (i.title || "").toLowerCase().includes(filter.toLowerCase())
    );

    const handleSort = (column) => {
        if (sort.column === column) {
            setSort({ column, asc: !sort.asc });
        } else {
            setSort({ column, asc: true });
        }
    };

    const sortIcon = (column) => {
        if (sort.column !== column) return "⇅";
        return sort.asc ? "▲" : "▼";
    };

    return (
        <>
            <div className="mb-3">
                <input
                    className="form-control"
                    placeholder={t("table.filterPlaceholder")}
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className={theme === "light" ? "table-light" : "table-dark"}>
                        <tr>
                            <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                                {t("table.columnTitle")} {sortIcon("title")}
                            </th>
                            <th style={{ cursor: "pointer" }} onClick={() => handleSort("description")}>
                                {t("table.columnDescription")} {sortIcon("description")}
                            </th>
                            {isOwner && <th>{t("table.columnActions")}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(inv => (
                            <tr
                                key={inv.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/inventories/${inv.id}`)}
                            >
                                <td>{inv.title}</td>
                                <td>{inv.description}</td>
                                {isOwner && (
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(inv.id);
                                            }}
                                        >
                                            {t("table.deleteBtn")}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}