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

  // Determine GST rate based on business logic
  const getGstRate = () => {
    // Check if creator has both PAN and GST number
    const creatorHasPanAndGst = creator?.pan_number && creator?.gst_number;

    // Check if both creator and customer are from the same state
    const sameState =
      creator?.state &&
      customer?.address_state &&
      creator.state.toLowerCase() === customer.address_state.toLowerCase();

    // If creator has both PAN and GST, and both are from same state, use 9% (CGST + SGST)
    // Otherwise use 18% (IGST)
    return creatorHasPanAndGst && sameState ? 9 : 18;
  };

  const gstRate = getGstRate();
  const isIntraState = gstRate === 9; // Same state transaction

  // Group items by HSN/SAC code for GST calculation
  const groupItemsByHsn = (invoiceItems) => {
    const grouped = {};
    invoiceItems.forEach((item) => {
      const hsnCode =
        itemsMap[item.item_id]?.hsn_sac_code ||
        itemsMap[item.item_id]?.hsn_sac ||
        "N/A";
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
        // Same state: CGST + SGST (4.5% each for total 9%)
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

    return convert(num).trim() + " Rupees";
  }

  const totalAmount = calculateTotal(items);
  const gstAmount = invoice.gst_amount;
  const netAmount = invoice.net_amount;
  const hsnGroups = groupItemsByHsn(items);

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
          TAX INVOICE
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
            {creator?.logo ? (
              <img
                src="https://framerusercontent.com/images/htoS18uygJMvEeokrXH2TSdQGg0.png"
                alt="images"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <img
                src="https://framerusercontent.com/images/htoS18uygJMvEeokrXH2TSdQGg0.png"
                alt="images"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
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
              State: {creator?.state || "Creator State"}
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
          State: {customer?.address_state || "Customer State"}
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
              HSN/SAC
            </th>
            <th
              style={{
                padding: "0.25rem 0.5rem",
                border: "1px solid #000000",
                width: "4rem",
              }}
            >
              QTY
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
                {itemsMap[item.item_id]?.hsn_sac_code ||
                  itemsMap[item.item_id]?.hsn_sac ||
                  "N/A"}
              </td>
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                {item.quantity}
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

          {/* Subtotal Row */}
          <tr style={{ border: "1px solid #000000" }}>
            <td
              colSpan="5"
              style={{
                padding: "0.25rem 0.5rem",
                textAlign: "right",
                border: "1px solid #000000",
                fontWeight: "bold",
              }}
            >
              Subtotal
            </td>
            <td
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            >
              ₹{totalAmount}
            </td>
          </tr>

          {/* GST Rows - Dynamic based on state */}
          {hsnGroups.map((group, index) => (
            <React.Fragment key={`gst-${index}`}>
              {isIntraState ? (
                // Same state: Show CGST and SGST
                <>
                  <tr style={{ border: "1px solid #000000" }}>
                    <td
                      colSpan="5"
                      style={{
                        padding: "0.25rem 0.5rem",
                        textAlign: "right",
                        border: "1px solid #000000",
                        fontWeight: "bold",
                      }}
                    >
                      CGST @ 9% ({group.hsnCode})
                    </td>
                    <td
                      style={{
                        padding: "0.25rem 0.5rem",
                        border: "1px solid #000000",
                      }}
                    >
                      ₹{group.cgstAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ border: "1px solid #000000" }}>
                    <td
                      colSpan="5"
                      style={{
                        padding: "0.25rem 0.5rem",
                        textAlign: "right",
                        border: "1px solid #000000",
                        fontWeight: "bold",
                      }}
                    >
                      SGST @ 9% ({group.hsnCode})
                    </td>
                    <td
                      style={{
                        padding: "0.25rem 0.5rem",
                        border: "1px solid #000000",
                      }}
                    >
                      ₹{group.sgstAmount.toFixed(2)}
                    </td>
                  </tr>
                </>
              ) : (
                // Different state: Show IGST
                <tr style={{ border: "1px solid #000000" }}>
                  <td
                    colSpan="5"
                    style={{
                      padding: "0.25rem 0.5rem",
                      textAlign: "right",
                      border: "1px solid #000000",
                      fontWeight: "bold",
                    }}
                  >
                    IGST @ 18% ({group.hsnCode})
                  </td>
                  <td
                    style={{
                      padding: "0.25rem 0.5rem",
                      border: "1px solid #000000",
                    }}
                  >
                    ₹{group.igstAmount.toFixed(2)}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}

          {/* Total Row */}
          <tr
            style={{ backgroundColor: "#E2E8F0", border: "1px solid #000000" }}
          >
            <td
              colSpan="5"
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

      {/* Enhanced GST Summary Table */}
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
            {isIntraState ? (
              <>
                <th
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                  colSpan="2"
                >
                  CGST
                </th>
                <th
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                  colSpan="2"
                >
                  SGST
                </th>
              </>
            ) : (
              <th
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
                colSpan="2"
              >
                IGST
              </th>
            )}
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
            {isIntraState ? (
              <>
                <th
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                >
                  Amount
                </th>
              </>
            ) : (
              <>
                <th
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                >
                  Amount
                </th>
              </>
            )}
            <th
              style={{ padding: "0.25rem 0.5rem", border: "1px solid #000000" }}
            ></th>
          </tr>
        </thead>
        <tbody>
          {/* Render row for each HSN group */}
          {hsnGroups.map((group, index) => (
            <tr key={`hsn-${index}`} style={{ border: "1px solid #000000" }}>
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                {group.hsnCode}
              </td>
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                ₹{group.totalAmount.toFixed(2)}
              </td>
              {isIntraState ? (
                <>
                  <td
                    style={{
                      padding: "0.25rem 0.5rem",
                      border: "1px solid #000000",
                    }}
                  >
                    9%
                  </td>
                  <td
                    style={{
                      padding: "0.25rem 0.5rem",
                      border: "1px solid #000000",
                    }}
                  >
                    ₹{group.cgstAmount.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "0.25rem 0.5rem",
                      border: "1px solid #000000",
                    }}
                  >
                    9%
                  </td>
                  <td
                    style={{
                      padding: "0.25rem 0.5rem",
                      border: "1px solid #000000",
                    }}
                  >
                    ₹{group.sgstAmount.toFixed(2)}
                  </td>
                </>
              ) : (
                <>
                  <td
                    style={{
                      padding: "0.25rem 0.5rem",
                      border: "1px solid #000000",
                    }}
                  >
                    18%
                  </td>
                  <td
                    style={{
                      padding: "0.25rem 0.5rem",
                      border: "1px solid #000000",
                    }}
                  >
                    ₹{group.igstAmount.toFixed(2)}
                  </td>
                </>
              )}
              <td
                style={{
                  padding: "0.25rem 0.5rem",
                  border: "1px solid #000000",
                }}
              >
                ₹{group.gstAmount.toFixed(2)}
              </td>
            </tr>
          ))}

          {/* Total row */}
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
              ₹{totalAmount.toFixed(2)}
            </td>
            {isIntraState ? (
              <>
                <td
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                ></td>
                <td
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                  }}
                >
                  ₹{(gstAmount / 2).toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
                ></td>
                <td
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                    fontWeight: "bold",
                  }}
                >
                  ₹{(gstAmount / 2).toFixed(2)}
                </td>
              </>
            ) : (
              <>
                <td
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #000000",
                  }}
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
              </>
            )}
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
