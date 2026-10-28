# Course Review Board — ACL UI/UX Lab

This is a **standalone React demo** for one session of the UI/UX Rescue Challenge. It uses realistic example records stored in this browser; it does not connect to MongoDB or the previous lab API.

## Run

```bash
npm install
npm run dev
```

The terminal prints **one local URL**. Open that link in your normal external browser. The development server will **not** open a browser automatically. Press `Ctrl+C` to stop it.

## Functional brief

Users browse reviews and course summaries. Course codes in the review list open a separate, shareable course-details page showing the course name, short description, teaching history for 2024/25 and 2025/26, and its student reviews. All staff names are fictional sample data, not historical claims. A reviewer may write one review per course and edit only their own reviews. Ratings must be integers 1–5.

### Fields from the prior lab

- `courseCode` — Course code: required text
- `rating` — Rating: whole number 1 to 5
- `comment` — Comment: optional

The demo supports create/edit and stores your updates in browser `localStorage` for this browser. **Reset demo** restores the example records. You can assume the current signed-in user is `You`.

## User scenario for this session

A student is choosing a course, wants to understand previous student feedback and then submit a review for another course.

Your redesign should support the scenario above without removing or weakening the existing features.
