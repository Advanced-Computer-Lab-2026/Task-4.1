import React, { useEffect, useMemo, useState } from 'react';
import './styles.css';

const STORAGE_KEY = 'course-review-demo-v2';
const CURRENT_USER = 'You';

// All instructor names below are fictional demonstration data.
const COURSES = [
  { code: 'CSEN 301', name: 'Data Structures & Algorithms', department: 'Computer Science', credits: 3, description: 'Learn how to organize information, analyze algorithms, and choose efficient solutions to computational problems.', tags: ['Algorithms', 'Problem solving'], history: [{ year: '2024/25', staff: ['Dr. Maya Hassan', 'Dr. Leo Brandt'] }, { year: '2025/26', staff: ['Dr. Salma Adel', 'Dr. Maya Hassan'] }] },
  { code: 'CSEN 402', name: 'Database Systems', department: 'Computer Science', credits: 3, description: 'Design relational databases, write SQL queries, and explore transactions, indexing, and practical data modeling.', tags: ['SQL', 'Data modeling'], history: [{ year: '2024/25', staff: ['Dr. Adam Farouk'] }, { year: '2025/26', staff: ['Dr. Nora Khalil', 'Dr. Adam Farouk'] }] },
  { code: 'CSEN 501', name: 'Computer Networks', department: 'Computer Science', credits: 3, description: 'Understand how computers communicate, from network layers and routing to reliable protocols and security basics.', tags: ['Networking', 'Protocols'], history: [{ year: '2024/25', staff: ['Dr. Karim Nasser'] }, { year: '2025/26', staff: ['Dr. Lina Shawky'] }] },
  { code: 'CSEN 602', name: 'Software Engineering', department: 'Computer Science', credits: 3, description: 'Work through requirements, testing, teamwork, and maintainable software design using realistic projects.', tags: ['Team projects', 'Testing'], history: [{ year: '2024/25', staff: ['Dr. Yara Amin'] }, { year: '2025/26', staff: ['Dr. Omar Aziz', 'Dr. Yara Amin'] }] },
  { code: 'CSEN 701', name: 'Embedded Systems', department: 'Computer Engineering', credits: 3, description: 'Build hardware-aware programs using microcontrollers, GPIO, sensors, interrupts, and PWM.', tags: ['Microcontrollers', 'Hardware'], history: [{ year: '2024/25', staff: ['Dr. Elias Mansour'] }, { year: '2025/26', staff: ['Dr. Hana Youssef'] }] },
];

const EXAMPLE_REVIEWS = [
  { id: 'ex-1', courseCode: 'CSEN 301', author: 'Mariam', rating: 5, comment: 'The exercises helped me understand the concepts. Keep up with the weekly problem sets!', createdAt: '2026-05-16' },
  { id: 'ex-2', courseCode: 'CSEN 301', author: 'Omar', rating: 4, comment: 'Great content, but allow enough time for the assignments.', createdAt: '2026-04-28' },
  { id: 'ex-3', courseCode: 'CSEN 402', author: 'Laila', rating: 5, comment: 'The SQL labs made everything click. Very practical.', createdAt: '2026-05-02' },
  { id: 'ex-4', courseCode: 'CSEN 402', author: 'Youssef', rating: 3, comment: 'Useful but the group project takes planning.', createdAt: '2026-04-20' },
  { id: 'ex-5', courseCode: 'CSEN 501', author: 'Nadine', rating: 4, comment: 'The diagrams and packet examples were really helpful.', createdAt: '2026-03-19' },
  { id: 'ex-6', courseCode: 'CSEN 602', author: 'Mostafa', rating: 5, comment: 'You learn a lot from the team project and code reviews.', createdAt: '2026-05-08' },
  { id: 'ex-7', courseCode: 'CSEN 701', author: 'Hana', rating: 4, comment: 'Hands-on labs are the best part. Practice wiring early.', createdAt: '2026-05-10' },
  { id: 'ex-8', courseCode: 'CSEN 701', author: 'You', rating: 4, comment: 'The practical demos helped me connect code to circuits.', createdAt: '2026-05-17' },
];

function initialReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.every((review) => review && typeof review === 'object')) return saved;
  } catch { /* ignore invalid local data */ }
  return EXAMPLE_REVIEWS.map((review) => ({ ...review }));
}
function pathFor(code) { return `/courses/${encodeURIComponent(code)}`; }
function getCourseFromPath() {
  const match = window.location.pathname.match(/^\/courses\/([^/]+)\/?$/);
  if (!match) return null;
  try { return COURSES.find((course) => course.code === decodeURIComponent(match[1])) || null; }
  catch { return null; }
}
function Stars({ value, size = 'normal' }) {
  return <span className={`stars ${size}`} aria-label={`${value} out of 5 stars`}>{'★'.repeat(Math.round(value))}<span className="stars-empty">{'★'.repeat(5 - Math.round(value))}</span></span>;
}
function RatingSummary({ reviews }) {
  const average = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0;
  return <div className="rating-summary"><span className="rating-number">{reviews.length ? average.toFixed(1) : '—'}</span><span><Stars value={average} /><small>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</small></span></div>;
}
function ReviewCard({ review, onEdit, compact = false, onOpenCourse }) {
  const own = review.author === CURRENT_USER;
  return <article className="review-card">
    <div className="review-head"><div className="avatar" aria-hidden="true">{review.author.slice(0, 1)}</div><div className="review-author"><strong>{review.author}</strong><span>{new Date(`${review.createdAt}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{own ? ' · Your review' : ''}</span></div><Stars value={review.rating} /></div>
    {compact && <button className="course-link" onClick={() => onOpenCourse(review.courseCode)}>{review.courseCode} ↗</button>}
    <p>{review.comment || <span className="muted">No written comment</span>}</p>
    {own && <button className="text-button" onClick={() => onEdit(review.courseCode)}>Edit your review →</button>}
  </article>;
}

export default function App() {
  const [reviews, setReviews] = useState(initialReviews);
  const [pageCourse, setPageCourse] = useState(getCourseFromPath);
  const [tab, setTab] = useState('courses');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recommended');
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { const update = () => setPageCourse(getCourseFromPath()); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []);
  useEffect(() => { document.title = pageCourse ? `${pageCourse.code} · CourseScope` : 'CourseScope · Student course reviews'; }, [pageCourse]);
  function goTo(code) { window.history.pushState({}, '', code ? pathFor(code) : '/'); setPageCourse(code ? COURSES.find((course) => course.code === code) : null); setNotice(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const reviewsFor = (code) => reviews.filter((review) => review.courseCode === code);
  const ownReview = (code) => reviews.find((review) => review.courseCode === code && review.author === CURRENT_USER);
  function openReview(code) { const existing = ownReview(code); setReviewModal(code); setRating(existing ? existing.rating : 5); setComment(existing ? existing.comment : ''); setError(''); }
  function saveReview(event) {
    event.preventDefault();
    const validRating = Number(rating);
    if (!Number.isInteger(validRating) || validRating < 1 || validRating > 5) { setError('Choose a whole-number rating between 1 and 5.'); return; }
    if (!COURSES.some((c) => c.code === reviewModal)) { setError('Choose a valid course.'); return; }
    const existing = ownReview(reviewModal);
    if (existing) setReviews((old) => old.map((review) => review.id === existing.id ? { ...review, rating: validRating, comment: comment.trim(), updatedAt: new Date().toISOString() } : review));
    else setReviews((old) => [...old, { id: `local-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`, courseCode: reviewModal, author: CURRENT_USER, rating: validRating, comment: comment.trim(), createdAt: new Date().toISOString().slice(0, 10) }]);
    setNotice(existing ? 'Your review was updated.' : 'Your review was published.');
    setReviewModal(null);
  }
  function resetDemo() { if (window.confirm('Restore all example reviews? Your changes in this browser will be lost.')) { setReviews(EXAMPLE_REVIEWS.map((review) => ({ ...review }))); setNotice('Example records restored.'); setReviewModal(null); } }
  const courseStats = (course) => { const list = reviewsFor(course.code); return { count: list.length, average: list.length ? list.reduce((sum, review) => sum + review.rating, 0) / list.length : 0 }; };
  const visibleCourses = useMemo(() => COURSES.filter((c) => `${c.code} ${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'rating') { const avg = (code) => { const list = reviews.filter((r) => r.courseCode === code); return list.length ? list.reduce((n, r) => n + r.rating, 0) / list.length : 0; }; return avg(b.code) - avg(a.code); }
    return 0;
  }), [search, sort, reviews]);
  const filteredReviews = useMemo(() => [...reviews].filter((r) => `${r.courseCode} ${COURSES.find((c) => c.code === r.courseCode)?.name || ''} ${r.comment} ${r.author}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.createdAt.localeCompare(a.createdAt)), [reviews, search]);
  const detailReviews = pageCourse ? [...reviewsFor(pageCourse.code)].sort((a,b) => b.createdAt.localeCompare(a.createdAt)) : [];
  const detailStats = pageCourse ? courseStats(pageCourse) : null;

  return <div className="app-shell">
    <header className="site-header"><div className="container topbar"><button className="brand" onClick={() => goTo(null)}><span className="brand-mark">✳</span> Course<span>Scope</span></button><nav aria-label="Main navigation"><button className={!pageCourse && tab === 'courses' ? 'nav-active' : ''} onClick={() => { goTo(null); setTab('courses'); setSearch(''); }}>Explore courses</button><button className={!pageCourse && tab === 'reviews' ? 'nav-active' : ''} onClick={() => { goTo(null); setTab('reviews'); setSearch(''); }}>Student reviews</button></nav><div className="profile"><span className="profile-dot">Y</span><span>Signed in as <strong>You</strong></span></div></div></header>
    <main className="container">
      {notice && <div className="notice" role="status">✓ {notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      {pageCourse ? <>
        <div className="breadcrumbs"><button onClick={() => { goTo(null); setTab('courses'); }}>All courses</button><span>/</span><span>{pageCourse.code}</span></div>
        <div className="detail-layout"><section className="detail-main"><div className="eyebrow">COURSE OVERVIEW <span className="eyebrow-line" /></div><h1>{pageCourse.name}</h1><div className="pill-row"><span className="code-pill">{pageCourse.code}</span><span className="neutral-pill">{pageCourse.department}</span><span className="neutral-pill">{pageCourse.credits} credit hours</span></div><p className="detail-description">{pageCourse.description}</p><div className="section-heading"><div><div className="eyebrow">FROM PREVIOUS STUDENTS</div><h2>Student reviews <span className="heading-count">{detailReviews.length}</span></h2></div></div>{detailReviews.length ? <div className="reviews-list">{detailReviews.map((review) => <ReviewCard key={review.id} review={review} onEdit={openReview} />)}</div> : <div className="empty-state">No reviews yet. Be the first to share your experience.</div>}</section>
        <aside className="detail-side"><section className="side-card rating-panel"><div className="eyebrow">STUDENT RATING</div><RatingSummary reviews={detailReviews} /><div className="mini-divider" /><p>Help other students decide if this course is right for them.</p><button className="primary-btn full" onClick={() => openReview(pageCourse.code)}>{ownReview(pageCourse.code) ? 'Edit my review' : 'Write a review'} <span>↗</span></button></section><section className="side-card"><div className="eyebrow">TEACHING HISTORY</div><h3>Previous academic years</h3><p className="sample-note">Fictional sample staff names for demo purposes.</p>{pageCourse.history.map((h) => <div className="year-row" key={h.year}><span className="year-label">{h.year}</span><div>{h.staff.map((name) => <div key={name}>{name}</div>)}</div></div>)}</section></aside></div>
      </> : <>
        <section className="hero"><div className="hero-copy"><div className="hero-kicker"><span className="tiny-sparkle">✳</span> BUILT FOR BETTER COURSE CHOICES</div><h1>Choose your next course<br />with <em>confidence.</em></h1><p>Real student perspectives, clear course details, and everything you need to make a more informed decision.</p><button className="primary-btn" onClick={() => { setTab('courses'); document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore courses <span>↗</span></button></div><div className="hero-art" aria-hidden="true"><div className="art-orbit"><div className="art-inner">✳</div></div><div className="art-card art-card-one"><strong>4.8 <span>★★★★★</span></strong><small>Student approved</small></div><div className="art-card art-card-two">✦ <strong>Learn from experience</strong></div></div></section>
        <section className="browse" id="browse"><div className="section-heading"><div><div className="eyebrow">FIND YOUR FIT</div><h2>{tab === 'courses' ? 'Explore courses' : 'Student reviews'}</h2><p>{tab === 'courses' ? 'Browse courses and see what students are saying.' : 'Read honest feedback from previous students.'}</p></div><button className="outline-btn" onClick={() => { setReviewModal(''); openReview(COURSES[0].code); }}>+ Write a review</button></div><div className="filters"><div className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search courses and reviews" placeholder="Search by course name, code, or keyword..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>{tab === 'courses' && <select aria-label="Sort courses" value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Featured order</option><option value="name">Course name</option><option value="rating">Highest rated</option></select>}</div>{tab === 'courses' ? <div className="course-grid">{visibleCourses.map((course) => { const stats = courseStats(course); return <article className="course-card" key={course.code}><div className="course-card-top"><span className="code-pill">{course.code}</span><span className="course-arrow" aria-hidden="true">↗</span></div><h3>{course.name}</h3><p>{course.description}</p><div className="tag-row">{course.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="course-card-bottom"><div><Stars value={stats.average} /><span className="small-rating">{stats.count ? `${stats.average.toFixed(1)} · ${stats.count} reviews` : 'No reviews yet'}</span></div><button onClick={() => goTo(course.code)}>View course →</button></div></article>; })}</div> : <div className="review-grid">{filteredReviews.map((review) => <ReviewCard key={review.id} review={review} compact onOpenCourse={goTo} onEdit={openReview} />)}</div>}{(tab === 'courses' ? visibleCourses.length === 0 : filteredReviews.length === 0) && <div className="empty-state">No matches found. Try a different search.</div>}</section>
      </>}
    </main>
    <footer className="site-footer"><div className="container footer-inner"><span><strong>✳ CourseScope</strong> · Student-powered course insights</span><button onClick={resetDemo}>Reset demo</button><small>Demo data · Stored locally in this browser</small></div></footer>
    {reviewModal !== null && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setReviewModal(null); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="review-title"><div className="modal-top"><div><div className="eyebrow">SHARE YOUR EXPERIENCE</div><h2 id="review-title">{ownReview(reviewModal) ? 'Edit your review' : 'Write a review'}</h2></div><button className="close-button" aria-label="Close" onClick={() => setReviewModal(null)}>×</button></div><form onSubmit={saveReview}><label htmlFor="course-select">Course code</label><select id="course-select" value={reviewModal} onChange={(e) => { const code = e.target.value; setReviewModal(code); const existing = ownReview(code); setRating(existing ? existing.rating : 5); setComment(existing ? existing.comment : ''); setError(''); }}>{COURSES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}</select><label htmlFor="rating-select">Your rating</label><select id="rating-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'star' : 'stars'}</option>)}</select><label htmlFor="review-comment">Comment <span className="muted">(optional)</span></label><textarea id="review-comment" rows={4} maxLength={1000} placeholder="What should another student know before taking this course?" value={comment} onChange={(e) => setComment(e.target.value)} /><p className="form-hint">One review per course. You can update your own review anytime.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="outline-btn" onClick={() => setReviewModal(null)}>Cancel</button><button className="primary-btn" type="submit">{ownReview(reviewModal) ? 'Save changes' : 'Publish review'} <span>↗</span></button></div></form></div></div>}
  </div>;
}
