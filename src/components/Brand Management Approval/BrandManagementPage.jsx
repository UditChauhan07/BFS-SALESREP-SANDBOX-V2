import { useEffect, useState } from "react";
import BMAIHandler from "../IssuesHandler/BMAIHandler";
import Attachements from "../IssuesHandler/Attachements";
import { GetAuthData, getOrderCustomerSupport, postSupportAny, uploadFileSupport } from "../../lib/store";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";


const BrandManagementPage = () => {
    const navigate = useNavigate();
    const reasons = [{ name: "RTV Request", icon: '/assets/request.png', desc: "" }, { name: "Other", icon: '/assets/Other.png', desc: "" }];
    const [reason, setReason] = useState();
    const [files, setFile] = useState([]);
    const [desc, setDesc] = useState();
    const [salesRepId,setSalesRepId]= useState(null);
    const [sumitForm,setSubmitForm] = useState(false)
    const resetHandler = () => {
    }
    function sortingList(data) {
        data.sort(function (a, b) {
          return new Date(b.CreatedDate) - new Date(a.CreatedDate);
        });
        return data;
      }
    useEffect(()=>{
        GetAuthData().then((res)=>{
            getOrderCustomerSupport({
                user: {
                  key: res.data.x_access_token,
                  accountId: false ? "00530000005AdvsAAC" : res.data.accountId,
                },
              })
                .then((order) => {
                  let sorting = sortingList(order);
                  if(sorting.length){
                    setSalesRepId(sorting[0].OwnerId)
                  }
                })
                .catch((error) => {
                  console.log({ error });
                });
        }).catch((err)=>{
            console.log({err});
        })
    },[])
    const SubmitHandler = () => {
        setSubmitForm(true)
        GetAuthData()
            .then((user) => {
                if (user) {
                    let subject = `Brand Management Approval for ${reason}`;
                    let rawData = {
                        orderStatusForm: {
                            typeId: "0123b000000GfOEAA0",
                            salesRepId,
                            reason,
                            accountId: user.data.accountId,
                            contactId: user.data.retailerId,
                            desc,
                            priority: "Medium",
                            sendEmail: true,
                            subject,
                        },
                        key: user.data.x_access_token,
                    };
                    postSupportAny({ rawData })
                        .then((response) => {
                            if (response) {
                                if (response) {
                                    if (files.length > 0) {

                                        uploadFileSupport({ key: user.x_access_token, supportId: response, files }).then((fileUploader) => {
                                            if (fileUploader) {
                                                navigate("/CustomerSupportDetails?id=" + response);
                                            }
                                        }).catch((fileErr) => {
                                            console.log({ fileErr });
                                        })
                                    } else {
                                        navigate("/CustomerSupportDetails?id=" + response);
                                    }
                                }
                            }
                        })
                        .catch((err) => {
                            console.error({ err });
                        });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
    if(sumitForm) return <Loading height={'80vh'}/>;
    return (
        <section>
            <BMAIHandler reasons={reasons} reason={reason} setReason={setReason} resetHandler={resetHandler} />
            <Attachements setFile={setFile} files={files} setDesc={setDesc} orderConfirmed={reason ? true : false} SubmitHandler={SubmitHandler} />
        </section>
    )
}
export default BrandManagementPage