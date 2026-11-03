const User = require('../models/User');
const AcademicYear = require('../models/AcademicYear');

class DashboardService {
  /**
   * Get summary statistics for Admin dashboard
   */
  async getSummary(schoolId) {
    const sId = schoolId.toUpperCase();

    const [totalUsers, activeUsers, inactiveUsers, totalAcademicYears] = await Promise.all([
      User.countDocuments({ schoolId: sId }),
      User.countDocuments({ schoolId: sId, isActive: true }),
      User.countDocuments({ schoolId: sId, isActive: false }),
      AcademicYear.countDocuments({ schoolId: sId })
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalAcademicYears
    };
  }
}

module.exports = new DashboardService();
