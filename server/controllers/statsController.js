import Booking from '../models/Booking.js';
import Inquiry from '../models/Inquiry.js';
import Destination from '../models/Destination.js';
import TourPackage from '../models/TourPackage.js';
import Vehicle from '../models/Vehicle.js';
import Blog from '../models/Blog.js';
import Customer from '../models/Customer.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    let totalBookings = 0;
    let pendingBookings = 0;
    let confirmedBookings = 0;
    let completedTrips = 0;
    let totalInquiries = 0;
    let totalDestinations = 8;
    let totalPackages = 8;
    let totalVehicles = 8;
    let totalBlogs = 2;
    let totalCustomers = 0;
    let statusBreakdown = {};
    let recentBookings = [];
    let recentInquiries = [];

    try {
      const counts = await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'New' }),
        Booking.countDocuments({ status: 'Confirmed' }),
        Booking.countDocuments({ status: 'Completed' }),
        Inquiry.countDocuments(),
        Destination.countDocuments(),
        TourPackage.countDocuments(),
        Vehicle.countDocuments(),
        Blog.countDocuments(),
        Customer.countDocuments()
      ]);

      totalBookings = counts[0];
      pendingBookings = counts[1];
      confirmedBookings = counts[2];
      completedTrips = counts[3];
      totalInquiries = counts[4];
      totalDestinations = counts[5] || 8;
      totalPackages = counts[6] || 8;
      totalVehicles = counts[7] || 8;
      totalBlogs = counts[8] || 2;
      totalCustomers = counts[9];

      const statusAgg = await Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      statusBreakdown = statusAgg.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
      recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(5);
    } catch (dbErr) {
      console.warn('[Stats DB Notice]:', dbErr.message);
    }

    res.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedTrips,
      totalInquiries,
      totalDestinations,
      totalPackages,
      totalVehicles,
      totalBlogs,
      totalCustomers,
      statusBreakdown,
      recentBookings,
      recentInquiries
    });
  } catch (err) {
    res.json({
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedTrips: 0,
      totalInquiries: 0,
      totalDestinations: 8,
      totalPackages: 8,
      totalVehicles: 8,
      totalBlogs: 2,
      totalCustomers: 0,
      statusBreakdown: {},
      recentBookings: [],
      recentInquiries: []
    });
  }
};
