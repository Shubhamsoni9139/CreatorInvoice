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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between ">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-emerald-400 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">
                {isNewProfile ? "Create Your Profile" : "Edit Your Profile"}
              </h2>
            </div>
          </div>
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
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  <span>Personal Information</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="name"
                        placeholder="Full Name"
                        value={editProfile.name || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="phone_number"
                        placeholder="Phone Number"
                        value={editProfile.phone_number || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="email"
                        value={editProfile.email || ""}
                        disabled
                        className="w-full pl-10 pr-4 py-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      PAN Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="pan_number"
                        placeholder="PAN Number"
                        value={editProfile.pan_number || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GST Number{" "}
                      <span className="text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="gst_number"
                        placeholder="GST Number (optional)"
                        value={editProfile.gst_number || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Invoice Prefix (optional)
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="prefix"
                        placeholder="Invoice Prefix (optional)"
                        value={editProfile.prefix || ""}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: e.target.name,
                              value: e.target.value.toUpperCase(),
                            },
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Address & Banking Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Address & Banking</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        name="address"
                        placeholder="Address"
                        value={editProfile.address || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address State
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select
                        name="state"
                        value={editProfile.state || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                      >
                        <option value="" disabled>
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
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bank Name
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="bank_name"
                        placeholder="Bank Name"
                        value={editProfile.bank_name || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="account_number"
                        placeholder="Account Number"
                        value={editProfile.account_number || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      IFSC Code
                    </label>
                    <div className="relative">
                      <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="ifsc_code"
                        placeholder="IFSC Code"
                        value={editProfile.ifsc_code || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                {isNewProfile ? "Create Profile" : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
