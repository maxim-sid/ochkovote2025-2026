// Import Firebase modules for Realtime Database
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getDatabase, ref, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
    import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    // FILL THESE IN FROM YOUR FIREBASE SETTINGS
    const firebaseConfig = {
        apiKey: "REPLACE_WITH_API_KEY",
        databaseURL: "REPLACE_WITH_DB_URL",
        projectId: "REPLACE_WITH_PROJECT_ID",
        appId: "REPLACE_WITH_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const auth = getAuth(app);

    let voteKey = "";
    let voteLimit = 1;
    const selectedOptions = new Set();

    // --- FETCH DATA FROM JSON FILE ---
    async function loadVotingData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            
            // Get the first key (the vote name)
            voteKey = Object.keys(data)[0];
            const options = data[voteKey];
            
            // Extract the 'q' limit (e.g., q1)
            const qMatch = voteKey.match(/\(q(\d+)/);
            voteLimit = qMatch ? parseInt(qMatch[1]) : 1;

            renderOptions(options);
        } catch (error) {
            console.error("Error loading JSON:", error);
        }
    }

    // --- RENDER OPTIONS ---
    function renderOptions(options) {
        const container = document.getElementById('optionsContainer');
        document.getElementById('voteTitle').innerText = voteKey.split('(')[0];
        
        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'vote-item';
            div.innerText = opt;
            div.onclick = () => {
                if (selectedOptions.has(opt)) {
                    selectedOptions.delete(opt);
                    div.classList.remove('selected');
                } else if (selectedOptions.size < voteLimit) {
                    selectedOptions.add(opt);
                    div.classList.add('selected');
                }
                document.getElementById('submitVote').disabled = selectedOptions.size === 0;
            };
            container.appendChild(div);
        });
    }

    // --- LOGIN & AUTH ---
    const startPortal = async () => {
        const nameInput = document.getElementById('userName');
        const name = nameInput.value.trim();
        
        if (name.length < 2) {
            alert("Please enter a name");
            return;
        }

        localStorage.setItem('voterName', name);
        
        try {
            await signInAnonymously(auth);
            
            // Visual Transitions
            document.getElementById('authOverlay').style.transform = 'translateY(-100%)';
            document.getElementById('mainContent').style.opacity = '1';
            document.getElementById('welcomeMsg').innerText = `OPERATOR: ${name.toUpperCase()}`;
            
            await loadVotingData(); 
        } catch (e) { 
            console.error(e);
            alert("Auth Error: Check your Firebase API Key and ensure Anonymous Auth is enabled."); 
        }
    };

    // Bind the function to the button click
    document.getElementById('loginBtn').addEventListener('click', startPortal);

    // Support pressing "Enter" in the input field
    document.getElementById('userName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startPortal();
    });

    // Auto-login check
    window.addEventListener('load', () => {
        const savedName = localStorage.getItem('voterName');
        if (savedName) {
            // If name exists, we can pre-fill it or auto-click
            document.getElementById('userName').value = savedName;
            startPortal();
        }
    });

    // Auto-login if name exists
    window.addEventListener('load', () => {
        if (localStorage.getItem('voterName')) {
            window.handleLogin();
        }
    });

    // --- SUBMIT VOTE ---
    document.getElementById('submitVote').onclick = async () => {
        const user = auth.currentUser;
        const name = localStorage.getItem('voterName');

        try {
            await set(ref(db, 'votes/' + user.uid), {
                voterName: name,
                selections: Array.from(selectedOptions),
                category: voteKey,
                timestamp: Date.now()
            });
            
            alert("Ballot Synced to Cloud.");
            location.reload();
        } catch (e) { alert("Submission failed."); }
    };