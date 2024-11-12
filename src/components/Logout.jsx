import React, { useEffect } from "react";
import { DestoryAuth } from "../lib/store";
import AppLayout from "./AppLayout";
import LoaderV3 from "./loader/v3";

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
  return <AppLayout><LoaderV3/></AppLayout>;
};

export default Logout;
