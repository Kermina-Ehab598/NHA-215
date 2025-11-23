import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loadingpage from './Loadingpage';

const Powerbi = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-[calc(100vh-72px)]">
      {loading && (
        <Loadingpage />
      )}

      <iframe
        className="w-full min-h-[calc(100vh-72px)]"
        title="MarketTrendsDEPI"
        src="https://app.powerbi.com/view?r=eyJrIjoiMGMzNzY4YzctYzk2OS00M2I2LWI5NjAtNTRmNTU3NzU3NTczIiwidCI6IjIwODJkZTQ2LTFhZmEtNGI2NC1hNDQwLTY1NThmODBlOTg0MCIsImMiOjh9"
        frameBorder="0"
        allowFullScreen={true}
        onLoad={() => setLoading(false)}
      />

      {!loading && (
        <button 
          onClick={() => navigate("/dashboard")}
          className="absolute top-4 left-4 text-[16px] text-white bg-[#0e898e] p-3 rounded-[24px] hover:scale-110 transition-all ease-in duration-300"
        >
          Back
        </button>
      )}
    </div>
  );
};

export default Powerbi;
