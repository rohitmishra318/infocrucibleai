import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Hero from '../components/common/Hero';
import NewsCard from '../components/common/NewsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

import '../components/common/Hero.css';
import '../components/common/NewsCard.css';
import './HomePage.css';

const VALID_CATEGORIES = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

function HomePage() {
  const { categoryName, searchQuery } = useParams();
  const navigate = useNavigate();

  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCategory, setDisplayCategory] = useState('Latest');
  const [refinedQuery, setRefinedQuery] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryTitle, setSummaryTitle] = useState(null);
  const [summaryImage, setSummaryImage] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const rewriteSearchQuery = async () => {
      try {
        const response = await fetch('http://localhost:5050/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        const data = await response.json();

        if (data.rewritten) {
          setRefinedQuery(data.rewritten);
        } else {
          setError('Query rewriting failed.');
          setRefinedQuery(searchQuery);
        }
      } catch (err) {
        setError('ML API error: ' + err.message);
        setRefinedQuery(searchQuery);
      }
    };

    if (searchQuery) {
      rewriteSearchQuery();
    } else {
      setRefinedQuery(null);
    }
  }, [searchQuery]);

  useEffect(() => {
    let fetchCategory = null;
    setError(null);

    if (refinedQuery) {
      setDisplayCategory(`Results for "${decodeURIComponent(refinedQuery)}"`);
    } else if (categoryName) {
      const lowerCaseCategory = categoryName.toLowerCase();
      if (VALID_CATEGORIES.includes(lowerCaseCategory)) {
        fetchCategory = lowerCaseCategory;
        setDisplayCategory(lowerCaseCategory.charAt(0).toUpperCase() + lowerCaseCategory.slice(1));
      } else {
        setError(`Invalid category: ${categoryName}`);
        setLoading(false);
        setNewsArticles([]);
        setDisplayCategory('Invalid Category');
        return;
      }
    } else {
      setDisplayCategory('Top Headlines');
    }

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setNewsArticles([]);

      const apiKey = process.env.REACT_APP_NEWS_API_KEY;
      if (!apiKey) {
        setError("News API key is missing.");
        setLoading(false);
        return;
      }

      let apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKey}&country=in&language=en`;
      if (refinedQuery) {
        apiUrl += `&q=${encodeURIComponent(refinedQuery)}`;
      } else if (fetchCategory) {
        apiUrl += `&category=${fetchCategory}`;
      }

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if ((data.status === "success" || data.status === "ok") && data.results) {
          const validArticles = data.results.filter(
            article => article.title && article.link && article.image_url
          );
          setNewsArticles(validArticles);

          if (validArticles.length === 0) {
            setError(refinedQuery
              ? `No articles found for "${decodeURIComponent(refinedQuery)}".`
              : `No articles found for category: ${displayCategory}.`);
          }
        } else {
          setError("News API returned no results.");
        }
      } catch (err) {
        setError(err.message.includes('Failed to fetch') ? "Network error: Could not fetch news." : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [categoryName, refinedQuery]);

  const handleVerifyClick = (articleUrl) => {
    if (!articleUrl) return;
    alert(`Verification requested for: ${articleUrl}`);
  };

  const handleReadMore = async (url, title, image) => {
    try {
      setSummaryLoading(true);
      setSummary(null);
      setSummaryTitle(title);
      setSummaryImage(image);
      const response = await fetch('http://localhost:5050/scrape-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary("Could not summarize the article.");
      }
    } catch (err) {
      setSummary("Error while summarizing: " + err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div>
      <div className="page-content">
        <h2 style={{ textAlign: 'center', margin: '1.5rem 0', color: '#333' }}>
          {displayCategory}
        </h2>

        {summaryLoading && <LoadingSpinner />}

        {summary && (
          <div className="summary-modal-overlay" onClick={() => setSummary(null)}>
            <div className="summary-modal" onClick={(e) => e.stopPropagation()}>
              <button className="summary-modal-close" onClick={() => setSummary(null)}>×</button>
              {summaryImage && <img src={summaryImage} alt="Summary visual" />}
              {summaryTitle && <h4>{summaryTitle}</h4>}
              
              <p>{summary}</p>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner />}
        {error && !loading && <div className="error-message">⚠️ {error}</div>}

        {!loading && !error && (
          <div className="news-grid-container">
            {newsArticles.length > 0 ? (
              newsArticles.map((article) => (
                <NewsCard
                  key={article.link}
                  title={article.title}
                  description={article.description}
                  image={article.image_url}
                  url={article.link}
                  source={article.source_id}
                  onReadMore={() => handleReadMore(article.link, article.title, article.image_url)}
                  onVerifyClick={handleVerifyClick}
                />
              ))
            ) : (
              <p>No news articles available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
