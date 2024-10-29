import { useEffect, useState } from "react";
import MyRetailersPage from "./MyRetailersPage";
import BrandsPage from "./BrandsPage";
import { GetAuthData } from "../lib/store";
import { useSearchParams } from "react-router-dom";


const OrderInit = () => {
    const [searchParams] = useSearchParams();
    const manufacturerId = searchParams.get("manufacturerId");
    const [isGridView, setIsGridView] = useState(true);
    useEffect(()=>{
        GetAuthData().then((user)=>{
            if(user.data.accountIds.length>1){
                setIsGridView(false);
            }
        }).catch((err)=>{
            console.log(err);
        })
    },[])
    if (isGridView) { return(<BrandsPage />) } else { return(<MyRetailersPage manufacturerId={manufacturerId}/>) }
}
export default OrderInit;