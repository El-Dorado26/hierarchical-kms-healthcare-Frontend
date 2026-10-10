import { useEffect, useState } from "react";
import {
    getAuditLogs,
    getSecurityTests
} from "../api/kmsApi";

function AuditLog({ username, password }) {

    const [logs, setLogs] = useState([]);
    const [tests, setTests] = useState([]);
    const [error, setError] = useState("");

    async function loadLogs() {

        try {

            setError("");

            const data = await getAuditLogs(
                username,
                password
            );

            setLogs(data);

        } catch (err) {

            setError(err.message);

        }
    }

    async function loadTests() {

        try {

            const data = await getSecurityTests();

            setTests(data);

        } catch (err) {

            setError(err.message);

        }
    }

    useEffect(() => {

        loadLogs();
        loadTests();

    }, []);

    return (
        <section className="panel">

            <h2>Audit Logs</h2>

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            <button onClick={loadLogs}>
                Refresh Audit Logs
            </button>

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Operation</th>
                            <th>Result</th>
                            <th>Key ID</th>
                            <th>Details</th>
                        </tr>

                    </thead>

                    <tbody>

                        {logs.map((log) => (

                            <tr key={log.id}>

                                <td>{log.timestamp}</td>
                                <td>{log.username}</td>
                                <td>{log.operation}</td>
                                <td>{log.result}</td>
                                <td>{log.keyId || "-"}</td>
                                <td>{log.details}</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            <h2>Automated Security Tests</h2>

            <div className="table-container">

                <table>

                    <thead>

                        <tr>
                            <th>Timestamp</th>
                            <th>Test</th>
                            <th>Result</th>
                            <th>Details</th>
                        </tr>

                    </thead>

                    <tbody>

                        {tests.map((test) => (

                            <tr key={test.id}>

                                <td>{test.timestamp}</td>
                                <td>{test.operation}</td>
                                <td>{test.result}</td>
                                <td>{test.details}</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </section>
    );
}

export default AuditLog;