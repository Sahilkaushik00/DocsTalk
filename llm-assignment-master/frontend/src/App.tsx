import React, { useState } from "react";
import axios from "axios"; // Use axios for API calls

// Import libraries for file upload and popups (optional)
import ReactDropzone from "react-dropzone";
import Modal from "react-modal";

interface File {
  name: string;
}

interface AppState {
  result?: string;
  question?: string;
  file?: File | null;
  isLoading: boolean;
  error?: string;
  isUploadSuccessModalOpen: boolean;
}

export default function App(): React.ReactElement {
  const [state, setState] = useState<AppState>({
    result: undefined,
    question: undefined,
    file: null,
    isLoading: false,
    error: null,
    isUploadSuccessModalOpen: false,
  });

  // Handle question change
  const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({ ...prevState, question: event.target.value }));
  };

  // Handle file upload (using react-dropzone)
  const onFileDrop = (acceptedFiles: File[]) => {
    setState((prevState) => ({ ...prevState, file: acceptedFiles[0] }));
    setIsUploadSuccessModalOpen(true); // Open success modal on upload
  };

  const handleCloseUploadSuccessModal = () => {
    setState((prevState) => ({ ...prevState, isUploadSuccessModalOpen: false }));
  };

  // Submit form handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

    const formData = new FormData();

    if (state.file) {
      formData.append("file", state.file);
    }
    if (state.question) {
      formData.append("question", state.question);
    }

    try {
      const response = await axios.post("/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setState((prevState) => ({ ...prevState, result: response.data.result }));
    } catch (err) {
      setState((prevState) => ({ ...prevState, error: err.message }));
    } finally {
      setState((prevState) => ({ ...prevState, isLoading: false }));
    }
  };

  return (
    <div className="appBlock">
      <form onSubmit={handleSubmit} className="form">
        <label className="questionLabel" htmlFor="question">
          Question:
        </label>
        <input
          className="questionInput"
          id="question"
          type="text"
          value={state.question}
          onChange={handleQuestionChange}
          placeholder="Ask your question here"
        />

        <br />
        <label className="fileLabel" htmlFor="file">
          Upload file (.csv, .txt, .docx, .pdf):
        </label>

        <ReactDropzone onDrop={onFileDrop} accept=".csv,.txt,.docx,.pdf">
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {!state.file && <p>Drag and drop your file here, or click to select</p>}
              {state.file && <p>File uploaded: {state.file.name}</p>}
            </div>
          )}
        </ReactDropzone>

        <br />
        <button
          className="submitBtn"
          type="submit"
          disabled={!state.file || !state.question || state.isLoading}
        >
          Submit
        </button>

        {state.isLoading && <p>Processing your request...</p>}
        {state.error && <div className="error">{state.error}</div>}
      </form>

      <Modal
        isOpen={state.isUploadSuccessModalOpen}
        onRequestClose={handleCloseUploadSuccessModal}
        contentLabel="Upload Success"
        className="upload-success-modal"
        overlayClassName="upload-success-modal-overlay"
      >
        <h2>File Upload Successful!</h2>
        <p>Your file has been uploaded and is ready for processing.</p>
        <button onClick={handleCloseUploadSuccessModal}>Close</button>
      </Modal>

      <
