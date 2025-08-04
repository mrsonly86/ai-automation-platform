import { Request, Response } from 'express';

interface AIAgent {
  id: string;
  name: {
    vi: string;
    en: string;
  };
  description: {
    vi: string;
    en: string;
  };
  icon: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'maintenance';
}

const aiAgents: AIAgent[] = [
  {
    id: 'data-analyst',
    name: {
      vi: 'Data Analyst AI',
      en: 'Data Analyst AI'
    },
    description: {
      vi: 'Phân tích dữ liệu và tạo báo cáo thông minh',
      en: 'Analyzes data and creates intelligent reports'
    },
    icon: '📊',
    capabilities: ['data-analysis', 'reporting', 'visualization', 'predictions'],
    status: 'active'
  },
  {
    id: 'content-creator',
    name: {
      vi: 'Content Creator AI',
      en: 'Content Creator AI'
    },
    description: {
      vi: 'Tạo nội dung đa phương tiện chất lượng cao',
      en: 'Creates high-quality multimedia content'
    },
    icon: '✍️',
    capabilities: ['content-generation', 'copywriting', 'translation', 'editing'],
    status: 'active'
  },
  {
    id: 'customer-service',
    name: {
      vi: 'Customer Service AI',
      en: 'Customer Service AI'
    },
    description: {
      vi: 'Hỗ trợ khách hàng 24/7 với AI thông minh',
      en: '24/7 customer support with intelligent AI'
    },
    icon: '🎧',
    capabilities: ['chat-support', 'ticket-management', 'sentiment-analysis', 'escalation'],
    status: 'active'
  },
  {
    id: 'sales-assistant',
    name: {
      vi: 'Sales Assistant AI',
      en: 'Sales Assistant AI'
    },
    description: {
      vi: 'Hỗ trợ bán hàng và quản lý leads hiệu quả',
      en: 'Supports sales and manages leads effectively'
    },
    icon: '💼',
    capabilities: ['lead-qualification', 'pipeline-management', 'forecasting', 'crm-integration'],
    status: 'active'
  },
  {
    id: 'project-manager',
    name: {
      vi: 'Project Manager AI',
      en: 'Project Manager AI'
    },
    description: {
      vi: 'Quản lý dự án và phân bổ tài nguyên tối ưu',
      en: 'Manages projects and optimizes resource allocation'
    },
    icon: '📋',
    capabilities: ['task-scheduling', 'resource-allocation', 'risk-assessment', 'progress-tracking'],
    status: 'active'
  },
  {
    id: 'security-monitor',
    name: {
      vi: 'Security Monitor AI',
      en: 'Security Monitor AI'
    },
    description: {
      vi: 'Giám sát bảo mật và phát hiện mối đe dọa',
      en: 'Monitors security and detects threats'
    },
    icon: '🔐',
    capabilities: ['threat-detection', 'vulnerability-scanning', 'incident-response', 'compliance-monitoring'],
    status: 'active'
  },
  {
    id: 'quality-assurance',
    name: {
      vi: 'Quality Assurance AI',
      en: 'Quality Assurance AI'
    },
    description: {
      vi: 'Kiểm tra chất lượng sản phẩm tự động',
      en: 'Automated product quality testing'
    },
    icon: '✅',
    capabilities: ['automated-testing', 'bug-detection', 'performance-analysis', 'code-review'],
    status: 'active'
  },
  {
    id: 'system-optimizer',
    name: {
      vi: 'System Optimizer AI',
      en: 'System Optimizer AI'
    },
    description: {
      vi: 'Tối ưu hóa hiệu suất hệ thống và quy trình',
      en: 'Optimizes system performance and processes'
    },
    icon: '⚙️',
    capabilities: ['performance-optimization', 'resource-management', 'bottleneck-detection', 'scaling-recommendations'],
    status: 'active'
  }
];

export const getAIAgents = (req: Request, res: Response): void => {
  try {
    const language = req.query.lang as string || 'vi';
    
    const localizedAgents = aiAgents.map(agent => ({
      id: agent.id,
      name: agent.name[language as keyof typeof agent.name] || agent.name.vi,
      description: agent.description[language as keyof typeof agent.description] || agent.description.vi,
      icon: agent.icon,
      capabilities: agent.capabilities,
      status: agent.status
    }));

    res.status(200).json({
      success: true,
      data: localizedAgents,
      total: localizedAgents.length,
      message: language === 'vi' ? 'Lấy danh sách AI agents thành công' : 'Successfully retrieved AI agents list'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách AI agents',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAIAgentById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const language = req.query.lang as string || 'vi';
    
    const agent = aiAgents.find(a => a.id === id);
    
    if (!agent) {
      res.status(404).json({
        success: false,
        message: language === 'vi' ? 'Không tìm thấy AI agent' : 'AI agent not found'
      });
      return;
    }

    const localizedAgent = {
      id: agent.id,
      name: agent.name[language as keyof typeof agent.name] || agent.name.vi,
      description: agent.description[language as keyof typeof agent.description] || agent.description.vi,
      icon: agent.icon,
      capabilities: agent.capabilities,
      status: agent.status
    };

    res.status(200).json({
      success: true,
      data: localizedAgent,
      message: language === 'vi' ? 'Lấy thông tin AI agent thành công' : 'Successfully retrieved AI agent information'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin AI agent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};