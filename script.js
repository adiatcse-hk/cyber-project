document.addEventListener("DOMContentLoaded", function() {
    loadHomePage();
});

function loadHomePage() {
    document.body.innerHTML = `
        <header>
            <h1>Welcome to Cipher Encryption</h1>
        </header>
        <main>
            <h2>Choose Your Cipher</h2>
            <button onclick="loadCipherPage()">Go to Cipher Encryption</button>
        </main>
        <footer>
            <p>&copy; 2025 Cipher Encryption. All rights reserved.</p>
        </footer>
    `;
}

function loadCipherPage() {
    document.body.innerHTML = `
        <header>
            <h1>Cipher Encryption</h1>
            <button onclick="loadHomePage()">Home</button>
        </header>
        <main>
            <label for="cipherType">Select Cipher:</label>
            <select id="cipherType">
                <option value="playfair">Playfair Cipher</option>
                <option value="affine">Affine Cipher</option>
            </select>
            <br>
            <label for="inputText">Enter Text:</label>
            <input type="text" id="inputText">
            <br>
            <label for="key">Enter Key:</label>
            <input type="text" id="key" placeholder="For Affine, use a,b format">
            <br>
            <button onclick="encrypt()">Encrypt</button>
            <button onclick="decrypt()">Decrypt</button>
            <p>Output: <span id="outputText"></span></p>
        </main>
        <footer>
            <p>&copy; 2025 Cipher Encryption. All rights reserved.</p>
        </footer>
    `;
}

// Playfair Cipher Implementation
function generateKeyTable(key) {
    let keyT = [], dicty = new Set(), i = 0, j = 0;
    key = key.toLowerCase().replace(/j/g, 'i').replace(/[^a-z]/g, '') + "abcdefghijklmnopqrstuvwxyz";
    key.split('').forEach(c => {
        if (!dicty.has(c) && c !== 'j') {
            dicty.add(c);
            if (!keyT[i]) keyT[i] = [];
            keyT[i][j++] = c;
            if (j === 5) [i, j] = [i + 1, 0];
        }
    });
    return keyT;
}

function formatPlayfairText(text) {
    text = text.toLowerCase().replace(/j/g, 'i').replace(/[^a-z]/g, '');
    let formattedText = '';
    for (let i = 0; i < text.length; i += 2) {
        if (i + 1 < text.length && text[i] === text[i + 1]) {
            formattedText += text[i] + 'x' + text[i + 1];
            i--; 
        } else {
            formattedText += text[i];
            if (i + 1 < text.length) {
                formattedText += text[i + 1];
            }
        }
    }
    if (formattedText.length % 2 !== 0) formattedText += 'x'; 
    return formattedText;
}

function playfairEncrypt(text, key) {
    let keyT = generateKeyTable(key);
    text = formatPlayfairText(text);
    let res = '';
    for (let i = 0; i < text.length; i += 2) {
        let [r1, c1, r2, c2] = [...findPosition(keyT, text[i]), ...findPosition(keyT, text[i + 1])];
        if (r1 === r2) {
            res += keyT[r1][(c1 + 1) % 5] + keyT[r2][(c2 + 1) % 5];
        } else if (c1 === c2) {
            res += keyT[(r1 + 1) % 5][c1] + keyT[(r2 + 1) % 5][c2];
        } else {
            res += keyT[r1][c2] + keyT[r2][c1];
        }
    }
    return res;
}

function playfairDecrypt(text, key) {
    let keyT = generateKeyTable(key);
    let res = '';
    for (let i = 0; i < text.length; i += 2) {
        let [r1, c1, r2, c2] = [...findPosition(keyT, text[i]), ...findPosition(keyT, text[i + 1])];
        if (r1 === r2) {
            res += keyT[r1][(c1 + 4) % 5] + keyT[r2][(c2 + 4) % 5];
        } else if (c1 === c2) {
            res += keyT[(r1 + 4) % 5][c1] + keyT[(r2 + 4) % 5][c2];
        } else {
            res += keyT[r1][c2] + keyT[r2][c1];
        }
    }
    return res;
}

function findPosition(keyT, letter) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (keyT[i][j] === letter) return [i, j];
        }
    }
}

// Affine Cipher Implementation
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function affineEncrypt(text, a, b) {
    if (gcd(a, 26) !== 1) return "Invalid Key: 'a' must be coprime with 26";
    return text.toUpperCase().replace(/[A-Z]/g, letter => 
        String.fromCharCode(((a * (letter.charCodeAt(0) - 65) + b) % 26) + 65)
    );
}

function modInverse(a, m) {
    a = a % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
    }
    return -1;
}

function affineDecrypt(text, a, b) {
    let a_inv = modInverse(a, 26);
    if (a_inv === -1) return "Invalid Key: No Modular Inverse for 'a'";

    return text.toUpperCase().replace(/[A-Z]/g, letter => {
        let decryptedCharCode = (a_inv * ((letter.charCodeAt(0) - 65 - b + 26) % 26)) % 26;
        return String.fromCharCode(decryptedCharCode + 65);
    });
}

function encrypt() {
    let text = document.getElementById("inputText").value;
    let key = document.getElementById("key").value;
    let cipherType = document.getElementById("cipherType").value;
    let output = "";

    if (!text || !key) return alert("Please enter text and key.");

    if (cipherType === "playfair") {
        output = playfairEncrypt(text, key);
    } else if (cipherType === "affine") {
        let [a, b] = key.split(',').map(Number);
        output = affineEncrypt(text, a, b);
    }
    document.getElementById("outputText").innerText = output;
}

function decrypt() {
    let text = document.getElementById("inputText").value;
    let key = document.getElementById("key").value;
    let cipherType = document.getElementById("cipherType").value;
    let output = "";

    if (!text || !key) return alert("Please enter text and key.");

    if (cipherType === "playfair") {
        output = playfairDecrypt(text, key);
    } else if (cipherType === "affine") {
        let [a, b] = key.split(',').map(Number);
        output = affineDecrypt(text, a, b);
    }
    document.getElementById("outputText").innerText = output;
}
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("hackBtn").addEventListener("click", hackAnimation);
});

