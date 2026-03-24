import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import InventoryPage from "./pages/InventoryPage";
import SearchPage from "./pages/SearchPage";
import Navbar from "./components/Navbar";
import SupportTicketModal from './components/integrations/SupportTicketModal';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<UserPage />} />
        <Route path="/inventories/:id" element={<InventoryPage />} />
        <Route path="/search" element={<SearchPage />} />
          </Routes>
          <SupportTicketModal />
    </BrowserRouter>
  );
}

export default App;