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
      setFormData({ title: "", description: "", price: "" });
      setEditingItemId(null);
      setShowModal(false);
      fetchItems();
    }
  };

  const handleCreateItem = () => {
    setFormData({ title: "", description: "", price: "" });
    setEditingItemId(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      price: item.price,
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
    setFormData({ title: "", description: "", price: "" });
    setEditingItemId(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Items</h2>
        <button
          onClick={handleCreateItem}
          className="bg-emerald-500 px-4 py-2 rounded-lg hover:bg-emerald-600 transition font-semibold"
        >
          Create Item
        </button>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingItemId ? "Edit Item" : "Add New Item"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400"
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400"
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 placeholder-gray-400"
              />

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 py-3 rounded-lg hover:bg-emerald-600 transition"
                >
                  {editingItemId ? "Update Item" : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 py-3 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Table */}
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400">No items added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left bg-gray-800 border border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-700 text-gray-300">
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.item_id} className="border-t border-gray-700">
                  <td className="px-4 py-2">{item.title}</td>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">₹ {item.price}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.item_id)}
                      className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default Items;
