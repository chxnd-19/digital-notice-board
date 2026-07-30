# Digital Notice Board - MRIT ISE Department

A modern, fast, and responsive digital notice board built for the Information Science & Engineering (ISE) department at MRIT. This web application allows students to view announcements and provides an admin portal for authorized personnel to easily manage and publish updates.

## Features

- **Real-time Updates**: Announcements are instantly visible to all students upon publication.
- **Admin Portal**: Secure management dashboard protected by a PIN code.
- **Document Attachments**: Support for image and document uploads with a built-in lightbox preview.
- **Modern UI**: Designed with a sleek, glassmorphic dark theme and engaging micro-animations.
- **Empty States**: Fun, randomized empty-state memes for when there are no active notices.

## Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Variables, CSS Grid, Flexbox), Vanilla JavaScript
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL & Storage)
- **Icons**: FontAwesome 6
- **Typography**: Plus Jakarta Sans (Google Fonts)

## Setup & Deployment

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   ```
2. **Open `index.html`** in any modern web browser to view the student board.
3. **Open `admin.html`** to access the administrator portal.
4. **Backend Setup (Optional)**: This project connects to a hosted Supabase instance by default. If you wish to use your own Supabase project:
   - Create a new project on Supabase.
   - Set up a table named `notices` with columns: `id` (uuid, primary key), `title` (text), `file_url` (text), and `created_at` (timestamp).
   - Set up a public storage bucket named `notice-files`.
   - Update `SUPABASE_URL` and `SUPABASE_KEY` in `script.js` with your own credentials.

## Admin Access

To manage notices, click the **Admin** button in the floating navigation bar.
- **Default PIN:** `1199`

Once logged in, administrators can:
- Post new announcements with optional file attachments.
- Edit existing notice titles and attachments.
- Delete outdated announcements (changes reflect immediately without logging you out).

## License

This project is created for educational and departmental use.
