import React, { useState } from 'react';
import { Brain, Search, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AIDiagnosis as AIDiagnosisType } from '../../types';
import axios from 'axios'; 
import axiosInstance from '../../context/axiosInstance';

export function AIDiagnosis() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosisType | null>(null);

 
  const fetchDiagnosis = async (symptomText: string): Promise<AIDiagnosisType> => {
       const { data } = await axiosInstance.post<AIDiagnosisType>(
         `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/aiDiag`,
         { symptoms: symptomText }           
       );
    return data;
  };

  const handleDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    try {
      const result = await fetchDiagnosis(symptoms);
      setDiagnosis(result);
    } catch (error) {
      console.error('Error generating diagnosis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'var(--error-red)';
      case 'medium': return 'var(--warning-amber)';
      case 'low': return 'var(--secondary-green)';
      default: return 'var(--neutral-500)';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle size={20} />;
      case 'medium': return <Clock size={20} />;
      case 'low': return <CheckCircle size={20} />;
      default: return <Brain size={20} />;
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">AI-Powered Diagnosis</h1>
          <p className="dashboard-subtitle">
            Get preliminary insights based on your symptoms. Always consult with a qualified doctor for proper diagnosis.
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Brain size={28} style={{ color: 'var(--primary-blue)' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Symptom Analysis
                </h3>
                <p style={{ color: 'var(--neutral-600)', fontSize: '0.875rem' }}>
                  Describe your symptoms and get AI-powered initial assessment
                </p>
              </div>
            </div>

            <form onSubmit={handleDiagnosis}>
              <div className="form-group">
                <label className="form-label">Describe Your Symptoms</label>
                <textarea
                  className="form-textarea"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g., chest pain, shortness of breath, headache, nausea"
                  rows={4}
                  required
                />
                <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginTop: '0.5rem' }}>
                  Separate multiple symptoms with commas. Be as specific as possible.
                </p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !symptoms.trim()}
                style={{ width: '100%' }}
              >
                {loading ? (
                  <>
                    <div className="loading"></div>
                    Analyzing symptoms...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Generate AI Diagnosis
                  </>
                )}
              </button>
            </form>
          </div>

          {diagnosis && (
  <div className="card fade-in" style={{ marginTop: '2rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <TrendingUp size={20} style={{ color: 'var(--primary-blue)' }} />
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
          AI Diagnosis Results
        </h3>
        <p style={{ color: 'var(--neutral-600)', fontSize: '0.875rem' }}>
          Here are possible conditions and recommended tests based on your input.
        </p>
      </div>
    </div>

    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <TrendingUp size={18} />
        Possible Conditions
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {diagnosis.possibleConditions.map((condition, index) => (
          <div key={index} style={{
            padding: '1rem',
            background: 'var(--neutral-50)',
            borderRadius: '0.5rem',
            border: '1px solid var(--neutral-200)'
          }}>
            <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {condition.condition}
            </h5>
            <p style={{ color: 'var(--neutral-600)', fontSize: '0.875rem' }}>
              {condition.description}
            </p>
          </div>
        ))}
      </div>
    </div>

    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <CheckCircle size={18} />
        Recommended Tests & Actions
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem'
      }}>
        {diagnosis.recommendedTests.map((test, index) => (
          <div key={index} style={{
            padding: '0.75rem',
            background: 'var(--white)',
            border: '2px solid var(--neutral-200)',
            borderRadius: '0.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {test}
          </div>
        ))}
      </div>
    </div>

    <div className="alert alert-warning">
      <AlertTriangle size={20} style={{ marginRight: '0.5rem' }} />
      <strong>Note:</strong> This AI assessment is a preliminary analysis and should not replace professional medical evaluation.
    </div>

    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
      <button className="btn btn-primary" style={{ flex: 1 }}>
        Consult Doctor
      </button>
      <button className="btn btn-secondary" style={{ flex: 1 }}>
        Upload Test Results
      </button>
    </div>
  </div>
)}


          <div className="card" style={{ marginTop: '2rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
              How AI Diagnosis Works
            </h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: 'var(--primary-blue)', 
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>1</div>
                <div>
                  <strong>Symptom Analysis:</strong> Our AI analyzes your symptoms using advanced machine learning algorithms trained on medical literature and diagnostic patterns.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: 'var(--primary-blue)', 
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>2</div>
                <div>
                  <strong>Pattern Matching:</strong> The system matches your symptoms against thousands of medical conditions to identify the most likely diagnoses.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: 'var(--primary-blue)', 
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>3</div>
                <div>
                  <strong>Doctor Review:</strong> All AI recommendations should be validated by qualified healthcare professionals for accurate diagnosis and treatment.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}