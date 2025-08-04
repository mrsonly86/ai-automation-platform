import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      "welcome": "Chào mừng đến với AI Automation Platform",
      "description": "Nền tảng tự động hóa thông minh với 8 AI agents chuyên biệt",
      "home": "Trang chủ",
      "agents": "AI Agents",
      "features": "Tính năng",
      "about": "Giới thiệu",
      "contact": "Liên hệ",
      "ai_agents_title": "8 AI Agents Chuyên Biệt",
      "ai_agents_description": "Khám phá các AI agents được thiết kế để tự động hóa mọi quy trình làm việc",
      "data_analyst": "Data Analyst AI",
      "content_creator": "Content Creator AI",
      "customer_service": "Customer Service AI",
      "sales_assistant": "Sales Assistant AI",
      "project_manager": "Project Manager AI",
      "security_monitor": "Security Monitor AI",
      "quality_assurance": "Quality Assurance AI",
      "system_optimizer": "System Optimizer AI"
    }
  },
  en: {
    translation: {
      "welcome": "Welcome to AI Automation Platform",
      "description": "Intelligent automation platform with 8 specialized AI agents",
      "home": "Home",
      "agents": "AI Agents",
      "features": "Features",
      "about": "About",
      "contact": "Contact",
      "ai_agents_title": "8 Specialized AI Agents",
      "ai_agents_description": "Explore AI agents designed to automate every workflow",
      "data_analyst": "Data Analyst AI",
      "content_creator": "Content Creator AI",
      "customer_service": "Customer Service AI",
      "sales_assistant": "Sales Assistant AI",
      "project_manager": "Project Manager AI",
      "security_monitor": "Security Monitor AI",
      "quality_assurance": "Quality Assurance AI",
      "system_optimizer": "System Optimizer AI"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;