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
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Info,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatorProfile = () => {
  const { session } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const userId = session?.user?.id;
  const authEmail = session?.user?.email;

  // Form steps configuration
  const steps = [
    {
      id: 1,
      title: "Personal Details",
      description: "Basic information about you",
      icon: User,
      fields: ["name", "phone_number", "pan_number"],
    },
    {
      id: 2,
      title: "Address & Location",
      description: "Where you're based",
      icon: MapPin,
      fields: ["address", "state"],
    },
    {
      id: 3,
      title: "Banking Details",
      description: "For payment processing",
      icon: CreditCard,
      fields: ["bank_name", "account_number", "ifsc_code"],
    },
    {
      id: 4,
      title: "Business Settings",
      description: "Optional business preferences",
      icon: Building,
      fields: ["gst_number", "prefix"],
    },
  ];

  const indianStates = [
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
  ];

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
        setEditProfile({ ...data, email: authEmail });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value || value.trim().length < 2) {
          newErrors[name] = "Name must be at least 2 characters";
        } else {
          delete newErrors[name];
        }
        break;
      case "phone_number":
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!value || !phoneRegex.test(value.replace(/\D/g, ""))) {
          newErrors[name] = "Enter a valid 10-digit mobile number";
        } else {
          delete newErrors[name];
        }
        break;
      case "pan_number":
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!value || !panRegex.test(value.toUpperCase())) {
          newErrors[name] = "Enter a valid PAN number (e.g., ABCDE1234F)";
        } else {
          delete newErrors[name];
        }
        break;
      case "address":
        if (!value || value.trim().length < 10) {
          newErrors[name] = "Address must be at least 10 characters";
        } else {
          delete newErrors[name];
        }
        break;
      case "state":
        if (!value) {
          newErrors[name] = "Please select your state";
        } else {
          delete newErrors[name];
        }
        break;
      case "bank_name":
        if (!value || value.trim().length < 2) {
          newErrors[name] = "Bank name is required";
        } else {
          delete newErrors[name];
        }
        break;
      case "account_number":
        if (!value || value.length < 9 || value.length > 18) {
          newErrors[name] = "Account number must be 9-18 digits";
        } else {
          delete newErrors[name];
        }
        break;
      case "ifsc_code":
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!value || !ifscRegex.test(value.toUpperCase())) {
          newErrors[name] = "Enter a valid IFSC code (e.g., SBIN0001234)";
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Auto-format specific fields
    if (name === "pan_number") {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    } else if (name === "ifsc_code") {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    } else if (name === "phone_number") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "account_number") {
      processedValue = value.replace(/\D/g, "");
    } else if (name === "prefix") {
      processedValue = value
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 4);
    }

    setEditProfile((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Validate field on change
    validateField(name, processedValue);
  };

  const isStepValid = (stepId) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return true;

    return step.fields.every((field) => {
      if (stepId === 4) return true; // Optional step
      const value = editProfile[field];
      return value && value.toString().trim() !== "" && !errors[field];
    });
  };

  const getCompletedSteps = () => {
    return steps.filter((step) => isStepValid(step.id)).length;
  };

  const handleNext = () => {
    if (currentStep < steps.length && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validate all required fields
    const requiredFields = [
      "name",
      "phone_number",
      "pan_number",
      "address",
      "state",
      "bank_name",
      "account_number",
      "ifsc_code",
    ];
    let hasErrors = false;

    requiredFields.forEach((field) => {
      if (!validateField(field, editProfile[field])) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      toast.error("Please fix all errors before saving");
      setSaving(false);
      return;
    }

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
      setProfile(fieldsToUpdate);
    }

    setSaving(false);
  };

  const renderStepContent = () => {
    const currentStepData = steps.find((s) => s.id === currentStep);

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="name"
                  placeholder="Enter your full name as per PAN card"
                  value={editProfile.name || ""}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-[#0f1419] border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.name ? "border-red-500" : "border-gray-600/50"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="phone_number"
                  placeholder="Enter 10-digit mobile number"
                  value={editProfile.phone_number || ""}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full pl-12 pr-4 py-4 bg-[#0f1419] border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.phone_number
                      ? "border-red-500"
                      : "border-gray-600/50"
                  }`}
                />
              </div>
              {errors.phone_number && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone_number}
                </p>
              )}
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
              <p className="text-gray-500 text-xs mt-2">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                PAN Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="pan_number"
                  placeholder="ABCDE1234F"
                  value={editProfile.pan_number || ""}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full pl-12 pr-4 py-4 bg-[#0f1419] border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.pan_number ? "border-red-500" : "border-gray-600/50"
                  }`}
                />
              </div>
              {errors.pan_number && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.pan_number}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Required for GST compliance and invoicing
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Complete Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  name="address"
                  placeholder="Enter your complete address including house/flat number, street, area, city, and pincode"
                  value={editProfile.address || ""}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full pl-12 pr-4 py-4 bg-[#0f1419] border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all resize-none ${
                    errors.address ? "border-red-500" : "border-gray-600/50"
                  }`}
                />
              </div>
              {errors.address && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                State <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Landmark className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  name="state"
                  value={editProfile.state || ""}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-[#0f1419] border rounded-xl text-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer ${
                    errors.state ? "border-red-500" : "border-gray-600/50"
                  }`}
                >
                  <option value="" disabled className="bg-[#0f1419]">
                    Select your state
                  </option>
                  {indianStates.map((state) => (
                    <option key={state} value={state} className="bg-[#0f1419]">
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              {errors.state && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.state}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Required for GST calculation (9% same state, 18% different
                state)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Bank Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Landmark className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="bank_name"
                  placeholder="e.g., State Bank of India"
                  value={editProfile.bank_name || ""}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-[#0f1419] border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.bank_name ? "border-red-500" : "border-gray-600/50"
                  }`}
                />
              </div>
              {errors.bank_name && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.bank_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Account Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="account_number"
                  placeholder="Enter your bank account number"
                  value={editProfile.account_number || ""}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-[#0f1419] border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.account_number
                      ? "border-red-500"
                      : "border-gray-600/50"
                  }`}
                />
              </div>
              {errors.account_number && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.account_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                IFSC Code <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Code className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="ifsc_code"
                  placeholder="SBIN0001234"
                  value={editProfile.ifsc_code || ""}
                  onChange={handleChange}
                  maxLength={11}
                  className={`w-full pl-12 pr-4 py-4 bg-[#0f1419] border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.ifsc_code ? "border-red-500" : "border-gray-600/50"
                  }`}
                />
              </div>
              {errors.ifsc_code && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.ifsc_code}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Find your IFSC code on your bank passbook or cheque
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 font-medium text-sm">
                    Banking Information
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    This information will appear on your invoices for client
                    payments. Ensure all details are accurate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-emerald-400 font-medium text-sm">
                    Optional Settings
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    These settings are optional but can help customize your
                    invoices and business setup.
                  </p>
                </div>
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
                  placeholder="22AAAAA0000A1Z5 (if registered)"
                  value={editProfile.gst_number || ""}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Only if you have GST registration
              </p>
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
                  placeholder="SHUB"
                  value={editProfile.prefix || ""}
                  onChange={handleChange}
                  maxLength={4}
                  className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Your invoices will be numbered like:{" "}
                {editProfile.prefix || "SHUB"}-001,{" "}
                {editProfile.prefix || "SHUB"}-002, etc.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <button className=" h-10 bg-emerald-500 rounded-xl p-2 flex items-center justify-center">
        <a
          href="/dashboard"
          className="text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 inline-block mr-2" />
          Back to Dashboard
        </a>

        <button />
      </button>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isNewProfile ? "Set Up Your Profile" : "Edit Your Profile"}
          </h1>
          <p className="text-gray-400">
            {isNewProfile
              ? "Let's get you set up to start creating professional invoices"
              : "Update your profile information and settings"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-300">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-400">
              {getCompletedSteps()} of {steps.length} sections completed
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = isStepValid(step.id);
            const isAccessible = step.id <= currentStep || isCompleted;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && setCurrentStep(step.id)}
                disabled={!isAccessible}
                className={`p-4 rounded-xl border transition-all text-left ${
                  isActive
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15"
                    : isAccessible
                    ? "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-800"
                    : "bg-gray-800/30 border-gray-700/30 text-gray-500 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-emerald-500"
                        : isCompleted
                        ? "bg-emerald-500/50"
                        : "bg-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <step.icon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
                <p className="text-xs opacity-75">{step.description}</p>
              </button>
            );
          })}
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

        {/* Form Content */}
        <div className="bg-[#1a1f2e] rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    {React.createElement(steps[currentStep - 1].icon, {
                      className: "w-5 h-5 text-white",
                    })}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {steps[currentStep - 1].title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {steps[currentStep - 1].description}
                    </p>
                  </div>
                </div>
              </div>

              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="px-8 py-6 bg-gray-800/30 border-t border-gray-700/50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    currentStep === 1
                      ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-3">
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStepValid(currentStep)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        isStepValid(currentStep)
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={saving || Object.keys(errors).length > 0}
                      className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all ${
                        saving || Object.keys(errors).length > 0
                          ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>
                            {isNewProfile ? "Create Profile" : "Update Profile"}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help with any field? All information is used for GST-compliant
            invoice generation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
