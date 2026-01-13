import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { InvestmentIcon, TopicIcon, UserIcon } from './Icons';
import { H2 } from './Heading';
import { ParagraphMD } from './Text';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12">
      <StatBlock
        value={formatNumber(stats.investmentOpportunities)}
        label="Investment Opportunities Posted"
        icon={<InvestmentIcon className="w-8" />}
      />
      <StatBlock
        value={formatNumber(stats.knowledgeAssets)}
        label="Knowledge Assets Uploaded"
        icon={<TopicIcon className="w-12" />}
      />
      <StatBlock
        value={formatNumber(stats.users)}
        label="Users Signed Up"
        icon={<UserIcon className="w-8" />}
      />
    </div>
  );
};

const StatBlock = ({ value, label, icon }) => (
  <div
    className="relative bg-gray-10 rounded-2xl p-8 overflow-hidden"
    style={{
      backgroundImage: "url('/images/decorative.svg')",
      backgroundPosition: 'right -2px top -2px',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '200px',
    }}
  >
    <div className="absolute top-6 left-6 text-primary-500 bg-primary-50 rounded-full flex items-center justify-center w-14 h-14">
      {icon}
    </div>

    <div className="mt-20">
      <H2 className="text-primary-500 mb-3" variant="bold">
        {value}
      </H2>
      <ParagraphMD>{label}</ParagraphMD>
    </div>
  </div>
);

export default StatsGrid;
