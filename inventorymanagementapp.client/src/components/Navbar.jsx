import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/theme/useTheme";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

export default function Navbar() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setQuery("");
        }
    };

    return (
        <nav className={`navbar navbar-expand-lg ${theme === "light" ? "navbar-light bg-light" : "navbar-dark bg-dark"} border-bottom`}>
            <div className="container-fluid px-4">
                <Link className="navbar-brand fw-bold" to="/">Inventory App</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/profile">Profile</Link>
                        </li>
                        {user?.role === "Admin" && (
                            <li className="nav-item">
                                <Link className="nav-link text-warning" to="/admin">Admin</Link>
                            </li>
                        )}
                    </ul>
                    <form className="d-flex mx-lg-auto mb-2 mb-lg-0 w-100 w-lg-50" onSubmit={handleSearch}>
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button className="btn btn-outline-success" type="submit">Search</button>
                    </form>
                    <div className="d-flex align-items-center gap-3 ms-lg-3">
                        <button className="btn btn-sm btn-outline-secondary border-0" onClick={toggleTheme}>
                            {theme === "light" ? "🌙" : "☀️"}
                        </button>
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                            >
                                {t("language")}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow">
                                <li><button className="dropdown-item" onClick={() => changeLanguage("en")}>English</button></li>
                                <li><button className="dropdown-item" onClick={() => changeLanguage("ru")}>Russian</button></li>
                            </ul>
                        </div>
                        {!user ? (
                            <Link className="btn btn-primary btn-sm" to="/login">
                                {t("login")}
                            </Link>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted d-none d-sm-inline small">
                                    {user.userName}
                                </span>
                                <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                                    {t("logout")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}