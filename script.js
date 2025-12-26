import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* 🔐 Firebase config (GitHub Pages replaces these) */
const firebaseConfig = {
    apiKey: "VITE_FIREBASE_API_KEY",
    databaseURL: "VITE_FIREBASE_DB_URL",
    projectId: "VITE_FIREBASE_PROJECT_ID",
    appId: "VITE_FIREBASE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let voteKey = "";
let voteLimit = 1;
const selectedOptions = new Set();

/* ---------------- LOAD DATA ---------------- */
async function loadVotingData() {
    const res = await fetch("data.json");
    const data = await res.json();

    voteKey = Object.keys(data)[0];
    const options = data[voteKey];

    const match = voteKey.match(/\(q(\d+)/);
    voteLimit = match ? parseInt(match[1]) : 1;

    document.getElementById("voteTitle").innerText =
        voteKey.split("(")[0];

    renderOptions(options);
}

/* ---------------- RENDER ---------------- */
function renderOptions(options) {
    const container = document.getElementById("optionsContainer");
    container.innerHTML = "";

    options.forEach(opt => {
        const div = document.createElement("div");
        div.className = "vote-item";
        div.innerText = opt;

        div.onclick = () => {
            if (selectedOptions.has(opt)) {
                selectedOptions.delete(opt);
                div.classList.remove("selected");
            } else if (selectedOptions.size < voteLimit) {
                selectedOptions.add(opt);
                div.classList.add("selected");
            }
            document.getElementById("submitVote").disabled =
                selectedOptions.size === 0;
        };

        container.appendChild(div);
    });
}

/* ---------------- LOGIN ---------------- */
async function startPortal() {
    const name = userName.value.trim();
    if (name.length < 2) {
        alert("Please enter your name.");
        return;
    }

    localStorage.setItem("voterName", name);

    try {
        await signInAnonymously(auth);

        authOverlay.style.transform = "translateY(-100%)";
        mainContent.style.opacity = "1";
        welcomeMsg.innerText = `OPERATOR: ${name.toUpperCase()}`;

        await loadVotingData();
    } catch (e) {
        console.error(e);
        alert("Firebase Anonymous Auth is disabled or misconfigured.");
    }
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    loginBtn.addEventListener("click", startPortal);

    submitVote.addEventListener("click", async () => {
        if (!auth.currentUser) {
            alert("Not authenticated.");
            return;
        }

        await set(ref(db, "votes/" + auth.currentUser.uid), {
            voterName: localStorage.getItem("voterName"),
            selections: Array.from(selectedOptions),
            category: voteKey,
            timestamp: Date.now()
        });

        alert("Vote submitted.");
        location.reload();
    });

    const saved = localStorage.getItem("voterName");
    if (saved) {
        userName.value = saved;
        startPortal();
    }
});
