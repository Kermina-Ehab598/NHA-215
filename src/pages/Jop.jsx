import React, { useState } from "react";
import { Loader2 } from "lucide-react";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">{job.title}</h3>
            <p className="text-sm text-white/70">
              {job.company} • {job.location}
            </p>
          </div>
          <div className="px-3 py-1 rounded-md text-sm bg-white/10 border border-white/20">
            {job.matchScore}%
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-white/10 h-2 rounded-full">
            <div
              style={{ width: `${job.matchScore}%` }}
              className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
            />
          </div>
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-4 text-sm">
            <p className="font-medium text-white/90 mb-1">Skills Match</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs border border-green-500/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.missingSkills?.length > 0 && (
          <div className="mt-4 text-sm">
            <p className="font-medium text-red-300 mb-1">Missing Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.missingSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs border border-red-500/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.why && <p className="mt-4 text-sm text-white/70">{job.why}</p>}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <a
          href={job.apply_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          Apply
        </a>
      </div>
    </div>
  );
};

const Job = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const fetchJobs = async () => {
    if (!file) {
      alert("Please upload your cv first!");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://hagarrrr-job-matching.hf.space/match-jobs?top_k=5",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      const mappedJobs = data.top_jobs.map((job, index) => ({
        id: `job_${index}`,
        title: job.title,
        company: job.company,
        location: job.location,
        apply_url: job.apply_url,
        matchScore: Math.round(job.similarity * 100),
        skills: job.skills || [],
        missingSkills: job.missingSkills || [],
        why: job.why || "",
      }));
      setJobs(mappedJobs);
    } catch (error) {
      console.error("Error Get jobs:", error);
      alert("failed to get jobs , please upload a real cv");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-4 animate-ultraSmoothFadeIn">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Job Recommendations</h1>
        <p className="text-white/70 mb-4">
          Upload your resume to see the best matching jobs.
        </p>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            id="fileUpload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="fileUpload"
            className="cursor-pointer px-4 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition text-white"
          >
            {file ? "Change File" : "Upload Resume"}
          </label>
          {file && <span className="text-white/70 text-sm">{file.name}</span>}
          <button
            onClick={fetchJobs}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "wait for your match" : "Get Jobs"}
          </button>
        </div>

        {loading && (
        <div className="flex justify-center items-center py-20">
            <div className="max-w-md mx-auto p-6 bg-[#121212] rounded-lg shadow text-white flex items-center gap-2"> 
            <h2 className="text-2xl font-semibold">Loading data...</h2>
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            </div>
        </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Job;
