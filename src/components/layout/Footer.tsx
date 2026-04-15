import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-lg font-bold mb-3">🎮 GlobalPlay360</h3>
            <p className="text-sm">
              Your global gaming marketplace. Buy, sell and discover games, consoles and accessories.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-white font-semibold mb-3">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace?category=games" className="hover:text-white transition-colors">Games</Link></li>
              <li><Link to="/marketplace?category=consoles" className="hover:text-white transition-colors">Consoles</Link></li>
              <li><Link to="/marketplace?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/marketplace?category=digital-keys" className="hover:text-white transition-colors">Digital Keys</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} GlobalPlay360. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
