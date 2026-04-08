import React from 'react';

const StatCard = ({ title, value, caption }) => (
  <article className="stat-card">
    <h3>{title}</h3>
    <p className="stat-value">{value}</p>
    <p className="stat-caption">{caption}</p>
  </article>
);

export default StatCard;
