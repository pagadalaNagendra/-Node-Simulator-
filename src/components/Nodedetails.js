import React, { useState } from 'react';
import Vertical from './vertical';
import Parameter from './parameter';
import Node from './node';


const Home = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, 2)); // Max page index is 2
  };

  const handleBack = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0)); // Min page index is 0
  };

  return (
    <div>
      {currentPage === 0 && <Vertical onNext={handleNext} />}
      {currentPage === 1 && <Parameter onNext={handleNext} onBack={handleBack} />}
      {currentPage === 2 && <Node onBack={handleBack} />}
    </div>
  );
};

export default Home;
