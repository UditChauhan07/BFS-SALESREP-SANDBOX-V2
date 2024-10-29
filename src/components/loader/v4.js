import React from 'react';
import Styles from './Loaderv4.module.css'; // For styling the loader

const LoaderV4 = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className={Styles.loaderOverlay}>
      <div className={Styles.loader}>
        <div className={Styles.spinner}></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default LoaderV4;
