import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Items = () => {
  const { session } = UserAuth();
  const userId = session?.user?.id;

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    hsn_sac_code: "",
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userId) fetchItems();
  }, [userId]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching items");
      console.error(error);
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast.warning("Title and Price are required.");
      return;
    }

    const itemPayload = {
      ...formData,
      price: parseFloat(formData.price),
      user_id: userId,
    };

    let result;
    if (editingItemId) {
      result = await supabase
        .from("items")
        .update(itemPayload)
        .eq("item_id", editingItemId);
      toast.success("Item updated!");
    } else {
      result = await supabase
        .from("items")
        .insert([{ ...itemPayload, item_id: uuidv4() }]);
      toast.success("Item added!");
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      setFormData({ title: "", description: "", price: "", hsn_sac_code: "" });
      setEditingItemId(null);
      setShowModal(false);
      fetchItems();
    }
  };

  const handleCreateItem = () => {
    setFormData({ title: "", description: "", price: "", hsn_sac_code: "" });
    setEditingItemId(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      price: item.price,
      hsn_sac_code: item.hsn_sac_code || "",
    });
    setEditingItemId(item.item_id);
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("item_id", itemId);
    if (error) {
      toast.error("Failed to delete item");
    } else {
      toast.success("Item deleted");
      fetchItems();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ title: "", description: "", price: "", hsn_sac_code: "" });
    setEditingItemId(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Items Management
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your products and services
            </p>
          </div>
          <button
            onClick={handleCreateItem}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
          >
            + Add New Item
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {items.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  ₹
                  {items
                    .reduce((sum, item) => sum + (item.price || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <span className="text-emerald-400 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Avg. Price</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  ₹
                  {items.length > 0
                    ? Math.round(
                        items.reduce(
                          (sum, item) => sum + (item.price || 0),
                          0
                        ) / items.length
                      ).toLocaleString()
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">All Items</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-400">Loading items...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-gray-400 text-lg mb-2">No items found</p>
              <p className="text-gray-500 text-sm mb-6">
                Get started by adding your first item
              </p>
              <button
                onClick={handleCreateItem}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Item
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Description
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      HSN/SAC
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Price
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {items.map((item, index) => (
                    <tr
                      key={item.item_id}
                      className="hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-emerald-400 font-bold">
                              {item.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {item.title}
                            </p>
                            <p className="text-gray-400 text-sm">
                              #{String(index + 1).padStart(3, "0")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300 max-w-xs truncate">
                          {item.description || "No description"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 font-mono text-sm">
                          {item.hsn_sac_code || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-semibold text-lg">
                          ₹{item.price?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.item_id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {editingItemId ? "Edit Item" : "Add New Item"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter item title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter item description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  HSN/SAC Code
                </label>
                <input
                  type="text"
                  name="hsn_sac_code"
                  placeholder="Enter HSN/SAC code"
                  value={formData.hsn_sac_code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                >
                  {editingItemId ? "Update Item" : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          backgroundColor: "#1f2937",
          color: "#fff",
          border: "1px solid #374151",
        }}
      />
    </div>
  );
};

export default Items;
