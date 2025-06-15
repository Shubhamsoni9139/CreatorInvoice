import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Building,
  MapPin,
  Landmark,
  Hash,
  Code,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatorProfile = () => {
  const { session } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState({});
  const [isNewProfile, setIsNewProfile] = useState(false);

  const userId = session?.user?.id;
  const authEmail = session?.user?.email;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.log("No existing profile, initializing...");
        setIsNewProfile(true);
        setEditProfile({
          user_id: userId,
          email: authEmail,
          usertype: "creator",
        });
      } else {
        setProfile(data);
        setEditProfile({ ...data, email: authEmail }); // override email from auth
      }

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fieldsToUpdate = { ...editProfile };

    let result;
    if (isNewProfile) {
      result = await supabase.from("creators").insert([fieldsToUpdate]);
    } else {
      result = await supabase
        .from("creators")
        .update(fieldsToUpdate)
        .eq("user_id", userId);
    }

    const { error } = result;
    if (error) {
      toast.error("Failed to save profile: " + error.message);
    } else {
      toast.success("Profile saved successfully!");
      setIsNewProfile(false);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isNewProfile ? "Create Your Profile" : "Edit Your Profile"}
          </h1>
          <p className="text-gray-400">
            {isNewProfile
              ? "Set up your creator profile to start managing invoices"
              : "Update your profile information and settings"}
          </p>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />

        {/* Profile Form */}
        <div className="bg-[#1a1f2e] rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Left Column - Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Personal Information
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="name"
                        placeholder="Enter your full name"
                        value={editProfile.name || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="phone_number"
                        placeholder="Enter your phone number"
                        value={editProfile.phone_number || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="email"
                        value={editProfile.email || ""}
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-gray-700/30 border border-gray-600/30 rounded-xl text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      PAN Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="pan_number"
                        placeholder="Enter PAN number"
                        value={editProfile.pan_number || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      GST Number{" "}
                      <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="gst_number"
                        placeholder="Enter GST number (optional)"
                        value={editProfile.gst_number || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Invoice Prefix{" "}
                      <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="prefix"
                        placeholder="e.g., SHUB"
                        value={editProfile.prefix || ""}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: e.target.value.toUpperCase(),
                            },
                          })
                        }
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This will be used as a prefix for your invoice numbers
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Address & Banking Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Address & Banking
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        name="address"
                        placeholder="Enter your complete address"
                        value={editProfile.address || ""}
                        onChange={handleChange}
                        rows={4}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      State
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                      <select
                        name="state"
                        value={editProfile.state || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#0f1419]">
                          Select your state
                        </option>
                        {[
                          "Andhra Pradesh",
                          "Arunachal Pradesh",
                          "Assam",
                          "Bihar",
                          "Chhattisgarh",
                          "Goa",
                          "Gujarat",
                          "Haryana",
                          "Himachal Pradesh",
                          "Jharkhand",
                          "Karnataka",
                          "Kerala",
                          "Madhya Pradesh",
                          "Maharashtra",
                          "Manipur",
                          "Meghalaya",
                          "Mizoram",
                          "Nagaland",
                          "Odisha",
                          "Punjab",
                          "Rajasthan",
                          "Sikkim",
                          "Tamil Nadu",
                          "Telangana",
                          "Tripura",
                          "Uttar Pradesh",
                          "Uttarakhand",
                          "West Bengal",
                          "Delhi",
                          "Jammu and Kashmir",
                          "Ladakh",
                          "Puducherry",
                        ].map((state) => (
                          <option
                            key={state}
                            value={state}
                            className="bg-[#0f1419]"
                          >
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Bank Name
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="bank_name"
                        placeholder="Enter bank name"
                        value={editProfile.bank_name || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Account Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="account_number"
                        placeholder="Enter account number"
                        value={editProfile.account_number || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      IFSC Code
                    </label>
                    <div className="relative">
                      <Code className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="ifsc_code"
                        placeholder="Enter IFSC code"
                        value={editProfile.ifsc_code || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 pt-8 border-t border-gray-700/50">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#1a1f2e] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span>
                    {isNewProfile ? "Create Profile" : "Update Profile"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
