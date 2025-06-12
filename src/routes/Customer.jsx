import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId);

    if (error) toast.error("Failed to load customers.");
    else setCustomers(data);
  };

  useEffect(() => {
    if (userId) fetchCustomers();
  }, [userId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
  };

  const handleEdit = (customer) => {
    setForm(customer);
    setEditingId(customer.brand_id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("brand_id", id);

    if (error) toast.error("Failed to delete customer");
    else {
      toast.success("Customer deleted!");
      fetchCustomers();
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button
          onClick={openModal}
          className="bg-emerald-500 px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Add Customer
        </button>
      </div>

      {/* Customer Grid - Dynamic width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {customers.map((c) => (
          <div
            key={c.brand_id}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-2 min-w-0"
          >
            <h3 className="text-lg font-semibold truncate">{c.brand_name}</h3>
            <p className="text-sm">
              <strong>Contact:</strong>{" "}
              <span className="break-words">{c.contact_person}</span>
            </p>
            <p className="text-sm">
              <strong>Email:</strong>{" "}
              <span className="break-words">{c.brand_email}</span>
            </p>
            <p className="text-sm">
              <strong>Address:</strong>{" "}
              <span className="break-words">
                {c.address}, {c.address_state}
              </span>
            </p>
            <p className="text-sm">
              <strong>GST:</strong>{" "}
              <span className="break-words">{c.gst_number}</span>
            </p>
            <p className="text-sm">
              <strong>PAN:</strong>{" "}
              <span className="break-words">{c.pan_number}</span>
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => handleEdit(c)}
                className="bg-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(c.brand_id)}
                className="bg-black px-3 py-1 rounded text-sm hover:bg-black-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingId ? "Edit Customer" : "Add Customer"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="brand_name"
                    placeholder="Brand Name"
                    value={form.brand_name || ""}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <input
                    name="contact_person"
                    placeholder="Contact Person"
                    value={form.contact_person || ""}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    name="brand_email"
                    placeholder="Brand Email"
                    value={form.brand_email || ""}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    name="gst_number"
                    placeholder="GST Number"
                    value={form.gst_number || ""}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    name="pan_number"
                    placeholder="PAN Number"
                    value={form.pan_number || ""}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <select
                    name="address_state"
                    value={form.address_state || ""}
                    onChange={handleChange}
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select State</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  name="address"
                  placeholder="Full Address"
                  value={form.address || ""}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  required
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-600 px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {editingId ? "Update Customer" : "Add Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default Customer;
