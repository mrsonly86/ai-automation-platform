import React from 'react';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <section className="hero-section">
        <div className="container">
          <h1>{t('welcome')}</h1>
          <p>{t('description')}</p>
        </div>
      </section>
      
      <section className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Tính năng chính</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' }}>
            <div className="feature-card">
              <h3>🤖 AI Agents Thông Minh</h3>
              <p>8 AI agents chuyên biệt được thiết kế để xử lý các tác vụ phức tạp</p>
            </div>
            <div className="feature-card">
              <h3>⚡ Tự Động Hóa Quy Trình</h3>
              <p>Tự động hóa toàn bộ quy trình làm việc từ đầu đến cuối</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Bảo Mật Doanh Nghiệp</h3>
              <p>Đảm bảo an toàn dữ liệu với các chuẩn bảo mật cao nhất</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;