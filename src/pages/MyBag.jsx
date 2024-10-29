import React, { useEffect } from "react";
import MyBagFinal from "../components/MyBagFinal";
import AppLayout from "../components/AppLayout";

const MyBag = () => {
  return (
    <AppLayout>
      <MyBagFinal />
      {/* <OrderStatusFormSection /> */}
    </AppLayout>
  );
};

export default MyBag;
