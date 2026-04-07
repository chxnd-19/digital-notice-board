document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = "https://zbopbziksxvlcnncbecx.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpib3Biemlrc3h2bGNubmNiZWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTI2NTQsImV4cCI6MjA5MDYyODY1NH0.4PyOIxnw22rdyGgLXemw7K1wgYC1j4g8uwPEf3vqhU4";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- ADMIN LOGIN LOGIC ---
    window.checkAdminPin = () => {
        const pinInput = document.getElementById("adminPinInput").value;
        if (pinInput === "1199") {
            const welcomeOverlay = document.createElement("div");
            welcomeOverlay.className = "success-overlay";
            welcomeOverlay.innerHTML = `
                <div class="success-card">
                    <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZjgwdm8xd252bnR6ZzlqNXp6NXp6NXp6NXp6NXp6NXp6NXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/Ae7SI3LoPYj8Q/giphy.gif">
                    <h2 style="color:white; margin-top:20px;">Access Granted</h2>
                    <p style="color:#a1a1aa; margin-top:10px;">One of us! One of us! Unlocking ISE Dashboard...</p>
                </div>`;
            document.body.appendChild(welcomeOverlay);

            // TIMER EXTENDED TO 4 SECONDS (4000ms)
            setTimeout(() => {
                welcomeOverlay.remove();
                document.getElementById("admin-login-overlay").style.display = "none";
                document.getElementById("admin-content").style.display = "block";
                // Load management list once logged in
                if (document.getElementById("admin-notices-list")) loadNotices();
            }, 4000);
        } else {
            showFailMeme();
        }
    };

    function showFailMeme() {
        const overlay = document.createElement("div");
        overlay.className = "fail-overlay";
        overlay.innerHTML = `
            <div class="fail-card">
                <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJmZjgwdm8xd252bnR6ZzlqNXp6NXp6NXp6NXp6NXp6NXp6NXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/10j1ZRgKdcM8ms/giphy.gif">
                <h2>Nice try, Hacker!</h2>
                <a href="admin.html" style="color:white; display:block; margin-top:20px; text-decoration:none; font-weight:800;">Try Again</a>
            </div>`;
        document.body.appendChild(overlay);
    }

    // --- LOADING & RENDERING NOTICES ---
    const container = document.getElementById("notices-list");
    if (container) loadNotices();

    async function loadNotices() {
        const list = document.getElementById("notices-list");
        const adminList = document.getElementById("admin-notices-list");
        const targetContainer = list || adminList;
        if (!targetContainer) return;

        const { data, error } = await supabase.from("notices").select("*").order("created_at", { ascending: false });

        if (error) return;
        if (data.length === 0) {
            displayUniqueMeme(targetContainer);
            return;
        }

        targetContainer.innerHTML = data.map(n => {
            const ist = new Date(new Date(n.created_at).getTime() + (5.5 * 60 * 60 * 1000));

            // Add Management Buttons if in Admin View
            let adminActions = adminList ? `
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button onclick="editNotice('${n.id}', '${n.title.replace(/'/g, "\\'")}')" class="btn-download" style="background:var(--primary); color:white; border:none; cursor:pointer;">Edit</button>
                    <button onclick="deleteNotice('${n.id}')" class="btn-download" style="background:#4b5563; color:white; border:none; cursor:pointer;">Delete</button>
                </div>` : "";

            return `
                <div class="card">
                    <div class="notice-meta">
                        <span><i class="far fa-calendar"></i> ${ist.toLocaleDateString('en-IN')}</span>
                        <span><i class="far fa-clock"></i> ${ist.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div class="notice-title">${n.title}</div>
                    <button onclick="viewImage('${n.file_url}', '${n.title}')" class="btn-download" style="border:none; cursor:pointer;">
                        View Document
                    </button>
                    ${adminActions}
                </div>`;
        }).join("");
    }

    // --- EDIT & DELETE ENGINE ---
    window.editNotice = (id, title) => {
        document.getElementById("edit-id").value = id;
        document.getElementById("noticeTitle").value = title;
        document.getElementById("uploadBtn").innerText = "Update Announcement";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteNotice = async (id) => {
        if (confirm("Are you sure you want to delete this notice? This cannot be undone.")) {
            const { error } = await supabase.from("notices").delete().eq("id", id);
            if (!error) location.reload();
        }
    };

    // --- PUBLISH / UPDATE LOGIC ---
    const uploadBtn = document.getElementById("uploadBtn");
    if (uploadBtn) {
        uploadBtn.onclick = async () => {
            const title = document.getElementById("noticeTitle").value;
            const fileInput = document.getElementById("noticeFile");
            const editId = document.getElementById("edit-id").value;

            if (!title) return alert("Please enter a title!");

            uploadBtn.innerText = "Syncing...";
            try {
                let fileUrl = null;
                if (fileInput.files[0]) {
                    const file = fileInput.files[0];
                    const filePath = `notices/${Date.now()}_${file.name}`;
                    await supabase.storage.from("notice-files").upload(filePath, file);
                    const { data } = supabase.storage.from("notice-files").getPublicUrl(filePath);
                    fileUrl = data.publicUrl;
                }

                if (editId) {
                    // Update existing notice
                    const updateData = { title };
                    if (fileUrl) updateData.file_url = fileUrl;
                    await supabase.from("notices").update(updateData).eq("id", editId);
                } else {
                    // Create new notice
                    await supabase.from("notices").insert([{ title, file_url: fileUrl, created_at: new Date().toISOString() }]);
                }

                const successOverlay = document.createElement("div");
                successOverlay.className = "success-overlay";
                successOverlay.innerHTML = `<div class="success-card"><img src="https://i.giphy.com/3o7abKhOpu0NPG9yFQ.gif"><h2>SYNCED!</h2></div>`;
                document.body.appendChild(successOverlay);
                setTimeout(() => location.reload(), 2000);
            } catch (err) { alert(err.message); }
        };
    }

    // --- HELPER FUNCTIONS ---
    function displayUniqueMeme(container) {
        const library = [
            { t: "No notices? Canteen break time! 🥟", g: "nuRXXyy0NIPIKm8KQH" },
            { t: "0 Notices. 100% Freedom detected. 🦅", g: "X0BnTmo7izRfi" },
            { t: "Your code compiled on the first try. 💻", g: "3o7TKVUn7iM8FMEG24" },
            { t: "Error 404: IA stress not found. ✨", g: "l2Je6mE4n4X6qS3YI" },
            { t: "The board is as blank as my exam paper. 📄", g: "3o7TKDk6fC0hVpYfK0" }
        ];

        let seen = JSON.parse(sessionStorage.getItem('seenMemes') || "[]");
        if (seen.length >= library.length) seen = [];
        let available = library.filter((_, i) => !seen.includes(i));
        let selected = available[Math.floor(Math.random() * available.length)];
        seen.push(library.indexOf(selected));
        sessionStorage.setItem('seenMemes', JSON.stringify(seen));

        container.innerHTML = `
            <div class="empty-hero">
                <img src="https://i.giphy.com/${selected.g}.gif" class="meme-img">
                <p style="font-size: 2.2rem; font-weight: 800;">${selected.t}</p>
                <div class="dept-badge" style="margin-top:30px; display:inline-block;">ISE Department Verified</div>
            </div>`;
    }

    window.viewImage = (url, title) => {
        const modal = document.getElementById("image-modal");
        const modalImg = document.getElementById("modal-img");
        const caption = document.getElementById("modal-caption");

        modalImg.src = url;
        caption.innerText = title;
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    };

    window.closeImage = () => {
        const modal = document.getElementById("image-modal");
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    };

    window.onclick = (event) => {
        const modal = document.getElementById("image-modal");
        if (event.target == modal) closeImage();
    };
});