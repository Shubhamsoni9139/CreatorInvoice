import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { router } from "./router.jsx";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { Analytics } from "@vercel/analytics/react"; // ✅ Import Vercel Analytics

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router} />
      <Analytics /> {/* ✅ Include Analytics inside the tree */}
    </AuthContextProvider>
  </StrictMode>
);
