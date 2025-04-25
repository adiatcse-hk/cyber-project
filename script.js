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

function search(keyT, a, b, pos) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (keyT[i][j] === a) {
                pos[0] = i;
                pos[1] = j;
            } else if (keyT[i][j] === b) {
                pos[2] = i;
                pos[3] = j;
            }
        }
    }
}

function playfairEncrypt(text, key) {
    let keyT = generateKeyTable(key);
    text = formatPlayfairText(text);
    let str = text.split('');
    let pos = new Array(4);
    
    for (let i = 0; i < str.length; i += 2) {
        search(keyT, str[i], str[i + 1], pos);
        if (pos[0] === pos[2]) {
            str[i] = keyT[pos[0]][(pos[1] + 1) % 5];
            str[i + 1] = keyT[pos[0]][(pos[3] + 1) % 5];
        } else if (pos[1] === pos[3]) {
            str[i] = keyT[(pos[0] + 1) % 5][pos[1]];
            str[i + 1] = keyT[(pos[2] + 1) % 5][pos[1]];
        } else {
            str[i] = keyT[pos[0]][pos[3]];
            str[i + 1] = keyT[pos[2]][pos[1]];
        }
    }
    return str.join('');
}

function playfairDecrypt(text, key) {
    let keyT = generateKeyTable(key);
    let str = text.split('');
    let pos = new Array(4);
    
    for (let i = 0; i < str.length; i += 2) {
        search(keyT, str[i], str[i + 1], pos);
        if (pos[0] === pos[2]) {
            str[i] = keyT[pos[0]][(pos[1] + 4) % 5];
            str[i + 1] = keyT[pos[0]][(pos[3] + 4) % 5];
        } else if (pos[1] === pos[3]) {
            str[i] = keyT[(pos[0] + 4) % 5][pos[1]];
            str[i + 1] = keyT[(pos[2] + 4) % 5][pos[1]];
        } else {
            str[i] = keyT[pos[0]][pos[3]];
            str[i + 1] = keyT[pos[2]][pos[1]];
        }
    }
    return str.join('');
}

// Affine Cipher Implementation
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function affineEncrypt(text, a, b) {
    if (gcd(a, 26) !== 1) return "Invalid Key: 'a' must be coprime with 26";
    let msg = text.toUpperCase().replace(/[^A-Z]/g, '');
    let cipher = '';
    
    for (let ch of msg) {
        if (ch !== ' ') {
            cipher += String.fromCharCode(((a * (ch.charCodeAt(0) - 65) + b) % 26) + 65);
        } else {
            cipher += ' ';
        }
    }
    return cipher;
}

function affineDecrypt(text, a, b) {
    let a_inv = 0;
    for (let i = 0; i < 26; i++) {
        if ((a * i) % 26 === 1) {
            a_inv = i;
            break;
        }
    }
    if (a_inv === 0) return "Invalid Key: No Modular Inverse for 'a'";
    
    let cipher = text.toUpperCase().replace(/[^A-Z]/g, '');
    let msg = '';
    
    for (let ch of cipher) {
        if (ch !== ' ') {
            let decrypted = a_inv * ((ch.charCodeAt(0) - 65 - b + 26) % 26);
            msg += String.fromCharCode((decrypted % 26) + 65);
        } else {
            msg += ' ';
        }
    }
    return msg;
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
    document.getElementById("hackBtn")?.addEventListener("click", hackAnimation);
});
