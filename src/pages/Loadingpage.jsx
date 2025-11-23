import React from 'react'

const Loadingpage = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-4 animate-ultraSmoothFadeIn z-10">
    <div className="max-w-md mx-auto p-6 bg-[#121212] rounded-lg shadow text-white flex items-center gap-2"> 
        <h2 className="text-2xl font-semibold">Loading data...</h2>
        <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
        <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    </div>
</div>
  )
}

export default Loadingpage