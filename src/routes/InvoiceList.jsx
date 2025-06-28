import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import InvoiceTemplate from "../components/InvoiceTemplate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Eye,
  MoreHorizontal,
  Edit3,
  Trash2,
  Filter,
  Search,
  X,
  Home,
  Settings,
  Share2,
  Sparkles,
  Target,
  Zap,
  Shield,
  CreditCard,
  Building,
  Hash,
  Percent,
  ArrowRight,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

      const invoiceData = invoiceRes.data || [];
      const customerData = customerRes.data || [];

      const itemMap = {};
      (itemRes.data || []).forEach((item) => {
        itemMap[item.item_id] = item;
      });

      if (invoiceData.length > 0) {
        const invoiceItemsRes = await supabase
          .from("invoice_items")
          .select("*")
          .in(
            "invoice_id",
            invoiceData.map((inv) => inv.invoice_id)
          );

        if (invoiceItemsRes.error) throw invoiceItemsRes.error;

        const invoiceMap = {};
        (invoiceItemsRes.data || []).forEach((item) => {
          if (!invoiceMap[item.invoice_id]) invoiceMap[item.invoice_id] = [];
          invoiceMap[item.invoice_id].push(item);
        });

        const mergedInvoices = invoiceData.map((inv) => ({
          ...inv,
          customer: customerData.find((c) => c.brand_id === inv.brand_id),
          items: invoiceMap[inv.invoice_id] || [],
        }));

        setInvoices(mergedInvoices);
      } else {
        setInvoices([]);
      }

      setItemsMap(itemMap);
    } catch (error) {
      console.error("❌ Error fetching invoices:", error.message || error);
      toast.error("Failed to fetch invoices");
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
            customer={invoice.customer}
            items={invoice.items}
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
  const handleShareInvoice = async (invoice, e) => {
    e.stopPropagation();

    try {
      // Generate the public link
      const currentDomain = window.location.origin;
      const shareLink = `${currentDomain}/invoice/${invoice.invoice_id}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareLink);

      toast.success("Invoice link copied to clipboard! 📋");
    } catch (error) {
      console.error("❌ Error sharing invoice:", error);

      // Fallback for browsers that don't support clipboard API
      const currentDomain = window.location.origin;
      const shareLink = `${currentDomain}/invoice/${invoice.invoice_id}`;

      // Create a temporary input element to copy the text
      const tempInput = document.createElement("input");
      tempInput.value = shareLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);

      toast.success("Invoice link copied to clipboard! 📋");
    }
  };
  const updateInvoiceStatus = async (invoiceId, newStatus, e) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("invoice_id", invoiceId);

      if (error) throw error;

      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.invoice_id === invoiceId ? { ...inv, status: newStatus } : inv
        )
      );

      if (selectedInvoice?.invoice_id === invoiceId) {
        setSelectedInvoice((prev) => ({ ...prev, status: newStatus }));
      }

      toast.success(`Invoice status updated to ${newStatus}! ✨`);
    } catch (error) {
      console.error("❌ Error updating invoice status:", error.message);
      toast.error("Failed to update invoice status. Please try again.");
    }
  };

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

      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("invoice_id", invoiceId)
        .eq("user_id", userId);

      if (invoiceError) {
        console.error("❌ Error deleting invoice:", invoiceError);
        throw new Error(`Failed to delete invoice: ${invoiceError.message}`);
      }

      console.log("✅ Invoice deleted successfully");

      setInvoices((prevInvoices) =>
        prevInvoices.filter((inv) => inv.invoice_id !== invoiceId)
      );

      if (selectedInvoice?.invoice_id === invoiceId) {
        setSelectedInvoice(null);
        setShowPreview(false);
      }

      toast.success("Invoice deleted successfully! 🗑️");
    } catch (error) {
      console.error("❌ Delete operation failed:", error);
      toast.error(`Failed to delete invoice: ${error.message}`);
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

  // Filter and search invoices
  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "paid" && invoice.status === "paid") ||
        (activeFilter === "unpaid" && invoice.status === "unpaid") ||
        (activeFilter === "overdue" && invoice.status === "overdue");

      const matchesSearch =
        !searchTerm ||
        invoice.invoice_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.customer?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.customer?.brand_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "unpaid":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "overdue":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "unpaid":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e]">
      {/* Navigation Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0  to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 mb-8 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-4xl font-bold text-white">
                    Invoice Dashboard
                  </h1>
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <p className="text-xl text-gray-300 mb-6 max-w-2xl">
                Manage all your invoices, track payments, and monitor your
                business performance
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">Secure & Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Real-time Updates</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">Business Insights</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard/invoice")}
                className="group flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                <span>Create Invoice</span>
              </button>
              <button
                onClick={fetchInvoices}
                className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-3 rounded-xl transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Paid Amount</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ₹{paidAmount.toLocaleString()}
                </p>
                <p className="text-emerald-400 text-xs mt-1">
                  {paidCount} invoices
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Pending Amount
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  ₹{pendingAmount.toLocaleString()}
                </p>
                <p className="text-amber-400 text-xs mt-1">
                  {unpaidCount} invoices
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Overdue Amount
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  ₹{overdueAmount.toLocaleString()}
                </p>
                <p className="text-red-400 text-xs mt-1">
                  {overdueCount} invoices
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices by number or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0f1419] border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === "all"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                All ({invoices.length})
              </button>
              <button
                onClick={() => setActiveFilter("paid")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === "paid"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                Paid ({paidCount})
              </button>
              <button
                onClick={() => setActiveFilter("unpaid")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === "unpaid"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                Unpaid ({unpaidCount})
              </button>
              <button
                onClick={() => setActiveFilter("overdue")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === "overdue"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                Overdue ({overdueCount})
              </button>
            </div>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {searchTerm || activeFilter !== "all"
                ? "No invoices found"
                : "No invoices yet"}
            </h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              {searchTerm || activeFilter !== "all"
                ? "Try adjusting your search terms or filters"
                : "Get started by creating your first invoice"}
            </p>
            {!searchTerm && activeFilter === "all" && (
              <button
                onClick={() => navigate("/dashboard/invoice")}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Invoice</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Invoice Table */}
            <div
              className={`${
                showPreview ? "xl:w-1/2" : "w-full"
              } bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden`}
            >
              <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Invoices ({filteredInvoices.length})
                  </h2>
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 bg-[#0f1419] border border-gray-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                      <option value="created_at">Sort by Date</option>
                      <option value="invoice_number">Sort by Number</option>
                      <option value="net_amount">Sort by Amount</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="p-1.5 bg-[#0f1419] border border-gray-600/50 rounded-lg text-gray-400 hover:text-white transition-all"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/30">
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
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.invoice_id}
                        onClick={() => handleRowClick(invoice)}
                        className={`group  cursor-pointer transition-all duration-200 ${
                          selectedInvoice?.invoice_id === invoice.invoice_id
                            ? "bg-gray-800/30 ring-2 ring-emerald-500/50"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                              {getStatusIcon(invoice.status)}
                            </div>
                            <div>
                              <span className="font-semibold text-white">
                                {invoice.invoice_number}
                              </span>
                              <p className="text-gray-400 text-sm">
                                #{invoice.invoice_id?.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-white font-medium">
                              {invoice.customer?.name ||
                                invoice.customer?.brand_name ||
                                "N/A"}
                            </span>
                            <p className="text-gray-400 text-sm">
                              {invoice.customer?.address_state || "Unknown"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {new Date(invoice.invoice_date).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          ₹{(invoice.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          ₹{(invoice.gst_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-white font-semibold text-lg">
                              ₹{(invoice.net_amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {getStatusIcon(invoice.status)}
                            <span className="capitalize">
                              {invoice.status || "unpaid"}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 opacity">
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
                                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all"
                                title="Mark as Paid"
                              >
                                <CheckCircle className="w-4 h-4" />
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
                                className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-all"
                                title="Mark as Unpaid"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(invoice);
                              }}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                generatePDF(invoice);
                              }}
                              disabled={generatingPDF}
                              className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all disabled:opacity-50"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleEdit(invoice, e)}
                              className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) =>
                                handleDelete(invoice.invoice_id, e)
                              }
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <div className="xl:w-1/2 bg-white text-black rounded-2xl overflow-hidden shadow-2xl">
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Invoice Preview
                    </h3>
                    <p className="text-gray-600">
                      {selectedInvoice.invoice_number}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        handleShareInvoice(selectedInvoice, {
                          stopPropagation: () => {},
                        })
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => generatePDF(selectedInvoice)}
                      disabled={generatingPDF}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {generatingPDF ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-auto">
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

export default InvoiceList;
