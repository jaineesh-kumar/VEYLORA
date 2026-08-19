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
import { motion } from "framer-motion";



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
    <div className="relative min-h-screen text-ink">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md glass-surface p-8 relative z-10"
        >
          <h2 className="mb-6 text-2xl font-semibold font-headline text-ink">Welcome to <span className="font-accent italic text-accent-violet font-normal">CryptML</span></h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="username" className="text-ink-dim">Username</Label>
              <Input
                id="username"
                placeholder="YourUsername123"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="bg-transparent border-none text-ink shadow-input"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password" className="text-ink-dim">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent border-none text-ink shadow-input"
              />
            </LabelInputContainer>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              className="group relative w-full overflow-hidden rounded-full bg-pill-dark transition-all duration-300 ease-out hover:-translate-y-[1px]"
              type="submit"
            >
              <div className="rounded-full px-8 py-3 transition-all duration-300">
                <span className="relative flex items-center justify-center font-medium text-white">
                  Login
                </span>
              </div>
            </button>
            <p className="text-ink-dim text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent-violet hover:text-accent-blue transition-colors font-medium">
              Sign up here
            </Link>
          </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex flex-col space-y-1.5 w-full", className)}>{children}</div>;
};
