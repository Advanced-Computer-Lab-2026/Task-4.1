import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'acl-course-review-board-v3';
const CURRENT_USER = 'You';

const COURSE_CATALOG = {
  CSEN701: {
    name: 'Advanced Computer Lab',
    description: 'A project focused course emphasizing teamwork, planning, software development, and delivery across several milestones.',
    history: [
      { year: '2025/26', instructors: ['Dr. Mariam Farouk'], tas: ['Yara Hassan', 'Omar Fawzy'] },
      { year: '2024/25', instructors: ['Dr. Karim Nabil'], tas: ['Nour Adel', 'Mina Sameh'] },
    ],
  },
  MATH204: {
    name: 'Linear Algebra',
    description: 'Vectors, matrices, linear systems, and mathematical methods used in technical problem solving.',
    history: [
      { year: '2025/26', instructors: ['Dr. Salma Younis'], tas: ['Layla Maher', 'Ahmed Sherif'] },
      { year: '2024/25', instructors: ['Dr. Rana Hamdy'], tas: ['Youssef Tarek', 'Dina Mourad'] },
    ],
  },
  CSEN401: {
    name: 'Software Engineering',
    description: 'Software requirements, architecture, implementation practices, testing, and collaborative development.',
    history: [
      { year: '2025/26', instructors: ['Dr. Tamer Elsayed'], tas: ['Rana Fathy', 'Adham Khalil'] },
      { year: '2024/25', instructors: ['Dr. Hala Mansour'], tas: ['Malak Samir', 'Ali Mahmoud'] },
    ],
  },
  HUMA101: {
    name: 'Critical Thinking & Communication',
    description: 'A discussion based course about assessing arguments, presenting ideas, and communicating effectively.',
    history: [
      { year: '2025/26', instructors: ['Dr. Dina Saad'], tas: ['Mariam Hossam', 'Youssef Nader'] },
      { year: '2024/25', instructors: ['Dr. Reem Taha'], tas: ['Farah Amr', 'Sara Magdy'] },
    ],
  },
  CSEN202: {
    name: 'Data Structures',
    description: 'Core data organization techniques and algorithms, with a focus on selecting suitable structures for different problems.',
    history: [
      { year: '2025/26', instructors: ['Dr. Amina Rashed'], tas: ['Rami Elshamy', 'Nada Wael'] },
      { year: '2024/25', instructors: ['Dr. Yasser Salem'], tas: ['Hana Ehab', 'Bassel Mostafa'] },
    ],
  },
};

const SEED_REVIEWS = [
  { id: 'r1', courseCode: 'CSEN701', rating: 4, comment: 'A challenging team project. The weekly milestones helped.', owner: 'you', name: 'You', date: '2026-10-06' },
  { id: 'r2', courseCode: 'CSEN701', rating: 5, comment: 'You learn the most when your group communicates well.', owner: 'other', name: 'Farida', date: '2026-10-02' },
  { id: 'r3', courseCode: 'MATH204', rating: 3, comment: 'Useful material but the pace felt fast.', owner: 'other', name: 'Karim', date: '2026-09-28' },
  { id: 'r4', courseCode: 'CSEN401', rating: 4, comment: 'Tutorial exercises are very important.', owner: 'you', name: 'You', date: '2026-09-24' },
  { id: 'r5', courseCode: 'HUMA101', rating: 5, comment: 'Well organized and approachable.', owner: 'other', name: 'Mariam', date: '2026-09-21' },
  { id: 'r6', courseCode: 'CSEN701', rating: 3, comment: 'Good practical work, but demanding during exam week.', owner: 'other', name: 'Youssef', date: '2026-09-15' },
  { id: 'r7', courseCode: 'MATH204', rating: 5, comment: 'Excellent explanation of difficult concepts.', owner: 'other', name: 'Nadine', date: '2026-08-30' },
  { id: 'r8', courseCode: 'CSEN401', rating: 2, comment: 'More worked examples in lectures would help.', owner: 'other', name: 'Adam', date: '2026-08-17' },
  { id: 'r9', courseCode: 'CSEN202', rating: 4, comment: 'The assignments strengthened problem solving skills.', owner: 'other', name: 'Hassan', date: '2026-08-09' },
];

const getCourse = code => COURSE_CATALOG[String(code || '').trim().toUpperCase()];
const stars = rating => '★'.repeat(rating) + '☆'.repeat(5 - rating);
const average = reviews => reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '—';
const dateLabel = date => new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

function loadReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : SEED_REVIEWS;
  } catch {
    return SEED_REVIEWS;
  }
}

function readRoute() {
  const match = window.location.hash.match(/^#\/courses\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
}

function Rating({ value, large = false }) {
  return <span className={large ? 'stars stars-large' : 'stars'} aria-label={`${value} out of 5 stars`}>{stars(value)}</span>;
}

export default function App() {
  const [reviews, setReviews] = useState(loadReviews);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [activeCourse, setActiveCourse] = useState(readRoute);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [section, setSection] = useState('overview');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    const onHashChange = () => {
      setActiveCourse(readRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const courseCodes = Object.keys(COURSE_CATALOG);
  const courseSummaries = courseCodes.map(code => {
    const courseReviews = reviews.filter(review => review.courseCode === code);
    return { code, course: COURSE_CATALOG[code], reviews: courseReviews, average: average(courseReviews) };
  });

  const filteredReviews = useMemo(() => reviews.filter(review => {
    const text = `${review.courseCode} ${getCourse(review.courseCode)?.name || ''} ${review.comment} ${review.name}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase().trim());
    const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter);
    const matchesOwner = !showMyReviews || review.owner === 'you';
    return matchesSearch && matchesRating && matchesOwner;
  }), [reviews, search, ratingFilter, showMyReviews]);

  const userCourses = new Set(reviews.filter(review => review.owner === 'you').map(review => review.courseCode));

  function openCourse(code) {
    const normalized = String(code).trim().toUpperCase();
    window.location.hash = `#/courses/${encodeURIComponent(normalized)}`;
    setActiveCourse(normalized);
  }

  function goHome(target = 'overview') {
    window.location.hash = '#/';
    setActiveCourse(null);
    setSection(target);
    requestAnimationFrame(() => document.getElementById(target === 'reviews' ? 'reviews' : 'top')?.scrollIntoView({ behavior: 'smooth' }));
  }

  function openEditor(review = null, presetCourse = '') {
    setError('');
    setEditor({
      id: review?.id || null,
      courseCode: review?.courseCode || presetCourse,
      rating: review?.rating ? String(review.rating) : '',
      comment: review?.comment || '',
    });
  }

  function submitReview(event) {
    event.preventDefault();
    const code = editor.courseCode.trim().toUpperCase();
    if (!code) return setError('Course code is required.');
    if (!/^\d*[A-Z]+\d+$/.test(code)) return setError('Enter a valid course code, for example CSEN701.');
    if (!/^([1-5])$/.test(editor.rating)) return setError('Rating must be a whole number from 1 to 5.');
    if (editor.comment.length > 500) return setError('Comment must be 500 characters or fewer.');
    if (reviews.some(review => review.id !== editor.id && review.owner === 'you' && review.courseCode === code)) {
      return setError('You have already reviewed this course. Edit your existing review instead.');
    }

    const payload = {
      courseCode: code,
      rating: Number(editor.rating),
      comment: editor.comment.trim(),
      owner: 'you',
      name: CURRENT_USER,
      date: editor.id ? reviews.find(review => review.id === editor.id)?.date || new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    };

    if (editor.id) {
      setReviews(current => current.map(review => review.id === editor.id ? { ...review, ...payload } : review));
      setNotice('Your review was updated.');
    } else {
      setReviews(current => [{ ...payload, id: `review-${Date.now()}` }, ...current]);
      setNotice('Your review was posted.');
    }
    setEditor(null);
  }

  function resetDemo() {
    setReviews(SEED_REVIEWS);
    setSearch('');
    setRatingFilter('all');
    setShowMyReviews(false);
    setNotice('Example records restored.');
  }

  const course = activeCourse ? getCourse(activeCourse) : null;
  const courseReviews = activeCourse ? reviews.filter(review => review.courseCode === activeCourse) : [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => goHome('overview')} aria-label="Course Review Board home">
          <span className="brand-mark">CR</span>
          <span>Course Review Board</span>
        </button>
        <div className="nav-label">WORKSPACE</div>
        <button className={section === 'overview' && !activeCourse ? 'nav-item active' : 'nav-item'} onClick={() => { setShowMyReviews(false); goHome('overview'); }}><span>⌂</span> Overview</button>
        <button className={section === 'reviews' && !activeCourse && !showMyReviews ? 'nav-item active' : 'nav-item'} onClick={() => { setShowMyReviews(false); setSearch(''); goHome('reviews'); }}><span>☷</span> Browse reviews</button>
        <button className="nav-item" onClick={() => openEditor()}><span>＋</span> Write a review</button>
        <div className="nav-label nav-gap">YOUR SPACE</div>
        <button className={showMyReviews && section === 'reviews' && !activeCourse ? 'nav-item active' : 'nav-item'} onClick={() => { setSearch(''); setRatingFilter('all'); setShowMyReviews(true); goHome('reviews'); }}><span>♡</span> Your reviews</button>
        <div className="sidebar-note">
          <strong>Local demo</strong>
          <span>Changes are saved in this browser only.</span>
        </div>
        <div className="profile"><span>Y</span><div><strong>You</strong><small>Signed in for this demo</small></div></div>
      </aside>

      <main className="main-content" id="top">
        {activeCourse && course ? (
          <CoursePage
            code={activeCourse}
            course={course}
            reviews={courseReviews}
            onBack={() => goHome('reviews')}
            onWrite={() => openEditor(null, activeCourse)}
            onEdit={openEditor}
          />
        ) : (
          <>
            <header className="topbar">
              <div>
                <div className="eyebrow">ACADEMIC FEEDBACK PORTAL</div>
                <h1>Choose with more confidence.</h1>
                <p>Explore what students said, compare course signals, then add your own experience.</p>
              </div>
              <button className="primary-button" onClick={() => openEditor()}>＋ Write a review</button>
            </header>

            {notice && <div className="notice" role="status"><span>✓ {notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}

            <section className="hero-grid">
              <div className="hero-card">
                <div className="hero-copy">
                  <span className="hero-kicker">BEFORE YOU ENROL</span>
                  <h2>See the course beyond the code.</h2>
                  <p>Open any course to read its description, teaching history for the last two academic years, and student reviews in one shareable page.</p>
                  <button className="secondary-button" onClick={() => goHome('reviews')}>Browse student reviews <span>→</span></button>
                </div>
                <div className="hero-stat"><strong>{courseCodes.length}</strong><span>sample courses</span><small>Ready to explore</small></div>
              </div>
              <div className="quick-card">
                <span className="card-kicker">YOUR REVIEWS</span>
                <strong>{reviews.filter(review => review.owner === 'you').length}</strong>
                <p>of {courseCodes.length} sample courses reviewed</p>
                <button onClick={() => { setShowMyReviews(true); setSearch(''); setRatingFilter('all'); goHome('reviews'); }}>View your reviews →</button>
              </div>
            </section>

            <section className="stats-grid">
              <Stat label="ALL REVIEWS" value={reviews.length} detail="Community contributions" />
              <Stat label="AVERAGE SCORE" value={`${average(reviews)} / 5`} detail="Across all reviews" />
              <Stat label="COURSES RATED" value={new Set(reviews.map(review => review.courseCode)).size} detail="Unique course codes" />
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span className="eyebrow">COURSE DIRECTORY</span><h2>Explore courses</h2><p>Start with a course, then open its full profile.</p></div></div>
              <div className="course-grid">
                {courseSummaries.map(item => <CourseCard key={item.code} {...item} onOpen={openCourse} />)}
              </div>
            </section>

            <section className="review-panel" id="reviews">
              <div className="section-heading review-heading"><div><span className="eyebrow">STUDENT VOICES</span><h2>{showMyReviews ? 'Your reviews' : 'Browse reviews'}</h2><p>{showMyReviews ? 'Review and edit the feedback you have submitted.' : 'Search by course, student, comment, or rating.'}</p></div><div className="review-actions">{showMyReviews && <button className="ghost-button" onClick={() => { setShowMyReviews(false); setSearch(''); setRatingFilter('all'); }}>All reviews</button>}<button className="ghost-button" onClick={resetDemo}>Reset demo</button></div></div>
              <div className="filter-bar">
                <label className="search-field"><span>⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search reviews or course codes" aria-label="Search reviews" /></label>
                <label className="select-field"><span>Rating</span><select value={ratingFilter} onChange={event => setRatingFilter(event.target.value)}><option value="all">All ratings</option>{[5,4,3,2,1].map(value => <option value={value} key={value}>{value} stars</option>)}</select></label>
              </div>
              <div className="review-table-wrap">
                <table>
                  <thead><tr><th>COURSE</th><th>RATING</th><th>COMMENT</th><th>REVIEWER</th><th>DATE</th><th></th></tr></thead>
                  <tbody>
                    {filteredReviews.map(review => <tr key={review.id}>
                      <td><button className="course-table-link" onClick={() => openCourse(review.courseCode)}><strong>{review.courseCode}</strong><small>{getCourse(review.courseCode)?.name || 'Course profile'}</small></button></td>
                      <td><Rating value={review.rating} /></td>
                      <td className="comment-cell">{review.comment || <span className="muted">No comment provided</span>}</td>
                      <td>{review.name}</td>
                      <td>{dateLabel(review.date)}</td>
                      <td>{review.owner === 'you' ? <button className="edit-link" onClick={() => openEditor(review)}>Edit</button> : <span className="muted"></span>}</td>
                    </tr>)}
                    {!filteredReviews.length && <tr><td className="empty-row" colSpan="6">No reviews match your filters.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">Showing {filteredReviews.length} of {reviews.length} reviews</div>
            </section>
          </>
        )}
      </main>

      {editor && <ReviewModal editor={editor} error={error} onChange={setEditor} onSubmit={submitReview} onClose={() => setEditor(null)} />}
    </div>
  );
}

function Stat({ label, value, detail }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function CourseCard({ code, course, reviews, average: score, onOpen }) {
  return <article className="course-card">
    <div className="course-card-top"><span className="course-code">{code}</span><span className="review-count">{reviews.length} review{reviews.length === 1 ? '' : 's'}</span></div>
    <h3>{course.name}</h3>
    <p>{course.description}</p>
    <div className="course-card-bottom"><div>{score !== '—' && <><Rating value={Math.round(Number(score))} /><strong>{score}</strong></>} {score === '—' && <span className="muted">No ratings yet</span>}</div><button onClick={() => onOpen(code)}>View course <span>→</span></button></div>
  </article>;
}

function CoursePage({ code, course, reviews, onBack, onWrite, onEdit }) {
  return <section className="course-page">
    <button className="back-link" onClick={onBack}>← Back to reviews</button>
    <header className="course-header">
      <div><span className="eyebrow">COURSE PROFILE</span><div className="course-code-large">{code}</div><h1>{course.name}</h1><p>{course.description}</p></div>
      <div className="score-card"><span>COURSE AVERAGE</span><strong>{average(reviews)}</strong><Rating value={reviews.length ? Math.round(Number(average(reviews))) : 0} large /><small>{reviews.length} review{reviews.length === 1 ? '' : 's'}</small></div>
    </header>
    <div className="course-layout">
      <section className="detail-card history-card"><div className="detail-heading"><div><span className="eyebrow">WHO TAUGHT IT</span><h2>Teaching history</h2></div></div><p className="detail-intro">Example teaching records for the two most recent academic years.</p>
        {course.history.map(entry => <div className="history-year" key={entry.year}><h3>{entry.year}</h3><div className="history-row"><span>Instructor{entry.instructors.length > 1 ? 's' : ''}</span><strong>{entry.instructors.join(', ')}</strong></div><div className="history-row"><span>Teaching assistants</span><strong>{entry.tas.join(', ')}</strong></div></div>)}
        <div className="fictional-note">Illustrative records only. All staff names shown here are fictional sample data.</div>
      </section>
      <section className="detail-card"><div className="detail-heading"><div><span className="eyebrow">STUDENT FEEDBACK</span><h2>Student reviews</h2></div><button className="primary-button small" onClick={onWrite}>＋ Write review</button></div><p className="detail-intro">Read what students have shared about {code}.</p>
        {reviews.length ? reviews.map(review => <article className="detail-review" key={review.id}><div className="detail-review-head"><div className="avatar">{review.name[0]}</div><div><strong>{review.name}</strong><small>{dateLabel(review.date)}</small></div><Rating value={review.rating} /></div><p>{review.comment || 'No comment provided.'}</p>{review.owner === 'you' && <button className="edit-link" onClick={() => onEdit(review)}>Edit your review</button>}</article>) : <div className="empty-detail">No reviews yet. Be the first to share your experience.</div>}
      </section>
    </div>
  </section>;
}

function ReviewModal({ editor, error, onChange, onSubmit, onClose }) {
  return <div className="modal-overlay" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
    <div className="modal-header"><div><span className="eyebrow">YOUR CONTRIBUTION</span><h2 id="review-modal-title">{editor.id ? 'Edit your review' : 'Write a course review'}</h2><p>One review per course. Ratings are whole numbers from 1 to 5.</p></div><button className="close-button" onClick={onClose} aria-label="Close">×</button></div>
    <form onSubmit={onSubmit}>
      <label>Course code<input value={editor.courseCode} onChange={event => onChange(current => ({ ...current, courseCode: event.target.value }))} placeholder="CSEN701" disabled={Boolean(editor.id)} /></label>
      <label>Rating<select value={editor.rating} onChange={event => onChange(current => ({ ...current, rating: event.target.value }))}><option value="">Choose a rating</option>{[1,2,3,4,5].map(value => <option value={value} key={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}</select></label>
      <label>Comment <span className="optional">optional</span><textarea value={editor.comment} maxLength="500" rows="5" onChange={event => onChange(current => ({ ...current, comment: event.target.value }))} placeholder="What would another student want to know?" /><small className="char-count">{editor.comment.length}/500</small></label>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="ghost-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{editor.id ? 'Save changes' : 'Post review'}</button></div>
    </form>
  </div></div>;
}
