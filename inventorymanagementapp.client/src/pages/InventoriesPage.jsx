import { useEffect, useState } from "react";
import api from "../api/api";

const InventoriesPage = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const res = await api.get("/inventories");
        setInventories(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventories();
  }, []);

  if (loading) return <div>Loading inventories...</div>;

  return (
    <div>
      <h1>Inventories</h1>
      <ul>
        {inventories.map((inv) => (
          <li key={inv.id}>
            {inv.title} - {inv.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoriesPage;