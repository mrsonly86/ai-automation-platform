'use client';

import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <span className="text-white text-xl font-bold">Automation Platform</span>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a href="#dashboard" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="#integrations" className="text-slate-300 hover:text-white transition-colors">
              Tích hợp
            </a>
            <a href="#solutions" className="text-slate-300 hover:text-white transition-colors">
              Giải pháp
            </a>
            <a href="#deployment" className="text-slate-300 hover:text-white transition-colors">
              Triển khai
            </a>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
              Bắt đầu
            </button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            className="md:hidden mt-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4">
              <a href="#dashboard" className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="#integrations" className="text-slate-300 hover:text-white transition-colors">
                Tích hợp
              </a>
              <a href="#solutions" className="text-slate-300 hover:text-white transition-colors">
                Giải pháp
              </a>
              <a href="#deployment" className="text-slate-300 hover:text-white transition-colors">
                Triển khai
              </a>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-left">
                Bắt đầu
              </button>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}