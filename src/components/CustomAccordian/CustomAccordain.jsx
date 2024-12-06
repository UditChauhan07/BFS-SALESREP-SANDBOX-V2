import React from 'react';

import './style.css'; // Import your custom styles
import { CiLock } from "react-icons/ci";
import { CiUnlock } from "react-icons/ci";
const CustomAccordion = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className="accordion-container">
            <div className="accordion-header" onClick={onToggle}>
            <h2 className="text-black font-montserrat text-lg font-medium leading-8 tracking-[1.12px] uppercase font-normal">
  {title}
</h2>
                {isOpen ? (
                  <h3><CiUnlock />  </h3>
                  
                ) : (
                    <h3> <CiLock /></h3>
                      
                )}
            </div>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};

export default CustomAccordion;
