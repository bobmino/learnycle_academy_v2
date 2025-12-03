import { Link } from 'react-router-dom';

/**
 * Breadcrumbs Component
 * Navigation breadcrumb trail
 */
const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {item.to ? (
              <Link
                to={item.to}
                className={`ml-1 text-sm font-medium ${
                  index === items.length - 1
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-purple-600 dark:text-purple-400 hover:underline'
                } md:ml-2`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

