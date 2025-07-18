import React from 'react';
import './NewsCard.css';
import { useNavigate } from 'react-router-dom';

function NewsCard({ title, description, image, url, source, onReadMore, onVerifyClick }) {
  const navigate = useNavigate();
  const placeholderImage = '/images/placeholder-news.png';

  const handleVerify = (event) => {
    event.stopPropagation();
    if (url) {
      const encodedUrl = encodeURIComponent(url);
      navigate(`/verify/${encodedUrl}`, { state: { description } });
    } else {
      console.warn("Verify button clicked, but no URL is available.");
    }
  };

  const handleReadMore = (event) => {
    event.stopPropagation();
    if (url && onReadMore) {
      onReadMore(url);
    }
  };

  return (
    <div className="news-card">
      <div className="news-card-image-wrapper">
        <img
          src={image || placeholderImage}
          alt={title || 'News preview'}
          className="news-card-image"
          onError={(e) => { e.target.src = placeholderImage; }}
          loading="lazy"
        />
      </div>
      <div className="news-card-content">
        {source && <span className="news-card-source">{source}</span>}
        {title && <h3 className="news-card-title">{title}</h3>}
        {description && <p className="news-card-description">{description}</p>}

        <div className="news-card-actions">
          {url && (
            <button
              onClick={handleReadMore}
              className="action-link read-more-link"
              title="Show 100-word summary"
            >
              Read More
            </button>
          )}
          <button
            onClick={handleVerify}
            className="action-button verify-button"
            disabled={!url}
            title={!url ? "Cannot verify without article URL" : "Verify this news article"}
          >
            Verify News
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
