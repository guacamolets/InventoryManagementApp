import { useEffect, useState } from "react";
import api from "../api/api";

export default function AdminPage() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data);
  };

  useEffect(() => {
    const loadUsers = async () => {
        const res = await api.get("/admin/users");
        setUsers(res.data);
  };
  loadUsers();
  }, []);

  const block = async (id) => {
    await api.post(`/admin/block/${id}`);
    loadUsers();
  };

  const unblock = async (id) => {
    await api.post(`/admin/unblock/${id}`);
    loadUsers();
  };

  const makeAdmin = async (id) => {
    await api.post(`/admin/make-admin/${id}`);
    loadUsers();
  };

  const removeAdmin = async (id) => {
    await api.post(`/admin/remove-admin/${id}`);
    loadUsers();
  };

  const deleteUser = async (id) => {
    await api.delete(`/admin/delete/${id}`);
    loadUsers();
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Admin</th>
            <th>Blocked</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.isAdmin ? "Yes" : "No"}</td>
              <td>{u.isBlocked ? "Yes" : "No"}</td>
              <td>
                {u.isBlocked
                  ? <button onClick={() => unblock(u.id)}>Unblock</button>
                  : <button onClick={() => block(u.id)}>Block</button>}

                {u.isAdmin
                  ? <button onClick={() => removeAdmin(u.id)}>Remove Admin</button>
                  : <button onClick={() => makeAdmin(u.id)}>Make Admin</button>}

                <button onClick={() => deleteUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}