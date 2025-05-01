import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const jobRoles = [
  "Software Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "Frontend Developer",
  "Backend Developer",
  "Cloud Engineer",
];

const difficultyLevels = ["Easy", "Medium", "Hard"];

export default function Practice() {
  const [selectedRole, setSelectedRole] = useState(jobRoles[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficultyLevels[0]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("generator");
  const navigate = useNavigate();

  const GEMINI_API = "AIzaSyA_0X3rlGJASgHYTVoIhu-DM_UOft2NpcY";

  const fetchQuestions = async () => {
    const gptQuery = `Generate exactly ${numQuestions} unique interview questions for the role of ${selectedRole} at the ${selectedDifficulty} difficulty level. 
Ensure that each question is clearly numbered and formatted as a list. 
Separate each question with a newline character (\n).`;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API}`,
        {
          contents: [{ parts: [{ text: gptQuery }] }],
        }
      );

      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanedQuestions = generatedText.split("\n").map((q) => q.trim()).filter(q => q);

      if (cleanedQuestions.length === 0) throw new Error("No questions received. Try again.");

      setQuestions(cleanedQuestions);
      setShowAnswers({});
      setActiveTab("questions");
      fetchAnswers(cleanedQuestions);
    } catch (err) {
      setError(err.message || "Failed to fetch questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (questions) => {
    const answerQuery = `Provide a brief but informative answer to each of the following interview questions:\n${questions.join("\n")}`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API}`,
        {
          contents: [{ parts: [{ text: answerQuery }] }],
        }
      );

      const generatedAnswers = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setAnswers(generatedAnswers.split("\n").map((a) => a.trim()).filter(a => a));
    } catch {
      setAnswers([]);
    }
  };

  const toggleAnswer = (index) => {
    setShowAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-md py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                </svg>
                Back
              </button>
              <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">InterviewPrep AI</h1>
            </div>
            <nav className="hidden md:flex space-x-4">
              <button 
                onClick={() => setActiveTab("generator")} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "generator" ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Generator
              </button>
              <button 
                onClick={() => setActiveTab("questions")} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "questions" ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
                disabled={!questions.length}
              >
                Questions
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile Tabs */}
        <div className="md:hidden mb-6">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                activeTab === "generator" ? "bg-white shadow-sm text-blue-700" : "text-gray-600"
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                activeTab === "questions" ? "bg-white shadow-sm text-blue-700" : "text-gray-600"
              }`}
              disabled={!questions.length}
            >
              Questions
            </button>
          </div>
        </div>

        {activeTab === "generator" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">Prepare for your tech interview</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Generate custom interview questions tailored to your target role and difficulty level.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div className="grid  grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Job Role</label>
                      <div className="relative">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="block w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 px-4 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {jobRoles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                      <div className="flex rounded-lg bg-gray-100 p-1">
                        {difficultyLevels.map((level) => (
                          <button
                            key={level}
                            onClick={() => setSelectedDifficulty(level)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md ${
                              selectedDifficulty === level
                                ? "bg-white shadow-sm text-blue-700"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Number of Questions</label>
                      <div className="flex items-center">
                        <button
                          onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))}
                          className="rounded-l-lg border border-gray-300 bg-gray-50 px-3 py-3 text-gray-500 hover:bg-gray-100"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-16 border-y border-gray-300 py-3 text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => setNumQuestions(Math.min(10, numQuestions + 1))}
                          className="rounded-r-lg border border-gray-300 bg-gray-50 px-3 py-3 text-gray-500 hover:bg-gray-100"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={fetchQuestions}
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        Generate Questions
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "questions" && questions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Interview Questions</h2>
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium text-blue-600">{selectedRole}</span>
                <span className="mx-2">•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedDifficulty === "Easy" ? "bg-green-100 text-green-800" :
                  selectedDifficulty === "Medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {selectedDifficulty}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-600 font-bold rounded-full h-8 w-8 flex items-center justify-center mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{q}</h3>
                        
                        <button 
                          onClick={() => toggleAnswer(index)} 
                          className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {showAnswers[index] ? (
                            <>
                              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                              Hide suggested answer
                            </>
                          ) : (
                            <>
                              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                              View suggested answer
                            </>
                          )}
                        </button>
                        
                        {showAnswers[index] && (
                          <div className="mt-3 rounded-lg bg-gray-50 p-4 border border-gray-100">
                            <p className="text-gray-700">{answers[index] || "Answer not available."}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setActiveTab("generator")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                </svg>
                Back to Generator
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">Powered by AI to help you ace your next technical interview</p>
        </div>
      </footer>
    </div>
  );
}