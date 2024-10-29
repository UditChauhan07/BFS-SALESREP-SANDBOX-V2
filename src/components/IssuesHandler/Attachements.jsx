import { BiLock, BiSave, BiUpload } from "react-icons/bi";
import Styles from "./Attachements.module.css";
import { useEffect } from "react";

const Attachements = ({ title=true, files, setFile, setDesc, orderConfirmed, setConfirm, children,unLockIcon=false }) => {
    function handleChange(e) {
        let tempFile = [...files];
        let reqfiles = e.target.files;
        if (reqfiles) {
            if (reqfiles.length > 0) {
                Object.keys(reqfiles).map((index) => {
                    let url = URL.createObjectURL(reqfiles[index])
                    if (url) {
                        tempFile.push({ preview: url, file: reqfiles[index] });
                    }
                    // this thoughing me Failed to execute 'createObjectURL' on 'URL': Overload resolution failed?
                })
            }
        }
        setFile(tempFile);
    }
    const handleFileChange = (event) => {
        const files = event.target.files;
        const images = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (event) => {
                images.push(event.target.result);
            };

            reader.readAsDataURL(file);
        }
        console.log({ images });
    };
    const shakeHandler = () => {
        let lock1 = document.getElementById("lock2");
        if (lock1) {
            setTimeout(() => {
                lock1.classList.remove(Styles.shake);
            }, 300)
            lock1.classList.add(Styles.shake)
        }
    }
    const ImageSlider = () => {
        return (
            files.map((file, index) => (
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', right: '5px', top: '-5px', color: '#000', zIndex: 1, cursor: 'pointer', fontSize: '18px' }} onClick={() => { fileRemoveHandler(index) }}>x</span>
                    <a href={file?.preview} target="_blank" title="Click to Download">
                        <img src={file?.preview} key={index} alt={file?.preview} />
                    </a>
                </div>
            ))
        )
    }
    const fileRemoveHandler = (index) => {
        let tempFile = [...files];
        tempFile.splice(index, 1)
        setFile(tempFile);
    }
    return (<section style={{ borderBottom: '1px solid #ccc' }} id="AttachementSection">
        <h2 className={`${Styles.reasonTitle} ${unLockIcon ? 'd-flex justify-content-between align-items-center':''}`}><span style={{ cursor: "pointer" }} onClick={shakeHandler}>{title?title!=true?title:"Help us by sending some Details:":null}</span> {!orderConfirmed ? <BiLock style={{ float: 'right' }} id="lock2" />:unLockIcon?unLockIcon:null}</h2>
        {orderConfirmed &&
            <div className={Styles.attachContainer}>
                {children ? <div className={Styles.dFlex}>{children}</div> : null}
                <div className={Styles.dFlex}>
                    <div className={Styles.descholder}>
                        <p className={Styles.subTitle}>Describe you Problem</p>
                        <textarea name="desc" id="desc" className={Styles.textAreaPut} onKeyUp={(e) => setDesc(e.target.value)}></textarea>
                    </div>
                    <div className={Styles.attachHolder}>
                        <p className={Styles.subTitle}>upload some attachments</p>
                        <label className={Styles.attachLabel} for="attachement"><div><div className={Styles.attachLabelDiv}><BiUpload /></div></div></label>
                        <input type="file" style={{ width: 0, height: 0 }} id="attachement" onChange={handleChange} multiple accept="image/*" />
                        <div className={Styles.imgHolder}>
                            <ImageSlider />
                        </div>
                    </div>
                </div>
                <button className={Styles.btnHolder} onClick={() => setConfirm(true)}><BiSave />&nbsp;Submit</button>
            </div>
        }
    </section>)
}
export default Attachements;