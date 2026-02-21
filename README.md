# 🚀 DevHub: The Ultimate Developer Resource Center

**DevHub** (by Finora) is a modern, community-driven platform designed for developers to discover, share, and curate high-quality tools, libraries, and inspiration. Built with a focus on speed, aesthetics, and usability.

![DevHub Preview](https://picsum.photos/seed/devhub/1200/600)

## ✨ Features

- **🌙 Dynamic Dark Mode:** Seamlessly switch between light and dark themes with system preference support.
- **🏷️ Smart Categorization:** Browse resources by Frontend, Backend, AI, Design, and more.
- **🗳️ Community Voting:** Upvote or downvote resources to highlight the best tools.
- **💬 Real-time Discussions:** Engage with other developers through integrated commenting.
- **🔗 Link Preview Scraping:** Automatically fetches title, description, and images from shared URLs.
- **🔖 Personal Collection:** Save your favorite resources to your private "Saved" list.
- **👤 User Profiles:** Track your contributions and impact within the community.
- **📋 One-Click Share:** Instantly copy resource links to your clipboard with visual feedback.

## 🛠️ Tech Stack

- **Frontend:** [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Modern utility-first CSS)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Backend/Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dev-resource-hub.git
cd dev-resource-hub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** and run the contents of `./supabase/schema.sql`.
3. Enable **GitHub OAuth** in the Authentication settings.

### 4. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server
```bash
npm run dev
```

## 🛡️ Security (RLS)
The project uses **Row Level Security (RLS)** to ensure data integrity:
- **Public:** Can view all resources and comments.
- **Authenticated:** Can share resources, vote, and comment.
- **Owner:** Only the creator can delete their own resources or comments.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the developer community.
