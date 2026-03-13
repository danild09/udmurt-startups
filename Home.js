import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="animate-fade-in">
          <h1>Взлети со стартапом<br />в Удмуртии 🚀</h1>
          <p className="delay-100">
            Платформа для молодых предпринимателей. Создавай проекты, находи команду,
            получай гранты и развивай бизнес с нами!
          </p>
          <div className="delay-200" style={{ marginTop: '2rem' }}>
            <Link to="/how-to-start" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}>
              Начать обучение
            </Link>
          </div>

          <div className="hero-stats delay-300 animate-fade-in">
            <div className="stat-badge">
              <h3>500+</h3>
              <p>Участников</p>
            </div>
            <div className="stat-badge">
              <h3>50+</h3>
              <p>Стартапов</p>
            </div>
            <div className="stat-badge">
              <h3>10M₽</h3>
              <p>Инвестиций</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <h2 className="section-title animate-fade-in delay-200">Возможности платформы</h2>
        </div>

        <div className="card-grid">
          <Link to="/about" className="card animate-fade-in delay-100">
            <h3>🌍 Об Удмуртии</h3>
            <p>Узнайте о регионе, его экономике и возможностях для развития вашего стартапа.</p>
          </Link>

          <Link to="/how-to-start" className="card animate-fade-in delay-200">
            <h3>💡 Как начать бизнес</h3>
            <p>Пошаговая инструкция для начинающих, гайды и первые шаги в мире предпринимательства.</p>
          </Link>

          <Link to="/success-stories" className="card animate-fade-in delay-300">
            <h3>🏆 Истории успеха</h3>
            <p>Вдохновитесь опытом успешных молодых предпринимателей из нашего региона.</p>
          </Link>

          <Link to="/lessons" className="card animate-fade-in delay-400">
            <h3>📚 Бизнес-уроки</h3>
            <p>Видеоуроки, мастер-классы и эксклюзивные образовательные материалы.</p>
          </Link>

          <Link to="/support" className="card animate-fade-in delay-500">
            <h3>🤝 Меры поддержки</h3>
            <p>Актуальные гранты, субсидии и акселераторы для молодых предпринимателей.</p>
          </Link>

          <Link to="/market" className="card animate-fade-in delay-600">
            <h3>🛍️ Маркет молодых</h3>
            <p>Витрина товаров и крутых услуг от перспективных стартапов.</p>
          </Link>

          <Link to="/guide" className="card animate-fade-in delay-700">
            <h3>🧭 Путеводитель</h3>
            <p>Интерактивная карта фондов, наставников и стратегических партнеров.</p>
          </Link>

          <Link to="/dashboard" className="card animate-fade-in delay-800">
            <h3>🚀 Личный кабинет</h3>
            <p>Публикуйте свои проекты, ищите команду и отслеживайте заявки на гранты.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

