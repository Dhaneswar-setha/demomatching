import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";
import Matching from "./Matching";
const App = () => {
  return (
    <div>
      {/* <h1>hiui</h1> */}
      <Router>
        <Routes>
          <Route path="/match/:userId" element={<Matching />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
