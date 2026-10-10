import { useState } from "react";
import {
    getEncryptionKey,
    getDecryptionKey,
    getNewEncryptionKey
} from "../api/kmsApi";


// Convert Base64 text into a Uint8Array
function base64ToBytes(base64) {

    const binaryString = atob(base64);

    const bytes =
        new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {

        bytes[i] =
            binaryString.charCodeAt(i);
    }

    return bytes;
}


// Convert a Uint8Array into Base64 text
function bytesToBase64(bytes) {

    let binaryString = "";

    for (let i = 0; i < bytes.length; i++) {

        binaryString +=
            String.fromCharCode(bytes[i]);
    }

    return btoa(binaryString);
}


function CryptoPanel({ username, password }) {


    // =========================================================
    // TEXT ENCRYPTION STATE
    // =========================================================

    const [encryptKeyId, setEncryptKeyId] =
        useState("");

    const [plaintext, setPlaintext] =
        useState("");

    const [encryptResult, setEncryptResult] =
        useState("");

    const [encryptError, setEncryptError] =
        useState("");


    // =========================================================
    // TEXT DECRYPTION STATE
    // =========================================================

    const [decryptKeyId, setDecryptKeyId] =
        useState("");

    const [decryptVersion, setDecryptVersion] =
        useState("");

    const [ciphertext, setCiphertext] =
        useState("");

    const [decryptResult, setDecryptResult] =
        useState("");

    const [decryptError, setDecryptError] =
        useState("");


    // =========================================================
    // FILE ENCRYPTION STATE
    // =========================================================

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [fileEncryptResult, setFileEncryptResult] =
        useState("");

    const [fileEncryptError, setFileEncryptError] =
        useState("");


    // =========================================================
    // FILE DECRYPTION STATE
    // =========================================================

    const [encryptedFile, setEncryptedFile] =
        useState(null);

    const [fileDecryptResult, setFileDecryptResult] =
        useState("");

    const [fileDecryptError, setFileDecryptError] =
        useState("");


    // =========================================================
    // TEXT ENCRYPTION
    // =========================================================

    async function handleEncrypt() {

        try {

            setEncryptError("");
            setEncryptResult("");


            // Make sure a key ID was entered
            if (!encryptKeyId) {

                throw new Error(
                    "Key ID is required"
                );
            }


            // Make sure plaintext was entered
            if (!plaintext) {

                throw new Error(
                    "Plaintext is required"
                );
            }


            /*
             * Ask the KMS for the authorized
             * encryption key.
             *
             * The KMS authenticates the user
             * and checks whether they have
             * permission to encrypt with this key.
             */
            const keyData =
                await getEncryptionKey(
                    username,
                    password,
                    encryptKeyId
                );


            /*
             * Convert the Base64 key returned
             * by the KMS into raw bytes.
             */
            const keyBytes =
                base64ToBytes(
                    keyData.keyMaterial
                );


            /*
             * Import the AES key into the
             * browser's Web Crypto API.
             */
            const cryptoKey =
                await window.crypto.subtle.importKey(
                    "raw",
                    keyBytes,
                    {
                        name: "AES-GCM"
                    },
                    false,
                    ["encrypt"]
                );


            /*
             * AES-GCM uses a unique IV
             * for each encryption.
             *
             * 12 bytes (96 bits) is the
             * standard IV size for AES-GCM.
             */
            const iv =
                window.crypto.getRandomValues(
                    new Uint8Array(12)
                );


            /*
             * Convert the plaintext string
             * into bytes.
             */
            const encoder =
                new TextEncoder();

            const plaintextBytes =
                encoder.encode(
                    plaintext
                );


            /*
             * Encrypt the plaintext LOCALLY
             * in the browser.
             *
             * The plaintext is NOT sent
             * to the KMS.
             */
            const encryptedData =
                await window.crypto.subtle.encrypt(
                    {
                        name: "AES-GCM",
                        iv: iv
                    },
                    cryptoKey,
                    plaintextBytes
                );


            /*
             * Web Crypto returns:
             *
             * ciphertext + authentication tag
             */
            const encryptedBytes =
                new Uint8Array(
                    encryptedData
                );


            /*
             * Attach the IV to the beginning
             * of the encrypted data.
             */
            const combined =
                new Uint8Array(
                    iv.length +
                    encryptedBytes.length
                );

            combined.set(iv, 0);

            combined.set(
                encryptedBytes,
                iv.length
            );


            /*
             * Convert IV + ciphertext
             * into Base64.
             */
            const finalCiphertext =
                bytesToBase64(
                    combined
                );


            /*
             * Display the result.
             */
            setEncryptResult(
                `Version: ${keyData.version} : Ciphertext: ${finalCiphertext}`
            );

        } catch (err) {

            setEncryptError(
                err.message
            );
        }
    }


    // =========================================================
    // TEXT DECRYPTION
    // =========================================================

    async function handleDecrypt() {

        try {

            setDecryptError("");
            setDecryptResult("");


            if (!decryptKeyId) {

                throw new Error(
                    "Key ID is required"
                );
            }


            if (!decryptVersion) {

                throw new Error(
                    "Key version is required"
                );
            }


            if (!ciphertext) {

                throw new Error(
                    "Ciphertext is required"
                );
            }


            /*
             * Ask the KMS for the authorized
             * decryption key.
             *
             * The KMS checks the user's
             * permission before releasing
             * the key material.
             */
            const keyData =
                await getDecryptionKey(
                    username,
                    password,
                    decryptKeyId,
                    Number(decryptVersion)
                );


            /*
             * Convert the Base64 key
             * into raw bytes.
             */
            const keyBytes =
                base64ToBytes(
                    keyData.keyMaterial
                );


            /*
             * Import the AES key
             * into Web Crypto.
             */
            const cryptoKey =
                await window.crypto.subtle.importKey(
                    "raw",
                    keyBytes,
                    {
                        name: "AES-GCM"
                    },
                    false,
                    ["decrypt"]
                );


            /*
             * Convert the Base64 ciphertext
             * back into bytes.
             */
            const combined =
                base64ToBytes(
                    ciphertext
                );


            /*
             * The first 12 bytes are our IV.
             */
            const iv =
                combined.slice(
                    0,
                    12
                );


            /*
             * Everything after the first
             * 12 bytes is:
             *
             * ciphertext + authentication tag
             */
            const encryptedBytes =
                combined.slice(
                    12
                );


            /*
             * Decrypt LOCALLY in the browser.
             *
             * The ciphertext is never sent
             * to the KMS.
             */
            const decryptedData =
                await window.crypto.subtle.decrypt(
                    {
                        name: "AES-GCM",
                        iv: iv
                    },
                    cryptoKey,
                    encryptedBytes
                );


            /*
             * Convert the decrypted bytes
             * back into normal text.
             */
            const decoder =
                new TextDecoder();

            const decryptedText =
                decoder.decode(
                    decryptedData
                );


            setDecryptResult(
                `Decrypted plaintext: ${decryptedText}`
            );

        } catch (err) {

            setDecryptError(
                "Decryption failed: " +
                err.message
            );
        }
    }


    // =========================================================
    // FILE ENCRYPTION
    // =========================================================

    async function handleFileEncrypt() {

        try {

            setFileEncryptError("");
            setFileEncryptResult("");


            /*
             * Make sure a file was selected.
             */
            if (!selectedFile) {

                throw new Error(
                    "Please select a file"
                );
            }


            /*
             * Ask the KMS to automatically
             * create a new encryption key.
             *
             * The user does NOT need to
             * enter a Key ID.
             */
            const keyData =
                await getNewEncryptionKey(
                    username,
                    password
                );


            /*
             * Convert the Base64 key returned
             * by the KMS into raw bytes.
             */
            const keyBytes =
                base64ToBytes(
                    keyData.keyMaterial
                );


            /*
             * Import the AES key into
             * the browser's Web Crypto API.
             */
            const cryptoKey =
                await window.crypto.subtle.importKey(
                    "raw",
                    keyBytes,
                    {
                        name: "AES-GCM"
                    },
                    false,
                    ["encrypt"]
                );


            /*
             * Read the selected file
             * as raw bytes.
             */
            const fileBytes =
                new Uint8Array(
                    await selectedFile.arrayBuffer()
                );


            /*
             * Generate a unique IV
             * for this file.
             */
            const iv =
                window.crypto.getRandomValues(
                    new Uint8Array(12)
                );


            /*
             * Encrypt the file LOCALLY
             * in the browser.
             *
             * The file contents are NEVER
             * sent to the KMS server.
             */
            const encryptedData =
                await window.crypto.subtle.encrypt(
                    {
                        name: "AES-GCM",
                        iv: iv
                    },
                    cryptoKey,
                    fileBytes
                );


            const encryptedBytes =
                new Uint8Array(
                    encryptedData
                );


            /*
             * Create the encrypted file
             * metadata.
             *
             * IMPORTANT:
             *
             * The AES key itself is NOT
             * stored inside this file.
             */
            const encryptedFileData = {

                keyId:
                    keyData.keyId,

                version:
                    keyData.version,

                fileName:
                    selectedFile.name,

                iv:
                    bytesToBase64(iv),

                ciphertext:
                    bytesToBase64(
                        encryptedBytes
                    )
            };


            /*
             * Convert the metadata and
             * ciphertext into JSON.
             */
            const json =
                JSON.stringify(
                    encryptedFileData
                );


            /*
             * Create a downloadable
             * .kms file.
             */
            const blob =
                new Blob(
                    [json],
                    {
                        type: "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                selectedFile.name +
                ".kms";


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );


            /*
             * Tell the user that
             * encryption succeeded.
             */
            setFileEncryptResult(
                `File encrypted successfully. Key ID: ${keyData.keyId}, Version: ${keyData.version}`
            );

        } catch (err) {

            setFileEncryptError(
                err.message
            );
        }
    }


    // =========================================================
    // FILE DECRYPTION
    // =========================================================

    async function handleFileDecrypt() {

        try {

            setFileDecryptError("");
            setFileDecryptResult("");


            /*
             * Make sure an encrypted
             * file was selected.
             */
            if (!encryptedFile) {

                throw new Error(
                    "Please select an encrypted .kms file"
                );
            }


            /*
             * Read the .kms file.
             */
            const text =
                await encryptedFile.text();


            /*
             * Convert the JSON back
             * into an object.
             */
            const encryptedFileData =
                JSON.parse(
                    text
                );


            /*
             * Read the key information
             * stored in the .kms file.
             */
            const keyId =
                encryptedFileData.keyId;

            const version =
                encryptedFileData.version;


            /*
             * Convert the stored IV
             * back into bytes.
             */
            const iv =
                base64ToBytes(
                    encryptedFileData.iv
                );


            /*
             * Convert the stored ciphertext
             * back into bytes.
             */
            const encryptedBytes =
                base64ToBytes(
                    encryptedFileData.ciphertext
                );


            /*
             * Ask the KMS for the authorized
             * decryption key.
             *
             * The KMS checks the user's
             * permission before releasing it.
             */
            const keyData =
                await getDecryptionKey(
                    username,
                    password,
                    keyId,
                    Number(version)
                );


            /*
             * Convert the Base64 key
             * into raw bytes.
             */
            const keyBytes =
                base64ToBytes(
                    keyData.keyMaterial
                );


            /*
             * Import the AES key
             * into Web Crypto.
             */
            const cryptoKey =
                await window.crypto.subtle.importKey(
                    "raw",
                    keyBytes,
                    {
                        name: "AES-GCM"
                    },
                    false,
                    ["decrypt"]
                );


            /*
             * Decrypt LOCALLY in the browser.
             */
            const decryptedData =
                await window.crypto.subtle.decrypt(
                    {
                        name: "AES-GCM",
                        iv: iv
                    },
                    cryptoKey,
                    encryptedBytes
                );


            /*
             * Create the original file again.
             */
            const blob =
                new Blob(
                    [decryptedData]
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                encryptedFileData.fileName;


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );


            setFileDecryptResult(
                `File decrypted successfully: ${encryptedFileData.fileName}`
            );

        } catch (err) {

            setFileDecryptError(
                "File decryption failed: " +
                err.message
            );
        }
    }


    // =========================================================
    // USER INTERFACE
    // =========================================================

    return (

        <>

            {/* =================================================
                TEXT ENCRYPTION
            ================================================= */}

            <section className="panel">

                <h2>Encrypt</h2>


                <label>
                    Key ID
                </label>


                <input
                    value={encryptKeyId}
                    onChange={(e) =>
                        setEncryptKeyId(
                            e.target.value
                        )
                    }
                    placeholder="Enter Key ID"
                />


                <label>
                    Plaintext
                </label>


                <textarea
                    value={plaintext}
                    onChange={(e) =>
                        setPlaintext(
                            e.target.value
                        )
                    }
                    placeholder="Enter plaintext"
                />


                <div className="button-row">

                    <button
                        onClick={handleEncrypt}
                    >
                        Encrypt
                    </button>

                </div>


                {encryptResult && (

                    <div className="success">

                        {encryptResult}

                    </div>

                )}


                {encryptError && (

                    <div className="error">

                        {encryptError}

                    </div>

                )}

            </section>


            {/* =================================================
                TEXT DECRYPTION
            ================================================= */}

            <section className="panel">

                <h2>Decrypt</h2>


                <label>
                    Key ID
                </label>


                <input
                    value={decryptKeyId}
                    onChange={(e) =>
                        setDecryptKeyId(
                            e.target.value
                        )
                    }
                    placeholder="Enter Key ID"
                />


                <label>
                    Version
                </label>


                <input
                    type="number"
                    value={decryptVersion}
                    onChange={(e) =>
                        setDecryptVersion(
                            e.target.value
                        )
                    }
                    placeholder="Enter key version"
                />


                <label>
                    Ciphertext
                </label>


                <textarea
                    value={ciphertext}
                    onChange={(e) =>
                        setCiphertext(
                            e.target.value
                        )
                    }
                    placeholder="Paste ciphertext"
                />


                <div className="button-row">

                    <button
                        onClick={handleDecrypt}
                    >
                        Decrypt
                    </button>

                </div>


                {decryptResult && (

                    <div className="success">

                        {decryptResult}

                    </div>

                )}


                {decryptError && (

                    <div className="error">

                        {decryptError}

                    </div>

                )}

            </section>


            {/* =================================================
                FILE ENCRYPTION
            ================================================= */}

            <section className="panel">

                <h2>
                    Encrypt File
                </h2>


                <p>
                    Select a file. The system will
                    automatically generate an encryption
                    key and encrypt the file locally
                    in your browser.
                </p>


                <input
                    type="file"
                    onChange={(e) =>
                        setSelectedFile(
                            e.target.files[0]
                        )
                    }
                />


                <div className="button-row">

                    <button
                        onClick={handleFileEncrypt}
                    >
                        Encrypt File
                    </button>

                </div>


                {fileEncryptResult && (

                    <div className="success">

                        {fileEncryptResult}

                    </div>

                )}


                {fileEncryptError && (

                    <div className="error">

                        {fileEncryptError}

                    </div>

                )}

            </section>


            {/* =================================================
                FILE DECRYPTION
            ================================================= */}

            <section className="panel">

                <h2>
                    Decrypt File
                </h2>


                <p>
                    Select an encrypted .kms file
                    to decrypt it.
                </p>


                <input
                    type="file"
                    accept=".kms"
                    onChange={(e) =>
                        setEncryptedFile(
                            e.target.files[0]
                        )
                    }
                />


                <div className="button-row">

                    <button
                        onClick={handleFileDecrypt}
                    >
                        Decrypt File
                    </button>

                </div>


                {fileDecryptResult && (

                    <div className="success">

                        {fileDecryptResult}

                    </div>

                )}


                {fileDecryptError && (

                    <div className="error">

                        {fileDecryptError}

                    </div>

                )}

            </section>

        </>

    );
}


export default CryptoPanel;


