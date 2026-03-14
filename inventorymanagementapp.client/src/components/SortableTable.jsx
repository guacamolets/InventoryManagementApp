import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/theme/useTheme";
import { useTranslation } from "react-i18next";

export default function SortableTable({ data, onDelete, isOwner }) {
    const { t } = useTranslation();
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState({ column: null, asc: true });
    const [selectedIds, setSelectedIds] = useState([]);

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

    const handleSelect = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        if (!window.confirm(t("table.confirmBulkDelete", { count: selectedIds.length }))) return;
        onDelete(selectedIds);
        setSelectedIds([]);
    };

    const handleSort = (column) => {
        setSort(prev => ({
            column,
            asc: prev.column === column ? !prev.asc : true
        }));
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="flex-grow-1 me-3">
                    <input
                        className="form-control form-control-sm"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text)',
                            borderColor: 'var(--bs-border-color)',
                            maxWidth: '300px'
                        }}
                        placeholder={t("table.filterPlaceholder")}
                        value={filter}
                        onChange={e => { setFilter(e.target.value); setSelectedIds([]); }}
                    />
                </div>

                {isOwner && selectedIds.length > 0 && (
                    <div className="animate__animated animate__fadeIn">
                        <button
                            className="btn btn-danger btn-sm px-4 rounded-pill fw-bold shadow-sm"
                            onClick={handleBulkDelete}
                        >
                            {t("table.deleteBtn")} ({selectedIds.length})
                        </button>
                    </div>
                )}
            </div>

            <div className="table-responsive shadow-sm rounded border" style={{ borderColor: 'var(--bs-border-color)' }}>
                <table className={`table table-hover align-middle mb-0 ${theme === 'dark' ? 'table-dark' : ''}`}>
                    <thead className={theme === 'dark' ? 'table-dark' : 'table-light'}>
                        <tr>
                            {isOwner && <th style={{ width: '40px' }} className="px-3"></th>}
                            <th className="small text-uppercase fw-bold opacity-75" style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                                {t("table.columnTitle")} {sort.column === "title" && (sort.asc ? " ▲" : " ▼")}
                            </th>
                            <th className="small text-uppercase fw-bold opacity-75" style={{ cursor: "pointer" }} onClick={() => handleSort("description")}>
                                {t("table.columnDescription")} {sort.column === "description" ? (sort.asc ? "▲" : "▼") : "⇅"}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(inv => (
                            <tr
                                key={inv.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/inventories/${inv.id}`)}
                                className={selectedIds.includes(inv.id) ? 'table-active' : ''}
                            >
                                {isOwner && (
                                    <td className="px-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedIds.includes(inv.id)}
                                            onChange={(e) => handleSelect(inv.id, e)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                )}
                                <td className="fw-bold">{inv.title}</td>
                                <td className="small text-truncate" style={{ maxWidth: "400px", color: 'var(--text)', opacity: 0.7 }}>
                                    {inv.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}