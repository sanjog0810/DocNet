import React, { useState } from 'react';
import { Heart, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onViewChange: (view: string) => void;
}

export function Register({ onViewChange }: RegisterProps) {
  const { register, verifyDoctor } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'doctor' | 'patient',
    nmcNumber: '',
    specialization: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nmcVerified, setNmcVerified] = useState(false);
  const [verifyingNmc, setVerifyingNmc] = useState(false);

  const handleNmcVerification = async () => {
    if (!formData.nmcNumber) return;
    
    setVerifyingNmc(true);
    try {
      const isValid = await verifyDoctor(formData.nmcNumber);
      setNmcVerified(isValid);
      if (!isValid) {
        setError('Invalid NMC registration number. Please check and try again.');
      } else {
        setError('');
      }
    } catch (err) {
      setError('Failed to verify NMC number. Please try again.');
    } finally {
      setVerifyingNmc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.role === 'doctor' && !nmcVerified) {
      setError('Please verify your NMC registration number first.');
      setLoading(false);
      return;
    }

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        nmcNumber: formData.nmcNumber || undefined,
        specialization: formData.specialization || undefined,
        location: formData.location,
        isVerified: formData.role === 'doctor' ? nmcVerified : true
      });

      if (success) {
        onViewChange('dashboard');
      } else {
        setError('Registration failed. Email might already be in use.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo" style={{ justifyContent: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>
            <Heart size={32} />
            DocNet
          </div>
          <p style={{ color: 'var(--neutral-600)' }}>
            Join DocNet - Register your account
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">I am a:</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="patient"
                  checked={formData.role === 'patient'}
                  onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value as 'patient' | 'doctor' });
                    setNmcVerified(false);
                  }}
                />
                Patient
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="doctor"
                  checked={formData.role === 'doctor'}
                  onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value as 'patient' | 'doctor' });
                    setNmcVerified(false);
                  }}
                />
                Doctor
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>

          {formData.role === 'doctor' && (
            <>
              <div className="form-group">
                <label className="form-label">NMC Registration Number</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nmcNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, nmcNumber: e.target.value });
                      setNmcVerified(false);
                    }}
                    required
                    placeholder="Enter NMC number"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleNmcVerification}
                    disabled={!formData.nmcNumber || verifyingNmc}
                  >
                    {verifyingNmc ? <div className="loading"></div> : (
                      nmcVerified ? <CheckCircle size={16} /> : 'Verify'
                    )}
                  </button>
                </div>
                {nmcVerified && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--success-green)' }}>
                    <CheckCircle size={16} />
                    <span>NMC number verified successfully</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Specialization</label>
                <select
                  className="form-select"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                >
                  <option value="">Select specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Radiology">Radiology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="City, State"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter password"
                style={{ paddingRight: '3rem' }}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--neutral-500)'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="Confirm password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? <div className="loading"></div> : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--neutral-600)' }}>
          Already have an account?{' '}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onViewChange('login'); }}
            style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}