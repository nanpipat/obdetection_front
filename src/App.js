import React, { useState, useCallback, useRef } from 'react'
import logo from './logo.svg';
import './App.css';
import Webcam from 'react-webcam'
import Modal from 'react-modal';
import nvision from "@nipacloud/nvision/dist/browser/nvision"
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner';

const App = () => {
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [opencamera, setOpencamera] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);

  const [filename, setFilename] = useState("");
  const [imgPreview, setImgPreview] = useState(null);
  const [imgResult, setImgResult] = useState(null);
  const [imgType, setImgType] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log(imageSrc)
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)'
    }
  };
  Modal.setAppElement('#root');

  const objectDetectionService = nvision.objectDetection({
    //API KEY
  });

  const openModal = () => {
    setIsOpen(true);
  }

  const obDetect = (img) => {
    setLoading(true);
    console.log(img, "test")
    if (!img) {
      alert("Not Found Image")
      setLoading(false);
      return
    }
    objectDetectionService.predict({
      rawData: img.replace("data:" + imgType + ";base64,", ""),
      outputCroppedImage: true,
      outputVisualizedImage: true
    }
    ).then((result) => {
      let resu = "";
      resu = result.raw_data
      setImgResult("data:" + imgType + ";base64," + result.raw_data)
      console.log(resu, "asdasdasd");
      setLoading(false);
    }, err => {
      alert(err);
      setLoading(false);
    });

  }

  const filehandler = event => {
    if (event.target.files[0]) {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => {
        // Make a fileInfo Object
        console.log("Called", reader);
        setImgPreview(reader.result)
      };
      setFilename(event.target.files[0].name)
      setImgType(event.target.files[0].type)
    }
    console.log(event.target.files[0], "img")
  }


  const upload = () => {
    document.getElementById("selectImage").click()
  }

  const submitModal = () => {
    setFilename("Webcam Capture")
    setImgPreview(imgSrc)
    setImgSrc(null);
    setIsOpen(false);
    setImgType("image/jpeg")

  }

  const afterOpenModal = () => {

  }

  const closeModal = () => {
    console.log("asdasdas")
    setImgSrc(null);
    setIsOpen(false);
  }

  const cleardata = () => {
    setFilename(null)
    setImgPreview(null)
    setImgResult(null)
    setImgType(null)
  }

  return (
    <div className="App">
      <header className="App-header">
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={() => afterOpenModal}
          onRequestClose={() => closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <div className="modalCamera">
            <div style={{ width: "100%", display: "flex" }}>
              <div style={{ width: "50%", textAlign: "left", paddingLeft: "1rem", justifyContent: "left" }}>
                <h1>Take your photo... </h1>
              </div>
              <div style={{ width: "50%", textAlign: "right", justifyContent: "right" }}>
                <button className="buttonUpload" style={{ backgroundColor: "red", width: "50px", marginTop: "18px" }} onClick={() => closeModal()}>X</button>
              </div>
            </div>
            {imgSrc ? <img
              src={imgSrc}
            />
              :
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
              />
            }

            {
              imgSrc ?
                <div className="buttonRow">
                  <div className="buttonContainer">
                    <button className="buttonUpload" style={{ marginRight: "1rem", backgroundColor: "#3c84c0" }} onClick={submitModal}>Submit</button>
                    <button className="buttonUpload" style={{ backgroundColor: "#49b431" }} onClick={() => setImgSrc(null)}>Snap Again</button>
                  </div>
                </div>
                :
                <div className="buttonRow">
                  <button className="buttonUpload" style={{ backgroundColor: "#af1b1b" }} onClick={capture}>Capture photo</button>
                </div>
            }
          </div>
        </Modal>
        <div className="previewImg">
          <div className="buttonRow">
            <img style={{ height: "100px", marginRight: "1rem" }}
              src={imgPreview}
            />
            <h5>{filename}</h5>
          </div>

        </div>
        <div className="buttonRow">
          <div className="buttonContainer">
            <button className="buttonUpload" style={{ marginRight: "1rem", backgroundColor: "#3c84c0" }} onClick={upload}>Upload</button>
            <input id='selectImage' hidden type="file" onChange={filehandler} accept="image/*" />
            <h6 style={{ margin: 0, alignSelf: "center", marginRight: "1rem" }}>Or</h6>
            <button className="buttonUpload" style={{ backgroundColor: "#49b431" }} onClick={() => openModal(false)}>Use Webcam</button>
          </div>
        </div>
        {
          loading ? <Loader
            type="Rings"
            color="#FFF"
            height={100}
            width={100}
            visible={loading}
          />
            :
            <div>
              <div className="buttonRow">
                <div className="buttonContainer">
                  <button className="buttonUpload" disabled={imgPreview == null || imgPreview == ''} style={{ backgroundColor: "#3c84c0" }} onClick={() => obDetect(imgPreview)}>Generate</button>
                </div>
              </div>
              <div className="buttonRow">
                <div className="buttonContainer">
                  <button className="buttonUpload" style={{ backgroundColor: "#af1b1b" }} onClick={cleardata}>Clear</button>
                </div>
              </div>
            </div>
        }

        {imgResult ? <div className="resultImg" style={{ paddingBottom: "2rem" }}>
          <h2>Result Image</h2>
          <img style={{ maxHeight: "700px", maxWidth: "70%" }}
            src={imgResult}
          />
        </div> :
          <>
            {
              loading ? ""
                :
                <div className="buttonRow">
                  <div style={{ borderStyle: "solid", borderColor: "white", width: "40%", height: "400px", alignSelf: "center" }}>
                    <h3>File input not found..</h3>
                    <h3>Please upload and generate to see result.</h3>
                  </div>
                </div>
            }
          </>
        }

      </header>
    </div>
  );
}

export default App;
