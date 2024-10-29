import React, { useEffect } from "react";
import { DestoryAuth } from "../lib/store";

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
    DestoryAuth();
    
    window.location.href = "/";
  }, []);
  return <></>;
};

export default Logout;
