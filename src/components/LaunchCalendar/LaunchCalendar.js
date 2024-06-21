import React, { useEffect, useState, useMemo } from "react";
import "./Style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductDetails from "../../pages/productDetails";
import { hexabrand, hexabrandText } from "../../lib/store";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function LaunchCalendar({ productList, selectBrand, brand, month }) {
  const [isEmpty, setIsEmpty] = useState(false);
  // useEffect(() => {
  //   let temp = true;
  //   products.map((month) => {
  //     month.content.map((item) => {
  //       if (!selectBrand || selectBrand == item.brand) {
  //         temp = false;
  //       }
  //     });
  //     setIsEmpty(temp);
  //   });
  // }, [selectBrand]);

  const [productDetailId, setProductDetailId] = useState();
  const [filterData, setFilterData] = useState()
  useEffect(() => {
    if (!month && !selectBrand) {
      const newValues = productList?.map((months) => {
        const filterData = months.content?.filter((item) => {
          return brand.some((brand) => brand.Name === item.ManufacturerName__c);
        });
        return { ...months, content: filterData };
      });
      setFilterData(newValues)
      setIsEmpty(false);

    } else {
      let isEmptyFlag = true;
      const newValues = productList?.map((months) => {
        const filterData = months.content?.filter((item) => {
          // let match = item.OCDDate.split("/")
          if (month) {
            if (selectBrand) {
              if (selectBrand == item.ManufacturerName__c) {
                if (month == "TBD") {
                  return parseInt(item.Ship_Date__c.split("-")[2]) == 15 && selectBrand === item.ManufacturerName__c && brand.some((brand) => brand.Name === item.ManufacturerName__c);
                } else {
                  return monthNames[parseInt(item.Ship_Date__c.split("-")[1]) - 1].toLowerCase() == month.toLowerCase() && selectBrand === item.ManufacturerName__c && brand.some((brand) => brand.Name === item.ManufacturerName__c);
                }
              }
            } else {
              if (month == "TBD") {
                return parseInt(item.Ship_Date__c.split("-")[2]) == 15 && brand.some((brand) => brand.Name === item.ManufacturerName__c);
              } else {
                return monthNames[parseInt(item.Ship_Date__c.split("-")[1]) - 1].toLowerCase() == month.toLowerCase() && brand.some((brand) => brand.Name === item.ManufacturerName__c);
              }
            }
            // return match.includes(month.toUpperCase() )
          } else {
            if (selectBrand) {
              if (selectBrand == item.ManufacturerName__c) {
                if (brand.some((brand) => brand.Name === item.ManufacturerName__c)) {
                  return true;
                }
              }
            } else {
              if (brand.some((brand) => brand.Name === item.ManufacturerName__c)) {
                return true;
              }
            }
            // If month is not provided, return all items
          }
        });
        if (filterData.length > 0) {
          isEmptyFlag = false;
        }
        // Create a new object with filtered content
        return { ...months, content: filterData };
      });
      setIsEmpty(isEmptyFlag);
      setFilterData(newValues);
    }

  }, [month, selectBrand, productList, brand]);

  return (
    <div id="Calendar">
      <div className="container">
        <h1 className="TopHeading">Marketing Calendar</h1>
        <div className="row">
          <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 ">
            <ul className="timeline mt-4 mr-4" id="CalenerContainer">
              {!isEmpty ? (
                filterData?.map((month, index) => {
                  if (month.content.length) {
                    return (
                      <li key={index}>
                        <span className={`timelineHolder0${(index % 3) + 1}`} id={month.month}>{month.month}</span>
                        {month.content.map((product, productIndex) => {
                          if (!selectBrand || selectBrand == product.ManufacturerName__c) {
                            return (
                              <>
                                <div className="timeline-content" key={productIndex}>
                                  <div className="ProductInfo">
                                    <div className="BothDateTopFlex">
                                      <div className="ShipDate">
                                        <span style={{textTransform:'uppercase'}}>Ship Date</span>
                                        {/* style={{ backgroundColor: hexabrand[product.ManufacturerId__c], color: hexabrandText[product.ManufacturerId__c] }} */}
                                        <div className={`DateCurrent0${(index % 3) + 1}`} style={{color:'#000'}}>{product.Ship_Date__c ? (product.Ship_Date__c.split("-")[2] == 15 ? 'TBD' : product.Ship_Date__c.split("-")[2]) + '/' + monthNames[parseInt(product.Ship_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + product.Ship_Date__c.split("-")[0] : 'NA'}</div>
                                      </div>
                                      <div className="ShipDate EDate">
                                        <span>OCD</span>
                                        <div className="DateEod">{product.Launch_Date__c ? product.Launch_Date__c.split("-")[2] + '/' + monthNames[parseInt(product.Launch_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + product.Launch_Date__c.split("-")[0] : 'NA'}</div>
                                      </div>
                                    </div>
                                    <div className="d-flex mt-2">
                                      <div className="m-auto ProductImg">
                                        <img src={product?.ProductImage ?? "\\assets\\images\\dummy.png"} alt={product.Name} onClick={() => {
                                          setProductDetailId(product.Id);
                                        }} style={{ cursor: 'pointer' }} />
                                      </div>
                                      <div className="LaunchProductDetail">
                                        <h3 onClick={() => {
                                          setProductDetailId(product.Id);
                                        }} style={{ cursor: 'pointer' }}>{product.Name}</h3>
                                        <div className="size">
                                          Size <span className="ProductQty">{product.Size_Volume_Weight__c}</span>
                                        </div>
                                        <p>{product.Description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="launchBrand">
                                    <img className="img-fluid" src={"\\assets\\images\\brandImage\\" + product.ManufacturerId__c + ".png"} alt={`${product.ManufacturerName__c} logo`} />
                                  </div>
                                </div>
                              </>
                            );
                          }
                        })}
                      </li>
                    )
                  }
                })
              ) : (
                <div>No data found</div>
              )}
            </ul>
          </div>

          <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 ">
            <div className="GrayBg">
              <div className="PlusBtn">
                <div className="AddNewInner">
                  <button className="btn btn-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="86" height="86" viewBox="0 0 86 86" fill="none">
                      <path d="M43 21.5L43 64.5" stroke="#D5D9D9" strokeWidth="5" strokeLinecap="square" strokeLinejoin="round" />
                      <path d="M64.5 43L21.5 43" stroke="#D5D9D9" strokeWidth="5" strokeLinecap="square" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <p> Unleashed feature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} isAddtoCart={false}/>
    </div>
  );
}

export default LaunchCalendar;
