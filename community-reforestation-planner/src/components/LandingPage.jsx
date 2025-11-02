import { motion } from 'framer-motion';
import { TreePine, MapPin, BarChart3, Users, ArrowRight, Sun, Moon, Droplets, Wind, Thermometer, Target, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage = ({ onAuth }) => {
  const { isDark, toggleTheme } = useTheme();

  const stats = [
    { number: "500K+", label: "Trees Planned" },
    { number: "1,200+", label: "Active Users" },
    { number: "85", label: "Cities Covered" },
    { number: "45%", label: "Avg. Air Quality Improvement" }
  ];

  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Smart Zone Mapping",
      description: "AI-powered GIS analysis identifies optimal planting locations based on environmental data."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Impact Analytics",
      description: "Track flood reduction, groundwater recharge, and air quality improvements in real-time."
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Water Management",
      description: "Optimize water resource allocation and monitor groundwater recharge potential."
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Enter Your Location",
      description: "Simply input your area of interest or drop a pin on the map."
    },
    {
      step: "02", 
      title: "AI Analysis",
      description: "Our system analyzes environmental data, soil quality, and climate patterns."
    },
    {
      step: "03",
      title: "Get Ranked Zones", 
      description: "Receive prioritized planting locations with detailed impact projections."
    },
    {
      step: "04",
      title: "Start Planting",
      description: "Organize campaigns, track progress, and see your environmental impact grow."
    }
  ];

  const handleExploreMap = () => {
    onAuth();
  };

  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const navHeight = 80; // Height of the fixed navigation
      const targetPosition = element.offsetTop - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <TreePine className="w-8 h-8 text-primary-600" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ReforestAI
          </span>
        </motion.div>

        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => smoothScrollTo('features')} 
            className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium"
          >
            Features
          </button>
          <button 
            onClick={() => smoothScrollTo('how-it-works')} 
            className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium"
          >
            How It Works
          </button>
          <button 
            onClick={() => smoothScrollTo('impact')} 
            className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium"
          >
            Impact
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <motion.button
            className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/login'}
          >
            Login
          </motion.button>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/signup'}
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section with Background */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&h=1080&fit=crop')",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Plant Smarter.
            <br />
            <span className="text-primary-400">Breathe Better.</span>
            <br />
            Heal the Earth.
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Discover high-impact zones for tree planting with AI-powered environmental analysis. Join communities worldwide in creating a greener, healthier planet.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.button
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExploreMap}
            >
              <span>Explore Map</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/signup'}
            >
              Sign Up Free
            </motion.button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          >
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 bg-white rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section
        className="py-16 bg-gray-900 dark:bg-gray-950"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Hero Section */}
      <motion.section
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Powerful Features for{' '}
            <span className="text-primary-600 dark:text-primary-400">
              Maximum Impact
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Advanced technology meets environmental action to help you make data-driven decisions.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(76, 175, 80, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExploreMap}
            >
              <span>Explore Map</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium px-8 py-4 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/signup'}
            >
              Sign Up Free
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        className="py-20 px-6 bg-gray-50 dark:bg-gray-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        id="how-it-works"
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-xl text-center text-gray-600 dark:text-gray-300 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Four simple steps to start making a real environmental impact.
          </motion.p>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-6xl font-bold text-gray-200 dark:text-gray-700 mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Impact Section */}
      <motion.section
        id="impact"
        className="py-20 px-6 bg-gray-50 dark:bg-gray-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop"
                  alt="Hands holding a young plant sapling"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Measure Your{' '}
                <span className="text-primary-600 dark:text-primary-400">
                  Environmental Impact
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Every tree planted through our platform contributes to measurable environmental improvements. Track your contribution to a healthier planet with real-time analytics.
              </p>

              {/* Impact Metrics */}
              <div className="space-y-4">
                <motion.div
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    Real-time carbon sequestration tracking
                  </span>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    Flood risk reduction metrics
                  </span>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    Groundwater recharge monitoring
                  </span>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    Air quality improvement analytics
                  </span>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    Biodiversity impact assessment
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.button
            className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/signup'}
          >
            Get Started Free
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <motion.div
                className="flex items-center space-x-2 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <TreePine className="w-8 h-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">ReforestAI</span>
              </motion.div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Empowering communities to heal the planet through intelligent reforestation.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">How It Works</a></li>
                <li><a href="#impact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Impact</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                © 2024 ReforestAI. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-gray-600 dark:text-gray-300 text-sm">Built with</span>
                <TreePine className="w-4 h-4 text-primary-600" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">for a greener tomorrow</span>
                <div className="bg-gray-800 text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
                  <span>e</span>
                  <span>Made with Emergent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
