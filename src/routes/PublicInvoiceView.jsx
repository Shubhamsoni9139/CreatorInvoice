import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import InvoiceTemplate from "../components/InvoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Download,
  FileText,
  AlertCircle,
  RefreshCw,
  Shield,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

const PublicInvoiceView = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [creator, setCreator] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      console.log("🔍 Fetching invoice with ID:", invoiceId);
      fetchPublicInvoice();
    } else {
      console.error("❌ No invoice ID provided");
      setError("No invoice ID provided");
      setLoading(false);
    }
  }, [invoiceId]);

  const fetchPublicInvoice = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📋 Starting to fetch invoice data for ID:", invoiceId);

      // Validate invoiceId format (should be a valid UUID)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(invoiceId)) {
        throw new Error("Invalid invoice ID format");
      }

      // Fetch invoice details
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("invoice_id", invoiceId)
        .single();

      if (invoiceError) {
        console.error("❌ Invoice fetch error:", invoiceError);
        if (invoiceError.code === "PGRST116") {
          throw new Error("Invoice not found");
        }
        throw new Error(`Database error: ${invoiceError.message}`);
      }

      if (!invoiceData) {
        throw new Error("Invoice not found");
      }

      console.log("✅ Invoice data fetched:", invoiceData);
      setInvoice(invoiceData);

      // Fetch creator details using the correct field name
      console.log(
        "🔍 Fetching creator with user_id:",
        invoiceData.creator_id || invoiceData.user_id
      );

      // Try creator_id first, then fall back to user_id
      const creatorId = invoiceData.creator_id || invoiceData.user_id;

      if (!creatorId) {
        throw new Error("No creator ID found in invoice data");
      }

      const { data: creatorData, error: creatorError } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", creatorId)
        .single();

      if (creatorError) {
        console.error("❌ Creator fetch error:", creatorError);
        throw new Error(
          `Failed to fetch creator details: ${creatorError.message}`
        );
      }

      console.log("✅ Creator data fetched:", creatorData);
      setCreator(creatorData);

      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("brand_id", invoiceData.brand_id)
        .single();

      if (customerError) {
        console.error("❌ Customer fetch error:", customerError);
        throw new Error(
          `Failed to fetch customer details: ${customerError.message}`
        );
      }

      console.log("✅ Customer data fetched:", customerData);
      setCustomer(customerData);

      // Fetch invoice items
      const { data: invoiceItemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId);

      if (itemsError) {
        console.error("❌ Invoice items fetch error:", itemsError);
        throw new Error(`Failed to fetch invoice items: ${itemsError.message}`);
      }

      console.log("✅ Invoice items fetched:", invoiceItemsData);
      setItems(invoiceItemsData || []);

      // Fetch items details for mapping
      if (invoiceItemsData && invoiceItemsData.length > 0) {
        const itemIds = invoiceItemsData.map((item) => item.item_id);
        const { data: itemsData, error: itemsMapError } = await supabase
          .from("items")
          .select("*")
          .in("item_id", itemIds);

        if (itemsMapError) {
          console.error("❌ Items mapping fetch error:", itemsMapError);
          throw new Error(
            `Failed to fetch item details: ${itemsMapError.message}`
          );
        }

        const itemMap = {};
        (itemsData || []).forEach((item) => {
          itemMap[item.item_id] = item;
        });

        console.log("✅ Items mapping created:", itemMap);
        setItemsMap(itemMap);
      }

      console.log("🎉 All data fetched successfully");
    } catch (error) {
      console.error("❌ Error fetching public invoice:", error);
      setError(error.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (generatingPDF) return;

    setGeneratingPDF(true);
    toast.info("Generating PDF... Please wait");

    try {
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.width = "210mm"; // A4 width
      tempContainer.style.backgroundColor = "white";
      tempContainer.style.padding = "0";
      tempContainer.style.margin = "0";
      tempContainer.style.fontFamily = "Arial, sans-serif";

      document.body.appendChild(tempContainer);

      // Create a React root and render the invoice template
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(tempContainer);

      await new Promise((resolve) => {
        root.render(
          <InvoiceTemplate
            invoice={invoice}
            creator={creator}
            customer={customer}
            items={items}
            itemsMap={itemsMap}
          />
        );
        // Wait for rendering to complete
        setTimeout(resolve, 1000);
      });

      // Generate canvas with proper settings
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: tempContainer.scrollWidth,
        windowHeight: tempContainer.scrollHeight,
      });

      // Clean up the temporary container
      root.unmount();
      document.body.removeChild(tempContainer);

      // Create PDF with exact A4 dimensions
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png", 1.0);

      // Add image to PDF - only add one page
      if (imgHeight <= pdfHeight) {
        // Image fits in one page
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // Image is too tall, scale it to fit one page
        const scaledHeight = pdfHeight;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(imgData, "PNG", 0, 0, scaledWidth, scaledHeight);
      }

      // Save the PDF
      pdf.save(`${invoice.invoice_number || "invoice"}.pdf`);
      toast.success("PDF downloaded successfully! 🎉");
    } catch (err) {
      console.error("❌ PDF generation error:", err);
      toast.error("Error generating PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading invoice...</p>
          <p className="text-gray-400 text-sm mt-2">Invoice ID: {invoiceId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-[#1a1f2e] rounded-2xl border border-red-500/20 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 border-b border-red-500/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Invoice Not Found
                  </h1>
                  <p className="text-gray-400 mt-1">
                    The requested invoice could not be loaded
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">{error}</p>
              <div className="bg-gray-800/50 rounded-lg p-3 mb-6">
                <p className="text-gray-400 text-sm">
                  <strong>Invoice ID:</strong> {invoiceId || "Not provided"}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e]">
      {/* Header */}

      {/* Invoice Content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-white text-black rounded-2xl overflow-hidden shadow-2xl">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Invoice Details
              </h3>
              <p className="text-gray-600">
                Created on{" "}
                {new Date(invoice?.invoice_date).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-gray-600">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Professional Invoice</span>
              </div>
              <button
                onClick={generatePDF}
                disabled={generatingPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {generatingPDF ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            <InvoiceTemplate
              invoice={invoice}
              creator={creator}
              customer={customer}
              items={items}
              itemsMap={itemsMap}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Secure & Verified</h4>
                <p className="text-gray-400 text-sm">
                  This invoice is digitally verified and secure
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-emerald-400 font-bold text-lg">
                  ₹{(invoice?.total_amount || 0).toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs">Total Amount</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">
                  {invoice?.status === "paid" ? "PAID" : "PENDING"}
                </div>
                <div className="text-gray-400 text-xs">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Powered By */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center space-x-2">
            <span>Powered by</span>
            <span className="text-emerald-400 font-semibold">
              CreatorInvoice
            </span>
            <ExternalLink className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Toast Container */}
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
        toastStyle={{
          backgroundColor: "#1a1f2e",
          color: "#fff",
          border: "1px solid #374151",
        }}
      />
    </div>
  );
};

export default PublicInvoiceView;
