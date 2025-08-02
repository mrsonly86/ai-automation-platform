'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Github, 
  Brain, 
  FileCode, 
  Server, 
  Settings, 
  Shield,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const deploymentSteps = [
  {
    id: '1',
    title: 'Đẩy lên GitHub',
    description: 'Upload code lên repository',
    icon: Github,
    status: 'completed' as const,
    progress: 100
  },
  {
    id: '2',
    title: 'AI phân tích',
    description: 'Phân tích code và dependencies',
    icon: Brain,
    status: 'completed' as const,
    progress: 100
  },
  {
    id: '3',
    title: 'Tạo Script tự động',
    description: 'Generate deployment scripts',
    icon: FileCode,
    status: 'in-progress' as const,
    progress: 65
  },
  {
    id: '4',
    title: 'Khởi tạo VPS',
    description: 'Setup virtual private server',
    icon: Server,
    status: 'pending' as const,
    progress: 0
  },
  {
    id: '5',
    title: 'Cài đặt môi trường',
    description: 'Install dependencies & configure',
    icon: Settings,
    status: 'pending' as const,
    progress: 0
  },
  {
    id: '6',
    title: 'Bảo mật & Triển khai',
    description: 'Security setup & deployment',
    icon: Shield,
    status: 'pending' as const,
    progress: 0
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'in-progress':
      return Clock;
    case 'failed':
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-400';
    case 'in-progress':
      return 'text-blue-400';
    case 'failed':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
};

export default function DeploymentProcess() {
  const [realTimeProgress, setRealTimeProgress] = useState(65);

  // Simulate real-time progress
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeProgress(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 2;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section 
      id="deployment"
      className="space-y-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">
          Quy trình triển khai tự động
        </h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          6 bước tự động từ code đến production
        </p>
      </div>

      {/* Real-time Progress Bar */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Luồng Xử lý Thời Gian Thực
          </h3>
          <span className="text-blue-400 font-medium">
            {Math.round(realTimeProgress)}%
          </span>
        </div>
        
        <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            style={{ width: `${realTimeProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${realTimeProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Animated glow effect */}
          <motion.div
            className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ left: `${Math.max(0, realTimeProgress - 20)}%` }}
            animate={{ 
              left: [`${Math.max(0, realTimeProgress - 20)}%`, `${Math.min(80, realTimeProgress)}%`] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
      </motion.div>

      {/* Deployment Steps */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 hidden md:block" />

        <div className="space-y-6">
          {deploymentSteps.map((step, index) => {
            const StatusIcon = getStatusIcon(step.status);
            const statusColor = getStatusColor(step.status);
            
            return (
              <motion.div
                key={step.id}
                className="relative flex items-start space-x-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                {/* Step Icon */}
                <div className={`
                  relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                  ${step.status === 'completed' 
                    ? 'bg-green-500/20 border-2 border-green-500' 
                    : step.status === 'in-progress'
                    ? 'bg-blue-500/20 border-2 border-blue-500'
                    : 'bg-slate-700/50 border-2 border-slate-600'
                  }
                `}>
                  <step.icon className={`w-5 h-5 ${statusColor}`} />
                </div>

                {/* Step Content */}
                <div className="flex-1 bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                    <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4">
                    {step.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className={statusColor}>{step.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`
                          h-full rounded-full
                          ${step.status === 'completed' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : step.status === 'in-progress'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                            : 'bg-slate-600'
                          }
                        `}
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 justify-center pt-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        viewport={{ once: true }}
      >
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium">
          Bắt đầu triển khai
        </button>
        <button className="border border-slate-600 text-slate-300 px-8 py-3 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all duration-300 font-medium">
          Xem chi tiết
        </button>
      </motion.div>
    </motion.section>
  );
}