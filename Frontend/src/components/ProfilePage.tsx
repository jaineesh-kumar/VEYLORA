import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Edit, History } from "lucide-react";

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
    <div className="relative min-h-screen bg-black text-white">
      <BackgroundBeams className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />

      <div className="container mx-auto py-12 px-4">
        <div className="mx-auto mb-6 w-full max-w-4xl">
          <p className="veylora-page-kicker">Veylora / Profile</p>
          <h1 className="veylora-page-title font-bold">Your workspace identity.</h1>
        </div>
        <div className="w-full max-w-4xl mx-auto rounded-xl border border-gray-800 bg-black/50 backdrop-blur-md p-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-6">
              {/* User Logo with Initials */}
              <div className="w-20 h-20 flex items-center justify-center bg-purple-600 text-white text-2xl font-bold rounded-full">
                {getUserInitials()}
              </div>

              <h2 className="text-2xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-400">@{user.username}</p>
            </div>

            <div className="flex-1 space-y-8">
              {isEditing ? (
                <form onSubmit={handleUpdate}>
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-purple-400 pb-2 border-b border-gray-800">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                      <LabelInputContainer className="md:col-span-2">
                        <Label className="text-gray-400">Username</Label>
                        <Input
                          name="username"
                          value={pendingChanges.username}
                          onChange={handleChange}
                          className="bg-zinc-800 border-none text-white shadow-input"
                        />
                      </LabelInputContainer>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LabelInputContainer>
                          <Label className="text-gray-400">First Name</Label>
                          <Input
                            name="firstName"
                            value={pendingChanges.firstName}
                            onChange={handleChange}
                            className="bg-zinc-800 border-none text-white shadow-input"
                          />
                        </LabelInputContainer>
                        <LabelInputContainer>
                          <Label className="text-gray-400">Last Name</Label>
                          <Input
                            name="lastName"
                            value={pendingChanges.lastName}
                            onChange={handleChange}
                            className="bg-zinc-800 border-none text-white shadow-input"
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
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-purple-600 text-white transition-colors duration-200 hover:bg-purple-700"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNavigateToHistory}
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-purple-600 text-white transition-colors duration-200 hover:bg-purple-700"
                      >
                        <History className="w-4 h-4" />
                        <span>View History</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 pb-2 border-b border-gray-800">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    <LabelInputContainer className="md:col-span-2">
                      <Label className="text-gray-400">Username</Label>
                      <Input
                        value={user.username}
                        disabled
                        className="bg-zinc-800 border-none text-white shadow-input"
                      />
                    </LabelInputContainer>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <LabelInputContainer>
                        <Label className="text-gray-400">First Name</Label>
                        <Input
                          value={user.firstName}
                          disabled
                          className="bg-zinc-800 border-none text-white shadow-input"
                        />
                      </LabelInputContainer>
                      <LabelInputContainer>
                        <Label className="text-gray-400">Last Name</Label>
                        <Input
                          value={user.lastName}
                          disabled
                          className="bg-zinc-800 border-none text-white shadow-input"
                        />
                      </LabelInputContainer>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-purple-600 text-white transition-colors duration-200 hover:bg-purple-700"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNavigateToHistory}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-purple-600 text-white transition-colors duration-200 hover:bg-purple-700"
                    >
                      <History className="w-4 h-4" />
                      <span>View History</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
