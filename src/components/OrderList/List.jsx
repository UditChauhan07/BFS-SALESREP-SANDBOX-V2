

import Styles from "./listStyle.module.css";
import { useNavigate } from "react-router-dom";
const OrderListHolder = ({ data = [] }) => {
    const navigate = useNavigate();
    if (data.length) {
        const onCLick = (id) => {
            localStorage.setItem("OpportunityId", JSON.stringify(id));
            navigate("/orderDetails")
        };
        return (
            <div className={Styles.listholder}>
                {data.map((order) => (
                    <div className={Styles.row} key={order.Id} onClick={() => onCLick(order.Id)}>
                        <div className={Styles.info}>
                            <div className={Styles.poHolder}>{order.PO_Number__c ?? "No PO Avaiable"}</div>
                            <div className={Styles.orderText}>Order for {order.AccountName} of {order.ManufacturerName__c} with {order.ProductCount} products ${parseFloat(order.Amount).toFixed(2)}, type: {order.Type}</div>
                        </div>
                    </div>
                ))}
            </div>)
    } else {
        return (<p className="text-[13px] text-[Arial]">No order found.</p>)
    }
}
export default OrderListHolder;