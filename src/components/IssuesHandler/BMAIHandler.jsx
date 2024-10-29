import { useState } from "react";
import Styles from "./Style.module.css"
import ModalPage from "../Modal UI";
const BMAIHandler = ({title=true, reasons, reason, setReason,resetHandler,name="Reason" }) => {
    const [confirm,SetConfirm] = useState(false)
    const [temReason,SetTemReason] = useState()
    const shakeHandler = () => {
        let lock1 = document.getElementById(name);
        if (lock1) {
            setTimeout(() => {
                lock1.classList.remove(Styles.shake);
            }, 300)
            lock1.classList.add(Styles.shake)
        }
    }
    const OnChangeHandler = (name)=>{
        if(reason){
            SetConfirm(true)
            SetTemReason(name)
        }else{
            setReason(name)
        }
    }
    return (
        <div className={Styles.reasonContainer} style={{ borderBottom: '1px solid #ccc' }}>
                    {confirm ? (
          <ModalPage
            open
            content={
              <div className="d-flex flex-column gap-3" style={{ maxWidth: '700px' }}>
                <h2 className={`${Styles.warning} `}>Please Confirm</h2>
                <p className={`${Styles.warningContent} `} style={{ lineHeight: '22px' }}>
                  Are you sure you want to change {name}?
                </p>
                <div className="d-flex justify-content-around ">
                <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => { setReason(temReason);resetHandler?.();SetTemReason();SetConfirm(false)}}>
                    Ok
                  </button>
                  <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => SetConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            }
            onClose={() => {
              SetConfirm(false);
            }}
          />
        ) : null}
            <div>
                <p className={Styles.reasonTitle}>{title?title!=true?title:"How can we help you?":null}</p>
                <div className={Styles.reasonHolder}>
                    {reasons.map((item) => {
                        return (<div className={`${Styles.reasonCard} ${reason == item.name ? Styles.activeReason : ''}`} title={reason != item.name ? `Click here to Select '${item.name}'` : null} id={reason == item.name ? name : ""} onClick={reason == item.name ? shakeHandler : () => OnChangeHandler(item.name)}>
                            <div className={Styles.flexBox}>
                                <img src={item.icon} alt={item.name} className={Styles.iconHolder} />
                                <p className={Styles.textHolder}>{item.name}</p>
                            </div>
                            <p className={Styles.descHolder}>{item.desc}</p>
                        </div>)
                    })}
                </div>
            </div>
        </div>
    )
}
export default BMAIHandler