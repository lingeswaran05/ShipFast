import { useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "717823s132",
    email: "717823s132@kce.ac.in",
    primaryPhone: "+91 98765 43210",
    alternatePhone: "",
    dob: "",
    gender: "",
    memberSince: "Jan 2024",
    totalShipments: 156,
    loyaltyPoints: 2450,
    status: "Verified"
  });
  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile-page">
      <div className="profile-top">
        <div>
          <h2>My Profile</h2>
          <p>Manage your account information</p>
        </div>
        <button className="edit-profile-btn" onClick={() => setEditMode(!editMode)}>
          <i className="bi bi-pencil"></i>
          {editMode ? "Save Profile" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-main">
        <div className="profile-left">
          <h4>Profile Picture</h4>

          <div className="avatar-box">
            <img src="https://i.pravatar.cc/150" alt="profile" />
            <div className="camera">
              <i className="bi bi-camera"></i>
            </div>
          </div>

          <button className="photo-btn">Choose Photo</button>

          <div className="profile-stats">
            <div className="stat">
              <span>Member Since</span>
              <strong>{profile.memberSince}</strong>
            </div>
            <div className="stat">
              <span>Total Shipments</span>
              <strong className="blue">{profile.totalShipments}</strong>
            </div>
            <div className="stat">
              <span>Loyalty Points</span>
              <strong className="orange">{profile.loyaltyPoints}</strong>
            </div>
            <div className="stat">
              <span>Account Status</span>
              <span className="profilestatus">{profile.status}</span>
            </div>
          </div>
        </div>

        <div className="profile-right">
          <h4>Personal Information</h4>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input value={profile.email} disabled />
            </div>

            <div className="form-group">
              <label>Primary Phone *</label>
              <input
                name="primaryPhone"
                value={profile.primaryPhone}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>Alternate Phone</label>
              <input
                name="alternatePhone"
                value={profile.alternatePhone}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                disabled={!editMode}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="security-section">
        <h4>Security Settings</h4>

        <div className="security-grid">
          <div className="security-card">
            <i className="bi bi-lock"></i>
            <h5>Change Password</h5>
            <p>Update your account password</p>
          </div>

          <div className="security-card">
            <i className="bi bi-shield-check"></i>
            <h5>Two-Factor Auth</h5>
            <p>Enable extra security layer</p>
          </div>

          <div className="security-card">
            <i className="bi bi-envelope-check"></i>
            <h5>Email Verification</h5>
            <p>Verify your email address</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
