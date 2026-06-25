// script.js

let saved = localStorage.getItem("hexa_wallet");
let entries = [];

try {
    entries = saved ? JSON.parse(saved) : [];
} catch {
    entries = [];
}

let currentEntryId = null;

const entryList = document.getElementById("entryList");
const serviceInput = document.getElementById("serviceName");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");
const appContainer = document.getElementById("appContainer");

function saveEntries() {
    localStorage.setItem("hexa_wallet", JSON.stringify(entries));
}

function renderEntries() {
    entryList.innerHTML = "";

    entries.forEach(entry => {
        const div = document.createElement("div");

        div.className = "note-item";
        

        div.innerText = entry.service.trim() || "Untitled Service";

        if (entry.id === currentEntryId)
            div.classList.add("active");

        div.onclick = () => openEntry(entry.id, true);

        entryList.appendChild(div);
    });
}

function createEntry() {
    const entry = {
        id: Date.now(),
        service: "", 
        username: "",
        password: ""
    };

    entries.push(entry);

    saveEntries();
    renderEntries();
    openEntry(entry.id, true);
}

function openEntry(id, mobile = false) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    currentEntryId = id;

    serviceInput.value = entry.service;
    usernameInput.value = entry.username;
    passwordInput.value = entry.password;


    const toggleBtn = document.querySelector(".icon-btn");
    passwordInput.type = "password";
    toggleBtn.innerText = "Show Password";

    renderEntries();

    if (mobile && window.innerWidth <= 768)
        appContainer.classList.add("note-open");
}

function closeEntry() {
    appContainer.classList.remove("note-open");
}

function deleteEntry() {
    if (!currentEntryId) return;

    if (!confirm("Delete this entry?"))
        return;

    entries = entries.filter(e => e.id !== currentEntryId);

    saveEntries();
    renderEntries();

    if (entries.length)
        openEntry(entries[0].id);
    else
        createEntry();

    if (window.innerWidth <= 768)
        closeEntry();
}


serviceInput.addEventListener("input", () => {
    const entry = entries.find(e => e.id === currentEntryId);
    if (!entry) return;

    entry.service = serviceInput.value;
    saveEntries();
    renderEntries();
});

usernameInput.addEventListener("input", () => {
    const entry = entries.find(e => e.id === currentEntryId);
    if (!entry) return;

    entry.username = usernameInput.value;
    saveEntries();
});

passwordInput.addEventListener("input", () => {
    const entry = entries.find(e => e.id === currentEntryId);
    if (!entry) return;

    entry.password = passwordInput.value;
    saveEntries();
});


const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}<>?";

function generatePassword() {
    const length = Number(lengthInput.value);
    const chars = LOWER + UPPER + NUMBERS + SYMBOLS;
    const random = new Uint32Array(length);

    crypto.getRandomValues(random);

    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars[random[i] % chars.length];
    }

    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event("input"));
}

lengthInput.addEventListener("input", () => {
    lengthValue.innerText = lengthInput.value;
});

function togglePassword() {
    const toggleBtn = document.querySelector(".icon-btn");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.innerText = "Hide Password";
    } else {
        passwordInput.type = "password";
        toggleBtn.innerText = "Show Password";
    }
}


window.addEventListener("DOMContentLoaded", () => {
    renderEntries();

    if (entries.length)
        openEntry(entries[0].id);
    else
        createEntry();

    setTimeout(() => {
        document.getElementById("loadingScreen").classList.add("hide-loader");
    }, 2200);
});