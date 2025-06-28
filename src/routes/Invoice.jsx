import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";

const InvoiceGenerator = () => {
  const { session } = UserAuth();
  const userId = session?.user?.id;
  const [searchParams] = useSearchParams();
  const editInvoiceId = searchParams.get("edit");

  const [creator, setCreator] = useState(null);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [notes, setNotes] = useState("");
  const [gstPercent, setGstPercent] = useState("");
  const [gstType, setGstType] = useState(""); // "CGST+SGST" or "IGST"
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchCreator();
      fetchItems();
      fetchCustomers();
      if (editInvoiceId) {
        fetchInvoiceForEdit();
      }
    }
  }, [userId, editInvoiceId]);

  useEffect(() => {
    const customer = customers.find((c) => c.brand_id === selectedCustomer);
    if (customer && creator) {
      // GST is always 18% total, but the type differs
      setGstPercent(18);
      if (customer.address_state === creator.state) {
        setGstType("CGST+SGST"); // 9% CGST + 9% SGST = 18% total
      } else {
        setGstType("IGST"); // 18% IGST
      }
    }
  }, [selectedCustomer, creator]);

  const fetchCreator = async () => {
    const { data, error } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error)
      toast.error(
        "Error fetching Cretor data first fill all you details in the profile section"
      );
    else setCreator(data);
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", userId);

    if (error) toast.error("Error fetching items");
    else setItems(data);
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId);

    if (error) toast.error("Error fetching customers");
    else setCustomers(data);
  };

  const fetchInvoiceForEdit = async () => {
    try {
      // Fetch invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("invoice_id", editInvoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Fetch invoice items
      const { data: invoiceItemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*, items(*)")
        .eq("invoice_id", editInvoiceId);

      if (itemsError) throw itemsError;

      // Set form data
      setSelectedCustomer(invoice.brand_id);
      setInvoiceDate(invoice.invoice_date);
      setNotes(invoice.notes || "");
      setInvoiceNumber(invoice.invoice_number);

      // Set invoice items
      const formattedItems = invoiceItemsData.map((item) => ({
        item_id: item.item_id,
        title: item.items.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price: item.unit_price,
      }));

      setInvoiceItems(formattedItems);
      setIsEditing(true);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Error loading invoice for editing");
    }
  };

  const addItemToInvoice = () => {
    const item = items.find((i) => i.item_id === selectedItem);
    if (!item) return;

    const existing = invoiceItems.find((i) => i.item_id === item.item_id);
    if (existing) {
      setInvoiceItems((prev) =>
        prev.map((i) =>
          i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setInvoiceItems((prev) => [
        ...prev,
        { ...item, quantity: 1, unit_price: item.price },
      ]);
    }
    setSelectedItem("");
  };

  const updateQuantity = (item_id, quantity) => {
    setInvoiceItems((prev) =>
      prev.map((i) =>
        i.item_id === item_id ? { ...i, quantity: parseInt(quantity) } : i
      )
    );
  };

  const removeItem = (item_id) => {
    setInvoiceItems((prev) => prev.filter((i) => i.item_id !== item_id));
  };

  const calculateTotal = () =>
    invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

  const generateInvoiceNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return creator?.prefix ? `${creator.prefix}-${random}` : `INV-${random}`;
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || invoiceItems.length === 0) {
      toast.warning("Select customer and at least one item");
      return;
    }

    setSubmitting(true);

    const totalAmount = calculateTotal();
    const gstAmount = (gstPercent / 100) * totalAmount;
    const netAmount = totalAmount + gstAmount;

    try {
      if (isEditing) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({
            brand_id: selectedCustomer,
            invoice_date: invoiceDate,
            total_amount: totalAmount,
            gst_amount: gstAmount,
            net_amount: netAmount,
            notes,
          })
          .eq("invoice_id", editInvoiceId);

        if (invoiceError) throw invoiceError;

        // Delete existing items
        const { error: deleteError } = await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", editInvoiceId);

        if (deleteError) throw deleteError;

        // Insert new items
        const itemsPayload = invoiceItems.map((item) => ({
          id: uuidv4(),
          invoice_id: editInvoiceId,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.quantity * item.unit_price,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsPayload);

        if (itemsError) throw itemsError;

        toast.success("Invoice updated successfully!");
      } else {
        // Create new invoice
        const invoice_id = uuidv4();
        const newInvoiceNumber = generateInvoiceNumber();

        const { error: invoiceError } = await supabase.from("invoices").insert([
          {
            invoice_id,
            user_id: userId,
            brand_id: selectedCustomer,
            invoice_number: newInvoiceNumber,
            invoice_date: invoiceDate,
            total_amount: totalAmount,
            gst_amount: gstAmount,
            net_amount: netAmount,
            notes,
            created_at: new Date().toISOString(),
          },
        ]);

        if (invoiceError) throw invoiceError;

        const itemsPayload = invoiceItems.map((item) => ({
          id: uuidv4(),
          invoice_id,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.quantity * item.unit_price,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsPayload);

        if (itemsError) throw itemsError;

        toast.success("Invoice created successfully!");
      }

      // Reset form
      if (!isEditing) {
        setInvoiceItems([]);
        setSelectedCustomer("");
        setNotes("");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error(
        isEditing ? "Error updating invoice" : "Error creating invoice"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = invoiceItems.length;
  const totalQuantity = invoiceItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700 ">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isEditing ? "Edit Invoice" : "Create Invoice"}
            </h1>
            <p className="text-gray-400 text-lg">
              {isEditing
                ? "Update your existing invoice"
                : "Generate a new invoice for your customer"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Invoice Date</p>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        {/* Customer Selection Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-400 text-xl">👤</span>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Customer Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Customer *
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.brand_id} value={c.brand_id}>
                    {c.brand_name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="flex items-end">
                <div className="bg-emerald-500/20 px-4 py-3 rounded-lg border border-emerald-500/30">
                  <p className="text-emerald-400 text-sm font-medium">
                    GST ({gstType})
                  </p>
                  <p className="text-emerald-300 text-lg font-bold">
                    {gstPercent}%
                  </p>
                  {gstType === "CGST+SGST" && (
                    <p className="text-emerald-200 text-xs mt-1">
                      CGST: 9% + SGST: 9%
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Items Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-emerald-400 text-xl">📦</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Add Items</h2>
          </div>

          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Item
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="">-- Select Item --</option>
                {items.map((item) => (
                  <option key={item.item_id} value={item.item_id}>
                    {item.title} - ₹{item.price}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addItemToInvoice}
              disabled={!selectedItem}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Invoice Items Table */}
        {invoiceItems.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                Invoice Items
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Item
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Quantity
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Unit Price
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Total
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {invoiceItems.map((item) => (
                    <tr
                      key={item.item_id}
                      className="hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-emerald-400 text-sm font-bold">
                              {item.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white font-medium">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.item_id, e.target.value)
                          }
                          className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-semibold">
                          ₹{item.unit_price?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-bold">
                          ₹{(item.unit_price * item.quantity)?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => removeItem(item.item_id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {invoiceItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {totalItems}
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
                  <p className="text-gray-400 text-sm font-medium">Quantity</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {totalQuantity}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 text-xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Subtotal</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    ₹{calculateTotal().toLocaleString()}
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
                  <p className="text-gray-400 text-sm font-medium">
                    GST ({gstType}) {gstPercent}%
                  </p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">
                    ₹{((gstPercent / 100) * calculateTotal()).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-orange-400 text-xl">🧾</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Net Total Card */}
        {invoiceItems.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-xl border border-emerald-600 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-lg font-medium">
                  Net Total Amount
                </p>
                <p className="text-4xl font-bold text-white mt-2">
                  ₹
                  {(
                    calculateTotal() +
                    (gstPercent / 100) * calculateTotal()
                  ).toLocaleString()}
                </p>
              </div>
              <div className="w-16 h-16 bg-emerald-500/30 rounded-xl flex items-center justify-center">
                <span className="text-emerald-200 text-2xl">💎</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-400 text-xl">📝</span>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Additional Notes
            </h2>
          </div>

          <textarea
            placeholder="Add any additional notes or terms for this invoice..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              submitting || !selectedCustomer || invoiceItems.length === 0
            }
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
          >
            {submitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Invoice"
              : "Create Invoice"}
          </button>
        </div>
      </div>

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

export default InvoiceGenerator;
