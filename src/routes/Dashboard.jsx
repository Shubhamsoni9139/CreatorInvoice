import React, { useState, useEffect } from "react";
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { UserAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const { session } = UserAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which invoice is being updated
  const [creator, setCreator] = useState(null);

  // Fetch creator data
  const fetchCreator = async () => {
    try {
      if (!session?.user?.id) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/creators?user_id=eq.${
          session.user.id
        }&select=*`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setCreator(data[0]);
      }
    } catch (err) {
      console.error("Error fetching creator:", err);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchCreator();
    }
  }, [session]);

  // Fetch invoices from Supabase
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Using fetch to call Supabase REST API
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/invoices?select=*,customers(brand_name)&user_id=eq.${
          session.user.id
        }&order=created_at.desc`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.message);
      // Fallback to mock data for demonstration
      setInvoices([
        {
          invoice_id: "1",
          invoice_number: "INV-2025-001",
          customers: { brand_name: "Tech Corp Ltd" },
          invoice_date: "2025-06-10",
          total_amount: 12500.0,
          gst_amount: 1875.0,
          net_amount: 14375.0,
          status: "paid",
          notes: "Monthly service charge",
          created_at: "2025-06-10T10:30:00Z",
        },
        {
          invoice_id: "2",
          invoice_number: "INV-2025-002",
          customers: { brand_name: "StartUp Inc" },
          invoice_date: "2025-06-12",
          total_amount: 8750.0,
          gst_amount: 1312.5,
          net_amount: 10062.5,
          status: "unpaid",
          notes: "Website development",
          created_at: "2025-06-12T14:20:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Update invoice status
  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
      setUpdatingStatus(invoiceId); // Show loading state for this specific invoice

      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/invoices?invoice_id=eq.${invoiceId}`,
        {
          method: "PATCH",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice.invoice_id === invoiceId
            ? { ...invoice, status: newStatus }
            : invoice
        )
      );

      // Show success message
      alert(`Invoice status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating invoice status:", err);
      alert("Failed to update invoice status. Please try again.");
    } finally {
      setUpdatingStatus(null); // Clear loading state
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [session]);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
  });

  const [filterStatus, setFilterStatus] = useState("all");

  // Calculate statistics from actual invoice data
  useEffect(() => {
    const newStats = invoices.reduce(
      (acc, invoice) => {
        const netAmount = parseFloat(invoice.net_amount) || 0;
        acc.totalRevenue += netAmount;
        acc.totalInvoices += 1;

        switch (invoice.status) {
          case "paid":
            acc.paidAmount += netAmount;
            acc.paidInvoices += 1;
            break;
          case "unpaid":
            // Check if overdue (more than 30 days)
            const invoiceDate = new Date(invoice.invoice_date);
            const today = new Date();
            const daysDiff = (today - invoiceDate) / (1000 * 60 * 60 * 24);

            if (daysDiff > 30) {
              acc.overdueAmount += netAmount;
              acc.overdueInvoices += 1;
            } else {
              acc.pendingAmount += netAmount;
              acc.pendingInvoices += 1;
            }
            break;
          default:
            acc.pendingAmount += netAmount;
            acc.pendingInvoices += 1;
            break;
        }
        return acc;
      },
      {
        totalRevenue: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
      }
    );

    setStats(newStats);
  }, [invoices]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      // Add your sign out logic here
      console.log("Signing out...");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status?.toLowerCase()) {
      case "paid":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "unpaid":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status, invoiceDate) => {
    // Check if unpaid invoice is overdue
    const isOverdue =
      status === "unpaid" &&
      invoiceDate &&
      (new Date() - new Date(invoiceDate)) / (1000 * 60 * 60 * 24) > 30;

    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "unpaid":
        return isOverdue ? (
          <AlertCircle className="w-4 h-4 text-red-600" />
        ) : (
          <Clock className="w-4 h-4 text-yellow-600" />
        );
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Filter invoices based on status, including overdue logic
  const filteredInvoices =
    filterStatus === "all"
      ? invoices
      : filterStatus === "overdue"
      ? invoices.filter((invoice) => {
          if (invoice.status !== "unpaid") return false;
          const daysDiff =
            (new Date() - new Date(invoice.invoice_date)) /
            (1000 * 60 * 60 * 24);
          return daysDiff > 30;
        })
      : invoices.filter((invoice) => invoice.status === filterStatus);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-b from-[#101212] to-[#08201D] min-h-screen">
      {/* Header */}
      <Navbar />
      {/* Main Content */}
      <div className="pt-24 pb-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-gradient-to-b from-[#101212] to-[#08201D]">
        {/* Welcome Section */}
        <div className="text-center mb-12 mt-10">
          <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4">
            Welcome,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-white">
              {creator?.name || "User"}
            </span>
          </h1>
          <p className="text-lg text-gray-300">
            Track and manage all your invoices and payments in one place
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300">Error: {error}</p>
              <button
                onClick={fetchInvoices}
                className="mt-2 text-sm text-red-400 hover:text-red-300 flex items-center justify-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(stats.paidAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Pending Amount</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatCurrency(stats.pendingAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Overdue Amount</p>
                    <p className="text-2xl font-bold text-red-400">
                      {formatCurrency(stats.overdueAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === "all"
                    ? "bg-green-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                All Invoices ({stats.totalInvoices})
              </button>
              <button
                onClick={() => setFilterStatus("paid")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === "paid"
                    ? "bg-green-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                Paid ({stats.paidInvoices})
              </button>
              <button
                onClick={() => setFilterStatus("unpaid")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === "unpaid"
                    ? "bg-green-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                Unpaid ({stats.pendingInvoices})
              </button>
              <button
                onClick={() => setFilterStatus("overdue")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === "overdue"
                    ? "bg-red-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                Overdue ({stats.overdueInvoices})
              </button>
            </div>

            {/* Invoices Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Invoice
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        GST
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.invoice_id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getStatusIcon(
                              invoice.status,
                              invoice.invoice_date
                            )}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-white">
                                {invoice.invoice_number}
                              </p>
                              <p className="text-xs text-gray-400">
                                {invoice.notes}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-white">
                            {invoice.customers?.brand_name ||
                              invoice.brand_name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">
                            {formatDate(invoice.invoice_date)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-white">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">
                            {formatCurrency(invoice.gst_amount)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-white">
                            {formatCurrency(invoice.net_amount)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusBadge(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() +
                              invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {invoice.status === "paid" ? (
                              <button
                                onClick={() =>
                                  updateInvoiceStatus(
                                    invoice.invoice_id,
                                    "unpaid"
                                  )
                                }
                                disabled={updatingStatus === invoice.invoice_id}
                                className={`text-sm transition-colors ${
                                  updatingStatus === invoice.invoice_id
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-400 hover:text-red-300"
                                }`}
                              >
                                {updatingStatus === invoice.invoice_id
                                  ? "Updating..."
                                  : "Mark Unpaid"}
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  updateInvoiceStatus(
                                    invoice.invoice_id,
                                    "paid"
                                  )
                                }
                                disabled={updatingStatus === invoice.invoice_id}
                                className={`text-sm transition-colors ${
                                  updatingStatus === invoice.invoice_id
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-yellow-400 hover:text-yellow-300"
                                }`}
                              >
                                {updatingStatus === invoice.invoice_id
                                  ? "Updating..."
                                  : "Mark Paid"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link to="/dashboard/invoice">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Create New Invoice
                </button>
              </Link>
              <Link to="/dashboard/customer">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Add Customer
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
