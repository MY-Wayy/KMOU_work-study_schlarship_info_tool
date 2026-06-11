import { scrapeKMOU } from '@/utils/scraper';
import Accordion from '@/components/Accordion';
import './globals.css';
import styles from './page.module.css';

// Revalidate every 1 hour
export const revalidate = 3600;

export default async function Home() {
  const dataTree = await scrapeKMOU();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>한국해양대학교</h1>
          <h2 className={styles.subtitle}>국가근로장학생 공지사항</h2>
          <p className={styles.description}>아치마당 - 정보광장 - 공지사항 크롤링 결과</p>
        </header>
        
        <section className={styles.content}>
          {Object.keys(dataTree).length === 0 ? (
            <div className={styles.emptyState}>
              게시물을 찾을 수 없습니다.
            </div>
          ) : (
            <Accordion data={dataTree} />
          )}
        </section>
      </div>
    </main>
  );
}
