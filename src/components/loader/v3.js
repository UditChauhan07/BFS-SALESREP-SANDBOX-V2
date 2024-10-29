import LoaderV2 from "./v2"
import styles from "./style3.module.css";
const LoaderV3 = ({text="Please wait, we're getting data..."}) => {
    if(text){
        return (<div className="d-grid place-content-center" style={{ height: '40vh' }}><div className={styles.loader}></div> <br /><p className={styles.textHolder}>{"Please wait, we're getting data..."}</p></div>)
    } return null;
}
export default LoaderV3