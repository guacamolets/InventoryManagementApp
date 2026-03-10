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
        <nav style={styles.nav}>
            <div style={styles.left}>
                <Link to="/" style={styles.logo}> Inventory App </Link>
                <Link to="/" style={styles.link}> Home </Link>
                <Link to="/profile" style={styles.link}> Profile </Link>
                <Link to="/admin" style={styles.link}> Admin </Link>
            </div>

            <div style={styles.right}>
                <ThemeToggle />

                <button onClick={() => changeLanguage("en")}>EN</button>
                <button onClick={() => changeLanguage("ru")}>RU</button>

                {!user && (<Link to="/login" style={styles.link}>{t("login")}</Link>)}

                {user && (
                    <>
                        <span style={styles.user}>{user.userName}</span>
                        <button onClick={logout} style={styles.button}>{t("logout")}</button>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--card)"
    },

    left: {
        display: "flex",
        gap: "16px",
        alignItems: "center"
    },

    right: {
        display: "flex",
        gap: "16px",
        alignItems: "center"
    },

    logo: {
        fontWeight: "bold",
        fontSize: "18px",
        textDecoration: "none",
        color: "var(--text)"
    },

    link: {
        textDecoration: "none",
        color: "var(--text)"
    },

    user: {
        opacity: 0.8
    },

    button: {
        padding: "6px 12px",
        cursor: "pointer"
    }
};