export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-primary">1,248</p>
        </div>
        <div className="bg-[#111827] p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-primary">342</p>
        </div>
        <div className="bg-[#111827] p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-2">Revenue</h2>
          <p className="text-3xl font-bold text-primary">€ 14,592</p>
        </div>
      </div>
    </div>
  );
}