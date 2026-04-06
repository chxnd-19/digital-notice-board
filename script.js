console.log("script loaded");

// All code is wrapped in a DOMContentLoaded listener to avoid global name conflicts
// with the 'supabase' object from the CDN.
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready. Initializing Supabase...");

    const SUPABASE_URL = "https://zbopbziksxvlcnncbecx.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpib3Biemlrc3h2bGNubmNiZWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTI2NTQsImV4cCI6MjA5MDYyODY1NH0.4PyOIxnw22rdyGgLXemw7K1wgYC1j4g8uwPEf3vqhU4";

    // This 'let supabase' is local to this scope, preventing collisions
    let supabase;

    if (!window.supabase) {
        console.error("Supabase CDN not loaded correctly. Check your script tags in HTML.");
        return;
    }

    // Initialize the client
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase ready");

    // 1. Set up the Upload Button logic
    const btn = document.getElementById("uploadBtn");
    if (btn) {
        console.log("Button connected");
        btn.onclick = uploadNotice;
    }

    // 2. Set up the Board logic
    if (document.getElementById("notices-list")) {
        loadNotices();
    }

    /**
     * Handle file upload for the admin portal
     * (Defined locally so it has access to the local 'supabase' variable)
     */
    async function uploadNotice() {
        console.log("Upload clicked");

        const titleElement = document.getElementById("noticeTitle");
        const fileElement = document.getElementById("noticeFile");

        if (!titleElement || !fileElement) return;

        const title = titleElement.value.trim();
        const file = fileElement.files[0];

        if (!title || !file) {
            alert("Fill all fields");
            return;
        }

        const filePath = "uploads/" + file.name;

        try {
            const { error: uploadError } = await supabase.storage
                .from("notice-files")
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                alert("Upload Error: " + uploadError.message);
                return;
            }

            const { data } = supabase.storage
                .from("notice-files")
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from("notices")
                .insert([{ title, file_url: data.publicUrl }]);

            if (dbError) {
                alert("Database Error: " + dbError.message);
                return;
            }

            alert("Notice uploaded successfully!");
            titleElement.value = "";
            fileElement.value = "";

            // Reload notices if container exists
            if (document.getElementById("notices-list")) {
                loadNotices();
            }
        } catch (err) {
            alert("An unexpected error occurred: " + err.message);
        }
    }

    /**
     * Fetch and display notices on the index page
     */
    async function loadNotices() {
        const container = document.getElementById("notices-list");
        if (!container) return;

        try {
            const { data, error } = await supabase
                .from("notices")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Fetch Error:", error.message);
                return;
            }

            container.innerHTML = "";

            data.forEach(n => {
                const div = document.createElement("div");
                div.className = "notice-item";
                div.innerHTML = `<p>${n.title}</p><a href="${n.file_url}" target="_blank" class="notice-link">View File</a>`;
                container.appendChild(div);
            });
        } catch (err) {
            console.error("Fetch failed:", err.message);
        }
    }
});
