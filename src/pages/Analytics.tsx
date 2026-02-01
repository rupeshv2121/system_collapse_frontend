import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Navbar } from '@/components/NavLink';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navbar />
      <AnalyticsDashboard/>
    </div>
  );
};

export default Analytics;
