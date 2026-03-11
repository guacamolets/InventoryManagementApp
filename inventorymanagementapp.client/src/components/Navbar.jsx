import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { t } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("lang", lang);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    Inventory App
                </Link>
                <div className="navbar-nav me-auto">
                    <Link className="nav-link" to="/">Home</Link>
                    <Link className="nav-link" to="/profile">Profile</Link>
                    {user?.role === "Admin" && (
                        <Link className="nav-link" to="/admin">Admin</Link>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2">
                    <ThemeToggle />
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-light btn-sm dropdown-toggle"
                            data-bs-toggle="dropdown"
                        >
                            {t("language")}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <button className="dropdown-item" onClick={() => changeLanguage("en")}>
                                    English
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" onClick={() => changeLanguage("ru")}>
                                    Russian
                                </button>
                            </li>
                        </ul>
                    </div>

                    {!user && (
                        <Link className="btn btn-primary btn-sm" to="/login">
                            {t("login")}
                        </Link>
                    )}

                    {user && (
                        <>
                            <span className="text-light small">
                                {user.userName}
                            </span>
                            <button className="btn btn-outline-light btn-sm" onClick={logout}>
                                {t("logout")}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}