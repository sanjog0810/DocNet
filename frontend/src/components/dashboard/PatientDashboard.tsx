import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, HeartPulse, Leaf, Shield, Brain } from 'lucide-react';
import axiosInstance from '../../context/axiosInstance';
import { useFacts, HealthFact } from '../../context/FactsContext';

export function PatientDashboard() {
  const { user } = useAuth();
  const { healthFacts, setHealthFacts } = useFacts();

  const [isLoading, setIsLoading] = useState(!healthFacts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (healthFacts) return;

    let isMounted = true;

    const fetchHealthFacts = async () => {
      try {
        const response = await axiosInstance.get<HealthFact[]>('/facts');
        if (isMounted) {
          setHealthFacts(response.data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHealthFacts();

    return () => {
      isMounted = false;
    };
  }, [healthFacts, setHealthFacts]);
  
  

  const factIcons = {
    nutrition: <Leaf size={20} />,
    exercise: <Activity size={20} />,
    mental: <Brain size={20} />,
    prevention: <Shield size={20} />,
    general: <HeartPulse size={20} />
  };

  const getFactCategory = (category) => {
    return factIcons[category.toLowerCase()] || factIcons.general;
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="dashboard-subtitle">
            Health Insights & Facts
          </p>
        </div>

        {isLoading ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading" style={{ margin: '0 auto' }}></div>
            <p>Loading health facts...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <p>Error: {error}</p>
            <button 
              className="btn btn-outline" 
              style={{ marginTop: '0.5rem' }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>
                <HeartPulse size={20} style={{ marginRight: '0.5rem' }} />
                Today's Health Facts
              </h3>
              
              {healthFacts.length > 0 ? (
                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  {healthFacts.map((fact, index) => (
                    <div 
                      key={index} 
                      className="card" 
                      style={{ 
                        padding: '1.5rem',
                        borderLeft: '4px solid var(--primary-green)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {getFactCategory(fact.category)}
                        <span style={{ 
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          background: 'var(--primary-green-light)',
                          color: 'var(--neutral-100)',
                        }}>
                          {fact.category}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                        {fact.title}
                      </h4>
                      <p style={{ color: 'var(--neutral-600)', lineHeight: '1.6' }}>
                        {fact.description}
                      </p>
                      {fact.source && (
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--neutral-500)',
                          marginTop: 'auto',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid var(--neutral-100)'
                        }}>
                          Source: {fact.source}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  background: 'var(--neutral-50)',
                  borderRadius: '0.5rem'
                }}>
                  <p>No health facts available at the moment.</p>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>
                <Shield size={20} style={{ marginRight: '0.5rem' }} />
                Health Fact of the Day
              </h3>
              {healthFacts.length > 0 ? (
                <div style={{ 
                  padding: '1.5rem',
                  background: 'var(--primary-green)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--primary-green)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    fontSize: '5rem',
                    opacity: '0.1',
                    color: 'var(--neutral-100)',
                  }}>
                    <HeartPulse />
                  </div>
                  <h4 style={{ 
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--neutral-100)',
                    marginBottom: '0.5rem'
                  }}>
                    {healthFacts[0].title}
                  </h4>
                  <p style={{ 
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    marginBottom: '1rem',
                    color: 'var(--neutral-100)'
                  }}>
                    {healthFacts[0].description}
                  </p>
                  {healthFacts[0].source && (
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: 'var(--neutral-100)',
                      fontStyle: 'italic'
                    }}>
                      - {healthFacts[0].source}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  background: 'var(--neutral-100)',
                  borderRadius: '0.5rem'
                }}>
                  <p>Check back later for today's health fact.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}