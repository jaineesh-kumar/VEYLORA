"use client";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, ReactNode } from "react";



export default function SignupFormDemo() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateInput = (value: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d_]+$/;
    return regex.test(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateInput(formData.username) || !validateInput(formData.password)) {
      setError(
        "Username and password must contain at least one uppercase letter, one lowercase letter, one number, and only underscores (_) as special characters."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post("http://localhost:8080/api/auth/signup", {
        username: formData.username,
        password: formData.password,
        firstName: formData.firstname,
        lastName: formData.lastname,
      });
      console.log("Signup me hai")
      console.log(response);
      if (response.status === 200) {
        toast.success("User Registered Successfully!");
        setSuccessMessage("User Registered Successfully");
        navigate("/login")
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data?.message || "Signup failed. Please try again.");
      } else {
        setError("Signup failed. Please try again.");
      }
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
            <div className="flex flex-col md:flex-row gap-4">
              <LabelInputContainer>
                <Label htmlFor="firstname" className="text-ink-dim">First name</Label>
                <Input id="firstname" placeholder="Tyler" type="text" value={formData.firstname} onChange={handleChange} className="bg-transparent border-none text-ink shadow-input" />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname" className="text-ink-dim">Last name</Label>
                <Input id="lastname" placeholder="Durden" type="text" value={formData.lastname} onChange={handleChange} className="bg-transparent border-none text-ink shadow-input" />
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <Label htmlFor="username" className="text-ink-dim">Username</Label>
              <Input id="username" placeholder="YourUsername123" type="text" value={formData.username} onChange={handleChange} className="bg-transparent border-none text-ink shadow-input" />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password" className="text-ink-dim">Password</Label>
              <Input id="password" placeholder="••••••••" type="password" value={formData.password} onChange={handleChange} className="bg-transparent border-none text-ink shadow-input" />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="confirmPassword" className="text-ink-dim">Confirm Password</Label>
              <Input id="confirmPassword" placeholder="••••••••" type="password" value={formData.confirmPassword} onChange={handleChange} className="bg-transparent border-none text-ink shadow-input" />
            </LabelInputContainer>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

            <button className="group relative w-full overflow-hidden rounded-full bg-pill-dark transition-all duration-300 ease-out hover:-translate-y-[1px]" type="submit">
              <div className="rounded-full px-8 py-3 transition-all duration-300">
                <span className="relative flex items-center justify-center font-medium text-white">Sign up →</span>
              </div>
            </button>
            <p className="text-ink-dim text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-accent-violet hover:text-accent-blue transition-colors font-medium">
              Sign in here
            </Link>
          </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}



const LabelInputContainer = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return <div className={cn("flex flex-col space-y-1.5 w-full", className)}>{children}</div>;
};

