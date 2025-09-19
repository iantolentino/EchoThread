# 📝 Modern Blog Platform (HTML, CSS, JS Only)

A simple blog platform built using **HTML, CSS, and JavaScript** with modern UI and essential blogging features.  
This version uses **localStorage** for data persistence, making it easy to test before moving to a real database (MongoDB + backend integration will come later).

---

## 🚀 Features

- **Authentication**
  - Separate **Login** and **Register** pages.
  - Unique **User IDs** for each user.
  - Secure password handling (basic hashing in JS).
- **Blog Functionality (CRUD)**
  - Logged-in users can **Create, Edit, Delete** their own posts.
  - Posts are stored dynamically in **localStorage**.
- **Public Access**
  - Visitors (not logged in) can still **read blogs**.
  - Each blog opens on a **separate page** with full content.
- **User Interaction**
  - Logged-in users can **Like** and **Comment** on posts.
- **Search**
  - Search blog posts by **user ID**.
- **Home Page Layout**
  - **Add New Blog Post** button (only visible to logged-in users).
  - **List of latest blogs** with links to their detail pages.
- **Design**
  - Clean, responsive UI.
  - Eye-catching colors with modern styling.

---

## 📂 Project Structure

```

blog-platform/
│── index.html         # Home page (list of blogs, add new blog if logged in)
│── login.html         # Login page
│── register.html      # Register page
│── blog.html          # Single blog page (full post, comments, likes)
│── styles.css         # Global styles
│── script.js          # Core logic for auth, blogs, likes, comments
│── README.md          # Project guide (this file)

````

---

## 🛠️ Setup & Usage

### 1. Clone or Download
```bash
git clone https://github.com/yourusername/blog-platform.git
cd blog-platform
````

Or simply download the ZIP and extract.

---

### 2. Run Locally

Since this project is **HTML, CSS, JS only**, you don’t need a backend yet.

Options:

* Open `index.html` directly in a browser.
* Or run a simple server (recommended for testing navigation):

```bash
# Python 3
python -m http.server 8000
```

Then go to:
👉 `http://localhost:8000`

---

### 3. Register & Login

1. Open `register.html` → Create a new account.

   * Each account gets a unique `userID`.
   * Data is stored in **localStorage**.
2. Log in via `login.html`.

---

### 4. Blogging

* Once logged in, go to `index.html`:

  * Add new blog posts.
  * Edit/Delete your own posts.
  * Like and Comment on others’ posts.
* Click on a post → opens `blog.html` with full details.

---

### 5. Search

* Use the **Search bar** to find posts by **User ID**.

---

## 🌐 Deployment

When ready to move online:

1. Deploy static version on **Render / Netlify / Vercel**.
2. Later, replace `localStorage` with **MongoDB + Node.js/Express** backend for real persistence.

---

## 🔮 Next Steps (Future Upgrade)

* Replace `localStorage` with MongoDB (user accounts, posts, comments).
* Add JWT authentication.
* Add profile pages for users.
* Implement real-time updates (likes, comments).
* Enhance UI with animations.

---

## 🧑‍💻 Author

Built with ❤️ using only **HTML, CSS, and JavaScript**.
Upgrade path: **Static → MongoDB/Express → Deployed on Render**.
