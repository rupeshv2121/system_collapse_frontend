import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Navbar } from '@/components/NavLink';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <Navbar />
      <AnalyticsDashboard/>
    </div>
  );
};

export default Analytics;
