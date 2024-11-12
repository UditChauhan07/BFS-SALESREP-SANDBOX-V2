import { useSearchParams } from "react-router-dom";
import FullQuearyDetail from "../components/CustomerSupportPage/FullQuearyDetail";
import Layout from "../components/Layout/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetAuthData, getSupportDetails } from "../lib/store";
import Loading from "../components/Loading";
import AppLayout from "../components/AppLayout";
import LoaderV3 from "../components/loader/v3";

const CustomerSupportDetails = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deatilsId, setDetailsId] = useState(searchParams.get("id"));
  const [detailsData, setDetailsData] = useState({});
  const [isLoaded, setLoaded] = useState(false);
  const [reset,setRest] = useState(false);
  useEffect(() => {
    GetAuthData()
      .then((user) => {
        let rawData = { key: user?.data?.x_access_token, caseId: deatilsId };
        getSupportDetails({ rawData })
          .then((deatils) => {
            deatils.salesRepName = user.Name;
            setDetailsData(deatils);
            setLoaded(true);
            setRest(false)
          })
          .catch((err) => {
            console.error({ err });
          });
      })
      .catch((error) => {
        console.error({ error });
      });
  }, [deatilsId,reset]);
  if (!deatilsId || deatilsId == "") return navigate("/customer-support");
  if (!isLoaded) return <AppLayout><LoaderV3 text={"Loading Support Details"}/></AppLayout>;
  return (
    <AppLayout>
      <FullQuearyDetail data={detailsData} setRest={setRest}/>
    </AppLayout>
  );
};
export default CustomerSupportDetails;
