import { useState } from "react";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import OrderStatusFormSection from "../components/OrderStatusFormSection";
import CustomerSupportLayout from "../components/customerSupportLayout";

const OrderStatusForm = () => {
  const [submitLoad,setSubmitLoad] = useState(false)
  if(submitLoad) return <Loading height={'80vh'} />
  return (
    <CustomerSupportLayout>
      <OrderStatusFormSection setSubmitLoad={setSubmitLoad}/>
    </CustomerSupportLayout>
  );
};
export default OrderStatusForm;
