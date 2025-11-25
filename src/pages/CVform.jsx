import React, { useReducer, useRef, useState, useCallback } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Loadingpage from "./Loadingpage";

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
        error: `Analysis failed: ${err.message}`,
      });
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  if (analysis) {
    const {
      overall = 0,
      subscores = {},
      warnings = [],
      missing_or_weak_sections = [],
      top_recommendations = [],
    } = analysis;
    const scoreColor =
      overall >= 80 ? "#10b981" : overall >= 60 ? "#f59e0b" : "#ef4444";

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#010d0d] to-[#023437] flex items-center justify-center p-6">
        <div className="max-w-6xl w-full space-y-10">
          <div className="bg-[#071014] rounded-3xl p-12 border border-[#123d3d] text-center">
            <h3 className="text-5xl font-bold text-[#20bec4] mb-8">
              ATS Overall Score
            </h3>
            <div className="w-80 h-80 mx-auto">
              <CircularProgressbar
                value={overall}
                text={`${overall}%`}
                styles={buildStyles({
                  pathColor: scoreColor,
                  textColor: "#fff",
                  trailColor: "#1f2937",
                  textSize: "18px",
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(subscores).map(([k, v]) => (
              <div
                key={k}
                className="bg-[#0a1a1a] p-6 rounded-2xl text-center border border-[#123d3d]"
              >
                <p className="text-gray-400 capitalize">
                  {k.replace(/_/g, " ")}
                </p>
                <p className="text-4xl font-bold text-white mt-2">{v}%</p>
              </div>
            ))}
          </div>

          {warnings.length > 0 && (
            <div className="bg-[#071014] rounded-2xl p-8 border border-[#123d3d]">
              <h3 className="text-2xl font-bold text-[#20bec4] mb-5">
                Warnings
              </h3>
              {warnings.map((w, i) => (
                <p
                  key={i}
                  className="text-yellow-300 flex items-center gap-3 mt-2"
                >
                  Warning {w}
                </p>
              ))}
            </div>
          )}

          {missing_or_weak_sections.length > 0 && (
            <div className="bg-[#071014] rounded-2xl p-8 border border-[#123d3d]">
              <h3 className="text-2xl font-bold text-[#20bec4] mb-5">
                Missing/Weak Sections
              </h3>
              {missing_or_weak_sections.map((s, i) => (
                <p
                  key={i}
                  className="text-red-400 flex items-center gap-3 mt-2"
                >
                  Cross {s}
                </p>
              ))}
            </div>
          )}

          {top_recommendations.length > 0 && (
            <div className="bg-[#071014] rounded-2xl p-8 border border-[#123d3d]">
              <h3 className="text-2xl font-bold text-[#20bec4] mb-5">
                Top Recommendations
              </h3>
              {top_recommendations.map((r, i) => (
                <p
                  key={i}
                  className="text-green-400 flex items-center gap-3 mt-2"
                >
                  Check {r}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={() => dispatch({ type: "SET_ANALYSIS", data: null })}
            className="w-full py-6 bg-[#0ea6a9] hover:bg-[#0c8f90] text-white text-2xl font-bold rounded-2xl"
          >
            Analyze Another CV
          </button>
        </div>
      </div>
    );
  }

  if (loading || analyzing) {
    return (
      <Loadingpage />
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-gradient-to-br from-[#010d0d] to-[#023437]">
      <div className="w-full max-w-4xl">
        <div className="rounded-3xl bg-gradient-to-b from-[#bfeee9] to-[#c7f3ea] p-12 shadow-2xl border border-[#0c3c3a]">
          <div className="text-center space-y-10">
            <div>
              <h2 className="text-5xl font-bold text-[#083433]">
                Upload Your Resume
              </h2>
              <p className="text-xl text-[#083433]/90 mt-4">
                Drag & drop your file here
              </p>
            </div>

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