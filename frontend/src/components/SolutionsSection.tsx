'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Code2, 
  TrendingUp, 
  PenTool, 
  Bot,
  Target,
  BarChart3,
  DollarSign,
  Rocket,
  Palette,
  Users,
  Settings,
  Zap
} from 'lucide-react';

const solutionTabs = [
  {
    id: 'technical',
    name: 'Phát triển kỹ thuật',
    description: 'Giải pháp phát triển toàn stack',
    services: [
      { title: 'Frontend Development', description: 'React, Next.js, Vue.js', icon: Code2 },
      { title: 'Backend Development', description: 'Node.js, Python, Java', icon: Settings },
      { title: 'Mobile Development', description: 'React Native, Flutter', icon: Code2 },
      { title: 'DevOps & CI/CD', description: 'Docker, Kubernetes, GitHub Actions', icon: Zap },
    ]
  },
  {
    id: 'business',
    name: 'Chiến lược kinh doanh',
    description: 'Tối ưu hóa doanh nghiệp',
    services: [
      { title: 'Tạo mô hình kinh doanh', description: 'Business Model Canvas, Lean Startup', icon: Target },
      { title: 'Phân tích & xác thực thị trường', description: 'Market Research, Competitor Analysis', icon: BarChart3 },
      { title: 'Dự báo tài chính & lập kế hoạch', description: 'Financial Modeling, Budget Planning', icon: DollarSign },
      { title: 'Chiến lược go-to-market', description: 'Marketing Strategy, Sales Funnel', icon: Rocket },
    ]
  },
  {
    id: 'content',
    name: 'Chiến lược nội dung',
    description: 'Sáng tạo và quản lý nội dung',
    services: [
      { title: 'Content Strategy', description: 'Content Planning, Editorial Calendar', icon: PenTool },
      { title: 'Brand Design', description: 'Logo, Brand Identity, Visual Assets', icon: Palette },
      { title: 'Social Media Management', description: 'Content Creation, Community Management', icon: Users },
      { title: 'SEO & Content Marketing', description: 'Keyword Research, Content Optimization', icon: TrendingUp },
    ]
  },
  {
    id: 'automation',
    name: 'Tự động hóa & AI',
    description: 'AI và automation solutions',
    services: [
      { title: 'AI Chatbots', description: 'Customer Support, Lead Generation', icon: Bot },
      { title: 'Process Automation', description: 'Workflow Automation, RPA', icon: Zap },
      { title: 'Data Analytics', description: 'Business Intelligence, Predictive Analytics', icon: BarChart3 },
      { title: 'AI Integration', description: 'Machine Learning, Natural Language Processing', icon: Bot },
    ]
  }
];

export default function SolutionsSection() {
  const [activeTab, setActiveTab] = useState('business');

  const activeTabData = solutionTabs.find(tab => tab.id === activeTab);

  return (
    <motion.section 
      id="solutions"
      className="space-y-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">
          Giải pháp toàn diện
        </h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Từ ý tưởng đến triển khai, chúng tôi cung cấp giải pháp end-to-end
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {solutionTabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            className={`
              px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all duration-300 text-sm md:text-base
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }
            `}
            onClick={() => setActiveTab(tab.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.name}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTabData && (
        <motion.div
          key={activeTab}
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {activeTabData.name}
            </h3>
            <p className="text-slate-300">
              {activeTabData.description}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTabData.services.map((service, index) => (
              <motion.div
                key={service.title}
                className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {service.title}
                    </h4>
                    <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        className="text-center pt-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        viewport={{ once: true }}
      >
        <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium">
          Tư vấn miễn phí
        </button>
      </motion.div>
    </motion.section>
  );
}