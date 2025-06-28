import React from "react";

const InvoiceTemplate = ({ invoice, creator, customer, items, itemsMap }) => {
  if (!invoice || !creator || !customer || !items || !itemsMap) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#4A5568" }}>
        Select an invoice to preview or data missing.
      </div>
    );
  }

  const calculateSubtotal = (invoiceItems) =>
    invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

  // Determine GST rate based on business logic
  const getGstRate = () => {
    // Check if both creator and customer are from the same state
    const sameState =
      creator?.state &&
      customer?.address_state &&
      creator.state.toLowerCase() === customer.address_state.toLowerCase();

    // If same state, use 9% each for CGST and SGST (18% total)
    // If different states, use 18% IGST
    return sameState ? 9 : 18;
  };

  const gstRate = getGstRate();
  const isIntraState =
    creator?.state?.toLowerCase() === customer?.address_state?.toLowerCase();

  // Group items by HSN/SAC code for GST calculation
  const groupItemsByHsn = (invoiceItems) => {
    const grouped = {};
    invoiceItems.forEach((item) => {
      const hsnCode =
        itemsMap[item.item_id]?.hsn_sac_code ||
        itemsMap[item.item_id]?.hsn_sac ||
        "998314"; // Default HSN for digital services

      if (!grouped[hsnCode]) {
        grouped[hsnCode] = {
          hsnCode,
          items: [],
          totalAmount: 0,
          gstAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
        };
      }

      grouped[hsnCode].items.push(item);
      grouped[hsnCode].totalAmount += item.quantity * item.unit_price;
    });

    // Calculate GST for each HSN group
    Object.keys(grouped).forEach((hsnCode) => {
      const baseAmount = grouped[hsnCode].totalAmount;
      if (isIntraState) {
        // Same state: CGST + SGST (9% each for total 18%)
        grouped[hsnCode].cgstAmount = baseAmount * 0.09;
        grouped[hsnCode].sgstAmount = baseAmount * 0.09;
        grouped[hsnCode].gstAmount =
          grouped[hsnCode].cgstAmount + grouped[hsnCode].sgstAmount;
      } else {
        // Different state: IGST (18%)
        grouped[hsnCode].igstAmount = baseAmount * 0.18;
        grouped[hsnCode].gstAmount = grouped[hsnCode].igstAmount;
      }
    });

    return Object.values(grouped);
  };

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

    return convert(Math.floor(num)).trim() + " Rupees Only";
  }

  const subtotal = calculateSubtotal(items);
  const gstAmount = invoice.gst_amount || subtotal * 0.18;
  // FIXED: Total amount now properly includes GST
  const totalAmount = subtotal + gstAmount; // This ensures total = subtotal + GST
  const hsnGroups = groupItemsByHsn(items);

  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        fontSize: "12px",
        lineHeight: "1.4",
        border: "2px solid #000000",
        padding: "20px",
        backgroundColor: "#FFFFFF",
        color: "#000000",
        maxWidth: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #000000",
          paddingBottom: "10px",
          marginBottom: "15px",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>TAX INVOICE</div>
        <div
          style={{
            border: "2px solid #000000",
            padding: "5px 10px",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          ORIGINAL FOR RECIPIENT
        </div>
      </div>

      {/* Company Details and Invoice Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          borderBottom: "1px solid #000000",
          paddingBottom: "15px",
          marginBottom: "15px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              flexShrink: 0,
              marginRight: "15px",
              border: "1px solid #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
            }}
          >
            <img
              src="https://framerusercontent.com/images/htoS18uygJMvEeokrXH2TSdQGg0.png"
              alt="Company Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div>
            <h1
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "5px",
                margin: "0 0 5px 0",
              }}
            >
              {creator?.name || "Creator Name"}
            </h1>
            <p style={{ fontSize: "11px", margin: "2px 0" }}>
              {creator?.address || "Creator Address"}
            </p>
            <p style={{ fontSize: "11px", margin: "2px 0" }}>
              State: {creator?.state || "Creator State"}
            </p>
            <p style={{ fontSize: "11px", margin: "2px 0" }}>
              GSTIN: {creator?.gst_number || "Not Registered"}
            </p>
            <p style={{ fontSize: "11px", margin: "2px 0" }}>
              PAN Number: {creator?.pan_number || "PAN Number"}
            </p>
            <p style={{ fontSize: "11px", margin: "2px 0" }}>
              Mobile: {creator?.phone_number || "Mobile Number"}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ marginBottom: "15px" }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                margin: "0 0 3px 0",
              }}
            >
              Invoice No.
            </p>
            <p style={{ fontSize: "11px", margin: "0" }}>
              {invoice?.invoice_number || "Invoice Number"}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                margin: "0 0 3px 0",
              }}
            >
              Invoice Date
            </p>
            <p style={{ fontSize: "11px", margin: "0" }}>
              {new Date(invoice?.invoice_date).toLocaleDateString("en-IN") ||
                "Invoice Date"}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div
        style={{
          borderBottom: "1px solid #000000",
          paddingBottom: "15px",
          marginBottom: "15px",
        }}
      >
        <p
          style={{ fontWeight: "bold", fontSize: "12px", margin: "0 0 8px 0" }}
        >
          BILL TO
        </p>
        <h2
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "5px",
            margin: "0 0 5px 0",
          }}
        >
          {customer?.name || customer?.brand_name || "Customer Name"}
        </h2>
        <p style={{ fontSize: "11px", margin: "2px 0" }}>
          Address: {customer?.address || "Customer Address"}
        </p>
        <p style={{ fontSize: "11px", margin: "2px 0" }}>
          State: {customer?.address_state || "Customer State"}
        </p>
        <p style={{ fontSize: "11px", margin: "2px 0" }}>
          GSTIN: {customer?.gst_number || "Not Registered"}
        </p>
        <p style={{ fontSize: "11px", margin: "2px 0" }}>
          PAN Number: {customer?.pan_number || "Not Available"}
        </p>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "15px",
          fontSize: "11px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th
              style={{
                padding: "8px 6px",
                border: "1px solid #000000",
                width: "40px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              S.NO
            </th>
            <th
              style={{
                padding: "8px 6px",
                border: "1px solid #000000",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              SERVICES
            </th>
            <th
              style={{
                padding: "8px 6px",
                border: "1px solid #000000",
                width: "80px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              HSN/SAC
            </th>
            <th
              style={{
                padding: "8px 6px",
                border: "1px solid #000000",
                width: "50px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              QTY
            </th>
            <th
              style={{
                padding: "8px 6px",
                border: "1px solid #000000",
                width: "80px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              RATE
            </th>
            <th
              style={{
                padding: "8px 6px",
                border: "1px solid #000000",
                width: "80px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              AMOUNT
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id || idx}>
              <td
                style={{
                  padding: "8px 6px",
                  border: "1px solid #000000",
                  textAlign: "center",
                }}
              >
                {idx + 1}
              </td>
              <td
                style={{
                  padding: "8px 6px",
                  border: "1px solid #000000",
                  textAlign: "left",
                }}
              >
                {itemsMap[item.item_id]?.title || "Unknown Service"}
              </td>
              <td
                style={{
                  padding: "8px 6px",
                  border: "1px solid #000000",
                  textAlign: "center",
                }}
              >
                {itemsMap[item.item_id]?.hsn_sac_code ||
                  itemsMap[item.item_id]?.hsn_sac ||
                  "998314"}
              </td>
              <td
                style={{
                  padding: "8px 6px",
                  border: "1px solid #000000",
                  textAlign: "center",
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  padding: "8px 6px",
                  border: "1px solid #000000",
                  textAlign: "right",
                }}
              >
                ₹{item.unit_price?.toFixed(2)}
              </td>
              <td
                style={{
                  padding: "8px 6px",
                  border: "1px solid #000000",
                  textAlign: "right",
                }}
              >
                ₹{(item.quantity * item.unit_price)?.toFixed(2)}
              </td>
            </tr>
          ))}

          {/* Subtotal Row */}
          <tr>
            <td
              colSpan="5"
              style={{
                padding: "8px 6px",
                textAlign: "right",
                border: "1px solid #000000",
                fontWeight: "bold",
                backgroundColor: "#f9f9f9",
              }}
            >
              Subtotal
            </td>
            <td
              style={{
                padding: "8px 6px",
                border: "1px solid #000000",
                textAlign: "right",
                fontWeight: "bold",
                backgroundColor: "#f9f9f9",
              }}
            >
              ₹{subtotal.toFixed(2)}
            </td>
          </tr>

          {/* GST Rows - Dynamic based on state */}
          {isIntraState ? (
            // Same state: Show CGST and SGST
            <>
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "8px 6px",
                    textAlign: "right",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                  }}
                >
                  CGST @ 9%
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    border: "1px solid #000000",
                    textAlign: "right",
                  }}
                >
                  ₹{(gstAmount / 2).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "8px 6px",
                    textAlign: "right",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                  }}
                >
                  SGST @ 9%
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    border: "1px solid #000000",
                    textAlign: "right",
                  }}
                >
                  ₹{(gstAmount / 2).toFixed(2)}
                </td>
              </tr>
            </>
          ) : (
            // Different state: Show IGST
            <tr>
              <td
                colSpan="5"
                style={{
                  padding: "8px 6px",
                  textAlign: "right",
                  border: "1px solid #000000",
                  fontWeight: "bold",
                }}
              >
                IGST @ 18%
              </td>
              <td
                style={{
                  padding: "8px 6px",
                  border: "1px solid #000000",
                  textAlign: "right",
                }}
              >
                ₹{gstAmount.toFixed(2)}
              </td>
            </tr>
          )}

          {/* FIXED: Total Row now correctly shows subtotal + GST */}
          <tr style={{ backgroundColor: "#e0e0e0" }}>
            <td
              colSpan="5"
              style={{
                padding: "10px 6px",
                textAlign: "right",
                border: "2px solid #000000",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              TOTAL
            </td>
            <td
              style={{
                padding: "10px 6px",
                border: "2px solid #000000",
                fontWeight: "bold",
                fontSize: "13px",
                textAlign: "right",
              }}
            >
              ₹{totalAmount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Enhanced GST Summary Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th
              style={{
                padding: "6px 4px",
                border: "1px solid #000000",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              HSN/SAC
            </th>
            <th
              style={{
                padding: "6px 4px",
                border: "1px solid #000000",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Taxable Value
            </th>
            {isIntraState ? (
              <>
                <th
                  style={{
                    padding: "6px 4px",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  colSpan="2"
                >
                  CGST
                </th>
                <th
                  style={{
                    padding: "6px 4px",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  colSpan="2"
                >
                  SGST
                </th>
              </>
            ) : (
              <th
                style={{
                  padding: "6px 4px",
                  border: "1px solid #000000",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
                colSpan="2"
              >
                IGST
              </th>
            )}
            <th
              style={{
                padding: "6px 4px",
                border: "1px solid #000000",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Total Tax
            </th>
          </tr>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ padding: "4px", border: "1px solid #000000" }}></th>
            <th style={{ padding: "4px", border: "1px solid #000000" }}></th>
            {isIntraState ? (
              <>
                <th
                  style={{
                    padding: "4px",
                    border: "1px solid #000000",
                    fontSize: "9px",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    padding: "4px",
                    border: "1px solid #000000",
                    fontSize: "9px",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    padding: "4px",
                    border: "1px solid #000000",
                    fontSize: "9px",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    padding: "4px",
                    border: "1px solid #000000",
                    fontSize: "9px",
                  }}
                >
                  Amount
                </th>
              </>
            ) : (
              <>
                <th
                  style={{
                    padding: "4px",
                    border: "1px solid #000000",
                    fontSize: "9px",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    padding: "4px",
                    border: "1px solid #000000",
                    fontSize: "9px",
                  }}
                >
                  Amount
                </th>
              </>
            )}
            <th style={{ padding: "4px", border: "1px solid #000000" }}></th>
          </tr>
        </thead>
        <tbody>
          {hsnGroups.map((group, index) => (
            <tr key={`hsn-${index}`}>
              <td
                style={{
                  padding: "6px 4px",
                  border: "1px solid #000000",
                  textAlign: "center",
                }}
              >
                {group.hsnCode}
              </td>
              <td
                style={{
                  padding: "6px 4px",
                  border: "1px solid #000000",
                  textAlign: "right",
                }}
              >
                ₹{group.totalAmount.toFixed(2)}
              </td>
              {isIntraState ? (
                <>
                  <td
                    style={{
                      padding: "6px 4px",
                      border: "1px solid #000000",
                      textAlign: "center",
                    }}
                  >
                    9%
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      border: "1px solid #000000",
                      textAlign: "right",
                    }}
                  >
                    ₹{group.cgstAmount.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      border: "1px solid #000000",
                      textAlign: "center",
                    }}
                  >
                    9%
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      border: "1px solid #000000",
                      textAlign: "right",
                    }}
                  >
                    ₹{group.sgstAmount.toFixed(2)}
                  </td>
                </>
              ) : (
                <>
                  <td
                    style={{
                      padding: "6px 4px",
                      border: "1px solid #000000",
                      textAlign: "center",
                    }}
                  >
                    18%
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      border: "1px solid #000000",
                      textAlign: "right",
                    }}
                  >
                    ₹{group.igstAmount.toFixed(2)}
                  </td>
                </>
              )}
              <td
                style={{
                  padding: "6px 4px",
                  border: "1px solid #000000",
                  textAlign: "right",
                }}
              >
                ₹{group.gstAmount.toFixed(2)}
              </td>
            </tr>
          ))}

          {/* Total row */}
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <td
              style={{
                padding: "6px 4px",
                border: "1px solid #000000",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Total
            </td>
            <td
              style={{
                padding: "6px 4px",
                border: "1px solid #000000",
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              ₹{subtotal.toFixed(2)}
            </td>
            {isIntraState ? (
              <>
                <td
                  style={{ padding: "6px 4px", border: "1px solid #000000" }}
                ></td>
                <td
                  style={{
                    padding: "6px 4px",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  ₹{(gstAmount / 2).toFixed(2)}
                </td>
                <td
                  style={{ padding: "6px 4px", border: "1px solid #000000" }}
                ></td>
                <td
                  style={{
                    padding: "6px 4px",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  ₹{(gstAmount / 2).toFixed(2)}
                </td>
              </>
            ) : (
              <>
                <td
                  style={{ padding: "6px 4px", border: "1px solid #000000" }}
                ></td>
                <td
                  style={{
                    padding: "6px 4px",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  ₹{gstAmount.toFixed(2)}
                </td>
              </>
            )}
            <td
              style={{
                padding: "6px 4px",
                border: "1px solid #000000",
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              ₹{gstAmount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bottom Section */}
      <div
        style={{
          border: "2px solid #000000",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        {/* Total Amount in Words - FIXED: Now uses total amount including GST */}
        <div
          style={{
            borderBottom: "1px solid #000000",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              fontSize: "12px",
              margin: "0 0 5px 0",
            }}
          >
            Total Amount (in words)
          </p>
          <p style={{ fontSize: "11px", margin: "0", fontStyle: "italic" }}>
            {numberToWords(totalAmount)}
          </p>
        </div>

        {/* Bank Details and Terms & Conditions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "15px",
            marginTop: "15px",
          }}
        >
          {/* Bank Details Box */}
          <div
            style={{
              border: "1px solid #000",
              padding: "10px",
              fontSize: "10px",
            }}
          >
            <p style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
              Bank Details
            </p>
            <p style={{ margin: "2px 0" }}>
              Name: {creator?.bank_name || "State Bank of India"}
            </p>
            <p style={{ margin: "2px 0" }}>
              IFSC: {creator?.ifsc_code || "SBIN0031325"}
            </p>
            <p style={{ margin: "2px 0" }}>
              A/c No: {creator?.account_number || "40402485796"}
            </p>
          </div>

          {/* Terms & Conditions Box */}
          <div
            style={{
              border: "1px solid #000",
              padding: "10px",
              fontSize: "10px",
            }}
          >
            <p style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
              Terms and Conditions
            </p>
            <ol
              style={{
                listStyleType: "decimal",
                paddingLeft: "15px",
                margin: "0",
                lineHeight: "1.3",
              }}
            >
              <li style={{ marginBottom: "3px" }}>
                All disputes are subject to {creator?.state || "Local"}{" "}
                jurisdiction only
              </li>
              <li>
                TDS Deduction will lie under Section 194C Payment to Contractor
                [1% or 2%].
              </li>
            </ol>
          </div>

          {/* Signature Box */}
          <div
            style={{
              border: "1px solid #000",
              padding: "10px",
              fontSize: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "80px",
            }}
          >
            <div></div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0", lineHeight: "1.3" }}>
                Authorised Signatory For
                <br />
                <strong>{creator?.name || "CREATOR NAME"}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
