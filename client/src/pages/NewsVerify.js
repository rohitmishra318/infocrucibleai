import React, { useState } from "react";
import axios from "axios";

const NewsVerify = () => {
  const [text, setText] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post("http://localhost:3001/api/news/check", {
        text,
      });

      const data = response.data;

      setResult({
        confidence: data.confidence,
        verdict: data.isFake ? "Fake" : "Real",
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("API endpoint not found (404). Please check your backend route.");
      } else {
        setError(err.response?.data?.error || err.message || "Something went wrong.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const Meter = ({ percent }) => (
    <div style={{ margin: "24px 0" }}>
      <div
        style={{
          width: "100%",
          height: 28,
          background: "#eee",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 8px #eee",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: percent > 60 ? "#e53935" : "#43a047",
            transition: "width 0.8s cubic-bezier(.4,2,.6,1)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: percent > 10 ? "flex-end" : "center",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            paddingRight: 12,
          }}
        >
          {percent}%
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          fontWeight: 500,
          color: percent > 60 ? "#e53935" : "#43a047",
        }}
      >
        {percent > 60 ? "Likely Fake News" : "Likely Real News"}
      </div>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: 32,
        border: "1px solid #e0e0e0",
        borderRadius: 16,
        background: "#fafcff",
        boxShadow: "0 4px 24px #0001",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#1976d2", marginBottom: 24 }}>
        Verify News Authenticity
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontWeight: 500, color: "#333" }}>
            Enter News Text:
            <textarea
              value={text}
              onChange={handleTextChange}
              rows={5}
              style={{
                width: "100%",
                marginTop: 8,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #bdbdbd",
                fontSize: 16,
                background: "#fff",
              }}
              placeholder="Paste or type news text here..."
              disabled={verifying}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            padding: "12px 32px",
            fontSize: 17,
            borderRadius: 8,
            border: "none",
            background: verifying ? "#bdbdbd" : "#1976d2",
            color: "#fff",
            fontWeight: 600,
            cursor: verifying ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px #1976d244",
            transition: "background 0.2s",
          }}
          disabled={verifying}
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#e53935", marginTop: 18, textAlign: "center" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 36, textAlign: "center" }}>
          <h3 style={{ color: "#222", marginBottom: 10 }}>Verification Result</h3>
          <Meter percent={result.confidence} />
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: result.verdict === "Fake" ? "#e53935" : "#43a047",
              marginTop: 8,
            }}
          >
            {result.verdict === "Fake"
              ? "⚠️ This news is likely FAKE."
              : "✅ This news is likely REAL."}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsVerify;
