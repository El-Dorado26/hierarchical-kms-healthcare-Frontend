import { useState } from "react";

import Login from "./components/Login";
import KeyList from "./components/KeyList";
import CryptoPanel from "./components/CryptoPanel";

function App() {

    const [session, setSession] = useState(null);

    function handleLogin(username, password) {

        setSession({
            username,
            password
        });

    }

    function handleLogout() {
        setSession(null);
    }

    if (!session) {

        return (
            <Login
                onLogin={handleLogin}
            />
        );

    }

    return (
        <div>

            <header className="topbar">

                <div>
                    <h1>KMS Dashboard</h1>

                    <span>
                        User: {session.username}
                    </span>
                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </header>

            <main className="container">

                <KeyList
                    username={session.username}
                    password={session.password}
                />

                <CryptoPanel
                    username={session.username}
                    password={session.password}
                />

            </main>

        </div>
    );
}

export default App;