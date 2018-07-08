const openpgp = require('openpgp') // use as CommonJS, AMD, ES6 module or via window.openpgp
 
// openpgp.initWorker({ path:'openpgp.worker.js' }) // set the relative web worker path

// put keys in backtick (``) to avoid errors caused by spaces or tabs
const pubkey = `
-----BEGIN PGP PUBLIC KEY BLOCK-----

mI0EW0FUzAEEAKwDCuE8GiqLLY6LsAPoivTzPk9BDqGdCqL3pnYQr0ELwLTEKbyF
Z9pT+BAgylVFLPmF3Nt61OloKhNFumaDnLsFaRgcKhNYxmJlu8fjjlgGOpsic9zP
txqtB2P5UPs9NVJGMjmOV7Dw3PQ43qDOLC39WA7VsnGCLj/qKK+fxIENABEBAAG0
IkVkd2luICh0ZXN0aW5nKSA8ZmFrZUBleGFtcGxlLmNvbT6IzgQTAQgAOBYhBLDC
vP/7eVUCxN5sYtcQxJApVsyqBQJbQVTMAhsDBQsJCAcCBhUKCQgLAgQWAgMBAh4B
AheAAAoJENcQxJApVsyqrxwEAJnx7s5Qe2kX6tradAl9WOO0MKs+WITvLeNJmTV0
lqIhJxj/ZtwOug32+M+GW9Zhq22+xgrrXWC0CJASLzPRTOBbRX8aftwDpe7f/b5V
Ob7PSeyMEd5mXG1mTCy/2Jd6A90fY/3s9dTw9/KJORmWBRVpHMfLxo19ZqiBQw0i
f+tMuI0EW0FUzAEEAL0NC+ZQptLdHYJsz/B1aUqaX26mroOx1Agmh2FY+n1pA9ju
6pjJNIFql+KMX5xzaT/wGkF1WUYN935/mel3rL2K3djm97AW74kb25KmTnDAtOus
u4EqApxJB6ZL0hHzZjfrxC4JrzeFKNN/tg4yV+2Km4/DPxWwjusGWhRa/KOhABEB
AAGItgQYAQgAIBYhBLDCvP/7eVUCxN5sYtcQxJApVsyqBQJbQVTMAhsMAAoJENcQ
xJApVsyqRCkD/3ZJZIqKlKa9ACYBq3R4AJmdwZwqBpV8r5+Y5H2wmcJsKk/M8JSd
7aPvmK3Y5vujwpFmrTx+OMnRj1TwiMMLyayXALqBNe8Ia4LwY9KkFAnqVcdOcx57
lUgcX5zQGqtKc3Ef3e2bKR/m8NfCCbhevzzZRJ/jQ7wi9H4wRsqDknbC
=D+mb
-----END PGP PUBLIC KEY BLOCK-----`

const privkey = `
-----BEGIN PGP PRIVATE KEY BLOCK-----

lQIGBFtBVMwBBACsAwrhPBoqiy2Oi7AD6Ir08z5PQQ6hnQqi96Z2EK9BC8C0xCm8
hWfaU/gQIMpVRSz5hdzbetTpaCoTRbpmg5y7BWkYHCoTWMZiZbvH445YBjqbInPc
z7carQdj+VD7PTVSRjI5jlew8Nz0ON6gziwt/VgO1bJxgi4/6iivn8SBDQARAQAB
/gcDAohq0o901CG48urJzh7PcYiPVB5VxxGzPB3P8fPdS1IuXvvO28mWq0mbkwiZ
RuAlh58j1+lSwlmPou+AP+QIDYMNVdqRugqueFOYjC2ONJZq8FFDIHiKVL/5YhFX
uc/6tTDoBnGzsEwaMFrEWcvekWCifpe3spbEKeMcJhIddkp25wtpws+ZehujfHiR
iYmSwkMxaX1YS9wHYeZfxc1O9Q/9dLwunVwnXpmRhwB4Ft7/pMjf2fRT4UlT4EyQ
O3EBAdZ1k6Tj3cILsrwRbpUyNFo2ErhvVCmFXTzQro365/TjoMO7chCDatmE4a3j
zEhUt4ixlTm6Kd68D9FcrZa8JmA16QYIE+vWKA1ZNPb49Hw9au0Dasyn+rN0LxkL
jq4HyjKvnRVx9403QNFrZeqnhpUaDn+gae+lpu5x68LWtydOMinwKYMtU00rsK8t
Uv5CKspYY3RTmEIi3MLV8GKxBZqyjpY5dUm3sVZkfDgFzIcY+puuiH60IkVkd2lu
ICh0ZXN0aW5nKSA8ZmFrZUBleGFtcGxlLmNvbT6IzgQTAQgAOBYhBLDCvP/7eVUC
xN5sYtcQxJApVsyqBQJbQVTMAhsDBQsJCAcCBhUKCQgLAgQWAgMBAh4BAheAAAoJ
ENcQxJApVsyqrxwEAJnx7s5Qe2kX6tradAl9WOO0MKs+WITvLeNJmTV0lqIhJxj/
ZtwOug32+M+GW9Zhq22+xgrrXWC0CJASLzPRTOBbRX8aftwDpe7f/b5VOb7PSeyM
Ed5mXG1mTCy/2Jd6A90fY/3s9dTw9/KJORmWBRVpHMfLxo19ZqiBQw0if+tMnQIG
BFtBVMwBBAC9DQvmUKbS3R2CbM/wdWlKml9upq6DsdQIJodhWPp9aQPY7uqYyTSB
apfijF+cc2k/8BpBdVlGDfd+f5npd6y9it3Y5vewFu+JG9uSpk5wwLTrrLuBKgKc
SQemS9IR82Y368QuCa83hSjTf7YOMlftipuPwz8VsI7rBloUWvyjoQARAQAB/gcD
AnCfdG5Be6Ew8oJvqd3g06igDRdPPKEb5sy9Zqj7JHoASSZLOqqVDNqSKmJbQxBU
0gYf4VwctaOrkcUzio2qNZKB7TjAU/AvUv8gtD59oIwOWjj6VjjZkJYsiWDml4gX
RIkpU5MaejYmjgON130Sun00sIcGHADNzuV4gA/Zzdm3PAS+TrepRtMuFMe/iZSe
u3+2nvIbqGD/YiOywxPvrDm7c3LOugrCTl4zYtS24uOxYL3IqygskJ09yQi68WQG
ObKsEK9xfqsQAFkqTDgP1/WUIKDw8KzyKGl9fWgN1527HrtdpXroxAPm/21P8Xx+
IecFYwsBxP3JQP9LK2POAWiTAzyMTPtNHK+l8tEMjiYItpg7bKB7+DX74y1+pjmv
toTuNMfRcniev8tmurXfEZqzEj+ev+XEd1nOuU0gAovwPJsd9QdJnvFLgv/ZCi6z
O69NgHg9YJwH7Wf7rFxJ/k18EC6vnLQWqKYhPGsHIH13hW62CKGItgQYAQgAIBYh
BLDCvP/7eVUCxN5sYtcQxJApVsyqBQJbQVTMAhsMAAoJENcQxJApVsyqRCkD/3ZJ
ZIqKlKa9ACYBq3R4AJmdwZwqBpV8r5+Y5H2wmcJsKk/M8JSd7aPvmK3Y5vujwpFm
rTx+OMnRj1TwiMMLyayXALqBNe8Ia4LwY9KkFAnqVcdOcx57lUgcX5zQGqtKc3Ef
3e2bKR/m8NfCCbhevzzZRJ/jQ7wi9H4wRsqDknbC
=aWtE
-----END PGP PRIVATE KEY BLOCK-----` //encrypted private key

const passphrase = `12345678` //what the privKey is encrypted with

const encryptDecryptFunction = async() => {
    const privKeyObj = openpgp.key.readArmored(privkey).keys[0]
    await privKeyObj.decrypt(passphrase)
    
    const options = {
        data: 'Hello, World!',                             // input as String (or Uint8Array)
        publicKeys: openpgp.key.readArmored(pubkey).keys,  // for encryption
        privateKeys: [privKeyObj]                          // for signing (optional)
    }
    
    openpgp.encrypt(options).then(ciphertext => {
        encrypted = ciphertext.data // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        console.log(encrypted);
        return encrypted
    })
    .then(encrypted => {
        const options = {
            message: openpgp.message.readArmored(encrypted),     // parse armored message
            publicKeys: openpgp.key.readArmored(pubkey).keys,    // for verification (optional)
            privateKeys: [privKeyObj]                            // for decryption
        }
         
        openpgp.decrypt(options).then(plaintext => {
            console.log(plaintext.data)
            return plaintext.data // 'Hello, World!'
        })
       
    })
}

encryptDecryptFunction()
