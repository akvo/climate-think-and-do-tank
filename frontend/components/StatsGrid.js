import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const formatNumber = (num) => (num > 0 ? `${num}+` : '0');

const StatsGrid = ({}) => {
  const [stats, setStats] = useState({
    investmentOpportunities: 0,
    knowledgeAssets: 0,
    users: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [investmentRes, knowledgeRes, usersRes] = await Promise.all([
          axios.get(
            `${env(
              'NEXT_PUBLIC_BACKEND_URL'
            )}/api/investment-opportunity-profiles/count`
          ),
          axios.get(
            `${env('NEXT_PUBLIC_BACKEND_URL')}/api/knowledge-hubs/count`
          ),
          axios.get(`${env('NEXT_PUBLIC_BACKEND_URL')}/api/users/count`),
        ]);
        setStats({
          investmentOpportunities: investmentRes.data || 0,
          knowledgeAssets: knowledgeRes.data || 0,
          users: usersRes.data || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-gray-100">
      <StatBlock
        value={formatNumber(stats.investmentOpportunities)}
        label={['Investment', 'Opportunities', 'Posted']}
      />
      <StatBlock
        value={formatNumber(stats.knowledgeAssets)}
        label={['Uploaded', 'Knowledge', 'Assets']}
      />
      <StatBlock
        value={formatNumber(stats.users)}
        label={['Users', 'Signed', 'Up']}
      />
    </div>
  );
};

const StatBlock = ({ value, label }) => (
  <div className="text-center">
    <p className="text-5xl font-bold text-black mb-3">{value}</p>
    <p className="text-lg text-black font-medium">
      {label.map((line, idx) => (
        <React.Fragment key={idx}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </p>
  </div>
);

export default StatsGrid;
