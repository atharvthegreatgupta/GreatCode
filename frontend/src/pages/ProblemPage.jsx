import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import Editorial from "../components/Editorial";
import ChatAi from '../components/ChatAi';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

// Helper: Securely decodes Base64 API responses
const safeDecode = (str) => {
  if (!str) return '';
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    return str; // Return as-is if it wasn't Base64 encoded
  }
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
        setProblem(response.data);
        setCode(initialCode);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setRunResult(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, error: 'Internal server error' });
    } finally {
      setLoading(false);
      setActiveRightTab('testcase'); // Safely switch tabs AFTER the request completes
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({ accepted: false, error: 'Internal server error' });
    } finally {
      setLoading(false);
      setActiveRightTab('result'); // Safely switch tabs AFTER the request completes
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'hard': return 'bg-rose-100 text-rose-700 border border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-violet-200 via-fuchsia-100 to-cyan-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
        active 
          ? 'bg-white text-primary shadow-sm ring-1 ring-slate-100' 
          : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
      }`}
    >
      {children}
    </button>
  );

  const allTestsPassed = runResult?.testCases ? runResult.testCases.every(tc => tc.status_id === 3) : false;

  return (
    <div className="h-screen flex p-4 gap-4 bg-gradient-to-br from-violet-200 via-fuchsia-100 to-cyan-200 font-sans overflow-hidden">
      
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        
        <div className="flex p-3 gap-2 bg-white/40 border-b border-white/50 backdrop-blur-md z-10 shrink-0">
          <TabButton active={activeLeftTab === 'description'} onClick={() => setActiveLeftTab('description')}>Description</TabButton>
          <TabButton active={activeLeftTab === 'editorial'} onClick={() => setActiveLeftTab('editorial')}>Editorial</TabButton>
          <TabButton active={activeLeftTab === 'solutions'} onClick={() => setActiveLeftTab('solutions')}>Solutions</TabButton>
          <TabButton active={activeLeftTab === 'submissions'} onClick={() => setActiveLeftTab('submissions')}>Submissions</TabButton>
          <TabButton active={activeLeftTab === 'chatAI'} onClick={() => setActiveLeftTab('chatAI')}>ChatAI 🤖</TabButton>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar min-h-0">
          {problem && (
            <div className="animate-fadeIn">
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-slate-200/60">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{problem.title}</h1>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getDifficultyBadge(problem.difficulty)}`}>
                      {problem.difficulty ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1) : ''}
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                      {problem.tags}
                    </div>
                  </div>

                  <div className="prose max-w-none prose-slate text-slate-700">
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-5">Examples:</h3>
                    <div className="space-y-5">
                      {problem.visibleTestCases?.map((example, index) => (
                        <div key={index} className="bg-white/60 border border-slate-100/50 p-6 rounded-2xl shadow-sm">
                          <h4 className="font-bold text-slate-700 mb-3">Example {index + 1}:</h4>
                          <div className="space-y-3 text-[14px] font-mono text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div><strong className="text-slate-800">Input:</strong> <span className="text-indigo-600">{example.input}</span></div>
                            <div><strong className="text-slate-800">Output:</strong> <span className="text-emerald-600">{example.output}</span></div>
                            {example.explanation && (
                              <div className="pt-2 border-t border-slate-200 mt-2">
                                <strong className="text-slate-800 font-sans">Explanation:</strong> 
                                <span className="font-sans text-slate-600 ml-2">{example.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Editorial</h2>
                  {problem.secureUrl ? (
                    <div className="bg-white/60 p-2 rounded-2xl shadow-sm border border-slate-100">
                      <Editorial 
                        secureUrl={problem.secureUrl} 
                        thumbnailUrl={problem.thumbnailUrl} 
                        duration={problem.duration} 
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-80 w-full bg-white/50 rounded-3xl border-2 border-dashed border-slate-300">
                      <div className="text-4xl mb-4">🚀</div>
                      <p className="text-slate-700 font-bold text-xl">Editorial Coming Soon</p>
                      <p className="text-slate-500 text-sm mt-2">Stay tuned for the video solution.</p>
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                          <h3 className="font-bold text-slate-700">{problem?.title}</h3>
                          <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-600 border border-slate-200">{solution?.language}</span>
                        </div>
                        <div className="p-0">
                          <pre className="bg-[#1e1e1e] text-slate-300 p-5 text-[14px] overflow-x-auto m-0">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center p-12 bg-white/50 rounded-3xl border border-slate-200 border-dashed">
                        <p className="text-slate-500 font-medium">Solutions will be unlocked after you solve the problem.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 mb-6">My Submissions</h2>
                  <div className="bg-white/60 rounded-2xl p-4 shadow-sm border border-slate-100">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">Chat with AI</span>
                    ✨
                  </h2>
                  <div className="bg-white/60 rounded-3xl shadow-sm border border-slate-100 p-2">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        
        <div className="flex p-3 gap-2 bg-white/40 border-b border-white/50 backdrop-blur-md z-10 shrink-0">
          <TabButton active={activeRightTab === 'code'} onClick={() => setActiveRightTab('code')}>Code Editor</TabButton>
          <TabButton active={activeRightTab === 'testcase'} onClick={() => setActiveRightTab('testcase')}>Testcases</TabButton>
          <TabButton active={activeRightTab === 'result'} onClick={() => setActiveRightTab('result')}>Results</TabButton>
        </div>

        <div className="flex-1 flex flex-col relative bg-slate-50/50 min-h-0">
          
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col h-full absolute inset-0">
              <div className="flex justify-between items-center p-3 px-5 bg-white border-b border-slate-200">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                        selectedLanguage === lang 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 pb-0 bg-slate-50/50">
                <div className="w-full h-full rounded-t-2xl overflow-hidden shadow-inner border border-slate-200 border-b-0 bg-[#1e1e1e]">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 16 },
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      roundedSelection: true,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-10 shrink-0">
                <button 
                  className="btn btn-ghost hover:bg-slate-100 rounded-xl text-slate-600 font-bold px-6"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Console
                </button>
                <div className="flex gap-3">
                  <button
                    className={`btn bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-xl font-bold px-8 shadow-sm ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    Run Code
                  </button>
                  <button
                    className={`btn btn-primary rounded-xl font-bold px-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar min-h-0 animate-fadeIn">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-6">Test Results</h3>
              
              {runResult ? (
                <div className={`p-6 rounded-3xl shadow-sm border ${allTestsPassed ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-full ${allTestsPassed ? 'bg-emerald-200' : 'bg-rose-200'}`}>
                      {allTestsPassed ? '✅' : '❌'}
                    </div>
                    <div>
                      <h4 className={`text-xl font-extrabold ${allTestsPassed ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {allTestsPassed ? 'All test cases passed!' : 'Some test cases failed'}
                      </h4>
                      {runResult.runtime && (
                        <div className="flex gap-4 mt-1 text-sm font-bold text-emerald-700/80">
                          <span>⏱️ {runResult.runtime} sec</span>
                          <span>💾 {runResult.memory} KB</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {runResult.testCases?.map((tc, i) => (
                      <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/50">
                        <div className="font-mono text-sm space-y-3">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <strong className="text-slate-800 font-sans block mb-1">Input:</strong> 
                            <span className="text-slate-600 break-all whitespace-pre-wrap">{safeDecode(tc.stdin)}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <strong className="text-slate-800 font-sans block mb-1">Expected Output:</strong> 
                            <span className="text-slate-600 break-all whitespace-pre-wrap">{safeDecode(tc.expected_output)}</span>
                          </div>
                          <div className={`p-3 rounded-lg border ${tc.status_id === 3 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                            <strong className="text-slate-800 font-sans block mb-1">Your Output:</strong> 
                            <span className="text-slate-600 break-all whitespace-pre-wrap">{safeDecode(tc.stdout) || safeDecode(tc.stderr) || safeDecode(tc.compile_output)}</span>
                          </div>
                          <div className={`font-bold font-sans mt-3 flex items-center gap-1 ${tc.status_id === 3 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tc.status_id === 3 ? '✓ Test Passed' : '✗ Test Failed'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="text-4xl mb-4">🧪</div>
                  <p className="text-slate-600 font-bold text-lg">Ready to test</p>
                  <p className="text-slate-400 text-sm mt-1">Click "Run Code" to evaluate the example test cases.</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar min-h-0 animate-fadeIn">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-6">Submission Result</h3>
              
              {submitResult ? (
                <div className={`p-8 rounded-3xl shadow-sm border text-center ${submitResult.accepted ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/50 border-emerald-200' : 'bg-gradient-to-b from-rose-50 to-rose-100/50 border-rose-200'}`}>
                  <div className="text-6xl mb-4">{submitResult.accepted ? '🎉' : '💔'}</div>
                  
                  <h4 className={`text-3xl font-extrabold mb-6 ${submitResult.accepted ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {submitResult.accepted 
                      ? 'Accepted!' 
                      : (typeof submitResult.error === 'string' ? submitResult.error : 'Submission Failed')}
                  </h4>
                  
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex-1 min-w-[140px]">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Test Cases</p>
                      <p className={`text-2xl font-extrabold ${submitResult.accepted ? 'text-slate-700' : 'text-rose-600'}`}>
                        {submitResult.passedTestCases ?? 0} <span className="text-slate-400 text-lg">/ {submitResult.totalTestCases ?? 0}</span>
                      </p>
                    </div>
                    {submitResult.accepted && (
                      <>
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex-1 min-w-[140px]">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Runtime</p>
                          <p className="text-2xl font-extrabold text-slate-700">{submitResult.runtime}<span className="text-sm font-semibold ml-1">sec</span></p>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex-1 min-w-[140px]">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Memory</p>
                          <p className="text-2xl font-extrabold text-slate-700">{submitResult.memory}<span className="text-sm font-semibold ml-1">KB</span></p>
                        </div>
                      </>
                    )}
                  </div>

                  {!submitResult.accepted && (submitResult.compile_output || submitResult.stderr || (submitResult.error && typeof submitResult.error !== 'string')) && (
                    <div className="mt-6 text-left bg-white p-5 rounded-2xl border border-rose-100 shadow-sm max-h-64 overflow-y-auto custom-scrollbar">
                      <strong className="text-rose-800 text-sm mb-2 block font-sans">Error Details / Output:</strong>
                      <pre className="text-[13px] text-rose-600 font-mono whitespace-pre-wrap break-words">
                        {safeDecode(submitResult.compile_output || submitResult.stderr || (typeof submitResult.error === 'object' ? JSON.stringify(submitResult.error, null, 2) : ''))}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="text-4xl mb-4">🏆</div>
                  <p className="text-slate-600 font-bold text-lg">Awaiting Submission</p>
                  <p className="text-slate-400 text-sm mt-1">Submit your code to see how it performs against all test cases.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
};

export default ProblemPage;