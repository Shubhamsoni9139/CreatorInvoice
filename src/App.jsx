import { Link } from "react-router-dom";
import Signin from "./components/Signin";

import { UserAuth } from "./context/AuthContext";
import Home from "./routes/Home";
import { Analytics } from "@vercel/analytics/next";
function App() {
  return (
    <>
      <Home />
    </>
  );
}

export default App;
