'use client';

import { useState } from 'react';
import styles from './Accordion.module.css';

function Chevron({ expanded }) {
  return (
    <svg
      className={`${styles.chevron} ${expanded ? styles.expanded : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

function PostItem({ post }) {
  return (
    <a href={post.link} target="_blank" rel="noopener noreferrer" className={styles.postItem}>
      <span className={styles.postIcon}>📄</span>
      <span className={styles.postTitle}>{post.title}</span>
      {post.date && <span className={styles.postDate}>{post.date}</span>}
    </a>
  );
}

function TypeNode({ type, posts }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={styles.node}>
      <button className={`${styles.nodeHeader} ${styles.typeHeader}`} onClick={() => setExpanded(!expanded)}>
        <Chevron expanded={expanded} />
        <span className={styles.nodeTitle}>{type}</span>
        <span className={styles.badge}>{posts.length}</span>
      </button>
      <div className={`${styles.nodeContent} ${expanded ? styles.contentExpanded : ''}`}>
        {posts.map((post, i) => (
          <PostItem key={i} post={post} />
        ))}
      </div>
    </div>
  );
}

function SemesterNode({ semester, types }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={styles.node}>
      <button className={`${styles.nodeHeader} ${styles.semesterHeader}`} onClick={() => setExpanded(!expanded)}>
        <Chevron expanded={expanded} />
        <span className={styles.nodeTitle}>{semester}</span>
      </button>
      <div className={`${styles.nodeContent} ${expanded ? styles.contentExpanded : ''}`}>
        {Object.keys(types).map((type, i) => (
          <TypeNode key={i} type={type} posts={types[type]} />
        ))}
      </div>
    </div>
  );
}

function YearNode({ year, semesters }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={styles.node}>
      <button className={`${styles.nodeHeader} ${styles.yearHeader}`} onClick={() => setExpanded(!expanded)}>
        <Chevron expanded={expanded} />
        <span className={styles.nodeTitle}>{year}</span>
      </button>
      <div className={`${styles.nodeContent} ${expanded ? styles.contentExpanded : ''}`}>
        {Object.keys(semesters).map((semester, i) => (
          <SemesterNode key={i} semester={semester} types={semesters[semester]} />
        ))}
      </div>
    </div>
  );
}

export default function Accordion({ data }) {
  return (
    <div className={styles.accordionContainer}>
      {Object.keys(data).sort((a,b) => b.localeCompare(a)).map((year, i) => (
        <YearNode key={i} year={year} semesters={data[year]} />
      ))}
    </div>
  );
}
