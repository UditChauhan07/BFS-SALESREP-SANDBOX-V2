import React, { useEffect, useState } from 'react'
import Detail from './Detail.module.css'
import { UserChecked } from '../../lib/svg'
import { DateConvert, GetAuthData, getStrCode, postSupportComment } from '../../lib/store'
import { Link } from 'react-router-dom';
import Loading from '../Loading';
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
function FullQuearyDetail({ data, setRest }) {
    const [userData, setUserData] = useState({});
    const [btnAct, setBtnAct] = useState(true)
    const [comment, setComment] = useState('');
    useEffect(() => {
        GetAuthData().then((user) => {
            setUserData(user.data)
        }).catch((error) => {
            console.error({ error });
        })
    }, [comment])
    const date = new Date(data.Date_Opened__c);
    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
    const CommentPostHandler = () => {
        setComment('');
        if (comment.trim() != '') {
            setBtnAct(false)
            let rawData = {
                key: userData.x_access_token,
                comment: {
                    ParentId: data.Id,
                    CommentBody: `${userData.firstName + ' ' + userData.lastName} Wrote: \n${comment}`
                }
            }
            postSupportComment({ rawData }).then((response) => {
                if (response.success) {
                    setRest(true);
                    setBtnAct(true);
                    // window.location.reload()
                } else {
                    alert("something went wrong")
                }
            }).catch((err) => {
                console.error({ err });
            })
        }
    }
    return (
        <div>
            <div className={Detail.FullQuearyDetailMain}>
                <h2 className={Detail.FullQuearyDetailH2}>
                    <Link to={'/customer-support'}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16" fill="none">
                            <path d="M8.94284 2.27615C9.46349 1.75544 9.46349 0.911229 8.94284 0.390521C8.42213 -0.130174 7.57792 -0.130174 7.05721 0.390521L2.3911 5.05666C2.39092 5.05684 2.39128 5.05648 2.3911 5.05666L0.390558 7.05721C0.153385 7.29442 0.024252 7.59868 0.00313201 7.90895C-0.00281464 7.99562 -0.000321319 8.08295 0.010852 8.17002C0.0431986 8.42308 0.148118 8.66868 0.325638 8.87322C0.348651 8.89975 0.372651 8.92535 0.397585 8.94989L7.05721 15.6095C7.57792 16.1302 8.42213 16.1302 8.94284 15.6095C9.46349 15.0888 9.46349 14.2446 8.94284 13.7239L4.55231 9.33335H22.6667C23.4031 9.33335 24 8.73642 24 8.00002C24 7.26362 23.4031 6.66668 22.6667 6.66668H4.55231L8.94284 2.27615Z" fill="black" />
                        </svg>
                    </Link>
                    <span>CUSTOMER Support </span> - My Support Tickets Status detail</h2>

                <h4 className={Detail.FullQuearyDetailH4}>{data.RecordType.Name} for Case Reason <span>- {data.Reason}</span> </h4>


                <div className={`row ${Detail.FlexReverse}`}>
                    <div className='col-lg-9 col-md-9 col-sm-12'>
                        <div className={Detail.LeftMainDiv}>
                            <div className={Detail.LeftMainTopBox}>
                                <p>
                                    {/* formatAMPM(date)} */}
                                    <UserChecked />
                                    <span>{data.Account.Name}</span>&nbsp; raised this on {DateConvert(data.Date_Opened__c)} </p>

                            </div>
                            <p style={{ marginTop: "1rem" }}>{data.Description?.split("User Desc:").length == 2 ? <>{data.Description.split("User Desc:")[1].split("Issue Desc:")[1]}<br /><b>User Description:</b> {data.Description.split("User Desc:")[1].split("Issue Desc:")[0]}</> : data.Description}</p>

                            <h6>Activity</h6>
                            <div className={Detail.HeightGiven}>
                                {data.CaseComments && data.CaseComments.records.length > 0 && <>{console.log({ comment: data.CaseComments.records })}
                                    {data.CaseComments.records.sort(
                                        (objA, objB) => new Date(objA.CreatedDate) - new Date(objB.CreatedDate),
                                    ).map((activity, index) => {
                                        const itemDate = new Date(activity.CreatedDate);
                                        let desc = activity?.CommentBody.split("Wrote:\n");
                                        return (<div className={Detail.ActivityBox}>

                                            <div className={`${Detail.ActivityProfile} ${activity?.CreatedById != "0053b00000DgEVEAA3" && Detail.ActiDark}`}>
                                                <h6>{getStrCode(desc.length > 1 && desc[0] || activity?.CreatedByname)}</h6>
                                                {/* <h6>{getStrCode(desc.length>1 &&desc[0]||activity?.CreatedByname)}</h6> */}
                                            </div>
                                            <div className={Detail.ActivityContentImform}>
                                                <h2>{activity?.CreatedByname}</h2>
                                                {desc.length > 1 ? <><p>{desc[0]} Wrote:</p>
                                                    <p className={Detail.Para2} dangerouslySetInnerHTML={{ __html: desc[1] }} /></> : <p className={Detail.Para2} dangerouslySetInnerHTML={{ __html: activity?.CommentBody }} />}
                                            </div>
                                            <div className={Detail.ActivityDate}>
                                                <p>{itemDate.getDate()}/{monthNames[itemDate.getMonth()]}/{itemDate.getFullYear()} {formatAMPM(itemDate)}</p>
                                            </div>
                                        </div>)
                                    })}
                                </>}
                                {data.ActivityHistories && data.ActivityHistories.records.length > 0 && <>
                                    {data.ActivityHistories.records.map((activity, index) => {
                                        const itemDate = new Date(activity.StartDateTime);
                                        return (<div className={Detail.ActivityBox}>

                                            <div className={`${Detail.ActivityProfile} ${activity?.OwnerId != data?.salesRepId && Detail.ActiDark}`}>
                                                <h6>{activity?.OwnerId == data?.salesRepId ? getStrCode(data.salesRepName) : "CS"}</h6>
                                            </div>
                                            <div className={Detail.ActivityContentImform}>
                                                <h2>{activity?.OwnerId == data?.salesRepId ? data.salesRepName : "Customer Support"}</h2>
                                                <p>Hi, {activity?.OwnerId != data?.salesRepId ? data.salesRepName : "Customer Support"},</p>
                                                <p className={Detail.Para2} dangerouslySetInnerHTML={{ __html: activity?.Description }} />

                                            </div>
                                            <div className={Detail.ActivityDate}>
                                                <p>{itemDate.getDate()}/{monthNames[itemDate.getMonth()]}/{itemDate.getFullYear()} {formatAMPM(itemDate)}</p>
                                            </div>
                                        </div>)
                                    })}
                                </>}


                            </div>
                            {/* Active Comment Box STARTING */}
                            <div className={Detail.CommentBox}>
                                {data.Status != "closed" && <div className={Detail.ActivityBox}>
                                    <div className={Detail.ActivityProfile}>
                                        <h6>{getStrCode(userData.firstName + ' ' + userData.lastName)}</h6>
                                    </div>
                                    <div className={`${Detail.ActivityContentImform} ${Detail.SendFlex}`}>
                                        <textarea placeholder='Add a comment...' rows="4" cols="50" value={comment} onChange={(e) => { setComment(e.target.value) }}></textarea>

                                        <div className={Detail.SendButtonChat} style={{ cursor: "pointer" }} onClick={() => { if (btnAct) { CommentPostHandler() } }}>
                                            {!btnAct ? <Loading /> :
                                                <svg xmlns="http://www.w3.org/2000/svg" width="58" height="58" viewBox="0 0 58 58" fill="none">
                                                    <path d="M40.5327 21.9402C40.7375 21.6765 40.8382 21.3451 40.8151 21.0105C40.7921 20.6758 40.647 20.3618 40.408 20.1293C40.1691 19.8968 39.8532 19.7624 39.5219 19.7523C39.1905 19.7421 38.8672 19.8568 38.6147 20.0743L14.6397 40.712L1.97907 35.7578C1.42832 35.5445 0.949652 35.1758 0.599955 34.6953C0.250258 34.2149 0.0442326 33.643 0.00635955 33.0476C-0.0315135 32.4522 0.100358 31.8582 0.386305 31.3364C0.672252 30.8146 1.10025 30.3868 1.61945 30.1039L54.18 0.313574C54.5931 0.088433 55.0588 -0.0189959 55.5276 0.00275323C55.9963 0.0245024 56.4503 0.174613 56.8413 0.437064C57.2323 0.699515 57.5455 1.06446 57.7475 1.49294C57.9496 1.92142 58.0328 2.39736 57.9884 2.86996L53.3778 51.4973C53.3316 51.996 53.171 52.477 52.9088 52.9019C52.6466 53.3268 52.29 53.6839 51.8674 53.9448C51.4447 54.2057 50.9678 54.3632 50.4744 54.4048C49.981 54.4464 49.4849 54.3709 49.0254 54.1843L33.6168 48.1479L23.9439 57.3191C23.5869 57.6566 23.1399 57.8808 22.6583 57.964C22.1767 58.0471 21.6816 57.9856 21.2342 57.7871C20.7867 57.5885 20.4066 57.2616 20.1409 56.8468C19.8752 56.432 19.7354 55.9475 19.739 55.4532V48.2505L40.5327 21.9402Z" fill="black" />
                                                </svg>}
                                        </div>
                                    </div>

                                </div>}
                            </div>

                        </div>
                    </div>

                    <div className='col-lg-3 col-md-3 col-sm-12'>

                        <div className={Detail.RightMainDiv}>

                            <div className={Detail.RightControlStatus}>
                                <h3>Status</h3>
                                <p>{data.Status}</p>
                            </div>

                            {/* <div className={Detail.ControlPriority}>
                                <h3>Priority</h3>
                                <p>{data.Priority == "High" ? <SupportStatusRed /> : data.Priority == "Medium" ? <SupportStatusYellow /> : <SupportStatusGreen />}
                                {data.Priority} Priority</p>
                            </div> */}


                            {data.ManufacturerName__c && <div className={Detail.ManufactureID}>
                                <h3>Manufacture ID</h3>
                                <p>{data.ManufacturerId__c? <Link to={'/Brand/'+data.ManufacturerId__c} className={Detail.LinkHolder}>{data.ManufacturerName__c}</Link>:data.ManufacturerName__c}</p>
                            </div>}

                            <div className={Detail.CaseNumber}>
                                <h3>Case Number</h3>
                                <p>{data.CaseNumber}</p>
                            </div>

                            {data.Associated_PO_Number__c && <div className={Detail.PONumber}>
                                <h3>PO Number</h3>
                                {console.log({ data })}
                                <p>#
                                    {data.Opportunity__c ? <Link to="/orderDetails" className={Detail.LinkHolder}><span onClick={()=>localStorage.setItem("OpportunityId", JSON.stringify(data.Opportunity__c))}>{data.Associated_PO_Number__c}</span></Link> :
                                    data.Associated_PO_Number__c}</p>
                            </div>}
                            <div className={Detail.RecordType}>
                                <h3>Record Type</h3>
                                <p>{data.RecordType.Name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FullQuearyDetail