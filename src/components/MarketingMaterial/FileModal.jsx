





import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineDownload } from "react-icons/md";
// import styles from './page.module.css';
import styles from '../../pages/page.module.css';
import Loading from "../Loading";

function FileModal({ show, onHide, file }) {
  const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { url, mimeType, fileName } = file;

  const openDownloadConfirm = () => {
    setIsDownloadConfirmOpen(true);
  };

  const closeDownloadConfirm = () => {
    setIsDownloadConfirmOpen(false);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setIsDownloading(false);
    closeDownloadConfirm();
  };

  const renderFileContent = () => {
  if (mimeType.startsWith('image/')) {
    return <img src={url} alt="File" className="img-fluid" />;
  } else if (mimeType === 'application/pdf') {
    // Use iframe for better PDF compatibility
    return <embed src={url} width="100%" height="500px" />;
  } else if (mimeType.startsWith('video/')) {
    return (
      <video controls width="100%">
        <source src={url} type={mimeType} />
        Your browser does not support the video tag.
      </video>
    );
  } else {
    return <p>Preview not available. Use the button below to download the file.</p>;
  }
};
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{fileName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] m-0 p-0 text-start" style={{ fontSize: '18px' }}>
            {fileName}
          </h1>
          <button className={styles.downloadButton} onClick={openDownloadConfirm}>
            <div className="d-flex align-items-center justify-content-between gap-1">
              <MdOutlineDownload size={16} />Download
            </div>
          </button>
        </div>
        <div className="mt-3">
          {renderFileContent()}
        </div>

        {isDownloadConfirmOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <p style={{ marginTop: '20px' }}>Are you sure you want to download?</p>
              <div className={styles.modalActions}>
                <button onClick={handleDownload} className={styles.confirmButton}>YES</button>
                <button onClick={closeDownloadConfirm} className={styles.cancelButton}>NO</button>
              </div>
              {isDownloading && (
                <div className={styles.spinnerOverlay}>
                  <Loading color={"#fff"} loading={true} size={50} />
                  <div className={styles.progressBarContainer}>
                    <div id="downloadProgress" className={styles.progressBar}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default FileModal;





