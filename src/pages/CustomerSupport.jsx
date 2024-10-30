import React, { useEffect, useMemo, useState } from "react";
import CustomerSupportPage from "../components/CustomerSupportPage/CustomerSupportPage";
import { FilterItem, MultiFilterItem } from "../components/FilterItem";
import FilterSearch from "../components/FilterSearch";
import { DestoryAuth, GetAuthData, getAllAccountBrand, getAllAccountSupport, getRetailerBrands, getSupportList } from "../lib/store";
import Pagination from "../components/Pagination/Pagination";
import AppLayout from "../components/AppLayout";
import { CloseButton } from "../lib/svg";
import LoaderV3 from "../components/loader/v3";


let PageSize = 10;
const CustomerSupport = () => {
  const [supportList, setSupportList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchBy, setSearchBy] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState(null);
  const [retailerFilter, setRetailerFilter] = useState(null);
  const [manufacturerData, setManufacturerData] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [account, setAccount] = useState(null);
  let statusList = ["Open","New", "Follow up Needed By Brand Customer Service", "Follow up needed by Rep", "Follow up Needed By Brand Accounting", "Follow up needed by Order Processor", "RTV Approved", "Closed"];
  const [status, setStatus] = useState(["Open"]);
  useEffect(() => {
    getSupportListHandler()
  }, []);
  const getSupportListHandler = (accountIds = null) => {
    setLoaded(false)
    setAccount(accountIds)
    GetAuthData()
      .then((user) => {
        if (user) {
          setAccountList(user.data.accountList)
          getAllAccountBrand({ key: user.data.x_access_token, accountIds: JSON.stringify(accountIds || user.data.accountIds) }).then((resManu) => {
            console.log({resManu});
            setManufacturerData(resManu);
            getAllAccountSupport({ key: user.data.x_access_token, accountIds: JSON.stringify(accountIds || user.data.accountIds) })
              .then((supports) => {
                // console.log({ supports });
                if (supports) {
                  setSupportList(supports);
                }
                setLoaded(true);
              })
              .catch((error) => {
                console.error({ error });
              });
          }).catch((err) => {
            console.log({ err });
          })
        } else {
          DestoryAuth()
            .then((res) => {
              console.log({ res });
            })
            .catch((err1) => {
              console.error({ err1 });
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  const filteredData = useMemo(() => {
    let newValues = supportList;
    if (status.length > 0) {
      if(status == "Open"){
        newValues = newValues.filter((item) => !"Approved".includes(item.Status)&&!"Closed".includes(item.Status));
      }else{
        newValues = newValues.filter((item) => status.includes(item.Status));
      }
    }
    if (manufacturerFilter) {
      newValues = newValues.filter((item) => item.ManufacturerId__c === manufacturerFilter);
    }
    if (searchBy) {
      newValues = newValues?.filter((value) => value.CaseNumber?.toLowerCase()?.includes(searchBy?.toLowerCase()) || value.Reason?.toLowerCase()?.includes(searchBy?.toLowerCase()) || value?.RecordType?.Name?.toLowerCase()?.includes(searchBy?.toLowerCase()));
    }
    if (retailerFilter) {
      newValues = newValues.filter((item) => item.AccountId === retailerFilter);
    }
    return newValues;
  }, [supportList, retailerFilter, manufacturerFilter, searchBy, status]);
  return (
    <AppLayout
      filterNodes={
        <>
          {accountList?.length > 1 &&
            <FilterItem
              minWidth="220px"
              label="All Store"
              value={account ? account?.length ? account[0] : null : null}

              options={[...accountList.map((month, i) => ({
                label: month.Name,
                value: month.Id,
              })), { label: 'All Store', value: null }]}
              onChange={(value) => {
                if(value){
                  getSupportListHandler([value]);
                }else{
                  getSupportListHandler(null);
                }
              }}
              name={"Account-menu"}
            />}
          <FilterItem
            minWidth="220px"
            label="Manufacturer"
            name="Manufacturer"
            value={manufacturerFilter}
            options={manufacturerData?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id,
            }))}
            onChange={(value) => setManufacturerFilter(value)}
          />
          <FilterItem
            label="Status"
            name="Status"
            value={status.length ? status[0] : null}
            options={statusList?.map((status) => ({
              label: status,
              value: status
            }))}
            minWidth={'200px'}
            onChange={(value) => setStatus([value])}
          />
          <FilterSearch
            onChange={(e) => setSearchBy(e.target.value)}
            value={searchBy}
            placeholder={"Search for Ticket"}
            minWidth="150px"
          />

          <button
            className="border px-2.5 py-1 leading-tight d-grid"
            onClick={() => {
              setStatus([statusList[0]])
              setManufacturerFilter(null);
              setRetailerFilter(null);
              setSearchBy("");
            }}
          >
            <CloseButton crossFill={'#fff'} height={20} width={20} />
            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
          </button>
        </>
      }
    >
      <>
        {!loaded ? (
          <LoaderV3 text={"Loading Support Please wait..."}/>
        ) : (
          <>
            <CustomerSupportPage
              data={filteredData}
              currentPage={currentPage}
              PageSize={PageSize}
              manufacturerFilter={manufacturerFilter}
              searchBy={searchBy}
              retailerFilter={retailerFilter}
            />
            <Pagination
              className="pagination-bar"
              currentPage={currentPage}
              totalCount={filteredData?.length}
              pageSize={PageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
        {/* <OrderStatusFormSection /> */}
      </>
    </AppLayout>
  );
};

export default CustomerSupport;
