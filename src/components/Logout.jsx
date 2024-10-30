import React, { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    localStorage.removeItem("Name");
    localStorage.removeItem("Api Data");
    localStorage.removeItem("orders");
    localStorage.removeItem("response");
    localStorage.removeItem("manufacturer");
    localStorage.removeItem("AccountId__c");
    localStorage.removeItem("ManufacturerId__c");
    localStorage.removeItem("Account");
    localStorage.removeItem("address");
    
    window.location.href = "/";
  }, []);
  return <></>;
};

export default Logout;
