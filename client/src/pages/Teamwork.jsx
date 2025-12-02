import { useTranslation } from 'react-i18next';

/**
 * Teamwork Page
 * Git basics and collaboration workflow
 */
const Teamwork = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        {t('nav.teamwork')}
      </h1>

      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Git Basics Tutorial
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300">
            Learn how to collaborate effectively with your team using Git version control.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Branching */}
        <div className="card">
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
            🌿 Creating Branches
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 mb-3">
            <code className="text-green-400 text-sm">
              git checkout -b feature/my-feature
            </code>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Create a new branch for each feature or task. This keeps your work isolated and organized.
          </p>
        </div>

        {/* Committing */}
        <div className="card">
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
            💾 Making Commits
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 mb-3 space-y-2">
            <code className="block text-green-400 text-sm">git add .</code>
            <code className="block text-green-400 text-sm">git commit -m "Add feature X"</code>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Stage your changes and commit them with a clear, descriptive message.
          </p>
        </div>

        {/* Pushing */}
        <div className="card">
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
            ⬆️ Pushing Changes
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 mb-3">
            <code className="text-green-400 text-sm">
              git push origin feature/my-feature
            </code>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Push your branch to the remote repository so others can see your work.
          </p>
        </div>

        {/* Pull Requests */}
        <div className="card">
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
            🔄 Pull Requests
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>1. Push your branch to GitHub</p>
            <p>2. Open a Pull Request</p>
            <p>3. Request team review</p>
            <p>4. Address feedback</p>
            <p>5. Merge when approved</p>
          </div>
        </div>

        {/* Merging */}
        <div className="card">
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
            🔀 Merging
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 mb-3 space-y-2">
            <code className="block text-green-400 text-sm">git checkout main</code>
            <code className="block text-green-400 text-sm">git merge feature/my-feature</code>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Merge your feature branch into the main branch after review.
          </p>
        </div>

        {/* Conflicts */}
        <div className="card">
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
            ⚠️ Resolving Conflicts
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>1. Pull latest changes: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">git pull</code></p>
            <p>2. Open conflicting files</p>
            <p>3. Resolve conflicts manually</p>
            <p>4. Stage resolved files</p>
            <p>5. Commit the merge</p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="card mt-6">
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          ✨ Best Practices
        </h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Commit often with clear messages</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Pull the latest changes before starting new work</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Use descriptive branch names (e.g., feature/user-authentication)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Review your changes before committing</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Communicate with your team about ongoing work</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Keep pull requests focused on a single feature or fix</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Teamwork;
