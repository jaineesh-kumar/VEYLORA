"use client";
import React, { useState } from "react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
// import { BackgroundBeams } from "@/components/ui/background-beams";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice.ts";



const BackgroundGrid = () => (
  <div className="absolute inset-0 -z-10 h-full w-full bg-black bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>
  </div>
);

export default function SignupFormDemo() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", formData);
      console.log("Login response:", response.data); // ✅ Debug API response
  
      const { accessToken, user } = response.data;
      if (!accessToken) {
        throw new Error("No access token received");
      }
  
      // Store tokens in local storage
      localStorage.setItem("accessToken", accessToken);
  
      // Dispatch to Redux store
      dispatch(loginSuccess({ user, token: accessToken }));
  
      toast.success("Logged in successfully!");
      navigate('/');
  
    } catch (error) {
      setError("Invalid username or password");
      console.error("Login error:", error);
    }
  };
  

  return (
    <div className="app-surface relative min-h-screen text-white">
      <BackgroundGrid />
      {/* <BackgroundBeams className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" /> */}

      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-10">
        <div className="panel w-full max-w-md p-8 relative z-10 sm:p-10">
          <div className="eyebrow mb-5">Veylora / Secure workspace</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome back.</h2>
          <p className="mt-2 mb-8 text-sm text-slate-400">Sign in to access your analysis history and profile.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="username" className="text-gray-400">Username</Label>
              <Input
                id="username"
                placeholder="YourUsername123"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="bg-slate-900/80 border border-slate-700/60 text-white shadow-none"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password" className="text-gray-400">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-slate-900/80 border border-slate-700/60 text-white shadow-none"
              />
            </LabelInputContainer>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              className="primary-action w-full"
              type="submit"
            >
              Sign in
            </button>
            <p className="text-gray-400 text-sm text-center mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-fuchsia-300 hover:text-fuchsia-200">
              Sign up here
            </Link>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex flex-col space-y-1.5 w-full", className)}>{children}</div>;
};
