
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080";


function authHeader(username, password) {

    return "Basic " + btoa(`${username}:${password}`);

}


async function request(url, options = {}) {

    const response =
        await fetch(url, options);

    const text =
        await response.text();

    let data;

    try {

        data =
            text ? JSON.parse(text) : {};

    } catch {

        data =
            text;

    }

    if (!response.ok) {

        throw new Error(

            typeof data === "object"

                ? data.error ||
                  `Request failed: ${response.status}`

                : `Request failed: ${response.status}`

        );

    }

    return data;

}
/*
export async function verifyCredentials(username, password) {
    return request(`${API_BASE_URL}/api/audit`, {
        headers: {
            "Authorization": authHeader(username, password)
        }
    });
}
*/
/*
 * Check whether the supplied username and password
 * are valid.
 *
 * Spring Security performs the actual authentication.
 */

export async function verifyCredentials(
    username,
    password
) {

    return request(
        `${API_BASE_URL}/api/crypto/auth-check`,
        {
            method: "GET",

            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}

/*
export async function encrypt(
    username,
    password,
    keyId,
    text
) {
    return request(`${API_BASE_URL}/api/crypto/encrypt`, {
        method: "POST",
        headers: {
            "Authorization": authHeader(username, password),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            keyId,
            text
        })
    });
}

*/
/*
 * Automatically create a new encryption key.
 *
 * The KMS generates the key, stores the wrapped
 * key, and returns the authorized key material
 * for client-side encryption.
 */

export async function getNewEncryptionKey(
    username,
    password
) {

    return request(
        `${API_BASE_URL}/api/crypto/new-encryption-key`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}


/*
 * Get an authorized encryption key from the KMS.
 *
 * The KMS checks the user's authentication and
 * encryption permission before releasing the key.
 *
 * The actual AES-GCM encryption happens in the browser.
 */

export async function getEncryptionKey(
    username,
    password,
    keyId
) {

    return request(
        `${API_BASE_URL}/api/crypto/encrypt`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    authHeader(username, password),

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                keyId
            })
        }
    );

}

/*
export async function decrypt(
    username,
    password,
    keyId,
    version,
    ciphertext
) {
    return request(`${API_BASE_URL}/api/crypto/decrypt`, {
        method: "POST",
        headers: {
            "Authorization": authHeader(username, password),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            keyId,
            version,
            ciphertext
        })
    });
}
*/
/*
 * Get an authorized decryption key from the KMS.
 *
 * The KMS checks the user's authentication and
 * decryption permission before releasing the key.
 *
 * The actual AES-GCM decryption happens in the browser.
 */

export async function getDecryptionKey(
    username,
    password,
    keyId,
    version
) {

    return request(
        `${API_BASE_URL}/api/crypto/decrypt`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    authHeader(username, password),

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                keyId,
                version
            })
        }
    );

}


export async function createKey(
    username,
    password
) {

    return request(
        `${API_BASE_URL}/api/keys`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}


export async function rotateKey(
    username,
    password,
    keyId
) {

    return request(
        `${API_BASE_URL}/api/keys/${keyId}/rotate`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}


export async function disableKey(
    username,
    password,
    keyId
) {

    return request(
        `${API_BASE_URL}/api/keys/${keyId}/disable`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}


export async function retireKey(
    username,
    password,
    keyId
) {

    return request(
        `${API_BASE_URL}/api/keys/${keyId}/retire`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}


export async function deleteKey(
    username,
    password,
    keyId
) {

    return request(
        `${API_BASE_URL}/api/keys/${keyId}`,
        {
            method: "DELETE",

            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}


export async function getAuditLogs(
    username,
    password
) {

    return request(
        `${API_BASE_URL}/api/audit`,
        {
            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}


export async function getSecurityTests() {

    return request(
        `${API_BASE_URL}/api/audit/security-tests`
    );

}


export async function listKeys(
    username,
    password
) {

    return request(
        `${API_BASE_URL}/api/keys`,
        {
            headers: {
                "Authorization":
                    authHeader(username, password)
            }
        }
    );

}




