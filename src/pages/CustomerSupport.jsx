import React, { useEffect, useMemo, useState } from "react";
import CustomerSupportPage from "../components/CustomerSupportPage/CustomerSupportPage";
import { FilterItem } from "../components/FilterItem";
import FilterSearch from "../components/FilterSearch";
import { DestoryAuth, GetAuthData, admins, getBrandList, getRetailerList, getSalesRepList, getSupportList } from "../lib/store";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination/Pagination";
import AppLayout from "../components/AppLayout";
import { CloseButton } from "../lib/svg";

let PageSize = 10;
const CustomerSupport = () => {
  const [supportList, setSupportList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchBy, setSearchBy] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState(null);
  const [retailerFilter, setRetailerFilter] = useState(null);
  const [brandList, setbrandList] = useState([])
  const [retailerList, setRetailerList] = useState([])
  const [userData, setUserData] = useState({});
  const [salesRepList, setSalesRepList] = useState([])
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  let statusList = ["New", "Follow up Needed By Brand Customer Service", "Follow up needed by Rep", "Follow up Needed By Brand Accounting", "Follow up needed by Order Processor", "RTV Approved", "Closed"];
  const [status, setStatus] = useState(["New"]);
  useEffect(() => {
    GetAuthData()
      .then((user) => {
        if (user) {
          setUserData(user)
          if (!selectedSalesRepId) setSelectedSalesRepId(user.Sales_Rep__c)
          supportHandler({ key: user.x_access_token, salesRepId: selectedSalesRepId ?? user.Sales_Rep__c })
          reatilerHandler({ key: user.x_access_token, userId: selectedSalesRepId ?? user.Sales_Rep__c })
          brandhandler({ key: user.x_access_token, userId: selectedSalesRepId ?? user.Sales_Rep__c })
          if (admins.includes(user.Sales_Rep__c)) {
            getSalesRepList({ key: user.x_access_token }).then((repRes) => {
              setSalesRepList(repRes.data)
            }).catch((repErr) => {
              console.log({ repErr });
            })
          }
        } else {
          DestoryAuth()
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  const reatilerHandler = ({ key, userId }) => {
    getRetailerList({ key, userId }).then((retailerRes) => {
      setRetailerList(retailerRes.data)
    }).catch((retailerErr) => console.log({ retailerErr }))
  }
  const brandhandler = ({ key, userId }) => {
    getBrandList({ key, userId }).then((brandRes) => {
      setbrandList(brandRes.data)
    }).catch((brandErr) => console.log({ brandErr }))
  }
  const supportHandler = ({ key, salesRepId }) => {
    getSupportList({ key, salesRepId })
      .then((supports) => {
        console.log({ supports });
        setSupportList(supports);
        setLoaded(true);
      })
      .catch((error) => {
        console.error({ error });
      });
  }
  const supportBasedOnSalesRep = (value) => {
    setSelectedSalesRepId(value)
    setSupportList([])
    setRetailerList([])
    setbrandList([])
    setLoaded(false)
    setRetailerFilter(null)
    setManufacturerFilter(null)
    supportHandler({ key: userData.x_access_token, salesRepId: value })
    brandhandler({ key: userData.x_access_token, userId: value })
    reatilerHandler({ key: userData.x_access_token, userId: value })
  }
  const filteredData = useMemo(() => {
    let newValues = supportList;
    if (status.length > 0) {
      newValues = newValues.filter((item) => status.includes(item.Status));
    }
    if (manufacturerFilter) {
      newValues = newValues.filter((item) => item.ManufacturerId__c === manufacturerFilter);
    }
    if (searchBy) {
      newValues = newValues?.filter((value) => value.CaseNumber?.toLowerCase().includes(searchBy?.toLowerCase()) || value.Reason?.toLowerCase().includes(searchBy?.toLowerCase()) || value?.RecordType?.Name?.toLowerCase().includes(searchBy?.toLowerCase()));
    }
    if (retailerFilter) {
      newValues = newValues.filter((item) => item.AccountId === retailerFilter);
    }
    return newValues;
  }, [supportList, retailerFilter, manufacturerFilter, searchBy,status]);
  return (
    <AppLayout
      filterNodes={
        <>
          {(admins.includes(userData?.Sales_Rep__c), salesRepList?.length > 0) &&
            <FilterItem
              minWidth="220px"
              label="salesRep"
              name="salesRep"
              value={selectedSalesRepId}
              options={salesRepList.map((salesRep) => ({
                label: salesRep.Id == userData.Sales_Rep__c ? 'My Supports (' + salesRep.Name + ')' : salesRep.Name,
                value: salesRep.Id,
              }))}
              onChange={(value) => supportBasedOnSalesRep(value)}
            />
          }
          {retailerList?.length > 0 &&
            <FilterItem
              minWidth="220px"
              label="Retailer"
              name="Retailer"
              value={retailerFilter}
              options={retailerList.map((retailer) => ({
                label: retailer.Name,
                value: retailer.Id,
              }))}
              onChange={(value) => setRetailerFilter(value)}
            />}
          {brandList?.length > 0 &&
            <FilterItem
              minWidth="220px"
              label="Manufacturer"
              name="Manufacturer"
              value={manufacturerFilter}
              options={brandList.map((manufacturer) => ({
                label: manufacturer.Name,
                value: manufacturer.Id,
              }))}
              onChange={(value) => setManufacturerFilter(value)}
            />}
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
            className="border px-2 py-1 leading-tight d-grid"
            onClick={() => {
              setSearchBy("");
              setManufacturerFilter(null);
              setRetailerFilter(null);
              setSupportList([]);
              setLoaded(false);
              setRetailerList([]);
              setbrandList([])
              setSelectedSalesRepId(userData.Sales_Rep__c)
              supportHandler({ key: userData.x_access_token, salesRepId: userData.Sales_Rep__c })
              reatilerHandler({ key: userData.x_access_token, userId: userData.Sales_Rep__c })
              brandhandler({ key: userData.x_access_token, userId: userData.Sales_Rep__c })
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
          <Loading height={'70vh'} />
        ) : (
          <CustomerSupportPage
            data={filteredData}
            currentPage={currentPage}
            PageSize={PageSize}
            manufacturerFilter={manufacturerFilter}
            searchBy={searchBy}
            retailerFilter={retailerFilter}
          />
        )}
        <Pagination
          className="pagination-bar"
          currentPage={currentPage}
          totalCount={filteredData?.length}
          pageSize={PageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
        {/* <OrderStatusFormSection /> */}
      </>
    </AppLayout>
  );
};

export default CustomerSupport;
