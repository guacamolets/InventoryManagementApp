import { useEffect, useState } from "react";
import api from "../api/api";
import SortableTable from "../components/SortableTable";

export default function UserPage() {
    const [owned, setOwned] = useState([]);
    const [writable, setWritable] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const ownedRes = await api.get("/user/owned");
                const writableRes = await api.get("/user/writable");

                setOwned(ownedRes.data);
                setWritable(writableRes.data);
            } catch (err) {
                console.error("Failed to load inventories", err);
            }
        };

        loadData();
    }, []);

    return (
        <div className="container mt-4">
            <h3 className="mb-3">My inventories</h3>
            <SortableTable data={owned} />
            <h3 className="mt-5 mb-3">Inventories with write access</h3>
            <SortableTable data={writable} />
        </div>
    );
}