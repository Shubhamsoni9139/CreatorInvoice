import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  User,
  X,
  Users,
  Filter,
} from "lucide-react";

const STATES = [
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

const Customer = () => {
  const { session } = UserAuth();
  const userId = session?.user?.id;

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load customers.");
    } else {
      setCustomers(data);
      setFilteredCustomers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchCustomers();
  }, [userId]);

  // Filter customers based on search term and state
  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.brand_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.contact_person
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.brand_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedState) {
      filtered = filtered.filter(
        (customer) => customer.address_state === selectedState
      );
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, selectedState, customers]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      user_id: userId,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("customers")
        .update(payload)
        .eq("brand_id", editingId);
    } else {
      result = await supabase
        .from("customers")
        .insert([{ ...payload, brand_id: uuidv4(), created_at: new Date() }]);
    }

    if (result.error) {
      toast.error("Error saving customer");
    } else {
      toast.success(editingId ? "Customer updated!" : "Customer added!");
      setForm({});
      setEditingId(null);
      setIsModalOpen(false);
      fetchCustomers();
    }
    setLoading(false);
  };

  const handleEdit = (customer) => {
    setForm(customer);
    setEditingId(customer.brand_id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this customer?")) {
        return;
      }

      setLoading(true);
      console.log("Attempting to delete customer with ID:", id);
      console.log("Current user ID:", userId);

      // First verify the customer exists and belongs to the user
      const { data: customer, error: fetchError } = await supabase
        .from("customers")
        .select("brand_id")
        .eq("brand_id", id)
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching customer:", fetchError);
        toast.error("Error verifying customer. Please try again.");
        return;
      }

      if (!customer) {
        console.error("Customer not found or doesn't belong to user");
        toast.error(
          "Customer not found or you don't have permission to delete it."
        );
        return;
      }

      // Proceed with deletion
      const { error: deleteError } = await supabase
        .from("customers")
        .delete()
        .eq("brand_id", id)
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        toast.error(`Failed to delete customer: ${deleteError.message}`);
      } else {
        console.log("Customer deleted successfully");
        toast.success("Customer deleted successfully!");
        // Update local state immediately
        setCustomers((prevCustomers) =>
          prevCustomers.filter((c) => c.brand_id !== id)
        );
        setFilteredCustomers((prevCustomers) =>
          prevCustomers.filter((c) => c.brand_id !== id)
        );
      }
    } catch (err) {
      console.error("Unexpected error during delete:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({});
    setEditingId(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedState("");
  };

  if (loading && customers.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-white text-lg">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
              <p className="text-gray-400">
                Manage your customer database and contact information
              </p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-white font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Customers</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {customers.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active States</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {new Set(customers.map((c) => c.address_state)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">With GST</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {customers.filter((c) => c.gst_number).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="pl-12 pr-8 py-3 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="">All States</option>
                {STATES.map((state) => (
                  <option key={state} value={state} className="bg-[#0f1419]">
                    {state}
                  </option>
                ))}
              </select>
            </div>
            {(searchTerm || selectedState) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-600/50 text-white rounded-xl hover:bg-gray-600 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Customer Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-[#1a1f2e] rounded-2xl p-12 text-center border border-gray-700/50">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {customers.length === 0
                ? "No customers yet"
                : "No customers found"}
            </h3>
            <p className="text-gray-400 mb-6">
              {customers.length === 0
                ? "Start by adding your first customer to get started"
                : "Try adjusting your search filters to find what you're looking for"}
            </p>
            {customers.length === 0 && (
              <button
                onClick={openModal}
                className="bg-emerald-500 px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all text-white font-medium"
              >
                Add Your First Customer
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.brand_id}
                className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 truncate">
                  {customer.brand_name}
                </h3>

                <div className="space-y-3">
                  {customer.contact_person && (
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm truncate">
                        {customer.contact_person}
                      </span>
                    </div>
                  )}

                  {customer.brand_email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm truncate">
                        {customer.brand_email}
                      </span>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm line-clamp-2">
                        {customer.address}, {customer.address_state}
                      </span>
                    </div>
                  )}

                  {customer.gst_number && (
                    <div className="flex items-center space-x-3">
                      <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">
                        GST: {customer.gst_number}
                      </span>
                    </div>
                  )}

                  {customer.pan_number && (
                    <div className="flex items-center space-x-3">
                      <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">
                        PAN: {customer.pan_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f2e] rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {editingId ? "Edit Customer" : "Add New Customer"}
                    </h3>
                    <p className="text-gray-400 mt-1">
                      {editingId
                        ? "Update customer information"
                        : "Enter customer details"}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 bg-gray-600/50 text-gray-400 hover:text-white hover:bg-gray-600 rounded-xl transition-all flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Brand Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="brand_name"
                          placeholder="Enter brand name"
                          value={form.brand_name || ""}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Contact Person
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="contact_person"
                          placeholder="Enter contact person name"
                          value={form.contact_person || ""}
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
                          name="brand_email"
                          placeholder="Enter email address"
                          type="email"
                          value={form.brand_email || ""}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        GST Number
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          name="gst_number"
                          placeholder="Enter GST number"
                          value={form.gst_number || ""}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
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
                          value={form.pan_number || ""}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        State *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                        <select
                          name="address_state"
                          value={form.address_state || ""}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="" className="bg-[#0f1419]">
                            Select State
                          </option>
                          {STATES.map((state) => (
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Full Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        name="address"
                        placeholder="Enter complete address"
                        value={form.address || ""}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700/50">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-600/50 text-white rounded-xl hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <span>
                          {editingId ? "Update Customer" : "Add Customer"}
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{
            backgroundColor: "#1a1f2e",
            border: "1px solid rgba(75, 85, 99, 0.3)",
          }}
        />
      </div>
    </div>
  );
};

export default Customer;
