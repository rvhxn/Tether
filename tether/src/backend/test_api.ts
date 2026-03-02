// Explicitly set the base URL before performing tests
const API_BASE_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log("========================================");
    console.log("🧪 STARTING TETHER BACKEND API TESTS 🧪");
    console.log("========================================\n");

    let createdIdeaId: number | null = null;
    let savedVaultId: number | null = null;
    let generatedPitch: any = null;

    try {
        // --- 1. POST /api/ideas (Create) ---
        console.log("Test 1: Create an Idea (POST /api/ideas)");
        const createRes = await fetch(`${API_BASE_URL}/ideas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "A cybernetic knight", type: "Character" })
        });
        if (!createRes.ok) throw new Error(`HTTP error! status: ${createRes.status}`);
        const createData = await createRes.json();
        console.log("   ✅ Success:", createData);
        createdIdeaId = createData.id;

        // --- 2. GET /api/ideas (Read All) ---
        console.log("\nTest 2: Fetch Ideas (GET /api/ideas?type=Character)");
        const getRes = await fetch(`${API_BASE_URL}/ideas?type=Character`);
        if (!getRes.ok) throw new Error(`HTTP error! status: ${getRes.status}`);
        const getData = await getRes.json();
        console.log(`   ✅ Success: Fetched ${getData.length} ideas.`);

        // --- 3. GET /api/ideas/random (Read Random) ---
        console.log("\nTest 3: Fetch Random Ideas (GET /api/ideas/random?count=1)");
        const randomRes = await fetch(`${API_BASE_URL}/ideas/random?count=1`);
        if (!randomRes.ok) throw new Error(`HTTP error! status: ${randomRes.status}`);
        const randomData = await randomRes.json();
        console.log(`   ✅ Success: Fetched ${randomData.length} random idea(s).`);

        // --- 4. POST /api/pitch/generate (Gemini Synthesis) ---
        console.log("\nTest 4: Generate Gemini Pitch (POST /api/pitch/generate)");
        const pitchRes = await fetch(`${API_BASE_URL}/pitch/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ combinedIdeas: "A cybernetic knight + A haunted space station" })
        });
        if (!pitchRes.ok) throw new Error(`HTTP error! status: ${pitchRes.status} (Likely invalid or missing GEMINI_API_KEY)`);
        generatedPitch = await pitchRes.json();
        console.log(`   ✅ Success: Generated Title: ${generatedPitch.title} [Genre: ${generatedPitch.genre}]`);

        // --- 5. POST /api/vault (Save to Vault) ---
        console.log("\nTest 5: Save Collision to Vault (POST /api/vault)");
        const vaultSaveRes = await fetch(`${API_BASE_URL}/vault`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idea_ids: [createdIdeaId, 999], // Dummy second ID
                combined_text: "A cybernetic knight + A haunted space station",
                title: generatedPitch.title,
                logline: generatedPitch.logline,
                tags: generatedPitch.genre
            })
        });
        if (!vaultSaveRes.ok) throw new Error(`HTTP error! status: ${vaultSaveRes.status}`);
        const vaultSaveData = await vaultSaveRes.json();
        console.log("   ✅ Success: Saved to vault with ID:", vaultSaveData.id);
        savedVaultId = vaultSaveData.id;

    } catch (error) {
        console.error("\n❌ TEST FAILED ❌");
        console.error((error as Error).message);
    } finally {
        console.log("\n--- CLEANUP PHASE ---");
        // Cleanup Idea
        if (createdIdeaId) {
            try {
                const delRes = await fetch(`${API_BASE_URL}/ideas/${createdIdeaId}`, { method: 'DELETE' });
                if (delRes.ok) console.log(`   🧹 Cleaned up Idea ID: ${createdIdeaId}`);
                else console.log(`   ⚠️ Failed to cleanup Idea ID: ${createdIdeaId}`);
            } catch (e) {
                console.error("Cleanup error:", e);
            }
        }
        // Cleanup Vault
        if (savedVaultId) {
            try {
                const delVaultRes = await fetch(`${API_BASE_URL}/vault/${savedVaultId}`, { method: 'DELETE' });
                if (delVaultRes.ok) console.log(`   🧹 Cleaned up Vault ID: ${savedVaultId}`);
                else console.log(`   ⚠️ Failed to cleanup Vault ID: ${savedVaultId}`);
            } catch (e) {
                console.error("Cleanup error:", e);
            }
        }

        console.log("\n========================================");
        console.log("🏁 TESTS COMPLETED 🏁");
        console.log("========================================");
    }
}

runTests();
