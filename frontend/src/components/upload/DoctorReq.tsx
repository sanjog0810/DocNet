import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../context/axiosInstance';

interface Request {
  id: number;
  patient: {
    id: string;
    name: string;
    email: string;
  };
  message: string;
  fileName: string;
  fileType: string;
  status: string;
}

export function DoctorRequestBoard() {
  const { user } = useAuth(); // Doctor is logged in
  const [requests, setRequests] = useState<Request[]>([]);
  const [messages, setMessages] = useState<{ [requestId: number]: string }>({});


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosInstance.get(`http://localhost:8080/consultations/doctor/${user.id}`);
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to load requests', err);
      }
    };
    fetchRequests();
  }, [user.id]);

  const handleApprove = async (requestId: number) => {
    const doctorMessage = messages[requestId] || '';
  
    try {
      await axiosInstance.post(
        `http://localhost:8080/consultations/approve`,
        null,
        {
          params: {
            requestId,
            doctorMessage,
          },
        }
      );
  
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: 'approved' }
            : req
        )
      );
    } catch (err) {
      console.error('Failed to approve request', err);
    }
  };
  

  const handleReject = async (requestId: number) => {
    const doctorMessage = messages[requestId] || '';
    try {
      await axiosInstance.post(
        `http://localhost:8080/reject`,
        null,
        {
          params: {
            requestId,
            doctorMessage,  // ✅ include message
          },
        }
      );
      setRequests((prev) =>
        prev.map((req) => req.id === requestId ? { ...req, status: 'rejected' } : req)
      );
    } catch (err) {
      console.error('Failed to reject request', err);
    }
  };
  

  const downloadFile = async (requestId: number, fileName: string) => {
    try {
      const res = await axiosInstance.get(`http://localhost:8080/consultations/download/${requestId}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download file', err);
    }
  };

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Patient Requests</h1>
        <p className="dashboard-subtitle">Review and respond to second consultancy requests.</p>
      </div>

      {requests.length === 0 ? (
        <p>No requests available.</p>
      ) : (
        <div className="grid grid-2">
          {requests.map((req) => (
            <div key={req.id} className="card">
              <h3 className="text-lg font-semibold">{req.patient.name}</h3>
              <p className="text-sm text-neutral-500">{req.patient.email}</p>

              <div className="form-group mt-2">
                <label className="form-label">Message</label>
                <p>{req.message}</p>
              </div>

              <div className="form-group mt-2">
                <label className="form-label">Document</label>
                <button
                  className="btn btn-outline"
                  onClick={() => downloadFile(req.id, req.fileName)}
                >
                  <FileText size={16} /> {req.fileName}
                </button>
              </div>

              <div className="flex gap-4 mt-4">
              {req.status === 'pending' && (
  <>
    <textarea
      className="form-textarea w-full mt-2"
      placeholder="Write your response to the patient..."
      value={messages[req.id] || ''}
      onChange={(e) =>
        setMessages((prev) => ({ ...prev, [req.id]: e.target.value }))
      }
    />
    <div className="flex gap-4 mt-2">
      <button className="btn btn-primary" onClick={() => handleApprove(req.id)}>
        <Check size={16} /> Approve
      </button>
      <button className="btn btn-outline" onClick={() => handleReject(req.id)}>
        <X size={16} /> Reject
      </button>
    </div>
  </>
)}

                {req.status === 'approved' && (
                  <span className="text-success-green font-medium">Approved</span>
                )}
                {req.status === 'rejected' && (
                  <span className="text-error-red font-medium">Rejected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
