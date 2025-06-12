import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InvoiceGenerator = () => {
  const { session } = UserAuth();
  const userId = session?.user?.id;

  const [creator, setCreator] = useState(null);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [notes, setNotes] = useState("");
  const [gstPercent, setGstPercent] = useState(18);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchCreator();
      fetchItems();
      fetchCustomers();
    }
  }, [userId]);

  const fetchCreator = async () => {
    const { data, error } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) toast.error("Error fetching creator");
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

  const addItemToInvoice = (item) => {
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

  const calculateTotal = () => {
    return invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

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
    const invoice_id = uuidv4();
    const invoiceNumber = generateInvoiceNumber();

    // Save invoice
    const { error: invoiceError } = await supabase.from("invoices").insert([
      {
        invoice_id,
        user_id: userId,
        brand_id: selectedCustomer,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        total_amount: totalAmount,
        gst_amount: gstAmount,
        net_amount: netAmount,
        notes,
        created_at: new Date().toISOString(),
      },
    ]);

    if (invoiceError) {
      toast.error("Error creating invoice");
      setSubmitting(false);
      return;
    }

    // Save invoice items
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

    if (itemsError) {
      toast.error("Error saving line items");
    } else {
      toast.success("Invoice created successfully!");
      setInvoiceItems([]);
      setSelectedCustomer("");
      setNotes("");
    }

    setSubmitting(false);
  };

  const totalItems = invoiceItems.length;
  const totalQuantity = invoiceItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-6">Create Invoice</h2>

      {/* Customer Selector */}
      <div className="mb-4">
        <label className="block mb-1 text-gray-400">Select Customer</label>
        <select
          className="bg-gray-800 text-white p-3 rounded w-full"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">-- Select --</option>
          {customers.map((brand) => (
            <option key={brand.brand_id} value={brand.brand_id}>
              {brand.brand_name} ({brand.brand_email})
            </option>
          ))}
        </select>
      </div>

      {/* Items List */}
      <div className="mb-4">
        <label className="block mb-1 text-gray-400">Add Items</label>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.item_id}
              onClick={() => addItemToInvoice(item)}
              className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            >
              {item.title} ₹{item.price}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Items Table */}
      {invoiceItems.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full table-auto bg-gray-800 border border-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit Price</th>
                <th className="px-3 py-2">Line Total</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item) => (
                <tr key={item.item_id} className="border-t border-gray-600">
                  <td className="px-3 py-2">{item.title}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.item_id, e.target.value)
                      }
                      className="bg-gray-700 w-16 p-1 rounded text-white"
                    />
                  </td>
                  <td className="px-3 py-2">₹{item.unit_price}</td>
                  <td className="px-3 py-2">
                    ₹{item.quantity * item.unit_price}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeItem(item.item_id)}
                      className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div className="space-y-2 text-sm text-gray-300 mb-4">
        <p>Items Selected: {totalItems}</p>
        <p>Total Quantity: {totalQuantity}</p>
        <p>Total: ₹{calculateTotal()}</p>
        <p>
          GST ({gstPercent}%): ₹{(gstPercent / 100) * calculateTotal()}
        </p>
        <p className="font-bold text-white">
          Net Amount: ₹
          {calculateTotal() + (gstPercent / 100) * calculateTotal()}
        </p>
      </div>

      {/* Notes */}
      <textarea
        placeholder="Add notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full bg-gray-800 text-white p-3 rounded mb-4"
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-emerald-500 px-6 py-3 rounded font-semibold hover:bg-emerald-600"
      >
        {submitting ? "Creating..." : "Generate Invoice"}
      </button>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default InvoiceGenerator;
