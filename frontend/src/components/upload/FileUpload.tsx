import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Upload, MessageCircle, Check, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../context/axiosInstance';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
}

interface RequestStatus {
  [doctorId: string]: 'pending' | 'approved' | 'rejected' | null;
}

export function FileUpload() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{ [doctorId: string]: File | null }>({});
  const [messages, setMessages] = useState<{ [doctorId: string]: string }>({});
  const [status, setStatus] = useState<RequestStatus>({});
  const [doctorReplies, setDoctorReplies] = useState<{ [doctorId: string]: string }>({});
  const [showResend, setShowResend] = useState<{ [doctorId: string]: boolean }>({});



  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get('http://localhost:8080/consultations/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      }
    };
    fetchDoctors();
  }, []);


  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosInstance.get(`http://localhost:8080/consultations/status/${user.id}`);
        const statuses: RequestStatus = {};
        const replies: { [doctorId: string]: string } = {};
  
        res.data.forEach((entry: any) => {
          statuses[entry.doctorId] = entry.status;
          replies[entry.doctorId] = entry.doctorMessage;
        });
  
        setStatus(statuses);
        setDoctorReplies(replies);
      } catch (err) {
        console.error('Failed to fetch consultation status', err);
      }
    };
  
    fetchStatus();
  }, [user.id]);
  


  const handleFileChange = (doctorId: string, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [doctorId]: file }));
  };

  const handleMessageChange = (doctorId: string, text: string) => {
    setMessages((prev) => ({ ...prev, [doctorId]: text }));
  };

  const sendRequest = async (doctorId: string) => {
    const file = selectedFiles[doctorId];
    const message = messages[doctorId];

    if (!file || !message) return alert('Please upload a file and enter a message.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', message);
    formData.append('doctorId', doctorId);
    formData.append('patientId', user.id);

    try {
      await axiosInstance.post('http://localhost:8080/consultations/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus((prev) => ({ ...prev, [doctorId]: 'pending' }));
    } catch (err) {
      console.error('Request failed', err);
    }
  };

  const openChat = (doctorId: string) => {
    window.location.href = `/chat/${doctorId}`;
  };

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Request Second Consultation</h1>
        <p className="dashboard-subtitle">Browse doctors and request a second opinion with your report and message.</p>
      </div>

      <div className="grid grid-2">
        {doctors.map((doc) => (
          <div key={doc.id} className="card">
          <h2 className="text-xl font-semibold">{doc.name}</h2>
          <p className="text-sm text-neutral-500 mb-2">{doc.specialization} · {doc.email}</p>
        
          {status[doc.id] === 'rejected' ? (
  <div className="mt-2">
    <p className="text-error-red font-medium">Request Rejected</p>
    {doctorReplies[doc.id] && (
      <p className="text-neutral-700 text-sm mt-1">Doctor's Message: {doctorReplies[doc.id]}</p>
    )}
    {/* No form shown */}
  </div>
) : doctorReplies[doc.id] && !showResend[doc.id] ? (
  <div className="mt-2">
    <p className="text-green-700 font-medium">
      Doctor's Message: {doctorReplies[doc.id]}
    </p>
    <button
      className="btn btn-outline mt-2"
      onClick={() =>
        setShowResend((prev) => ({ ...prev, [doc.id]: true }))
      }
    >
      Request Again
    </button>
  </div>
) : (
  <>
    <div className="form-group">
      <label className="form-label">Message</label>
      <textarea
        className="form-textarea"
        placeholder="Write your message/request"
        value={messages[doc.id] || ''}
        onChange={(e) => handleMessageChange(doc.id, e.target.value)}
      />
    </div>

    <div className="form-group">
      <label className="form-label">Upload Document</label>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
        className="form-input"
      />
    </div>

    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => sendRequest(doc.id)}
        className="btn btn-primary"
        disabled={status[doc.id] === 'pending'}
      >
        <Upload size={18} /> {status[doc.id] === 'pending' ? 'Request Sent' : 'Send Request'}
      </button>

      {status[doc.id] === 'pending' && (
        <span className="text-warning-amber flex items-center gap-1">
          <Clock size={16} /> Pending
        </span>
      )}

      {showResend[doc.id] && (
        <button
          className="btn btn-outline"
          onClick={() =>
            setShowResend((prev) => ({ ...prev, [doc.id]: false }))
          }
        >
          Cancel
        </button>
      )}
    </div>
  </>
)}

        
          
        </div>
        
        ))}
      </div>
    </div>
  );
}
