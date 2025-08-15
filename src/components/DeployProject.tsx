import React from 'react';
import { Heart, ArrowLeft, Download, Code, Database, Server, Globe, Shield, Users, BookOpen, Terminal, Github, ExternalLink, CheckCircle, Clock, Star } from 'lucide-react';

const DeployProject: React.FC<{ onBackToLanding?: () => void }> = ({ onBackToLanding }) => {
  const deploymentSteps = [
    {
      step: 1,
      title: 'System Requirements',
      description: 'Ensure your system meets the minimum requirements',
      details: [
        'Node.js 18+ and npm 8+',
        'PostgreSQL 13+ or Supabase account',
        'Git for version control',
        'Modern web browser for testing'
      ]
    },
    {
      step: 2,
      title: 'Clone Repository',
      description: 'Get the latest source code from our repository',
      details: [
        'Fork or clone the Vitalita repository',
        'Navigate to project directory',
        'Install dependencies with npm install'
      ]
    },
    {
      step: 3,
      title: 'Environment Setup',
      description: 'Configure your environment variables and database',
      details: [
        'Copy .env.example to .env',
        'Set up Supabase project',
        'Configure database connection',
        'Set API keys and secrets'
      ]
    },
    {
      step: 4,
      title: 'Database Migration',
      description: 'Set up your database schema and initial data',
      details: [
        'Run database migrations',
        'Seed initial data',
        'Verify table structures',
        'Test database connections'
      ]
    },
    {
      step: 5,
      title: 'Build & Deploy',
      description: 'Build the application and deploy to your server',
      details: [
        'Build production version',
        'Configure web server (nginx/Apache)',
        'Set up SSL certificates',
        'Deploy to production server'
      ]
    }
  ];

  const quickStartCommands = [
    { command: 'git clone https://github.com/your-org/vitalita.git', description: 'Clone repository' },
    { command: 'cd vitalita', description: 'Navigate to project' },
    { command: 'npm install', description: 'Install dependencies' },
    { command: 'cp .env.example .env', description: 'Setup environment' },
    { command: 'npm run build', description: 'Build application' },
    { command: 'npm start', description: 'Start development server' }
  ];

  const resources = [
    {
      title: 'Documentation',
      description: 'Comprehensive setup and deployment guides',
      icon: <BookOpen className="w-6 h-6" />,
      link: '#',
      color: 'bg-blue-500'
    },
    {
      title: 'API Reference',
      description: 'Complete API documentation and examples',
      icon: <Code className="w-6 h-6" />,
      link: '#',
      color: 'bg-green-500'
    },
    {
      title: 'Database Schema',
      description: 'Database structure and migration files',
      icon: <Database className="w-6 h-6" />,
      link: '#',
      color: 'bg-purple-500'
    },
    {
      title: 'Support Forum',
      description: 'Community support and troubleshooting',
      icon: <Users className="w-6 h-6" />,
      link: '#',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToLanding}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-red-600" fill="#DC2626" />
                <h1 className="text-2xl font-bold text-gray-900">Deploy the Project</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-5 h-5" />
              <span>For Blood Donation Centers</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Deploy Vitalita for Your Blood Donation Center
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Get your own instance of the Vitalita blood donation management system up and running. 
            Follow our step-by-step deployment guide to set up a secure, AWS-compliant platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <Server className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Self-Hosted</h3>
              <p className="text-sm text-blue-100">Full control over your data and infrastructure</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <Shield className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AWS Compliant</h3>
              <p className="text-sm text-blue-100">Meet all blood donation center standards</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <Globe className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Customizable</h3>
              <p className="text-sm text-blue-100">Adapt the system to your specific needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Guide</h3>
            <p className="text-lg text-gray-600">
              Get up and running in minutes with these essential commands
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Essential Commands</h4>
              <div className="space-y-3">
                {quickStartCommands.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-gray-800 text-green-400 px-3 py-2 rounded font-mono">
                        {item.command}
                      </code>
                      <span className="text-sm text-gray-600">{item.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Node.js 18+ installed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">PostgreSQL or Supabase account</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Git for version control</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Basic command line knowledge</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Need Help?</h5>
                <p className="text-sm text-blue-800">
                  Our support team is available to help you with deployment. 
                  Contact us at support@vitalita.org
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Steps */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Detailed Deployment Steps</h3>
          <p className="text-lg text-gray-600">
            Follow these comprehensive steps to deploy Vitalita successfully
          </p>
        </div>
        
        <div className="space-y-8">
          {deploymentSteps.map((step) => (
            <div key={step.step} className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resources Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Additional Resources</h3>
          <p className="text-lg text-gray-600">
            Access comprehensive documentation and support materials
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 ${resource.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                {resource.icon}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              <a
                href={resource.link}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Access Resource
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Download Section */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
            <Download className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Deploy?
            </h3>
            <p className="text-gray-600 mb-6">
              Download the complete deployment package including source code, 
              documentation, and configuration templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </button>
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
                <Download className="w-5 h-5 mr-2" />
                Download Package
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Latest version: v2.1.0 • Updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-6 h-6 text-red-600" fill="#DC2626" />
            <span className="font-bold text-lg">Vitalita</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering blood donation centers with modern technology
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeployProject;
