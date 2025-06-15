import React from "react";

const InvoiceTemplate = ({ invoice, creator, customer, items, itemsMap }) => {
  if (!invoice || !creator || !customer || !items || !itemsMap) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#4A5568" }}>
        Select an invoice to preview or data missing.
      </div>
    );
  }

  const calculateTotal = (invoiceItems) =>
    invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  function numberToWords(num) {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    function convert(n) {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + convert(n % 100) : "")
        );
      if (n < 100000)
        return (
          convert(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + convert(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          convert(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + convert(n % 100000) : "")
        );
      return (
        convert(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + convert(n % 10000000) : "")
      );
    }

    return convert(num).trim() + " Rupees";
  }

  const totalAmount = calculateTotal(items);
  const gstAmount = invoice.gst_amount;
  const netAmount = invoice.net_amount;
  const gstPercentage = ((gstAmount / (netAmount - gstAmount)) * 100).toFixed(
    2
  );

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        fontSize: "0.75rem",
        border: "1px solid #A0AEC0",
        padding: "1rem",
        backgroundColor: "#FFFFFF",
        color: "#000000",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #000000",
          paddingBottom: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ fontSize: "0.875rem", fontWeight: "bold" }}>
          TAXINVOICE
        </div>
        <div style={{ border: "1px solid #000000", padding: "0.25rem 0.5rem" }}>
          ORIGINAL FOR RECIPIENT
        </div>
      </div>

      {/* Company Details and Invoice Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          borderBottom: "1px solid #000000",
          paddingBottom: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "3rem",
              flexShrink: 0,
              marginRight: "0.5rem",
              border: "1px solid #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6rem",
            }}
          >
            <img src={creator?.logo} alt="Logo" />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "0.25rem",
              }}
            >
              {creator?.name || "Creator Name"}
            </h1>
            <p style={{ fontSize: "0.7rem" }}>
              {creator?.address || "Creator Address"}
            </p>
            <p style={{ fontSize: "0.7rem" }}>
              GSTIN: {creator?.gst_number || "GSTIN"}
            </p>
            <p style={{ fontSize: "0.7rem" }}>
              PAN Number: {creator?.pan_number || "PAN Number"}
            </p>
            <p style={{ fontSize: "0.7rem" }}>
              Mobile: {creator?.phone_number || "Mobile Number"}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}>
            <strong>Invoice No.</strong>
            <br />
            {invoice?.invoice_number || "Invoice Number"}
          </p>
          <p style={{ fontSize: "0.75rem" }}>
            <strong>Invoice Date</strong>
            <br />
            {new Date(invoice?.invoice_date).toLocaleDateString() ||
              "Invoice Date"}
          </p>
        </div>
      </div>

      {/* Bill To Section */}
      <div
        style={{
          borderBottom: "1px solid #000000",
          paddingBottom: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <p style={{ fontWeight: "bold", fontSize: "0.75rem" }}>BILL TO</p>
        <h2
          style={{
            fontSize: "0.875rem",
            fontWeight: "bold",
            marginBottom: "0.25rem",
          }}
        >
          {customer?.brand_name || "Customer Name"}
        </h2>
        <p style={{ fontSize: "0.75rem" }}>
          Address: {customer?.address || "Customer Address"}
        </p>
        <p style={{ fontSize: "0.75rem" }}>
          GSTIN: {customer?.gst_number || "GSTIN"}
        </p>
        <p style={{ fontSize: "0.75rem" }}>
          PAN Number: {customer?.pan_number || "PAN Number"}
        </p>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          textAlign: "left",
          borderCollapse: "collapse",
          marginBottom: "0.5rem",
        }}
      >
        <thead>
          <tr
            style={{ backgroundColor: "#E2E8F0", border: "1px solid #000000" }}
          >
            <th
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                width: "2.5rem",
              }}
            >
              S.NO
            </th>
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              SERVICES
            </th>
            <th
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                width: "6rem",
              }}
            >
              SAC
            </th>
            <th
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                width: "6rem",
              }}
            >
              RATE
            </th>
            <th
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                width: "6rem",
              }}
            >
              AMOUNT
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id || idx} style={{ border: "1px solid #000000" }}>
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                {idx + 1}
              </td>
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                {itemsMap[item.item_id]?.title || "Unknown Service"}
              </td>
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                {itemsMap[item.item_id]?.hsn_sac || "N/A"}
              </td>
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                ₹{item.unit_price}
              </td>
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                ₹{item.quantity * item.unit_price}
              </td>
            </tr>
          ))}
          {/* GST Row */}
          <tr style={{ border: "1px solid #000000" }}>
            <td
              colSpan="4"
              style={{
                padding: "0.25rem 0.5rem",
                textAlign: "right",
                border: "1px solid #000000",
                fontWeight: "bold",
              }}
            >
              IGST @ {gstPercentage || ""}%
            </td>
            <td
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              ₹{gstAmount}
            </td>
          </tr>
          {/* Total Row */}
          <tr
            style={{ backgroundColor: "#E2E8F0", border: "1px solid #000000" }}
          >
            <td
              colSpan="4"
              style={{
                padding: "0.25rem 0.5rem",
                textAlign: "right",
                border: "1px solid #000000",
                fontWeight: "bold",
                fontSize: "0.875rem",
              }}
            >
              TOTAL
            </td>
            <td
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                fontWeight: "bold",
                fontSize: "0.875rem",
              }}
            >
              ₹{netAmount}
            </td>
          </tr>
        </tbody>
      </table>

      {/* GST Summary Table */}
      <table
        style={{
          width: "100%",
          textAlign: "left",
          borderCollapse: "collapse",
          marginBottom: "0.5rem",
        }}
      >
        <thead>
          <tr
            style={{ backgroundColor: "#E2E8F0", border: "1px solid #000000" }}
          >
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              HSN/SAC
            </th>
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              Taxable Value
            </th>
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
              colSpan="2"
            >
              IGST
            </th>
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              Total Tax Amount
            </th>
          </tr>
          <tr
            style={{ backgroundColor: "#E2E8F0", border: "1px solid #000000" }}
          >
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            ></th>
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            ></th>
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              Rate
            </th>
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              Amount
            </th>
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            ></th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ border: "1px solid #000000" }}>
            <td
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              {itemsMap[items[0]?.item_id]?.hsn_sac || "hsn_sac"}
            </td>
            <td
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              ₹{totalAmount}
            </td>
            <td
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              {gstPercentage || "18"}%
            </td>
            <td
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              ₹{gstAmount}
            </td>
            <td
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              ₹{gstAmount}
            </td>
          </tr>
          <tr
            style={{ backgroundColor: "#E2E8F0", border: "1px solid #000000" }}
          >
            <td
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                fontWeight: "bold",
              }}
            >
              Total
            </td>
            <td
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                fontWeight: "bold",
              }}
            >
              ₹{totalAmount}
            </td>
            <td
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            ></td>
            <td
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                fontWeight: "bold",
              }}
            >
              ₹{gstAmount}
            </td>
            <td
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                fontWeight: "bold",
              }}
            >
              ₹{gstAmount}
            </td>
          </tr>
        </tbody>
      </table>
      <div
        style={{
          border: "1px solid #000000",
          padding: "1rem",
          marginTop: "1rem",
          borderRadius: "4px",
        }}
      >
        {/* Total Amount in Words */}
        <div
          style={{
            borderBottom: "1px solid #000000",
            paddingBottom: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <p style={{ fontWeight: "bold", fontSize: "0.75rem" }}>
            Total Amount (in words)
          </p>
          <p style={{ fontSize: "0.75rem" }}>
            {numberToWords(netAmount) || "amount in words"}
          </p>
        </div>

        {/* Bank Details and Terms & Conditions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {/* Bank Details Box */}
          <div
            style={{
              flex: 1,
              border: "1px solid #000",
              padding: "0.75rem",
              fontSize: "0.75rem",
            }}
          >
            <p style={{ fontWeight: "bold" }}>Bank Details</p>
            <p>Name: {creator?.bank_name || "State Bank of India"}</p>
            <p>IFSC Code: {creator?.ifsc_code || "SBIN0031325"}</p>
            <p>Account No: {creator?.account_number || "40402485796"}</p>
          </div>

          {/* Terms & Conditions Box */}
          <div
            style={{
              flex: 1,
              border: "1px solid #000",
              padding: "0.75rem",
              fontSize: "0.75rem",
            }}
          >
            <p style={{ fontWeight: "bold" }}>Terms and Conditions</p>
            <ol
              style={{
                listStyleType: "decimal",
                paddingLeft: "1rem",
                margin: 0,
              }}
            >
              <li>All disputes are subject to Rajasthan jurisdiction only</li>
              <li>
                TDS Deduction will lie under Section 194C Payment to Contractor
                [1% or 2% ].
              </li>
            </ol>
          </div>

          {/* Signature Box */}
          <div
            style={{
              flex: 1,
              border: "1px solid #000",
              padding: "0.75rem",
              fontSize: "0.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <p>
              Authorised Signatory For <br />
              {creator?.name || "CLYROMEDIA PRIVATE LIMITED"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
