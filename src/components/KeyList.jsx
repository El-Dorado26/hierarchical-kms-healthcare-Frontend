import { useState, useEffect } from "react";
import {
    createKey,
    listKeys,
    rotateKey,
    disableKey,
    retireKey,
    deleteKey
} from "../api/kmsApi";
import { departmentColor } from "../constants/departments";

function KeyList({ username, password }) {

    const [keys, setKeys] = useState([]);
    const [error, setError] = useState("");

    async function loadKeys() {

        try {

            setError("");

            const data = await listKeys(username, password);

            setKeys(data);

        } catch (err) {

            setError(err.message);

        }
    }

    useEffect(() => {
        loadKeys();
    }, []);

    async function handleCreateKey() {

        try {

            setError("");

            await createKey(username, password);

            await loadKeys();

        } catch (err) {

            setError(err.message);

        }
    }

    function updateKey(keyId, updates) {
        setKeys(keys.map((k) =>
            k.keyId === keyId ? { ...k, ...updates } : k
        ));
    }

    async function handleRotate(keyId) {

        try {

            setError("");

            const data = await rotateKey(username, password, keyId);

            updateKey(keyId, {
                status: data.status,
                version: data.version
            });

        } catch (err) {

            setError(err.message);

        }
    }

    async function handleDisable(keyId) {

        try {

            setError("");

            const data = await disableKey(username, password, keyId);

            updateKey(keyId, { status: data.status });

        } catch (err) {

            setError(err.message);

        }
    }

    async function handleRetire(keyId) {

        try {

            setError("");

            const data = await retireKey(username, password, keyId);

            updateKey(keyId, { status: data.status });

        } catch (err) {

            setError(err.message);

        }
    }

    async function handleDelete(keyId) {

        try {

            setError("");

            await deleteKey(username, password, keyId);

            setKeys(keys.filter((k) => k.keyId !== keyId));

        } catch (err) {

            setError(err.message);

        }
    }

    return (
        <section className="panel">

            <div className="panel-header">

                <h2>Keys</h2>

                <button onClick={handleCreateKey}>
                    Generate Key
                </button>

            </div>

            {keys.length === 0 ? (

                <p>No keys yet.</p>

            ) : (

                <div className="key-list">

                    {keys.map((key) => (

                        <div className="key-item" key={key.keyId}>

                            <div>
                                <strong>{key.keyId}</strong>
                                <div className="key-meta">
                                    <span
                                        className="dept-tag"
                                        style={{ background: departmentColor(key.department) }}
                                    >
                                        {key.department}
                                    </span>
                                    <span className={`status-pill status-${key.status}`}>
                                        {key.status}
                                    </span>
                                    <span>v{key.version}</span>
                                </div>
                            </div>

                            <div className="button-row">

                                <button
                                    onClick={() => handleRotate(key.keyId)}
                                    disabled={key.status !== "ENABLED"}
                                >
                                    Rotate
                                </button>

                                <button
                                    onClick={() => handleDisable(key.keyId)}
                                    disabled={key.status === "DELETED"}
                                >
                                    Disable
                                </button>

                                <button
                                    onClick={() => handleRetire(key.keyId)}
                                    disabled={
                                        key.status === "RETIRED" ||
                                        key.status === "DELETED"
                                    }
                                >
                                    Retire
                                </button>

                                <button
                                    onClick={() => handleDelete(key.keyId)}
                                    disabled={key.status !== "RETIRED"}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

        </section>
    );
}

export default KeyList;