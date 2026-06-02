import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export default function Dashboard() {
  const [patients, setPatients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    try {
      const res = await fetch(
        `${window.API_BASE_URL}/api/Medical/FindTreatment`
      );
      const data = await res.json();
      setPatients(data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- ANALYTICS ----------------
  const analytics = useMemo(() => {
    if (!patients) return null;

    const zones = Object.keys(patients);

    let totalPatients = 0;
    let totalDoctors = 0;

    const zoneAnalysis = [];
    const medicineMap = {};

    zones.forEach((zone) => {
      const records = patients[zone] || [];

      let doctorCount = 0;

      records.forEach((r) => {
        if (r.doctors) doctorCount += r.doctors.length;

        if (r.Medicines) {
          r.Medicines.forEach((m) => {
            medicineMap[m.name] =
              (medicineMap[m.name] || 0) + m.noOfTablets;
          });
        }
      });

      totalPatients += records.length;
      totalDoctors += doctorCount;

      zoneAnalysis.push({
        zone,
        patients: records.length,
        doctors: doctorCount,
      });
    });

    const shortageMedicines = Object.entries(medicineMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 8);

    return {
      zones,
      zoneAnalysis,
      totalPatients,
      totalDoctors,
      shortageMedicines,
    };
  }, [patients]);

  // ---------------- FILTERED DATA ----------------
  const filteredZoneAnalysis = useMemo(() => {
    if (!analytics) return [];
    if (selectedZone === "All") return analytics.zoneAnalysis;
    return analytics.zoneAnalysis.filter((z) => z.zone === selectedZone);
  }, [analytics, selectedZone]);

  const filteredStats = useMemo(() => {
    if (!analytics) return { patients: 0, doctors: 0 };
    if (selectedZone === "All")
      return { patients: analytics.totalPatients, doctors: analytics.totalDoctors };
    const zone = analytics.zoneAnalysis.find((z) => z.zone === selectedZone);
    return {
      patients: zone?.patients || 0,
      doctors: zone?.doctors || 0,
    };
  }, [analytics, selectedZone]);

  // ---------------- DOCTORS ----------------
  const doctorsList = useMemo(() => {
    if (!patients) return [];

    const list = [];

    Object.keys(patients).forEach((zone) => {
      patients[zone].forEach((r) => {
        r.doctors?.forEach((d) => {
          list.push({
            ...d,
            zone,
          });
        });
      });
    });

    return list;
  }, [patients]);

  const displayedDoctors = useMemo(() => {
    if (selectedZone === "All") return doctorsList;
    return doctorsList.filter((d) => d.zone === selectedZone);
  }, [doctorsList, selectedZone]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Medical Intelligence Dashboard</h2>
          <p className="text-gray-600">Fetching real-time healthcare data...</p>
        </motion.div>
      </div>
    );

  if (!analytics)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md"
        >
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Dashboard Data Available</h2>
          <p className="text-gray-600 mb-4">Unable to load healthcare analytics at this time.</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-50 p-6">

      {/* ---------------- HEADER ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-white p-6 rounded-2xl shadow-lg"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
              🏥 Medical Intelligence Dashboard
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Real-time Healthcare Resource Monitoring & Analytics Platform
            </p>
            <p className="text-sm text-gray-500">
              Monitor patient care, doctor workload, and medicine inventory across all healthcare zones
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
            <button
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Zone Filter */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <label className="font-semibold text-gray-700">Select Healthcare Zone:</label>
              <p className="text-sm text-gray-500">Filter data by geographic region</p>
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-4 py-2 rounded-xl border shadow-sm bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="All">🌍 All Zones ({analytics.zones.length} regions)</option>
              {analytics.zones.map((z) => (
                <option key={z} value={z}>🏥 {z}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* ---------------- STATS ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <StatCard
          title="Total Patients"
          value={filteredStats.patients}
          subtitle={`${selectedZone === "All" ? "across all zones" : `in ${selectedZone}`}`}
          icon="👥"
          color="from-blue-500 to-blue-700"
          trend="Real-time data"
        />
        <StatCard
          title="Active Doctors"
          value={filteredStats.doctors}
          subtitle="medical professionals on duty"
          icon="👨‍⚕️"
          color="from-green-500 to-green-700"
          trend={`${filteredStats.patients > 0 ? Math.round(filteredStats.doctors / filteredStats.patients * 100) : 0}% doctor ratio`}
        />
        <StatCard
          title="Healthcare Zones"
          value={analytics.zones.length}
          subtitle="geographic regions covered"
          icon="🏥"
          color="from-purple-500 to-purple-700"
          trend="All operational"
        />
      </motion.div>

      {/* ---------------- ALERTS (IMPROVED) ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8"
      >

        {/* DOCTOR ALERT (BAR GRAPH) */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                👨‍⚕️ Doctor Workload Alert
              </h2>
              <p className="text-sm text-gray-600">Monitor doctor distribution and capacity</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{filteredStats.doctors}</div>
              <div className="text-xs text-gray-500">Active Doctors</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredZoneAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [`${value} doctors`, 'Active Staff']}
                labelFormatter={(label) => `Zone: ${label}`}
              />
              <Bar dataKey="doctors" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
              💡 <strong>Recommendation:</strong> Consider redistributing doctors to zones with higher patient loads.
            </p>
          </div>
        </div>

        {/* MEDICINE ALERT (BAR GRAPH) */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2">
                💊 Medicine Inventory Alert
              </h2>
              <p className="text-sm text-gray-600">Track critical medicine stock levels</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{analytics.shortageMedicines.length}</div>
              <div className="text-xs text-gray-500">Low Stock Items</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.shortageMedicines}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [`${value} tablets`, 'Remaining Stock']}
                labelFormatter={(label) => `Medicine: ${label}`}
              />
              <Bar dataKey="qty" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ <strong>Action Required:</strong> Restock medicines below threshold. Critical items need immediate attention.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ---------------- CHARTS ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8"
      >

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📊 Zone Performance Overview
            </h2>
            <p className="text-sm text-gray-600">Compare patient and doctor distribution across zones</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.zoneAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name === 'patients' ? 'Patients' : 'Doctors']}
                labelFormatter={(label) => `Zone: ${label}`}
              />
              <Legend />
              <Bar dataKey="patients" fill="#3b82f6" name="Patients" radius={[4, 4, 0, 0]} />
              <Bar dataKey="doctors" fill="#22c55e" name="Doctors" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🥧 Patient Distribution Map
            </h2>
            <p className="text-sm text-gray-600">Geographic breakdown of patient population</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.zoneAnalysis}
                dataKey="patients"
                nameKey="zone"
                outerRadius={110}
                label={({ zone, percent }) => `${zone} ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.zoneAnalysis.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} patients`, `Zone: ${name}`]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 flex flex-wrap gap-2">
            {analytics.zoneAnalysis.map((zone, i) => (
              <div key={zone.zone} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></div>
                <span>{zone.zone}</span>
              </div>
            ))}
          </div>
        </div>

      </motion.div>

      {/* ---------------- DOCTORS ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white p-6 rounded-2xl shadow-lg"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            👨‍⚕️ Healthcare Professionals Directory
          </h2>
          <p className="text-gray-600">Click on any doctor to view their performance analytics and patient load</p>
          <div className="mt-2 text-sm text-gray-500">
            Showing {displayedDoctors.length} doctors {selectedZone !== "All" ? `in ${selectedZone}` : "across all zones"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedDoctors.map((d, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDoctor(d)}
              className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow cursor-pointer border-l-4 border-blue-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">👨‍⚕️</div>
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {d.zone}
                </div>
              </div>

              <h3 className="font-bold text-gray-800 mb-1">
                Dr. {d.firstname} {d.lastname}
              </h3>

              <p className="text-sm text-gray-600 mb-2">{d.email}</p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-green-600 font-medium">● Active</span>
                <span className="text-gray-500">Click for details</span>
              </div>
            </motion.div>
          ))}
        </div>

        {displayedDoctors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👨‍⚕️</div>
            <p>No doctors found in the selected zone.</p>
          </div>
        )}
      </motion.div>

      {/* ---------------- MODAL ---------------- */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDoctor(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">👨‍⚕️</div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Dr. {selectedDoctor.firstname} {selectedDoctor.lastname}
                      </h2>
                      <p className="text-gray-600">{selectedDoctor.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Doctor Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl mb-2">🏥</div>
                    <div className="font-semibold text-blue-800">Zone</div>
                    <div className="text-blue-600">{selectedDoctor.zone}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-semibold text-green-800">Status</div>
                    <div className="text-green-600">Active</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl mb-2">�</div>
                    <div className="font-semibold text-purple-800">Total Patients</div>
                    <div className="text-purple-600">
                      {selectedDoctor.totalPatients ?
                        selectedDoctor.totalPatients.reduce((sum, day) => sum + day.count, 0) : 0}
                    </div>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Patient Treatment History</h3>
                  {selectedDoctor.totalPatients && selectedDoctor.totalPatients.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={selectedDoctor.totalPatients.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value} patients`, 'Patients Treated']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <div className="text-3xl mb-2">📊</div>
                      <p>No treatment history available</p>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Treatment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Patients:</span>
                        <span className="font-medium">
                          {selectedDoctor.totalPatients ?
                            selectedDoctor.totalPatients.reduce((sum, day) => sum + day.count, 0) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Days:</span>
                        <span className="font-medium">
                          {selectedDoctor.totalPatients ? selectedDoctor.totalPatients.length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Daily:</span>
                        <span className="font-medium">
                          {selectedDoctor.totalPatients && selectedDoctor.totalPatients.length > 0 ?
                            (selectedDoctor.totalPatients.reduce((sum, day) => sum + day.count, 0) / selectedDoctor.totalPatients.length).toFixed(1) : 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Recent Activity</h4>
                    <div className="space-y-2 text-sm">
                      {selectedDoctor.totalPatients && selectedDoctor.totalPatients.length > 0 ? (
                        selectedDoctor.totalPatients.slice(-3).reverse().map((day, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{new Date(day.date).toLocaleDateString()}:</span>
                            <span className="font-medium">{day.count} patients</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No recent activity</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedDoctor(null)}
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Full Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- FOOTER SUMMARY ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🏥</div>
            <h3 className="font-bold mb-1">Healthcare Network</h3>
            <p className="text-sm opacity-90">
              {analytics.zones.length} zones operational with {filteredStats.doctors} healthcare professionals serving {filteredStats.patients} patients
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-bold mb-1">Real-time Monitoring</h3>
            <p className="text-sm opacity-90">
              Continuous tracking of medical resources, patient care metrics, and inventory levels across all facilities
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold mb-1">Smart Analytics</h3>
            <p className="text-sm opacity-90">
              AI-powered insights for optimal resource allocation and proactive healthcare management
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <p className="text-sm opacity-75">
            HospCare Medical Intelligence Platform • Last Updated: {lastUpdated.toLocaleString()} • Auto-refresh: Every 5 minutes
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------- UI COMPONENTS ----------------
function StatCard({ title, value, subtitle, icon, color, trend }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-lg relative overflow-hidden`}
    >
      <div className="absolute top-4 right-4 text-2xl opacity-20">
        {icon}
      </div>
      <div className="relative z-10">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-3xl font-bold mb-2">{value?.toLocaleString() || 0}</p>
        <p className="text-sm opacity-90 mb-2">{subtitle}</p>
        <div className="text-xs bg-white/20 px-2 py-1 rounded-full inline-block">
          {trend}
        </div>
      </div>
    </motion.div>
  );
}