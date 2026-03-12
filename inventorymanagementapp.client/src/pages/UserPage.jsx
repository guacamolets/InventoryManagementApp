import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import SortableTable from "../components/SortableTable";

export default function UserPage() {
    const [owned, setOwned] = useState([]);
    const [writable, setWritable] = useState([]);

    const loadData = useCallback(async () => {
        try {
            const ownedRes = await api.get("/user/owned");
            const writableRes = await api.get("/user/writable");
            setOwned(ownedRes.data);
            setWritable(writableRes.data);
        } catch (err) {
            console.error("Failed to load inventories", err);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            loadData();
        };
        fetchData();
    }, []);

    const handleCreate = async () => {
        const title = prompt("Enter inventory title:");
        if (!title) return;
        try {
            await api.post("/inventories", {
                title,
                description: "",
                category: "General",
                customIdTemplate: "[]"
            });
            loadData();
        } catch (err) {
            alert("Failed to create inventory");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this inventory?")) return;
        try {
            await api.delete(`/inventories/${id}`);
            loadData();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>My inventories</h3>
                <button className="btn btn-primary" onClick={handleCreate}>
                    + Create New
                </button>
            </div>

            <SortableTable
                data={owned}
                onDelete={handleDelete}
                isOwner={true}
            />

            <h3 className="mt-5 mb-3">Inventories with write access</h3>
            <SortableTable data={writable} isOwner={false} />
        </div>
    );
}