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

  const handleDelete = async (invoiceId) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      // First delete invoice items
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoiceId);

      if (itemsError) throw itemsError;

      // Then delete the invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("invoice_id", invoiceId);

      if (invoiceError) throw invoiceError;

      // Refresh the invoice list
      fetchInvoices();
      setSelectedInvoice(null);
      setShowPreview(false);
    } catch (error) {
      console.error("❌ Error deleting invoice:", error.message);
      alert("Failed to delete invoice. Please try again.");
    }
  };

  const handleEdit = (invoice) => {
    navigate(`/dashboard/invoice?edit=${invoice.invoice_id}`);
  };

  const handlePreview = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-6">Your Invoices</h2>

      {loading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar List */}
          <div className="w-full lg:w-1/3 space-y-4">
            {invoices.map((inv) => (
              <div
                key={inv.invoice_id}
                className={`bg-gray-800 p-4 rounded shadow hover:bg-gray-700 ${
                  selectedInvoice?.invoice_id === inv.invoice_id
                    ? "ring-2 ring-emerald-500"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{inv.invoice_number}</p>
                    <p>{inv.customer?.brand_name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(inv)}
                      className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleEdit(inv)}
                      className="px-2 py-1 bg-yellow-600 rounded hover:bg-yellow-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(inv.invoice_id)}
                      className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invoice Preview */}
          {showPreview && selectedInvoice && (
            <div className="w-full lg:w-2/3 bg-white text-black p-6 rounded overflow-auto">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => generatePDF(selectedInvoice)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Download PDF
                </button>
              </div>
              <div id="invoice-preview-display">
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
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
