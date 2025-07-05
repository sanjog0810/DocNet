import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Plus, X, Image as ImageIcon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CasePost } from '../../types';
import { useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../../context/axiosInstance';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function CasePosts() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    patientAge: '',
    patientGender: 'male',
    symptoms: ''
  });
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  const [posts, setPosts] = useState<CasePost[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});
  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };
  

  const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const content = commentInputs[postId]?.trim();
    if (!content || !user) return;
  
    const newComment = {
      doctorId: user.id,
      doctorName: user.name,
      content
    };
  
    try {
      const res = await axiosInstance.post(`/case-posts/${postId}/comments`, newComment);
      setPosts(posts.map(post => post.id === postId ? res.data : post));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };
  

  useEffect(() => {
    axiosInstance.get('/case-posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error("Error fetching posts:", err));
  }, []);


  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'DOCTOR') return;
  
    const formData = new FormData();
    const postPayload = {
      title: newPost.title,
      description: newPost.description,
      patientAge: parseInt(newPost.patientAge),
      patientGender: newPost.patientGender,
      symptoms: newPost.symptoms,
      doctorId: user.id,
      doctorName: user.name,
      specialization: user.specialization || '',
      likes: 0,
      comments: []
    };
  
    formData.append('post', new Blob([JSON.stringify(postPayload)], { type: 'application/json' }));
    if (file) formData.append('file', file);
  
    try {
      const res = await axiosInstance.post('/case-posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts([res.data, ...posts]);
      setNewPost({ title: '', description: '', patientAge: '', patientGender: 'male', symptoms: '' });
      setFile(null);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };
  
  

  const handleLike = async (postId: string) => {
    if (!user) return;
  
    try {
      const res = await axiosInstance.post(`/case-posts/${postId}/like`, null, {
        params: { userId: user.id }
      });
  
      // Update the post in state only if backend actually updated it
      setPosts(posts.map(post =>
        post.id === postId ? res.data : post
      ));
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.warn("User already liked this post.");
      } else {
        console.error("Failed to like post", err);
      }
    }
  };
  
  

  const formatTimeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
  
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };
  

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <div>
              <h1 className="dashboard-title">Case Discussions</h1>
              <p className="dashboard-subtitle">
                Share complex cases and get expert opinions from peers
              </p>
            </div>
            {user?.role === 'DOCTOR' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                Create Case Post
              </button>
            )}
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {posts.map(post => (
            <div key={post.id} className="post fade-in">
              <div className="post-header">
                <div className="post-avatar">
                  <User size={24} />
                </div>
                <div>
                  <div className="post-author">{post.doctorName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      background: 'var(--primary-blue)', 
                      color: 'white', 
                      padding: '0.125rem 0.5rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem' 
                    }}>
                      {post.specialization}
                    </span>
                    <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {post.title}
              </h3>

              <div className="post-content">
  <p style={{ marginBottom: '1rem' }}>{post.description}</p>

  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--neutral-600)' }}>
    <span><strong>Patient:</strong> {post.patientAge}y {post.patientGender}</span>
    <span><strong>Symptoms:</strong> {post.symptoms}</span>

  </div>

  {/* File download link */}

{post.fileUrl && (
  <a 
    href={`${BASE_URL}${post.fileUrl}`} 
    download 
    className="btn btn-outline"
    style={{ marginTop: '0.5rem' }}
  >
    📎 Download Attached File
  </a>
)}
</div>


<div className="post-actions" style={{ marginTop: '1.5rem' }}>
  {/* Like Button */}
  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
    <button 
      className="btn btn-sm btn-outline"
      onClick={() => handleLike(post.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        fontWeight: 500
      }}
    >
      <Heart size={16} />
      {post.likes} Likes
    </button>
  </div>

  {/* Comment Input */}
  {user?.role === 'DOCTOR' && (
    <form 
      onSubmit={(e) => handleCommentSubmit(e, post.id)} 
      style={{ display: 'flex', gap: '0.5rem' }}
    >
      <input
        type="text"
        className="form-input"
        placeholder="Write a comment..."
        value={commentInputs[post.id] || ''}
        onChange={(e) =>
          setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
        }
        required
        style={{
          flex: 1,
          padding: '0.5rem 0.75rem',
          border: '1px solid var(--neutral-300)',
          borderRadius: '0.375rem'
        }}
      />
      <button 
        type="submit" 
        className="btn btn-sm btn-outline"
        style={{
          whiteSpace: 'nowrap',
          padding: '0.5rem 1rem',
          fontWeight: 500
        }}
      >
        Add Comment
      </button>
    </form>
  )}
</div>



{post.comments.length > 0 && (
  <div style={{ marginTop: '1rem' }}>
    <button
      onClick={() => toggleComments(post.id)}
      className="btn btn-sm btn-outline"
      style={{ marginBottom: '0.75rem' }}
    >
      {expandedComments[post.id] ? 'Hide Comments' : `View Comments (${post.comments.length})`}
    </button>

    {expandedComments[post.id] && (
      <div
        style={{
          maxHeight: '250px',
          overflowY: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--neutral-200)',
        }}
      >
        {post.comments.map(comment => (
          <div key={comment.id} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'var(--secondary-green)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {comment.doctorName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                  {comment.doctorName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                  {formatTimeAgo(comment.createdAt)}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', paddingLeft: '2.5rem' }}>
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">Create Case Post</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <label className="form-label">Case Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter a descriptive title for the case"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Case Description</label>
                  <textarea
                    className="form-textarea"
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    placeholder="Describe the case in detail, including relevant history and findings"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Patient Age</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newPost.patientAge}
                      onChange={(e) => setNewPost({ ...newPost, patientAge: e.target.value })}
                      placeholder="Age"
                      min="0"
                      max="120"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Patient Gender</label>
                    <select
                      className="form-select"
                      value={newPost.patientGender}
                      onChange={(e) => setNewPost({ ...newPost, patientGender: e.target.value })}
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Symptoms (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newPost.symptoms}
                    onChange={(e) => setNewPost({ ...newPost, symptoms: e.target.value })}
                    placeholder="e.g., Chest pain, Shortness of breath, Fatigue"
                    required
                  />
                </div>
                <div className="form-group">
  <label className="form-label">Attach File (optional)</label>
  <input
    type="file"
    accept=".pdf,.jpg,.png,.doc,.docx"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
    className="form-input"
  />
</div>


                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Post Case
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