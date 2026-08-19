import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Edit, History } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });

  const [pendingChanges, setPendingChanges] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // Retrieve token from local storage
        if (!token) {
          console.error("No access token found");
          return;
        }

        const response = await axios.get("http://localhost:8080/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data); // Update user state with fetched data
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [isEditing]);

  const handleEdit = () => {
    setPendingChanges({ ...user });
    setIsEditing(true);
    setUpdateMessage("");
  };
  // interface User {
  //   firstName: string;
  //   lastName: string;
  //   username: string;
  // }


  interface UpdateData {
    newUsername: string;
    firstName: string;
    lastName: string;
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }
      const updateData: UpdateData = {
        newUsername: pendingChanges.username,
        firstName: pendingChanges.firstName,
        lastName: pendingChanges.lastName,
      };
      const response = await axios.put("http://localhost:8080/api/users/update", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setIsEditing(false);
      setUpdateMessage("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateMessage("Failed to update profile");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPendingChanges((prev) => ({ ...prev, [name]: value }));
  };

  const handleNavigateToHistory = () => {
    navigate("/history");
  };

  // Generate user logo with the first letter of first and last name
  const getUserInitials = () => {
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen text-ink overflow-hidden pt-24 pb-12">
      <div className="container mx-auto py-12 px-4 relative z-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="w-full max-w-4xl mx-auto glass-surface p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-6">
              {/* User Logo with Initials */}
              <div className="w-20 h-20 flex items-center justify-center bg-accent-violet/20 border border-accent-violet/50 text-accent-violet text-2xl font-headline font-bold rounded-full shadow-[0_0_15px_rgba(124,92,255,0.3)]">
                {getUserInitials()}
              </div>

              <h2 className="text-2xl font-bold text-ink font-headline">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-ink-dim">@{user.username}</p>
            </div>

            <div className="flex-1 space-y-8">
              {isEditing ? (
                <form onSubmit={handleUpdate}>
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-accent-violet pb-2 border-b border-ink-dim/20 font-headline">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                      <LabelInputContainer className="md:col-span-2">
                        <Label className="text-ink-dim">Username</Label>
                        <Input
                          name="username"
                          value={pendingChanges.username}
                          onChange={handleChange}
                          className="bg-transparent border-none text-ink shadow-input"
                        />
                      </LabelInputContainer>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LabelInputContainer>
                          <Label className="text-ink-dim">First Name</Label>
                          <Input
                            name="firstName"
                            value={pendingChanges.firstName}
                            onChange={handleChange}
                            className="bg-transparent border-none text-ink shadow-input"
                          />
                        </LabelInputContainer>
                        <LabelInputContainer>
                          <Label className="text-ink-dim">Last Name</Label>
                          <Input
                            name="lastName"
                            value={pendingChanges.lastName}
                            onChange={handleChange}
                            className="bg-transparent border-none text-ink shadow-input"
                          />
                        </LabelInputContainer>
                      </div>
                    </div>
        {updateMessage && (
                      <p className={`text-sm font-medium ${updateMessage.includes("successfully") ? "text-green-500" : "text-red-500"}`}>{updateMessage}</p>
                    )}
                    <div className="mt-8 flex gap-4">
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-pill-dark text-white font-medium transition-all duration-300 hover:-translate-y-[1px]"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNavigateToHistory}
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-accent-violet transition-colors duration-200 hover:bg-accent-violet/20 font-medium"
                      >
                        <History className="w-4 h-4" />
                        <span>View History</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent-violet pb-2 border-b border-ink-dim/20 font-headline">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    <LabelInputContainer className="md:col-span-2">
                      <Label className="text-ink-dim">Username</Label>
                      <Input
                        value={user.username}
                        disabled
                        className="bg-transparent border-none text-ink shadow-input"
                      />
                    </LabelInputContainer>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <LabelInputContainer>
                        <Label className="text-ink-dim">First Name</Label>
                        <Input
                          value={user.firstName}
                          disabled
                          className="bg-transparent border-none text-ink shadow-input"
                        />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label className="text-ink-dim">Last Name</Label>
                        <Input
                          value={user.lastName}
                          disabled
                          className="bg-transparent border-none text-ink shadow-input"
                        />
                      </LabelInputContainer>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-pill-dark text-white font-medium transition-all duration-300 hover:-translate-y-[1px]"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNavigateToHistory}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-accent-violet transition-colors duration-200 hover:bg-accent-violet/20 font-medium"
                    >
                      <History className="w-4 h-4" />
                      <span>View History</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex flex-col space-y-1.5 w-full", className)}>{children}</div>;
};
