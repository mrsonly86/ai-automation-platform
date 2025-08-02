'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Palette, 
  Building2, 
  Code, 
  Bug, 
  Server, 
  Bot,
  ArrowRight
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
}

interface AIAgentCardProps {
  agent: AIAgent;
}

const iconMap = {
  BarChart3,
  TrendingUp,
  Palette,
  Building2,
  Code,
  Bug,
  Server,
  Bot,
};

export default function AIAgentCard({ agent }: AIAgentCardProps) {
  const IconComponent = iconMap[agent.icon as keyof typeof iconMap];

  return (
    <motion.div
      className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
      
      {/* Icon */}
      <div className={`w-12 h-12 bg-gradient-to-br ${agent.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
          {agent.name}
        </h3>
        <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-300 transition-colors duration-300">
          {agent.description}
        </p>
        
        {/* Arrow Icon */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 uppercase tracking-wider">
            {agent.category}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
    </motion.div>
  );
}