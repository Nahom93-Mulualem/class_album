# Phoenix Class Album

Phoenix Class Album is a class community and alumni-lounge web app for the Software Engineering Class of 2026. It brings a class feed, student directory, profiles, direct messages, events, and yearbook memories into a responsive Next.js interface.

> **Project status:** The current experience is a front-end prototype. Its sample content and interactions are managed in client-side React state and are not persisted between reloads. Prisma/PostgreSQL configuration is present as a starting point for database integration, but the current Prisma schema does not define application models.

## Features

- **Class feed:** Browse and filter posts, create posts, like content, comment, and view attached images or videos.
- **Classmate directory:** Find classmates and connect with them.
- **Profiles:** View classmate profiles and edit the current demo profile.
- **Direct messages:** Browse conversations, send messages, and react to messages. Replies are simulated in the client.
- **Class events:** Review upcoming events and toggle RSVP status.
- **Yearbook and notifications:** The shared app state includes yearbook signatures and notifications.
- **Responsive navigation and UI:** Shared desktop and mobile navigation, modals, image lightbox, and toast notifications.

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- [React](https://react.dev/) 19 and [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Prisma](https://www.prisma.io/) 7 with a PostgreSQL datasource configured
- [Lucide React](https://lucide.dev/) icons and `canvas-confetti`
- ESLint 9 with the Next.js configuration

## Getting started

### Prerequisites

Install Node.js and npm. The repository includes `package-lock.json`; use npm to install dependencies and run the scripts below.

### Install and run locally

```bash
git clone https://github.com/Nahom93-Mulualem/class_album.git
cd class_album
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app is seeded with demo content from `app/data/initialData.ts`.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build (run `npm run build` first). |
| `npm run lint` | Run ESLint. |

## Project structure

```text
.
├── app/
│   ├── components/       # Shared navigation, modals, lightbox, and toast UI
│   ├── context/          # AppContext: shared client-side state and actions
│   ├── data/             # Demo users, posts, conversations, events, and other seed data
│   ├── directory/        # Classmate directory route (/directory)
│   ├── messages/         # Direct messages route (/messages)
│   ├── profile/          # Current-user profile and dynamic classmate profile (/profile/[id])
│   ├── globals.css       # Global styles and Tailwind CSS imports
│   ├── layout.tsx        # Root layout, shared navigation, provider, and global overlays
│   └── page.tsx          # Main class feed route (/)
├── prisma/
│   └── schema.prisma     # Prisma client and PostgreSQL datasource configuration
├── public/               # Static assets served from the site root
├── class directory.html  # Standalone HTML design/prototype page
├── class feed.html       # Standalone HTML design/prototype page
├── direct messages.html  # Standalone HTML design/prototype page
├── personal profile .html# Standalone HTML design/prototype page
├── package.json          # Dependencies and npm scripts
├── prisma.config.ts      # Prisma schema, migration, and datasource configuration
├── next.config.ts        # Next.js configuration, including remote image hosts
└── tsconfig.json         # TypeScript configuration
```

The `.html` files at the repository root are standalone prototype pages; the live Next.js routes are implemented under `app/`.

### Shared state and demo data

`app/context/AppContext.tsx` provides the `AppProvider` and `useApp()` hook. It centralizes the current demo user, posts, classmates, conversations, events, gallery items, yearbook signatures, notifications, and UI state for components and routes. Initial records and TypeScript data types are defined in `app/data/initialData.ts`.

Because this state currently lives in React rather than a connected persistence layer, changes such as posts, likes, messages, profile edits, and RSVPs are temporary and reset when the page is reloaded.

## Database configuration

Prisma is configured to read `DATABASE_URL` from the environment through `prisma.config.ts`. A PostgreSQL connection string is needed if you run Prisma database or migration commands. For example, create a local `.env` file (do not commit secrets):

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

The current `prisma/schema.prisma` contains the PostgreSQL datasource and Prisma client generator, but no models or migrations are included yet. The app's current demo experience does not require a database connection.

## Development notes

- The root layout and shared interface are in `app/layout.tsx`; page routes use the Next.js App Router convention.
- Remote image patterns for `lh3.googleusercontent.com` and `images.unsplash.com` are allowed in `next.config.ts`.
- Global styling is in `app/globals.css`; the layout loads the project's Google Fonts and Material Symbols.
- Run `npm run lint` before submitting changes. There is currently no test script defined in `package.json`.

## License

No license is currently specified in this repository. Contact the repository owner before redistributing or reusing the project.
