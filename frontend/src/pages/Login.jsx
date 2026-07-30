import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-200 via-fuchsia-100 to-cyan-200">
      
      <div className="card w-full max-w-md bg-white shadow-2xl rounded-3xl border border-white/50 backdrop-blur-sm">
        <div className="card-body p-8"> 
          
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">GreatCode</h2>
            <p className="text-sm text-slate-500">Welcome back! Please enter your details.</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-semibold text-slate-700">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered w-full rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white transition-colors duration-200 ${errors.emailId ? 'input-error focus:ring-error' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`} 
                {...register('emailId')}
              />
              {errors.emailId && (
                <span className="text-error text-sm mt-1.5 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {errors.emailId.message}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-semibold text-slate-700">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-10 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white transition-colors duration-200 ${errors.password ? 'input-error focus:ring-error' : 'focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-error text-sm mt-1.5 font-medium flex items-center gap-1">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="form-control mt-8">
              <button
                type="submit"
                className={`btn btn-primary w-full rounded-xl text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${loading ? 'loading btn-disabled' : ''}`} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Logging in...
                  </>
                ) : 'Log In'}
              </button>
            </div>
          </form>

          <div className="text-center mt-8">
            <span className="text-sm text-slate-600">
              Don't have an account?{' '} 
              <NavLink to="/signup" className="link link-primary font-bold hover:text-primary-focus transition-colors">
                Sign Up
              </NavLink>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;