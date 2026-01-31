import { useState } from 'react';
import { User as UserIcon, Lock, Mail, ArrowRight, AlertCircle, Shield, Phone, MapPin, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShipment } from '../../context/ShipmentContext';
import { Logo } from '../ui/Logo';

export function RegistrationPage() {
  const navigate = useNavigate();
  const { register } = useShipment();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill all required fields');
      return;
    }

    // Register user via context
    register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    });

    setSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };



  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-6 transition-colors duration-500">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 animate-scale-in">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Account Created!</h2>
            <p className="text-lg text-slate-600">Welcome to ShipFast! Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#d946ef] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 max-h-screen">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="text-white space-y-8 animate-fade-in-up">
          <div className="mb-6">
            <Logo className="text-white" />
          </div>
          
          <div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Join ShipFast Today
            </h2>
            <p className="text-xl text-indigo-100 leading-relaxed">
              Create your account and start shipping with India's fastest growing courier service.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Secure & Safe</h3>
                <p className="text-indigo-100 text-sm">Your data is encrypted and protected with industry-standard security</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Pan-India Coverage</h3>
                <p className="text-indigo-100 text-sm">Ship to 20,000+ pin codes across India with real-time tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 animate-slide-in-right max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block mb-4 px-4 py-1.5 bg-indigo-50 rounded-full">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  CREATE ACCOUNT
                </span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Get Started Free</h2>
              <p className="text-slate-500 text-sm">Fill in your details to create your account</p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-slate-700 font-semibold flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-700 font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-700 font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-700 font-semibold text-sm">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-700 font-semibold text-sm">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-700 font-semibold text-sm">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="PIN"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label className="text-sm text-slate-600">
                  I agree to the <span className="text-blue-600 font-semibold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-blue-600 font-semibold hover:underline cursor-pointer">Privacy Policy</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl transition-all font-bold text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transform hover:-translate-y-0.5"
              >
                Create Account
                <ArrowRight className="inline-block w-5 h-5 ml-2" />
              </button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-slate-600 hover:text-blue-600 font-semibold transition-colors"
                >
                  Already have an account? <span className="text-blue-600">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
