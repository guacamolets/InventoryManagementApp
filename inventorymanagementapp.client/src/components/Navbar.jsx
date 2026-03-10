import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav style={styles.nav}>
            <div style={styles.left}>
                <Link to="/" style={styles.logo}>
                    Inventory App
                </Link>

                <Link to="/" style={styles.link}>
                    Home
                </Link>

                {user && (
                    <Link to="/inventories" style={styles.link}>
                        My Inventories
                    </Link>
                )}
            </div>

            <div style={styles.right}>
                <ThemeToggle />

                {!user && (
                    <>
                        <Link to="/login" style={styles.link}>
                            Login
                        </Link>
                    </>
                )}

                {user && (
                    <>
                        <span style={styles.user}>
                            {user.userName}
                        </span>

                        <button onClick={logout} style={styles.button}>
                            Logout
                        </button>
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