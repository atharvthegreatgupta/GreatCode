import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); 
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      solvedProblems.some(sp => sp._id === problem._id);
    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    /* Upgraded Background: Matching the vibrant gradient from auth pages */
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-fuchsia-100 to-cyan-200 font-sans pb-12">
      
      {/* Upgraded Navbar: Glassmorphism effect, clean typography */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-sm px-6 py-2">
        <div className="navbar container mx-auto p-0">
          <div className="flex-1">
            <NavLink to="/" className="text-2xl font-extrabold text-slate-800 tracking-tight hover:opacity-80 transition-opacity">
              GreatCode
            </NavLink>
          </div>
          <div className="flex-none gap-4">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="btn btn-ghost rounded-full px-6 bg-white/50 border border-white shadow-sm hover:bg-white text-slate-700 font-semibold transition-all">
                {user?.firstName || 'Guest'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
              <ul className="mt-3 p-2 shadow-2xl menu menu-sm dropdown-content bg-white rounded-2xl w-52 border border-slate-100">
                {user?.role === 'admin' && (
                  <li>
                    <NavLink to="/admin" className="hover:bg-slate-50 text-slate-700 font-medium rounded-xl py-2">
                      Admin Dashboard
                    </NavLink>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout} className="hover:bg-rose-50 text-rose-600 font-medium rounded-xl py-2">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 mt-8 max-w-7xl">
        
        {/* Upgraded Filters: A sleek "command center" bar */}
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 mb-8 flex flex-wrap gap-4 items-center">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mr-2 hidden md:block">Filters</div>
          
          <select 
            className="select w-full md:w-auto flex-1 rounded-xl bg-white/80 text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-slate-200 transition-colors"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select 
            className="select w-full md:w-auto flex-1 rounded-xl bg-white/80 text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-slate-200 transition-colors"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select 
            className="select w-full md:w-auto flex-1 rounded-xl bg-white/80 text-slate-700 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-slate-200 transition-colors"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">All Topics</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">Dynamic Programming</option>
          </select>
        </div>

        {/* Upgraded Problems List: Responsive grid with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map(problem => (
            <div key={problem._id} className="card bg-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-3xl border border-white/80 backdrop-blur-sm group">
              <div className="card-body p-6">
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="card-title text-xl font-bold">
                    <NavLink to={`/problem/${problem._id}`} className="text-slate-800 hover:text-primary transition-colors line-clamp-2">
                      {problem.title}
                    </NavLink>
                  </h2>
                  {solvedProblems.some(sp => sp._id === problem._id) && (
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Solved
                    </div>
                  )}
                </div>
                
                <div className="mt-auto flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getDifficultyBadgeColor(problem.difficulty)}`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 shadow-sm">
                    {problem.tags}
                  </span>
                </div>

              </div>
            </div>
          ))}
          
          {/* Empty State in case filters hide everything */}
          {filteredProblems.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white/50 rounded-3xl border border-white/50 border-dashed">
              <p className="text-lg font-medium text-slate-500">No problems found matching your filters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Upgraded Difficulty Colors: Custom pastel styling instead of basic alerts
const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'hard': return 'bg-rose-100 text-rose-700 border border-rose-200';
    default: return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

export default Homepage;