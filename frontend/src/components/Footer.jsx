import { Link } from 'react-router-dom';
import { Search, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">Find<span className="text-primary-400">Back</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              An intelligent lost and found system that uses smart matching to reconnect people with their belongings — securely and efficiently.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse" className="hover:text-white transition-colors">Browse Items</Link></li>
              <li><Link to="/report" className="hover:text-white transition-colors">Report Lost Item</Link></li>
              <li><Link to="/report" className="hover:text-white transition-colors">Report Found Item</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              <li><Link to="/matches" className="hover:text-white transition-colors">My Matches</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} FindBack. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="mailto:help@findback.io" className="text-slate-500 hover:text-slate-300 transition-colors"><Mail className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
