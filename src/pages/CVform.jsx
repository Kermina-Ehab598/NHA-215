import React, { useReducer, useRef, useCallback, useState } from "react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
];

const initialState = {
  file: null,
  loading: false,
  analyzing: false,
  serverError: null,
  analysis: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, file: action.file, serverError: null };
    case "REMOVE_FILE":
      return { ...state, file: null, serverError: null };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ANALYZING":
      return { ...state, analyzing: action.analyzing };
    case "SET_ANALYSIS":
      return {
        ...state,
        analysis: action.data,
        loading: false,
        analyzing: false,
      };
    case "SET_SERVER_ERROR":
      return {
        ...state,
        serverError: action.error,
        loading: false,
        analyzing: false,
      };
    default:
      return state;
  }
}

export default function CVFormUploader() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { file, loading, analyzing, serverError, analysis } = state;
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const validateAndSet = useCallback((f) => {
    if (!f) return false;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      dispatch({
        type: "SET_SERVER_ERROR",
        error: "Only PDF, Word or PowerPoint files allowed.",
      });
      dispatch({ type: "REMOVE_FILE" });
      if (fileRef.current) fileRef.current.value = "";
      return false;
    }
    dispatch({ type: "SET_FILE", file: f });
    return true;
  }, []);

  const handleFiles = (files) => {
    const f = files?.[0];
    if (f) validateAndSet(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onChoose = () => fileRef.current?.click();
  const onFileChange = (e) => handleFiles(e.target.files);
  const removeFile = () => {
    dispatch({ type: "REMOVE_FILE" });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      dispatch({ type: "SET_SERVER_ERROR", error: "Please upload a file." });
      return;
    }


    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_SERVER_ERROR", error: null });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://yaraa03-resume-ats-api.hf.space/ats-score",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok)
        throw new Error(
          `API Error ${response.status}: ${JSON.stringify(result)}`
        );

      dispatch({ type: "SET_ANALYZING", analyzing: true });

      setTimeout(() => {
        dispatch({ type: "SET_ANALYSIS", data: result });
      }, 1000);
    } catch (err) {
      dispatch({
        type: "SET_SERVER_ERROR",
        error: "Network error. Try again.",
      });
    }
  };

  /* ----------------- Success UI ----------------- */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#020707] to-[#052a2a]">
        <div className="max-w-3xl w-full bg-[#071014] p-8 rounded-2xl shadow-lg border border-[#123d3d] text-white">
          <h2 className="text-2xl font-bold text-[#20bec4]">
            Submission received
          </h2>
          <p className="mt-2 text-gray-300">
            Thanks! We will analyze your CV and send job recommendations
            shortly.
          </p>
        </div>
      </div>
    );
  }

  /* ----------------- Main UI: upload bubble + form ----------------- */
  return (
    <div className="flex items-center justify-center p-6 bg-gradient-to-br from-[#010d0d] to-[#023437] text-white">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: big speech-bubble upload */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#bfeee9] to-[#c7f3ea] p-8 shadow-2xl border border-[#0c3c3a] flex flex-col items-center">
          <div className="flex flex-col items-center gap-3">
            {/* cloud icon */}
            <svg
              className="w-16 h-16 text-[#083433]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 16H7a4 4 0 010-8c.62 0 1.2.16 1.7.44A6 6 0 1120 16h-4z"
                stroke="#083433"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 10v4"
                stroke="#083433"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 13h6"
                stroke="#083433"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <h2 className="text-2xl font-semibold text-[#083433]">
              Upload your resume
            </h2>
            <p className="text-sm text-[#083433]/90">
              Drag & drop your CV, or click Import file. Accepted: PDF, DOCX,
              PPTX.
            </p>

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`border-4 border-dashed rounded-3xl p-20 text-center transition-all ${
                dragOver ? "border-[#0ea6a9] bg-teal-50" : "border-teal-400"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.pptx,.ppt"
                className="hidden"
                onChange={onFileChange}
              />
              <button
                onClick={onChoose}
                className="px-12 py-5 bg-[#0ea6a9] hover:bg-[#0c8f90] text-white text-xl rounded-2xl font-semibold"
              >
                Choose File
              </button>
            </div>

            {file && (
              <div className="bg-white/40 backdrop-blur rounded-2xl p-6 flex justify-between items-center">
                <span className="text-xl font-medium text-[#083433]">
                  {file.name}
                </span>
                <button
                  onClick={removeFile}
                  className="text-red-600 font-bold text-lg"
                >
                  Remove
                </button>
              </div>
            )}

            {serverError && (
              <p className="text-red-500 font-bold text-xl">{serverError}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className="w-full py-7 text-3xl font-bold rounded-2xl text-black bg-[#20bec4] hover:bg-[#0ea6a9] disabled:bg-gray-500 disabled:cursor-not-allowed transition"
            >
              Analyze My CV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}