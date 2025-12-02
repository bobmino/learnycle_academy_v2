import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Landing Page
 * Marketing page for prospects with CTA
 */
const Landing = () => {
  const { t } = useTranslation();

  const caseStudies = [
    {
      title: t('modules.cafe'),
      description: 'Complete management system for a modern café',
      icon: '☕',
      color: 'from-amber-400 to-amber-600'
    },
    {
      title: t('modules.restaurant'),
      description: 'Restaurant reservation and table management',
      icon: '🍽️',
      color: 'from-red-400 to-red-600'
    },
    {
      title: t('modules.hotel'),
      description: 'Hotel booking and room management system',
      icon: '🏨',
      color: 'from-blue-400 to-blue-600'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            {t('landing.hero')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            {t('landing.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
              {t('landing.cta')}
            </Link>
            <Link to="/prospect-form" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors text-lg">
              {t('prospect.title')}
            </Link>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t('landing.caseStudies')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className="dashboard-card group cursor-pointer"
              >
                <div className={`text-6xl mb-4 bg-gradient-to-br ${study.color} w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {study.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {study.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {study.description}
                </p>
                <Link to="/modules" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t('landing.howItWorks')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600 dark:text-primary-400">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-300">Create your account and choose your learning path</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600 dark:text-primary-400">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Learn & Build</h3>
              <p className="text-gray-600 dark:text-gray-300">Follow structured lessons with real-world projects</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600 dark:text-primary-400">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Master Skills</h3>
              <p className="text-gray-600 dark:text-gray-300">Complete quizzes and track your progress</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
