function Dashboard({ username, onLogout }) {

    return (
        <div className="dashboard">

            <header className="topbar">

                <div>
                    <h1>Key Management System</h1>
                    <span>
                        Logged in as <strong>{username}</strong>
                    </span>
                </div>

                <button onClick={onLogout}>
                    Logout
                </button>

            </header>

        </div>
    );
}

export default Dashboard;