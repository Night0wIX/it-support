import s from "./Hero.module.css";

interface HeroProps {
  name: string;
  version: string;
}

export function Hero({ name, version }: HeroProps) {
  return (
    <header className={s.hero}>
      <div className={s.hero__bg} />
      <div className={s.hero__content}>
        <span className={s.hero__chip}>K-Means Clustering</span>
        <h1 className={s.hero__title}>{name}</h1>
        <p className={s.hero__subtitle}>
          Інтелектуальний аналіз та сегментація клієнтської бази
        </p>
      </div>
      <span className={s.hero__version}>v{version}</span>
    </header>
  );
}
