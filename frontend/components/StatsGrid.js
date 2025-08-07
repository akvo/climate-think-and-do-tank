import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { InvestmentIcon, TopicIcon, UserIcon } from './Icons';

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
        value={`${
          stats.users > 0 ? Math.round((stats.users / 100) * 600) : 600
        }%`}
        label="Users Signed Up"
        icon={<UserIcon className="w-8" />}
      />
    </div>
  );
};

const StatBlock = ({ value, label, icon }) => (
  <div
    className="relative bg-gray-10 rounded-2xl p-8"
    style={{
      backgroundImage: "url('/images/graphic.svg')",
      backgroundPosition: 'right -10% top -170%',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '30%',
    }}
  >
    <div className="absolute top-6 left-6 text-primary-500 bg-primary-50 rounded-full flex items-center justify-center w-14 h-14">
      {icon}
    </div>

    <div className="mt-20">
      <p className="text-5xl font-bold text-primary-500 mb-3">{value}</p>
      <p className="text-gray-800 font-medium text-xl">{label}</p>
    </div>
  </div>
);

export default StatsGrid;
