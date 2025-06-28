import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import InvoiceTemplate from "../components/InvoiceTemplate";

const InvoiceList = () => {
  const { session } = UserAuth();
  const userId = session?.user?.id;
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [creator, setCreator] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (userId) {
      fetchInvoices();
      fetchCreator();
    }
  }, [userId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const [invoiceRes, customerRes, itemRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase.from("customers").select("*").eq("user_id", userId),
        supabase.from("items").select("*").eq("user_id", userId),
      ]);

      if (invoiceRes.error) throw invoiceRes.error;
      if (customerRes.error) throw customerRes.error;
      if (itemRes.error) throw itemRes.error;

      const invoiceData = invoiceRes.data;
      const customerData = customerRes.data;

      const itemMap = {};
      itemRes.data.forEach((item) => {
        itemMap[item.item_id] = item;
      });

      const invoiceItemsRes = await supabase
        .from("invoice_items")
        .select("*")
        .in(
          "invoice_id",
          invoiceData.map((inv) => inv.invoice_id)
        );

      if (invoiceItemsRes.error) throw invoiceItemsRes.error;

      const invoiceMap = {};
      invoiceItemsRes.data.forEach((item) => {
        if (!invoiceMap[item.invoice_id]) invoiceMap[item.invoice_id] = [];
        invoiceMap[item.invoice_id].push(item);
      });

      const mergedInvoices = invoiceData.map((inv) => ({
        ...inv,
        customer: customerData.find((c) => c.brand_id === inv.brand_id),
        items: invoiceMap[inv.invoice_id] || [],
      }));

      setInvoices(mergedInvoices);
      setItemsMap(itemMap);
    } catch (error) {
      console.error("❌ Error fetching invoices:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreator = async () => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setCreator(data);
    } catch (error) {
      console.error("❌ Error fetching creator:", error.message || error);
    }
  };

  const generatePDF = async (invoice) => {
    const content = document.getElementById("invoice-template-pdf-render");

    if (!content) {
      alert("Invoice preview not available for PDF generation.");
      return;
    }

    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: true,
        width: content.offsetWidth,
        height: content.offsetHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let pageNum = 0;

      while (heightLeft > 0) {
        let position = -(pageNum * pageHeight);
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        if (heightLeft > 0) {
          pdf.addPage();
        }
        pageNum++;
      }

      pdf.save(`${invoice.invoice_number}.pdf`);
    } catch (err) {
      console.error("❌ PDF generation error:", err);
      alert("Error generating PDF. See console for more details.");
    }
  };

  // NEW: Function to update invoice status
  const updateInvoiceStatus = async (invoiceId, newStatus, e) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("invoice_id", invoiceId);

      if (error) throw error;

      // Update the local state
      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.invoice_id === invoiceId ? { ...inv, status: newStatus } : inv
        )
      );

      // Update selected invoice if it's the one being modified
      if (selectedInvoice?.invoice_id === invoiceId) {
        setSelectedInvoice((prev) => ({ ...prev, status: newStatus }));
      }

      alert(`Invoice status updated to ${newStatus}!`);
    } catch (error) {
      console.error("❌ Error updating invoice status:", error.message);
      alert("Failed to update invoice status. Please try again.");
    }
  };

  // IMPROVED: Better delete function with proper error handling
  const handleDelete = async (invoiceId, e) => {
    e.stopPropagation();

    if (
      !window.confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone."
      )
    )
      return;

    try {
      console.log("🗑️ Starting delete process for invoice:", invoiceId);

      // Start a transaction-like approach
      // First, delete all related invoice items
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoiceId);

      if (itemsError) {
        console.error("❌ Error deleting invoice items:", itemsError);
        throw new Error(
          `Failed to delete invoice items: ${itemsError.message}`
        );
      }

      console.log("✅ Invoice items deleted successfully");

      // Then delete the main invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("invoice_id", invoiceId)
        .eq("user_id", userId); // Extra security check

      if (invoiceError) {
        console.error("❌ Error deleting invoice:", invoiceError);
        throw new Error(`Failed to delete invoice: ${invoiceError.message}`);
      }

      console.log("✅ Invoice deleted successfully");

      // Update local state immediately for better UX
      setInvoices((prevInvoices) =>
        prevInvoices.filter((inv) => inv.invoice_id !== invoiceId)
      );

      // Clear preview if the deleted invoice was selected
      if (selectedInvoice?.invoice_id === invoiceId) {
        setSelectedInvoice(null);
        setShowPreview(false);
      }

      alert("Invoice deleted successfully!");
    } catch (error) {
      console.error("❌ Delete operation failed:", error);
      alert(`Failed to delete invoice: ${error.message}`);
      // Refresh the list to ensure data consistency
      await fetchInvoices();
    }
  };

  const handleEdit = (invoice, e) => {
    e.stopPropagation();
    navigate(`/dashboard/invoice?edit=${invoice.invoice_id}`);
  };

  const handlePreview = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleRowClick = (invoice) => {
    handlePreview(invoice);
  };

  // Calculate statistics
  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.net_amount || 0),
    0
  );
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.net_amount || 0), 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "unpaid")
    .reduce((sum, inv) => sum + (inv.net_amount || 0), 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + (inv.net_amount || 0), 0);

  const paidCount = invoices.filter((inv) => inv.status === "paid").length;
  const unpaidCount = invoices.filter((inv) => inv.status === "unpaid").length;
  const overdueCount = invoices.filter(
    (inv) => inv.status === "overdue"
  ).length;

  // Filter invoices based on active filter
  const filteredInvoices = invoices.filter((invoice) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "paid") return invoice.status === "paid";
    if (activeFilter === "unpaid") return invoice.status === "unpaid";
    if (activeFilter === "overdue") return invoice.status === "overdue";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "unpaid":
        return "text-red-600 bg-red-100";
      case "overdue":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return "✓";
      case "unpaid":
        return "⏳";
      case "overdue":
        return "⚠";
      default:
        return "○";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-8">Invoice Dashboard</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading invoices...</div>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Paid Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{paidAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-400 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{pendingAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-500 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Overdue Amount</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{overdueAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-500 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveFilter("paid")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeFilter === "paid"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Paid ({paidCount})
            </button>
            <button
              onClick={() => setActiveFilter("unpaid")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeFilter === "unpaid"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Unpaid ({unpaidCount})
            </button>
            <button
              onClick={() => setActiveFilter("overdue")}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeFilter === "overdue"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Overdue ({overdueCount})
            </button>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400 text-lg">
                No invoices found for the selected filter.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Invoice Table */}
              <div
                className={`${
                  showPreview ? "lg:w-1/2" : "w-full"
                } bg-gray-800 rounded-lg overflow-hidden`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Invoice
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          GST
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Total
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice.invoice_id}
                          onClick={() => handleRowClick(invoice)}
                          className={`hover:bg-gray-700 cursor-pointer transition-colors ${
                            selectedInvoice?.invoice_id === invoice.invoice_id
                              ? "bg-gray-700 ring-2 ring-emerald-500"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span
                                className={`mr-2 ${
                                  getStatusIcon(invoice.status) === "✓"
                                    ? "text-green-500"
                                    : getStatusIcon(invoice.status) === "⚠"
                                    ? "text-orange-500"
                                    : "text-yellow-500"
                                }`}
                              >
                                {getStatusIcon(invoice.status)}
                              </span>
                              <span className="font-medium">
                                {invoice.invoice_number}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {invoice.customer?.brand_name || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {new Date(
                              invoice.invoice_date
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            ₹{(invoice.total_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            ₹{(invoice.gst_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-gray-300 font-medium">
                            ₹{(invoice.net_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                invoice.status
                              )}`}
                            >
                              {invoice.status === "paid"
                                ? "Paid"
                                : invoice.status === "unpaid"
                                ? "Unpaid"
                                : "Overdue"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              {/* Status Toggle Buttons */}
                              {invoice.status === "unpaid" && (
                                <button
                                  onClick={(e) =>
                                    updateInvoiceStatus(
                                      invoice.invoice_id,
                                      "paid",
                                      e
                                    )
                                  }
                                  className="text-green-400 hover:text-green-300 text-sm font-medium px-2 py-1 rounded bg-green-400/10 hover:bg-green-400/20 transition-colors"
                                >
                                  Mark Paid
                                </button>
                              )}
                              {invoice.status === "paid" && (
                                <button
                                  onClick={(e) =>
                                    updateInvoiceStatus(
                                      invoice.invoice_id,
                                      "unpaid",
                                      e
                                    )
                                  }
                                  className="text-yellow-400 hover:text-yellow-300 text-sm font-medium px-2 py-1 rounded bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors"
                                >
                                  Mark Unpaid
                                </button>
                              )}
                              {invoice.status === "overdue" && (
                                <>
                                  <button
                                    onClick={(e) =>
                                      updateInvoiceStatus(
                                        invoice.invoice_id,
                                        "paid",
                                        e
                                      )
                                    }
                                    className="text-green-400 hover:text-green-300 text-sm font-medium px-2 py-1 rounded bg-green-400/10 hover:bg-green-400/20 transition-colors"
                                  >
                                    Mark Paid
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      updateInvoiceStatus(
                                        invoice.invoice_id,
                                        "unpaid",
                                        e
                                      )
                                    }
                                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium px-2 py-1 rounded bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors"
                                  >
                                    Mark Unpaid
                                  </button>
                                </>
                              )}

                              {/* Action Buttons */}
                              <button
                                onClick={(e) => handleEdit(invoice, e)}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium px-2 py-1 rounded bg-blue-400/10 hover:bg-blue-400/20 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) =>
                                  handleDelete(invoice.invoice_id, e)
                                }
                                className="text-red-400 hover:text-red-300 text-sm font-medium px-2 py-1 rounded bg-red-400/10 hover:bg-red-400/20 transition-colors"
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
              </div>

              {/* Invoice Preview */}
              {showPreview && selectedInvoice && (
                <div className="lg:w-1/2 bg-white text-black rounded-lg overflow-auto max-h-screen">
                  <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Invoice Preview</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generatePDF(selectedInvoice)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <InvoiceTemplate
                      invoice={selectedInvoice}
                      creator={creator}
                      customer={selectedInvoice.customer}
                      items={selectedInvoice.items}
                      itemsMap={itemsMap}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden element for PDF generation */}
          {selectedInvoice && (
            <div
              id="invoice-template-pdf-render"
              className="absolute -left-[9999px] -top-[9999px]"
            >
              <InvoiceTemplate
                invoice={selectedInvoice}
                creator={creator}
                customer={selectedInvoice.customer}
                items={selectedInvoice.items}
                itemsMap={itemsMap}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InvoiceList;
