import Booking from '../models/Booking.js';
import Inquiry from '../models/Inquiry.js';
import Destination from '../models/Destination.js';
import TourPackage from '../models/TourPackage.js';
import Vehicle from '../models/Vehicle.js';
import Blog from '../models/Blog.js';
import Customer from '../models/Customer.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedTrips,
      totalInquiries,
      totalDestinations,
      totalPackages,
      totalVehicles,
      totalBlogs,
      totalCustomers
    ] = await Promise.all([
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

    // Bookings by Status
    const statusAgg = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusBreakdown = statusAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Recent 5 bookings
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);

    // Recent 5 inquiries
    const recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(5);

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
    next(err);
  }
};
