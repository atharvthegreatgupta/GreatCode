{/* Result Tab Styling */}
          {activeRightTab === 'result' && (
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar min-h-0 animate-fadeIn">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-6">Submission Result</h3>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white/50 rounded-3xl border border-slate-100">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="mt-4 font-bold text-slate-600">Evaluating submission...</p>
                </div>
              ) : submitResult ? (
                <div className={`p-8 rounded-3xl shadow-sm border text-center ${submitResult.accepted ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/50 border-emerald-200' : 'bg-gradient-to-b from-rose-50 to-rose-100/50 border-rose-200'}`}>
                  <div className="text-6xl mb-4">{submitResult.accepted ? '🎉' : '💔'}</div>
                  
                  {/* Upgraded Error Title Handling */}
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

                  {/* New: Bulletproof Error Log Display */}
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