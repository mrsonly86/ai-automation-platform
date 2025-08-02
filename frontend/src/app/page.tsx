'use client';

import { motion } from 'framer-motion';
import AIAgentCard from '@/components/AIAgentCard';
import IntegrationSection from '@/components/IntegrationSection';
import SolutionsSection from '@/components/SolutionsSection';
import DeploymentProcess from '@/components/DeploymentProcess';
import Header from '@/components/Header';

const aiAgents = [
  {
    id: '1',
    name: 'Chuyển đổi Phân tích',
    description: 'Phân tích báo cáo và dữ liệu kinh doanh',
    icon: 'BarChart3',
    category: 'analysis' as const,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '2',
    name: 'Chiến lược gia kinh doanh',
    description: 'Quản lý & AI Report',
    icon: 'TrendingUp',
    category: 'business' as const,
    color: 'from-emerald-500 to-green-500'
  },
  {
    id: '3',
    name: 'Thiết kế viên UX/UI',
    description: 'Thiết kế & Trải nghiệm',
    icon: 'Palette',
    category: 'design' as const,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '4',
    name: 'Kiến trúc sư Hệ thống',
    description: 'Kiến trúc & Kế toán',
    icon: 'Building2',
    category: 'architecture' as const,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: '5',
    name: 'Lập trình viên Full Stack',
    description: 'Phát triển Full Stack',
    icon: 'Code',
    category: 'development' as const,
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: '6',
    name: 'Kỹ sư QA',
    description: 'Kiểm thử & QA testing',
    icon: 'Bug',
    category: 'testing' as const,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: '7',
    name: 'Kỹ sư DevOps',
    description: 'DevOps & Hạ tầng',
    icon: 'Server',
    category: 'devops' as const,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: '8',
    name: 'Điều phối viên AI',
    description: 'Điều phối AI',
    icon: 'Bot',
    category: 'coordination' as const,
    color: 'from-rose-500 to-pink-500'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen gradient-animation">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <motion.section 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
            Hệ thống AI Cách mạng
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            Nền tảng tự động hóa toàn diện với 8 AI agents chuyên biệt, 
            tích hợp đa dịch vụ và quy trình triển khai tự động
          </p>
        </motion.section>

        {/* AI Agents Grid */}
        <motion.section 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            8 AI Agents Chuyên biệt
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <AIAgentCard agent={agent} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Integration Section */}
        <IntegrationSection />

        {/* Solutions Section */}
        <SolutionsSection />

        {/* Deployment Process */}
        <DeploymentProcess />
      </main>
    </div>
  );
}
