import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function UserPage() {
  const [owned, setOwned] = useState([]);
  const [writable, setWritable] = useState([]);
  const navigate = useNavigate();

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
    <div>
      <h2>My inventories</h2>
      <table>
        <thead>
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

      <h2>Inventories with write access</h2>
      <table>
        <thead>
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
  );
}