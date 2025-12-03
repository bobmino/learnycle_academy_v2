import { useState } from 'react';
import { quizService } from '../services/api';

/**
 * EmbeddedQuiz Component
 * Displays a quiz inline within lesson content
 */
const EmbeddedQuiz = ({ quiz, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnswerChange = (questionIndex, optionIndex) => {
    if (submitted) return; // Prevent changes after submission
    
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = async () => {
    if (submitted) return;

    // Check if all questions are answered
    const allAnswered = quiz.questions.every((_, index) => answers[index] !== undefined);
    if (!allAnswered) {
      alert('Veuillez répondre à toutes les questions');
      return;
    }

    setLoading(true);
    try {
      // Calculate score
      let correctCount = 0;
      const answerDetails = quiz.questions.map((question, qIndex) => {
        const selectedOptionIndex = answers[qIndex];
        const isCorrect = question.options[selectedOptionIndex]?.isCorrect || false;
        if (isCorrect) correctCount++;
        
        return {
          questionId: question._id || qIndex,
          selectedOptionIndex,
          isCorrect
        };
      });

      const score = Math.round((correctCount / quiz.questions.length) * 100);

      // Submit quiz result
      try {
        await quizService.submit({
          quizId: quiz._id,
          moduleId: quiz.module,
          answers: answerDetails,
          score
        });
      } catch (error) {
        console.error('Error submitting quiz result:', error);
        // Continue even if submission fails
      }

      setResult({
        score,
        correctCount,
        totalQuestions: quiz.questions.length,
        answers: answerDetails
      });
      setSubmitted(true);

      if (onComplete) {
        onComplete(score);
      }
    } catch (error) {
      console.error('Error processing quiz:', error);
      alert('Erreur lors de la soumission du quiz');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="my-6 p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {quiz.title}
        </h3>
        {quiz.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {quiz.description}
          </p>
        )}
      </div>

      {!submitted ? (
        <>
          <div className="space-y-6">
            {quiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {qIndex + 1}. {question.questionText}
                </p>
                <div className="space-y-2 ml-4">
                  {question.options.map((option, oIndex) => (
                    <label
                      key={oIndex}
                      className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                        answers[qIndex] === oIndex
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={oIndex}
                        checked={answers[qIndex] === oIndex}
                        onChange={() => handleAnswerChange(qIndex, oIndex)}
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Soumission...' : 'Soumettre'}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className={`text-center p-4 rounded-lg ${getScoreColor(result.score)}`}>
            <p className="text-2xl font-bold">
              Score: {result.score}%
            </p>
            <p className="text-sm mt-1">
              {result.correctCount} / {result.totalQuestions} réponses correctes
            </p>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, qIndex) => {
              const selectedIndex = result.answers[qIndex].selectedOptionIndex;
              const isCorrect = result.answers[qIndex].isCorrect;
              
              return (
                <div
                  key={qIndex}
                  className={`p-3 rounded ${
                    isCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white mb-2">
                    {qIndex + 1}. {question.questionText}
                  </p>
                  <div className="space-y-1 ml-4">
                    {question.options.map((option, oIndex) => {
                      const isSelected = selectedIndex === oIndex;
                      const isCorrectOption = option.isCorrect;
                      
                      return (
                        <div
                          key={oIndex}
                          className={`p-2 rounded ${
                            isSelected && isCorrectOption
                              ? 'bg-green-200 dark:bg-green-800'
                              : isSelected && !isCorrectOption
                              ? 'bg-red-200 dark:bg-red-800'
                              : isCorrectOption && !isSelected
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-white dark:bg-gray-700'
                          }`}
                        >
                          <span className="text-gray-900 dark:text-white">
                            {option.text}
                            {isSelected && ' (Votre réponse)'}
                            {isCorrectOption && !isSelected && ' (Bonne réponse)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbeddedQuiz;

