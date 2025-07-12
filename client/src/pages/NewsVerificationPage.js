import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './NewsVerificationPage.css';

function NewsVerificationPage() {
  const { encodedArticleUrl } = useParams();
  const location = useLocation();

  const [articleUrl, setArticleUrl] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFake, setIsFake] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const desc = location.state?.description;

    if (encodedArticleUrl) {
      try {
        const decodedUrl = decodeURIComponent(encodedArticleUrl);
        setArticleUrl(decodedUrl);

        if (!desc) {
          throw new Error("No description provided for verification.");
        }

        setDescriptionText(desc);
        setIsLoading(true);
        setErrorMessage('');
        setIsFake(null);
        setConfidence(null);

        const verifyNews = async () => {
          try {
            const response = await axios.post('http://localhost:3001/api/news/check', {
              text: desc
            });

            if (response.data.success) {
              setIsFake(response.data.isFake);
              setConfidence(response.data.confidence);
            } else {
              throw new Error(response.data.error || "Verification failed.");
            }
          } catch (error) {
            console.error("Verification error:", error);
            setErrorMessage(error.message || "Server error during verification.");
          } finally {
            setIsLoading(false);
          }
        };

        verifyNews();

      } catch (error) {
        console.error("Error setting up verification:", error);
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } else {
      setErrorMessage("Missing article URL.");
      setIsLoading(false);
    }
  }, [encodedArticleUrl, location.state]);

  const renderResultMessage = () => {
    if (isLoading) return null;
    if (errorMessage) {
      return <p className="verification-status status-error">⚠️ Error: {errorMessage}</p>;
    }

    if (isFake === true) {
      return (
        <p className="verification-status status-fake">
          ❌ This article is likely <strong>FAKE</strong>. <br />
          Confidence: {confidence}%
        </p>
      );
    }

    if (isFake === false) {
      return (
        <p className="verification-status status-real">
          ✅ This article is likely <strong>REAL</strong>. <br />
          Confidence: {confidence}%
        </p>
      );
    }

    return (
      <p className="verification-status status-pending">
        Verification status unknown.
      </p>
    );
  };

  return (
    <div className="verification-page-container">
      <h1>News Verification</h1>

      {articleUrl && (
        <div className="article-info">
          <p>Verifying article from:</p>
          <a href={articleUrl} target="_blank" rel="noopener noreferrer" className="article-link">
            {articleUrl}
          </a>
        </div>
      )}

      <div className="verification-result-area">
        {isLoading ? (
          <div className="loading-area">
            <LoadingSpinner />
            <p>Verifying, please wait...</p>
          </div>
        ) : (
          renderResultMessage()
        )}
      </div>

      <Link to="/" className="back-link">← Back to Home</Link>
    </div>
  );
}

export default NewsVerificationPage;
