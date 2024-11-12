import AppLayout from "../components/AppLayout";
import { useEffect, useState } from "react";
import { GetAuthData, getProductDetails } from "../lib/store";
import Loading from "../components/Loading";
import ModalPage from "../components/Modal UI";
import ProductDetailCard from "../components/ProductDetailCard";
import { CloseButton } from "../lib/svg";
import { useCart } from "../context/CartContent";
import Select from "react-select";


const ProductDetails = ({ productId, setProductDetailId, AccountId = null }) => {
    const { addOrder, isProductCarted } = useCart();
    const [product, setProduct] = useState({ isLoaded: false, data: [], discount: {} });
    const [replaceCartModalOpen, setReplaceCartModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(true)
    const [isModalNoRepOpen, setIsModalNoRepOpen] = useState(false);
    const [dealAccountList, setAccountList] = useState([]);
    const [selectAccount, setSelectAccount] = useState();
    const [replaceCartProduct, setReplaceCartProduct] = useState({});
    useEffect(() => {
        if (productId) {
            setIsModalOpen(true)
            setProduct({ isLoaded: false, data: [], discount: {} })
            GetAuthData().then((user) => {

                let rawData = { productId: productId, key: user?.data?.x_access_token, accountIds: JSON.stringify(AccountId || user.data.accountIds) }
                getProductDetails({ rawData }).then((productRes) => {

                    setProduct({ isLoaded: true, data: productRes.data, discount: productRes.discount })
                }).catch((proErr) => {
                    console.log({ proErr });
                })
            }).catch((err) => {
                console.log({ err });
            })
        }
    }, [productId])
    if (!productId) return null;

    const onQuantityChange = (element, quantity) => {
        let listPrice = Number(element?.usdRetail__c?.replace("$", "")?.replace(",", ""));
        let selectProductDealWith = product?.discount || {}
        let listOfAccounts = Object.keys(selectProductDealWith);
        let addProductToAccount = null

        if (listOfAccounts.length) {
            if (listOfAccounts.length == 1) {
                addProductToAccount = listOfAccounts[0];
            } else {
                //multi store deal with
                if (selectAccount) {
                    if (selectAccount?.value) {
                        addProductToAccount = selectAccount.value
                    }
                } else {
                    let accounts = [];
                    listOfAccounts.map((actId) => {
                        if (selectProductDealWith[actId]) {
                            accounts.push({ value: actId, label: selectProductDealWith[actId].Name })
                        }
                    })
                    setReplaceCartProduct({ product: element, quantity });
                    setAccountList(accounts);
                    //alert user
                    return;
                }
            }
            if (addProductToAccount) {
                let selectAccount = selectProductDealWith[addProductToAccount];

                let account = {
                    name: selectAccount?.Name,
                    id: addProductToAccount,
                    address: selectAccount?.ShippingAddress,
                    shippingMethod: selectAccount?.ShippingMethod,
                    discount: selectAccount?.Discount,
                    SalesRepId: selectAccount?.SalesRepId
                }

                let manufacturer = {
                    name: element.ManufacturerName__c,
                    id: element.ManufacturerId__c,
                }
                let orderType = 'wholesale';
                if (element?.Category__c?.toUpperCase() === "PREORDER" || element?.Category__c?.toUpperCase()?.match("EVENT")) {
                    orderType = 'pre-order'
                }
                element.orderType = orderType;
                let discount = 0;
                if (element?.Category__c === "TESTER") {
                    discount = selectAccount?.Discount?.testerMargin || 0;
                } else if (element?.Category__c === "Samples") {
                    discount = selectAccount?.Discount?.sample || 0;
                } else {
                    discount = selectAccount?.Discount?.margin || 0;
                }
                let salesPrice = (+listPrice - ((discount || 0) / 100) * +listPrice).toFixed(2);
                element.price = salesPrice;
                element.qty = element.Min_Order_QTY__c;
                let cartStatus = addOrder(element, account, manufacturer);
            }
        }
    };
    const accountSelectionHandler = () => {
        onQuantityChange(replaceCartProduct.product, replaceCartProduct.quantity, replaceCartProduct.salesPrice)
        accountSelectionCloseHandler();
    }
    const accountSelectionCloseHandler = () => {
        setReplaceCartProduct();
        setAccountList();
        setSelectAccount();
    }
    const HtmlFieldSelect = ({ title, list = [], value, onChange }) => {
        let styles = {
            holder: {
                border: '1px dashed #ccc',
                padding: '10px',
                width: '100%',
                marginBottom: '20px'
            },
            title: {
                color: '#000',
                textAlign: 'left',
                fontFamily: 'Montserrat',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '24px',
                letterSpacing: '2.2px',
                textTransform: 'uppercase'
            },
            field: {
                width: '100%',
                minHeight: '40px',
                borderBottom: '1px solid #ccc',
                borderRadius: '10px',
                background: '#f4f4f4'
            }
        }
        return (<div style={styles.holder}>
            <p style={styles.title}>{title}</p>
            <Select
                type="text"
                id={title?.replaceAll(/\s+/g, '-')}
                options={list}
                onChange={(option) => {
                    onChange?.(option)
                }}
                value={list ? list.find((option) => option.value === value?.value) : ""}
            />
        </div>)
    }
    let styles = {
        btn: { color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '1.4px', backgroundColor: '#000', width: '100px', height: '30px', cursor: 'pointer' }
    }
    return (
        <>
            <ModalPage
                styles={{ zIndex: 1022 }}
                open={dealAccountList?.length ? true : false}
                content={
                    <div className="d-flex flex-column gap-3">
                        <h2>Attention!</h2>
                        <p>
                            Please select store you want to order for
                        </p>
                        <HtmlFieldSelect value={selectAccount} list={dealAccountList} onChange={(value) => setSelectAccount(value)} />
                        <div className="d-flex justify-content-around ">
                            <button style={styles.btn} onClick={accountSelectionHandler}>
                                OK
                            </button>
                            <button style={styles.btn} onClick={accountSelectionCloseHandler}>
                                Cancel
                            </button>
                        </div>
                    </div>
                }
                onClose={accountSelectionCloseHandler}
            />
            {isModalOpen &&
                <ModalPage
                    open
                    content={
                        <div className="d-flex flex-column gap-3" style={{ width: '75vw' }}>
                            <div style={{
                                position: 'sticky',
                                top: '-20px',
                                background: '#fff',
                                zIndex: 1,
                                padding: '15px 0 0 0'
                            }}>
                                <div className="d-flex align-items-center justify-content-between" style={{ minWidth: '75vw' }}>
                                    <h1 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] m-0 p-0">Product Details</h1>
                                    <button type="button" onClick={() => { setIsModalOpen(false); setProductDetailId(null) }}>
                                        <CloseButton />
                                    </button>
                                </div>
                                <hr />
                            </div>

                            {isModalNoRepOpen ? (
                                <ModalPage
                                    open
                                    content={
                                        <div className="d-flex flex-column gap-3">
                                            <h2>Warning</h2>
                                            <p>
                                                You can not order from this brand.<br /> Kindly contact your Sales Rep
                                            </p>
                                            <div className="d-flex justify-content-around ">
                                                <button style={styles.btn} onClick={() => setIsModalNoRepOpen(false)}>
                                                    Ok
                                                </button>
                                            </div>
                                        </div>
                                    }
                                    onClose={() => {
                                        setIsModalNoRepOpen(false);
                                    }}
                                />
                            ) : null}
                            {!product?.isLoaded ? <Loading /> :
                                <ProductDetailCard product={product} orders={isProductCarted(productId)} onQuantityChange={onQuantityChange}
                                />}
                        </div>
                    }
                    onClose={() => {
                        setIsModalOpen(false); setProductDetailId(null);
                    }}
                />}
        </>
    );
};
export default ProductDetails;