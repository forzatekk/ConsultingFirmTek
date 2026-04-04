# Tek Consulting Website

## Overview

This project is the official website for Tek Consulting. It features a dynamic and modern design to showcase the company's services, portfolio, and contact details.

## Folder Structure

- `/assets/css/style.css`: Main styles for the website.
- `/assets/js/script.js`: JavaScript for dynamic features.
- `/services/`: Contains HTML files for individual services.
- `/contact.html`: Contact form for inquiries.
- `/portfolio.html`: Portfolio of completed projects.

## Features

1. Interactive typewriter effect in the hero section.
2. Responsive layout optimized for all devices.
3. Dynamic testimonial carousel.

## Setup Instructions

1. Clone the repository.
2. Open `index.html` in a browser or use a local development server (e.g., Live Server).

## Contact

For questions, contact `tarek.eltayeh@tekksolutions.ca`.

---

## What Was Built

### Flask Backend Restructuring

- **`website/static/`** — all CSS, JS, and data assets moved here from `assets/`
- **`website/templates/`** — all HTML pages converted to Jinja2 templates
- **`website/views.py`** — new Blueprint serving all public routes (`/`, `/about`, `/services`, `/portfolio`, `/contact`, `/landing`)
- **`website/__init__.py`** — added `@login_manager.user_loader` callback and registered the `views` blueprint
- **`website/forms.py`** — added `ContactForm` (name, email, message, optional file attachment)
- **`website/client_dashboard.py`** — added POST handler for file uploads

### Jinja2 Templates

| Template | Description |
|---|---|
| `base.html` | Shared navbar (active-link highlighting, login/logout), flash messages, footer, `url_for` static asset links |
| `index.html` | Typewriter hero, 3-D flip service cards, testimonial carousel |
| `about.html` | Two-column layout, skills grid, CTA |
| `services.html` | Flat service-section cards |
| `portfolio.html` | Static grid + dynamic JSON section (populated by `script.js`) |
| `contact.html` | FlaskForm with drag-and-drop file upload area |
| `login.html` | Auth form with CSRF token |
| `signup.html` | Auth form with CSRF token |
| `client_dashboard.html` | Drag-and-drop file upload card + account details card |

### CSS Fixes (`static/css/style.css`)

- **Root cause fixed:** the `@media (max-width: 768px)` block opened at line 237 was never closed — everything below it (drop-area, 3-D flip cards, testimonials, hero video, form styles) was trapped inside the mobile query and never applied on desktop
- Introduced CSS custom properties (`--color-primary`, etc.) for consistent colours across the sheet
- Collapsed duplicate `footer`, `body`, `.cta-button`, and `.service-cards` rule sets
- Added missing styles for `.auth-container`, `.dashboard-card`, `.flash-messages`, `.skill-tag`, `.field-errors`, `.file-list`, `.nav-auth`, `.about-section`

### JavaScript Fixes (`static/js/script.js`)

- **Typo fixed:** `getElementById("porfolio-items")` → `"portfolio-items"`
- **Null-checks added** on every DOM query — script no longer throws on pages that don't contain `#typewriter`, `#drop-area`, `.testimonial-carousel`, or `form.contact-form`
- Four separate `DOMContentLoaded` listeners collapsed into one
- `renderFileList()` helper displays file names and sizes inside the drop area
- `IntersectionObserver` includes a graceful fallback for older browsers

---

## TEKK Solutions Portfolio SPA (`tekk-portfolio/`)

A standalone React + Vite single-page application for the high-end TEKK Solutions public-facing portfolio.

### Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** with custom neon-blue/purple/teal palette and glassmorphism utilities
- **Framer Motion 11** for entrance animations, parallax, and hover effects
- **Lucide React** for icons

### File Structure

```
tekk-portfolio/
├── package.json
├── vite.config.js          base: /static/portfolio/  →  outDir: ../website/static/portfolio
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── public/images/          hero-backround.webp, logo.webp, project1-3.webp
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css            .glass-card, .text-gradient, .btn-primary/ghost, .form-input
    └── components/
        ├── Navbar.jsx       transparent → glass blur on scroll, AnimatePresence mobile menu
        ├── Hero.jsx         parallax bg, glassmorphism headline card, stats strip
        ├── About.jsx        two-column, animated stats overlay, SAGE badge, capability checklist
        ├── Services.jsx     3 glass cards (ERP / Data Automation / Infrastructure) with neon hover glow
        ├── Projects.jsx     3 image cards with zoom + description reveal on hover
        └── Contact.jsx      glass form, sidebar, footer strip
```

### Running in Development

```bash
cd tekk-portfolio
npm install
npm run dev        # → http://localhost:5173
```

### Building for Flask

```bash
npm run build      # outputs to website/static/portfolio/
flask --app "website:create_app()" run
# visit http://localhost:5000/landing
```

### Image Notes

| File | Status |
|---|---|
| `logo.webp` | Present in `website/static/images/` |
| `hero-backround.webp` | Present — note: filename has a typo (missing 'g') |
| `project1.webp` | Present |
| `project2.webp` | Present |
| `project3.webp` | Present |
| `about-bg.webp` | **Missing** — About section uses an animated CSS gradient panel as fallback |
