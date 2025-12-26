 // YOUR DATA
    const rawData = {
        "Лучшая игра вышедшая в 2025 (q1,w1)": [
            "Battlefield 6",
            "SAND",
            "War thunder",
            "Escape from Duckov",
            "Clair Obscure: Expedition 33",
            "Quickie: A Love Hotel Story"
        ]
    };

    // Parsing logic for (qX, wY)
    const voteKey = Object.keys(rawData)[0];
    const options = rawData[voteKey];
    
    // Extract q value (voting limit) using Regex
    const qMatch = voteKey.match(/\(q(\d+)/);
    const voteLimit = qMatch ? parseInt(qMatch[1]) : 1;

    let selectedCount = 0;
    const selectedOptions = new Set();

    function initVote() {
        document.getElementById('voteTitle').innerText = voteKey.split('(')[0].trim();
        document.getElementById('voteLimitInfo').innerText = `Select up to ${voteLimit} candidates`;
        
        const container = document.getElementById('optionsContainer');
        
        options.forEach(option => {
            const div = document.createElement('div');
            div.className = 'vote-item d-flex align-items-center justify-content-between';
            div.innerHTML = `<span>${option}</span> <div class="status-dot"></div>`;
            
            div.onclick = () => toggleSelection(div, option);
            container.appendChild(div);
        });
    }

    function toggleSelection(element, option) {
        if (selectedOptions.has(option)) {
            selectedOptions.delete(option);
            element.classList.remove('selected');
        } else {
            if (selectedOptions.size < voteLimit) {
                selectedOptions.add(option);
                element.classList.add('selected');
            } else {
                alert(`You can only select ${voteLimit} options.`);
            }
        }
        
        // Toggle Submit Button
        document.getElementById('submitVote').disabled = selectedOptions.size === 0;
    }

    document.getElementById('submitVote').onclick = async () => {
        const finalVotes = Array.from(selectedOptions);
        console.log("Submitting to Firebase/Database:", finalVotes);
        
        // FIREBASE INTEGRATION PLACEHOLDER
        /*
        try {
            await addDoc(collection(db, "votes"), {
                category: voteKey,
                selections: finalVotes,
                timestamp: serverTimestamp()
            });
            alert("Vote Cast Successfully!");
        } catch (e) { console.error(e); }
        */
        
        alert("Thank you! You voted for: " + finalVotes.join(", "));
    };

    initVote();