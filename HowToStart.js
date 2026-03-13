import React from 'react';
import '../App.css';

const HowToStart = () => {
  const steps = [
    {
      number: 1,
      title: 'Выбор идеи',
      description: 'Как найти идею для бизнеса, учитывая интересы и потребности. Подумайте о том, что вам нравится, что вы умеете делать, и какие проблемы можете решить.'
    },
    {
      number: 2,
      title: 'Регистрация бизнеса',
      description: 'Порядок регистрации ИП или ООО. Для подростков с 14 лет возможно открытие ИП с согласия родителей или опекунов. Необходимо собрать пакет документов и подать заявление в налоговую службу.'
    },
    {
      number: 3,
      title: 'Выбор налогообложения',
      description: 'Обзор доступных систем налогообложения для подростков. Рекомендуется упрощенная система налогообложения (УСН) с ставкой 6% от доходов или 15% от прибыли.'
    },
    {
      number: 4,
      title: 'Открытие счета в банке',
      description: 'Как открыть расчетный счет, необходимые документы. Потребуется паспорт, документы о регистрации ИП, заявление. Многие банки предлагают льготные условия для молодых предпринимателей.'
    },
    {
      number: 5,
      title: 'Разработка бизнес-плана',
      description: 'Создайте подробный план вашего бизнеса: описание продукта, анализ рынка, финансовые прогнозы, маркетинговая стратегия.'
    },
    {
      number: 6,
      title: 'Поиск финансирования',
      description: 'Изучите возможности получения грантов, субсидий или кредитов для молодых предпринимателей. Обратитесь в центры поддержки бизнеса.'
    },
    {
      number: 7,
      title: 'Маркетинг и продвижение',
      description: 'Разработайте стратегию продвижения: социальные сети, сайт, участие в ярмарках и выставках. Для украшений с национальной символикой важна работа с культурными центрами и туристическими организациями.'
    },
    {
      number: 8,
      title: 'Производство и качество',
      description: 'Организуйте процесс производства, обеспечьте контроль качества. Для украшений важно найти надежных поставщиков материалов и создать уникальный дизайн.'
    },
    {
      number: 9,
      title: 'Продажи и клиенты',
      description: 'Начните продажи через интернет, социальные сети, ярмарки. Создайте онлайн-магазин или используйте маркетплейсы. Участвуйте в нашем "Маркете молодых".'
    },
    {
      number: 10,
      title: 'Развитие и масштабирование',
      description: 'Постоянно развивайтесь: изучайте конкурентов, улучшайте продукт, расширяйте ассортимент, ищите новые каналы продаж и партнеров.'
    }
  ];

  return (
    <div className="container">
      <h1 className="page-title">Как открыть свой бизнес в 14 лет</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        10 советов для начинающих предпринимателей
      </p>

      {steps.map(step => (
        <div key={step.number} className="card">
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
            {step.number}. {step.title}
          </h2>
          <p style={{ lineHeight: '1.8' }}>{step.description}</p>
        </div>
      ))}

      <div className="card">
        <h2 className="section-title" style={{ color: 'var(--primary-color)' }}>Полезные ссылки</h2>
        <ul style={{ listStyle: 'none', lineHeight: '2' }}>
          <li><a href="https://www.nalog.gov.ru" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dark)', textDecoration: 'underline' }}>
            Федеральная налоговая служба
          </a></li>
          <li><a href="https://www.smb.gov.ru" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dark)', textDecoration: 'underline' }}>
            Корпорация МСП
          </a></li>
          <li><a href="https://udmurt.ru" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dark)', textDecoration: 'underline' }}>
            Правительство Удмуртской Республики
          </a></li>
          <li><a href="https://www.molpred18.ru" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-dark)', textDecoration: 'underline' }}>
            Молодежное предпринимательство
          </a></li>
        </ul>
      </div>
    </div>
  );
};

export default HowToStart;

