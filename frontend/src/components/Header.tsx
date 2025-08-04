import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="App-header">
      <div>
        <h2>AI Automation Platform</h2>
      </div>
      <nav className="App-nav">
        <ul>
          <li><Link to="/">{t('home')}</Link></li>
          <li><Link to="/agents">{t('agents')}</Link></li>
          <li>
            <button onClick={toggleLanguage} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer' }}>
              {i18n.language === 'vi' ? 'EN' : 'VI'}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;