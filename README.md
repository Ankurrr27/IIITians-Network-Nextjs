# IIITians Network

A premium portal connecting students, recruiters, and alumni across the Indian Institutes of Information Technology (IIIT) network.

## Core Features

- **College Directory**: Comprehensive listing of IIIT institutes, managing website details, logos, and campus cover images.
- **Campus Gallery**: Curated photo gallery organized by categories (Infrastructure, Clubs, Events, etc.).
- **Alumni Network**: Database of legacy profiles and alumni details with administrative validation workflows.
- **Opportunities Portal**: Platform for recruiters to submit jobs/internships (subject to admin approval) and students to browse matching posts.
- **Discuss Forum**: A community-oriented discussion board with accounts, voting, and views.
- **Clubs Directory**: Information about tech, cultural, and sports clubs across various campuses.

---

## Security & Administrative Policies

To maintain the safety and quality of the platform, the following access control policies are implemented:

- **College Gallery Uploads**: Adding images to any college gallery is strictly restricted to **Admins** and **Super Admins** to prevent spam and inappropriate uploads.
- **Alumni Verification**: New alumni profiles are verified by administrators before appearing publicly.
- **Job Postings**: Recruiter submissions are placed under a `pending` status until verified and published by admins.
- **Admin Portal**: Fully protected internal console accessible only via designated JWT verification methods.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

