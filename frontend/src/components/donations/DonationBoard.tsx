import React, { useState, useEffect } from 'react';
import { Heart, Plus, MapPin, Clock, Phone, User, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DonationRequest } from '../../types';
import { fetchWithAuth } from '../../context/FetchWithAuth';

export function DonationBoard() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'blood' | 'organ' | 'my'>('all');
  const [newRequest, setNewRequest] = useState({
    type: 'blood' as 'blood' | 'organ',
    bloodType: '',
    organType: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    patientName: '',
    hospitalName: '',
    location: '',
    contactPhone: '',
    description: '',
    requiredBy: ''
  });

  const [donations, setDonations] = useState<DonationRequest[]>([]);
  const [myRequests, setMyRequests] = useState<DonationRequest[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingRequest, setEditingRequest] = useState<DonationRequest | null>(null);


  // Fetch all donations
  useEffect(() => {
    fetchWithAuth('http://localhost:8080/donation')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({
          ...d,
          requiredBy: new Date(d.requiredBy),
          createdAt: new Date(d.createdAt)
        }));
        setDonations(formatted);
      })
      .catch(err => console.error('Error fetching donations:', err));
  }, []);

  // Fetch user's requests when user changes
  useEffect(() => {
    if (user?.email) {
      fetchWithAuth(`http://localhost:8080/user/${user.email}`)
        .then(res => res.json())
        .then(data => {
          const formatted = data.map((d: any) => ({
            ...d,
            requiredBy: new Date(d.requiredBy),
            createdAt: new Date(d.createdAt)
          }));
          setMyRequests(formatted);
        })
        .catch(err => console.error('Error fetching user donations:', err));
    }
  }, [user?.email]);

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    if (filter === 'my') return false; // Handled separately
    return donation.type === filter;
  });

  const handleDeleteRequest = async (id: string) => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/donation/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete request');
      }

      // Update both donations and myRequests state
      setDonations(donations.filter(d => d.id !== id));
      setMyRequests(myRequests.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting donation request:', err);
      setErrorMessage('Failed to delete request');
    }
  };
  const handleUpdateRequest = async (updatedRequest: DonationRequest) => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/donation/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest)
      });
  
      if (!res.ok) throw new Error('Update failed');
  
      const updated = { ...updatedRequest };
      updated.requiredBy = new Date(updated.requiredBy);
      updated.createdAt = new Date(updated.createdAt);
  
      // Update the request in local state
      setMyRequests(prev =>
        prev.map(r => (r.id === updated.id ? updated : r))
      );
      setDonations(prev =>
        prev.map(r => (r.id === updated.id ? updated : r))
      );
  
      setEditingRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      setErrorMessage('Failed to update the request');
    }
  };
  

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const payload = {
      ...newRequest,
      requiredBy: newRequest.requiredBy,
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'anonymous'
    };

    try {
      const res = await fetchWithAuth('http://localhost:8080/donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 409) {
        setErrorMessage('Request already posted for this patient.');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to post donation');
      }

      const saved = await res.json();
      saved.requiredBy = new Date(saved.requiredBy);
      saved.createdAt = new Date(saved.createdAt);

      setDonations([saved, ...donations]);
      setMyRequests([saved, ...myRequests]);
      setNewRequest({
        type: 'blood',
        bloodType: '',
        organType: '',
        urgency: 'medium',
        patientName: '',
        hospitalName: '',
        location: '',
        contactPhone: '',
        description: '',
        requiredBy: ''
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating donation request:', err);
      setErrorMessage('An unexpected error occurred.');
    }
  };

  const formatTimeLeft = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    if (hours > 0) return `${hours} hours left`;
    return 'Expires soon';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'var(--error-red)';
      case 'medium': return 'var(--warning-amber)';
      case 'low': return 'var(--secondary-green)';
      default: return 'var(--neutral-500)';
    }
  };

  const renderDonationCard = (donation: DonationRequest, isMine = false) => (
    <div key={donation.id} className={`donation-card ${donation.type} fade-in`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <div>
          <span className={`donation-type ${donation.type}`}>
            {donation.type === 'blood' ? '🩸 Blood Donation' : '🫀 Organ Donation'}
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0.5rem 0' }}>
            {donation.type === 'blood' ? `${donation.bloodType} Blood Needed` : `${donation.organType} Transplant`}
          </h3>
        </div>
        <span 
          className={`urgency-${donation.urgency}`}
          style={{ 
            fontSize: '0.75rem', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {donation.urgency} Priority
        </span>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: 'var(--neutral-700)', lineHeight: 1.5 }}>
          {donation.description}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <User size={16} style={{ color: 'var(--neutral-500)' }} />
          <span>{donation.patientName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <MapPin size={16} style={{ color: 'var(--neutral-500)' }} />
          <span>{donation.hospitalName}, {donation.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Clock size={16} style={{ color: getUrgencyColor(donation.urgency) }} />
          <span style={{ color: getUrgencyColor(donation.urgency) }}>
            {formatTimeLeft(donation.requiredBy)}
          </span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '0.75rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--neutral-200)'
      }}>
        {isMine ? (
  <>
    <button 
      onClick={() => handleDeleteRequest(donation.id)}
      className="btn btn-outline"
      style={{ flex: 1, justifyContent: 'center' }}
    >
      <Trash2 size={16} />
      Delete
    </button>
    <button 
      onClick={() => setEditingRequest(donation)}
      className="btn btn-outline"
      style={{ flex: 1, justifyContent: 'center' }}
    >
      ✏️ Edit
    </button>
  </>
) : (
  <a 
    href={`tel:${donation.contactPhone}`}
    className="btn btn-primary"
    style={{ flex: 1, justifyContent: 'center' }}
  >
    <Phone size={16} />
    I can help
  </a>
)}

      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <div>
              <h1 className="dashboard-title">Donation Board</h1>
              <p className="dashboard-subtitle">
                Help save lives by connecting blood and organ donors with patients in need
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={20} />
              Post Request
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All Requests ({donations.length})
            </button>
            <button 
              className={`btn ${filter === 'blood' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('blood')}
            >
              Blood ({donations.filter(d => d.type === 'blood').length})
            </button>
            <button 
              className={`btn ${filter === 'organ' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('organ')}
            >
              Organ ({donations.filter(d => d.type === 'organ').length})
            </button>
            <button 
              className={`btn ${filter === 'my' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('my')}
            >
              My Requests ({myRequests.length})
            </button>
          </div>
        </div>

        {filter === 'my' ? (
          <div className="grid grid-2">
            {myRequests.length > 0 ? (
              myRequests.map(donation => renderDonationCard(donation, true))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: 'var(--neutral-500)',
                gridColumn: '1 / -1'
              }}>
                <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>No requests posted yet</h3>
                <p>Post your first donation request to get started.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-2">
            {filteredDonations.length > 0 ? (
              filteredDonations.map(donation => renderDonationCard(donation))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: 'var(--neutral-500)',
                gridColumn: '1 / -1'
              }}>
                <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>No donation requests found</h3>
                <p>Be the first to post a donation request in your area.</p>
              </div>
            )}
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">Post Donation Request</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateRequest}>
                <div className="form-group">
                  <label className="form-label">Request Type</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        value="blood"
                        checked={newRequest.type === 'blood'}
                        onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value as 'blood' | 'organ' })}
                      />
                      Blood Donation
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        value="organ"
                        checked={newRequest.type === 'organ'}
                        onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value as 'blood' | 'organ' })}
                      />
                      Organ Donation
                    </label>
                  </div>
                </div>

                {newRequest.type === 'blood' ? (
                  <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <select
                      className="form-select"
                      value={newRequest.bloodType}
                      onChange={(e) => setNewRequest({ ...newRequest, bloodType: e.target.value })}
                      required
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Organ Type</label>
                    <select
                      className="form-select"
                      value={newRequest.organType}
                      onChange={(e) => setNewRequest({ ...newRequest, organType: e.target.value })}
                      required
                    >
                      <option value="">Select organ type</option>
                      <option value="Kidney">Kidney</option>
                      <option value="Liver">Liver</option>
                      <option value="Heart">Heart</option>
                      <option value="Lung">Lung</option>
                      <option value="Pancreas">Pancreas</option>
                      <option value="Cornea">Cornea</option>
                      <option value="Bone Marrow">Bone Marrow</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Urgency Level</label>
                  <select
                    className="form-select"
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value as 'low' | 'medium' | 'high' })}
                    required
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority (Emergency)</option>
                  </select>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Patient Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRequest.patientName}
                      onChange={(e) => setNewRequest({ ...newRequest, patientName: e.target.value })}
                      placeholder="Patient name or Anonymous"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRequest.hospitalName}
                      onChange={(e) => setNewRequest({ ...newRequest, hospitalName: e.target.value })}
                      placeholder="Hospital name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRequest.location}
                      onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                      placeholder="City, State"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={newRequest.contactPhone}
                      onChange={(e) => setNewRequest({ ...newRequest, contactPhone: e.target.value })}
                      placeholder="+91-XXXXX-XXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Required By</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={newRequest.requiredBy}
                    onChange={(e) => setNewRequest({ ...newRequest, requiredBy: e.target.value })}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Provide additional details about the requirement"
                    rows={4}
                    required
                  />
                </div>
                {errorMessage && (
                  <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {errorMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Post Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {editingRequest && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <h2 className="modal-title">Edit Donation Request</h2>
        <button className="modal-close" onClick={() => setEditingRequest(null)}>
          <X size={24} />
        </button>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleUpdateRequest(editingRequest);
      }}>
        {/* Reuse input fields, but bind them to editingRequest instead of newRequest */}
        {/* You can extract a shared form component later to avoid duplication */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={editingRequest.description}
            onChange={(e) =>
              setEditingRequest({ ...editingRequest, description: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Required By</label>
          <input
            type="datetime-local"
            className="form-input"
            value={new Date(editingRequest.requiredBy).toISOString().slice(0, 16)}
            onChange={(e) =>
              setEditingRequest({ ...editingRequest, requiredBy: e.target.value })
            }
            required
          />
        </div>

        {/* Add other fields like urgency, contactPhone, etc., similarly */}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setEditingRequest(null)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      </div>
    </div>
  );
}