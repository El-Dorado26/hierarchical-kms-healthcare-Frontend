import { useState } from "react";
import { verifyCredentials } from "../api/kmsApi";
import { DEPARTMENT_COLORS, DEPARTMENT_USERS, departmentColor } from "../constants/departments";

function Login({ onLogin }) {

    const [department, setDepartment] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function handleSelectDepartment(dept) {
        setDepartment(dept);
        setUsername(DEPARTMENT_USERS[dept]);
        setPassword("");
        setError("");
    }

    function handleBack() {
        setDepartment(null);
        setUsername("");
        setPassword("");
        setError("");
    }

    async function handleSubmit(e) {

        e.preventDefault();

        if (!username || !password) {
            setError("Username and password are required.");
            return;
        }

        setError("");

        try {
            await verifyCredentials(username, password);
            onLogin(username, password);
        } catch {
            setError("Invalid username or password.");
        }
    }

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>KMS</h1>

                <p className="subtitle">
                    Key Management System
                </p>

                {!department ? (

                    <div className="department-select">

                        {Object.keys(DEPARTMENT_USERS).map((dept) => (

                            <button
                                key={dept}
                                className="department-button"
                                style={{ background: departmentColor(dept) }}
                                onClick={() => handleSelectDepartment(dept)}
                            >
                                {dept}
                            </button>

                        ))}

                    </div>

                ) : (

                    <form onSubmit={handleSubmit}>

                        <div
                            className="selected-department"
                            style={{ color: departmentColor(department) }}
                        >
                            {department}
                        </div>

                        <label>Username</label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="Username"
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Password"
                            autoFocus
                        />

                        {error && (
                            <div className="error">
                                {error}
                            </div>
                        )}

                        <button type="submit">
                            Login
                        </button>

                        <button
                            type="button"
                            className="link-button"
                            onClick={handleBack}
                        >
                            Choose a different department
                        </button>

                    </form>

                )}

            </div>

        </div>
    );
}

export default Login;