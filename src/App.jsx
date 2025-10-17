// import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import React from "react";
import { NavLink, Route, Routes, Link } from "react-router-dom";
import MainNav from "./layouts/MainNav";
import About from "./pages/About";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUpForm from "./components/SignUpForm";
function App() {
  return (
    <>
      {/* start nav */}
      <MainNav />
      {/* end nav */}
      {/* start routes */}
      <Routes>
        <Route path="/" element={<Home />} /> {/* in nav bar */}
        <Route path="/about" element={<About />} /> {/* in nav bar */}
        <Route path="/signin" element={<SignIn />} /> {/* in About */}
        <Route path="/signUpForm" element={<SignUpForm />} /> {/* in Singin */}
      </Routes>
      {/* end routes */}
    </>
  );
}

export default App;
