import CustomerSupportLayout from "../components/customerSupportLayout"
import React, { useEffect, useMemo, useState } from "react";
import Filters from "../components/OrderList/Filters";
import Styles from "../components/OrderList/style.module.css";
import { GetAuthData, getAllAccountOrders, getOrderList } from "../lib/store";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination/Pagination";
import OrderListContent from "../components/OrderList/OrderListContent";
import LoaderV3 from "../components/loader/v3";

let PageSize = 5;

const OrderStatusIssues = ()=>{
    const [currentPage, setCurrentPage] = useState(1);
    const [shipByText, setShipByText] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [orders, setOrders] = useState([]);
    const [searchShipBy, setSearchShipBy] = useState();
    const [filterValue, onFilterChange] = useState({
      month: "",
      manufacturer: null,
      search: "",
    });
  
    const handleFilterChange = (filterType, value) => {
      onFilterChange((prev) => {
        const newData = { ...prev };
        newData[filterType] = value;
        return newData;
      });
      setCurrentPage(1);
    };
  
    function sortingList(data) {
      data.sort(function (a, b) {
        return new Date(b.CreatedDate) - new Date(a.CreatedDate);
      });
      return data;
    }
  
    const orderData = useMemo(() => {
      return (
        orders
          // Manufacturer filter
          ?.filter(
            (order) =>
              !filterValue.manufacturer ||
              filterValue.manufacturer === order.ManufacturerId__c
          )
          // Search by account filter
          ?.filter((order) => {
            return (
              !filterValue?.search?.length ||
              order.AccountName?.toLowerCase().includes(
                filterValue?.search?.toLowerCase()
              )
            );
          })
          .filter((order) => {
            if (searchShipBy) {
              const orderItems = order.OpportunityLineItems?.records;
              if (orderItems?.length) {
                return (
                  orderItems?.some((item) => {
                    return item.Name?.toLowerCase().includes(
                      searchShipBy?.toLowerCase()
                    );
                  }) ||
                  order.PO_Number__c?.toLowerCase().includes(
                    searchShipBy?.toLowerCase()
                  )
                );
              } else if (
                order.PO_Number__c?.toLowerCase().includes(
                  searchShipBy.toLowerCase()
                )
              ) {
                return true;
              }
              return false;
            }
            return true;
          })
      );
    }, [filterValue, orders, searchShipBy]);
  
    useEffect(() => {
      setLoaded(false);
      GetAuthData()
        .then((response) => {
          getAllAccountOrders({
            key: response.data.x_access_token,
            accountIds: JSON.stringify(response.data.accountIds)
          })
            .then((order) => {
              console.log({order});
              let sorting = sortingList(order);
              setOrders(sorting);
              setLoaded(true);
            })
            .catch((error) => {
              console.log({ error });
            });
        })
        .catch((err) => {
          console.log({ err });
        });
    }, [filterValue.month]);
  
    useEffect(() => {
      setShipByText(searchShipBy);
    }, [searchShipBy]);
  
    return (
      <CustomerSupportLayout

        filterNodes={
          <Filters
            onChange={handleFilterChange}
            value={filterValue}
            monthHide={false}
            resetFilter={() => {
              onFilterChange({
                manufacturer: null,
                month: "",
                search: "",
              });
              setSearchShipBy("");
            }}
          />
        }
      >
        {!loaded ? (
          <LoaderV3 text={"Loading Order List"} />
        ) : (
          <div>
            <section>
              <div className="">
                <div className={Styles.orderMainDiv}>
                  <div className={Styles.OrderMainFull}>
                    <div className={Styles.inorderflex}>
                      <div>
                        <h2>Your Orders</h2>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setSearchShipBy(e.target.elements.searchShipBy.value);
                        }}
                      >
                        <div
                          className={`d-flex align-items-center ${Styles.InputControll}`}
                        >
                          <input
                            type="text"
                            name="searchShipBy"
                            onChange={(e) => setShipByText(e.target.value)}
                            value={shipByText}
                            placeholder="Search All Orders"
                          />
                          <button>Search Orders</button>
                        </div>
                      </form>
                    </div>
                    <OrderListContent
                      data={orderData?.slice(
                        (currentPage - 1) * PageSize,
                        currentPage * PageSize
                      )}
                      setSearchShipBy={setSearchShipBy}
                      searchShipBy={searchShipBy}
                      hideDetailedShow
                    />
                  </div>
                  <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={orderData.length}
                    pageSize={PageSize}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
        </CustomerSupportLayout>
    );
}
export default OrderStatusIssues