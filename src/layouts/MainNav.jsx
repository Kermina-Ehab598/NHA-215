import React from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"


const MainNav = () => {

  const navigate = useNavigate();

  return (
    <div className=" w-screen h-[72px] px-[50px] bg-sec flex justify-between items-center content-center">
      <p className='text-white text-[25px] font-bold cursor-pointer' onClick={() => navigate("/")}>ICA</p>
      <nav className=" flex text-white gap-8">
        <NavLink to='/' className='nav-t'> Home</NavLink>
        <NavLink to='/About' className='nav-t'> About</NavLink>
        <NavLink to='/dashboard' className='nav-t'> Dashboard</NavLink>
        <NavLink to='/CVform' className='nav-t'> Review CV</NavLink>
        <NavLink to='/jop' className='nav-t'> Job Recommendations</NavLink>
        <NavLink to='/Chatbot' className='nav-t'> Chatbot</NavLink>
      </nav>
      <button
      onClick={() => navigate("/logout")}
      className="text-[16px] text-white hover:bg-[#0e898e] p-4 rounded-[24px] hover:scale-110 bg-[#172627] hover:text-red-600 hover:font-semibold transition-all ease-in duration-300"
      >
      Logout
      </button>
    </div>
  )
}

export default MainNav