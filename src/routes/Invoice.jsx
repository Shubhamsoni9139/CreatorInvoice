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
      setGstPercent(customer.address_state === creator.state ? 9 : 18);
    }
  }, [selectedCustomer, creator]);

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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Navbar />
      <h2 className="text-2xl font-bold mb-6 mt-20">
        {isEditing ? "Edit Invoice" : "Create Invoice"}
      </h2>

      {/* Customer */}
      <div className="mb-4">
        <label className="block text-gray-400 mb-1">Select Customer</label>
        <select
          className="bg-gray-800 text-white p-3 rounded w-full"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">-- Select --</option>
          {customers.map((c) => (
            <option key={c.brand_id} value={c.brand_id}>
              {c.brand_name} ({c.state})
            </option>
          ))}
        </select>
      </div>

      {/* Item dropdown */}
      <div className="mb-4 flex items-center gap-3">
        <select
          className="bg-gray-800 text-white p-3 rounded w-full"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">-- Select Item --</option>
          {items.map((item) => (
            <option key={item.item_id} value={item.item_id}>
              {item.title} ₹{item.price}
            </option>
          ))}
        </select>
        <button
          onClick={addItemToInvoice}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Invoice Table */}
      {invoiceItems.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="w-full bg-gray-800 border border-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit Price</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Remove</th>
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
                      className="bg-gray-700 w-16 p-1 rounded"
                    />
                  </td>
                  <td className="px-3 py-2">₹{item.unit_price}</td>
                  <td className="px-3 py-2">
                    ₹{item.unit_price * item.quantity}
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
      <div className="text-sm text-gray-300 space-y-2 mb-6">
        <p>Items: {totalItems}</p>
        <p>Quantity: {totalQuantity}</p>
        <p>Subtotal: ₹{calculateTotal()}</p>
        <p>
          GST ({gstPercent}%): ₹{(gstPercent / 100) * calculateTotal()}
        </p>
        <p className="text-white font-bold">
          Net: ₹{calculateTotal() + (gstPercent / 100) * calculateTotal()}
        </p>
      </div>

      {/* Notes */}
      <textarea
        placeholder="Add notes (optional)"
        className="w-full bg-gray-800 text-white p-3 rounded mb-4"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-emerald-500 px-6 py-3 rounded font-semibold hover:bg-emerald-600"
      >
        {submitting ? "Saving..." : "Save Invoice"}
      </button>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default InvoiceGenerator;
