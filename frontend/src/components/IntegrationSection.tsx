'use client';

import { motion } from 'framer-motion';
import { 
  Github, 
  Cloud, 
  Zap, 
  CreditCard, 
  Brain,
  Activity,
  Globe,
  Shield
} from 'lucide-react';

const integrations = [
  { name: 'Vercel', icon: Zap, category: 'deployment', connected: true },
  { name: 'Netlify', icon: Globe, category: 'deployment', connected: true },
  { name: 'GitHub', icon: Github, category: 'development', connected: true },
  { name: 'Docker', icon: Shield, category: 'development', connected: true },
  { name: 'Google Cloud', icon: Cloud, category: 'cloud', connected: true },
  { name: 'Firebase', icon: Activity, category: 'cloud', connected: true },
  { name: 'Stripe', icon: CreditCard, category: 'business', connected: false },
  { name: 'OpenAI', icon: Brain, category: 'business', connected: true },
];

const metrics = {
  integrations: 50,
  uptime: '99.9%',
  connections: 1247,
  support: '24/7'
};

export default function IntegrationSection() {
  return (
    <motion.section 
      id="integrations"
      className="space-y-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">
          Tích hợp Liền mạch
        </h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Kết nối với các công cụ và nền tảng yêu thích của bạn
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {Object.entries(metrics).map(([key, value], index) => (
          <motion.div
            key={key}
            className="text-center bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-3xl font-bold text-white mb-2">
              {typeof value === 'number' ? `${value}+` : value}
            </div>
            <div className="text-slate-400 text-sm capitalize">
              {key === 'integrations' ? 'Tích hợp' :
               key === 'uptime' ? 'Uptime' :
               key === 'connections' ? 'Kết nối' :
               key === 'support' ? 'Hỗ trợ' : key}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.name}
            className={`
              relative group bg-slate-800/40 backdrop-blur-sm border rounded-xl p-4 text-center
              ${integration.connected 
                ? 'border-green-500/30 hover:border-green-400/50' 
                : 'border-slate-600/30 hover:border-slate-500/50'
              }
              hover:bg-slate-700/40 transition-all duration-300 cursor-pointer
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            {/* Connection Status */}
            <div className={`
              absolute top-2 right-2 w-2 h-2 rounded-full
              ${integration.connected ? 'bg-green-400' : 'bg-slate-500'}
            `} />

            {/* Icon */}
            <div className={`
              w-8 h-8 mx-auto mb-3 flex items-center justify-center rounded-lg
              ${integration.connected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-slate-600/20 text-slate-400'
              }
            `}>
              <integration.icon className="w-4 h-4" />
            </div>

            {/* Name */}
            <div className={`
              text-xs font-medium
              ${integration.connected ? 'text-white' : 'text-slate-400'}
            `}>
              {integration.name}
            </div>

            {/* Category */}
            <div className="text-xs text-slate-500 mt-1 capitalize">
              {integration.category === 'deployment' ? 'Triển khai' :
               integration.category === 'development' ? 'Phát triển' :
               integration.category === 'cloud' ? 'Cloud' :
               integration.category === 'business' ? 'Kinh doanh' : integration.category}
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        viewport={{ once: true }}
      >
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium">
          Khám phá thêm tích hợp
        </button>
      </motion.div>
    </motion.section>
  );
}