import React from 'react';
import { useTranslation } from 'react-i18next';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const AIAgentsPage: React.FC = () => {
  const { t } = useTranslation();

  const aiAgents: AIAgent[] = [
    {
      id: 'data-analyst',
      name: t('data_analyst'),
      description: 'Phân tích dữ liệu và tạo báo cáo thông minh',
      icon: '📊'
    },
    {
      id: 'content-creator',
      name: t('content_creator'),
      description: 'Tạo nội dung đa phương tiện chất lượng cao',
      icon: '✍️'
    },
    {
      id: 'customer-service',
      name: t('customer_service'),
      description: 'Hỗ trợ khách hàng 24/7 với AI thông minh',
      icon: '🎧'
    },
    {
      id: 'sales-assistant',
      name: t('sales_assistant'),
      description: 'Hỗ trợ bán hàng và quản lý leads hiệu quả',
      icon: '💼'
    },
    {
      id: 'project-manager',
      name: t('project_manager'),
      description: 'Quản lý dự án và phân bổ tài nguyên tối ưu',
      icon: '📋'
    },
    {
      id: 'security-monitor',
      name: t('security_monitor'),
      description: 'Giám sát bảo mật và phát hiện mối đe dọa',
      icon: '🔐'
    },
    {
      id: 'quality-assurance',
      name: t('quality_assurance'),
      description: 'Kiểm tra chất lượng sản phẩm tự động',
      icon: '✅'
    },
    {
      id: 'system-optimizer',
      name: t('system_optimizer'),
      description: 'Tối ưu hóa hiệu suất hệ thống và quy trình',
      icon: '⚙️'
    }
  ];

  return (
    <div className="container">
      <section style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1>{t('ai_agents_title')}</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto 40px' }}>
          {t('ai_agents_description')}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {aiAgents.map((agent) => (
            <div key={agent.id} className="ai-agent-card">
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{agent.icon}</div>
              <h3>{agent.name}</h3>
              <p>{agent.description}</p>
              <button 
                style={{ 
                  backgroundColor: '#667eea', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  width: '100%' 
                }}
              >
                Khám phá
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AIAgentsPage;