// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchWithToken } from "../../api/api";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kycFile, setKycFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    kycCard: "",
    role: "USER",
  });

  // redirect if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role)
      navigate(role === "ADMIN" ? "/admin" : "/", { replace: true });
  }, [navigate]);

  // field change
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // file change
  const handleFileChange = (e) => setKycFile(e.target.files[0]);

  // cloudinary upload
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "kyc_card");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dralfzsvo/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    if (!res.ok) throw new Error("Cloudinary upload failed");
    return res.json();
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let kycUrl = formData.kycCard;
      if (kycFile) {
        const uploadRes = await uploadToCloudinary(kycFile);
        kycUrl = uploadRes.secure_url;
      }

      const res = await fetchWithToken(`/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, kycCard: kycUrl }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful!");
        navigate("/login");
        setFormData({
          fullName: "",
          userName: "",
          email: "",
          password: "",
          phoneNumber: "",
          kycCard: "",
          role: "USER",
        });
        setKycFile(null);
      } else toast.error(data.message || "Registration failed!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // fields config
  const fields = [
    { name: "fullName", type: "text", placeholder: "Full Name" },
    { name: "userName", type: "text", placeholder: "Username" },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "password", type: "password", placeholder: "Password" },
    { name: "phoneNumber", type: "tel", placeholder: "Phone Number" },
  ];

  return (
    <div className="register-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="register-form">
        {fields.map((f) => (
          <input
            key={f.name}
            type={f.type}
            name={f.name}
            placeholder={f.placeholder}
            value={formData[f.name]}
            onChange={handleChange}
            required
            disabled={loading}
          />
        ))}

        <label className="file-upload-label">
          Upload KYC (Aadhaar / PAN)
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
        {kycFile && <p>📂 {kycFile.name}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
