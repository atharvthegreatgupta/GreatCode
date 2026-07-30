import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        // Using your exact backend route
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        
        if (Array.isArray(response.data)) {
          setSubmissions(response.data);
        } else {
          setSubmissions([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  // Upgraded custom pastel badges instead of DaisyUI
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'wrong': return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'error': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'pending': return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return '-';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl shadow-sm flex items-center gap-3 my-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-bold">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Removed the <h2> tag here because your ProblemPage already has one right above this component! */}
      
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-500">
          <div className="text-4xl mb-3">👻</div>
          <p className="font-bold text-lg text-slate-600">No submissions found for this problem</p>
          <p className="text-sm mt-1">Submit your code to see your history here.</p>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-100 bg-white">
            <table className="table w-full text-left border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="font-bold py-4 px-6 rounded-tl-2xl">#</th>
                  <th className="font-bold py-4 px-4">Language</th>
                  <th className="font-bold py-4 px-4">Status</th>
                  <th className="font-bold py-4 px-4">Runtime</th>
                  <th className="font-bold py-4 px-4">Memory</th>
                  <th className="font-bold py-4 px-4 whitespace-nowrap">Test Cases</th>
                  <th className="font-bold py-4 px-4">Submitted</th>
                  <th className="font-bold py-4 px-6 text-center rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="text-slate-600 text-sm">
                {submissions.map((sub, index) => (
                  <tr key={sub._id || index} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="font-bold text-slate-400 px-6 py-4">{submissions.length - index}</td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                        {sub.language}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap ${getStatusColor(sub.status)}`}>
                        {sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="font-mono px-4 py-4">{sub.runtime ? `${sub.runtime}sec` : '-'}</td>
                    <td className="font-mono px-4 py-4 whitespace-nowrap">{formatMemory(sub.memory)}</td>
                    <td className="font-mono px-4 py-4 text-center">
                      {sub.testCasesPassed ?? '-'}/{sub.testCasesTotal ?? '-'}
                    </td>
                    <td className="px-4 py-4 text-slate-500 whitespace-nowrap">{formatDate(sub.createdAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        className="btn btn-sm rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:border-slate-300 shadow-sm transition-all"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                        Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm font-bold text-slate-400 px-2 text-right">
            Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Upgraded Code View Modal - Using custom Tailwind instead of DaisyUI modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-2xl text-slate-800">
                Submission Details
              </h3>
              <button 
                className="btn btn-circle btn-ghost btn-sm hover:bg-slate-200 text-slate-500"
                onClick={() => setSelectedSubmission(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status ? selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1) : 'Unknown'}
                </span>
                <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-indigo-600 shadow-sm">
                  {selectedSubmission.language}
                </span>
                <span className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm">
                  ⏱️ {selectedSubmission.runtime ? `${selectedSubmission.runtime}sec` : '-'}
                </span>
                <span className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm">
                  💾 {formatMemory(selectedSubmission.memory)}
                </span>
                <span className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm">
                  🧪 Passed: {selectedSubmission.testCasesPassed ?? '-'}/{selectedSubmission.testCasesTotal ?? '-'}
                </span>
              </div>
              
              {selectedSubmission.errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl mb-6 shadow-sm">
                  <strong className="text-rose-800 text-sm mb-1 block font-sans">Error Output:</strong>
                  <pre className="text-rose-600 font-mono text-sm whitespace-pre-wrap break-words">
                    {selectedSubmission.errorMessage}
                  </pre>
                </div>
              )}
              
              <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-inner bg-[#1e1e1e]">
                <div className="bg-slate-800 px-4 py-2 flex items-center">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="ml-4 text-xs font-bold text-slate-400">code.{selectedSubmission.language?.toLowerCase() === 'c++' ? 'cpp' : selectedSubmission.language?.toLowerCase() === 'java' ? 'java' : 'js'}</span>
                </div>
                <pre className="p-6 text-slate-300 font-mono text-[14px] overflow-x-auto leading-relaxed">
                  <code>{selectedSubmission.code}</code>
                </pre>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 text-right">
              <button 
                className="btn btn-primary rounded-xl font-bold px-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;