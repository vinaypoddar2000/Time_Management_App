import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function TableView() {
  const [timesheets, setTimesheets] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both timesheets and entries data
    Promise.all([
      fetch("http://localhost:5000/timesheets").then(res => res.json()),
      fetch("http://localhost:5000/entries").then(res => res.json())
    ])
    .then(([timesheetsData, entriesData]) => {
      // Update timesheets with calculated totalHours from entries
      const updatedTimesheets = updateTimesheetTotals(timesheetsData, entriesData);
      setTimesheets(updatedTimesheets);
      setEntries(entriesData);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      setLoading(false);
    });
  }, []);

  // Function to update timesheets with calculated totalHours from entries
  const updateTimesheetTotals = (timesheets, entries) => {
    return timesheets.map(timesheet => {
      // Match entry.weekId with timesheet.weekId (if that's the correct relationship)
      const totalHours = entries
        .filter(entry => String(entry.weekId) === String(timesheet.weekId))
        .reduce((sum, entry) => sum + entry.hours, 0);
      
      return {
        ...timesheet,
        totalHours: totalHours
      };
    });
  };

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 px-2 py-1 rounded";
      case "Incomplete":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded";
      case "Missing":
        return "bg-red-100 text-red-700 px-2 py-1 rounded";
      default:
        return "";
    }
  };

  // Function to determine status based on total hours
  const getStatusFromHours = (totalHours) => {
    if (totalHours < 1) return "Missing";
    if (totalHours < 40) return "Incomplete";
    return "Completed";
  };

  // Helper function to determine action based on status
  const getActionFromStatus = (status) => {
    switch (status) {
      case "Missing": return "Create";
      case "Incomplete": return "Update";
      case "Completed": return "View";
      default: return "View";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading timesheets...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Timesheets</h1>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Week #</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Total Hours</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.map((t, index) => {
            // Use the updated totalHours from the timesheet object
            const status = getStatusFromHours(t.totalHours || 0);
            const action = getActionFromStatus(status);
            
            return (
              <tr key={t.id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{t.week}</td>
                <td className="border p-2 text-center font-medium">
                  {t.totalHours || 0} hrs
                </td>
                <td className="border p-2">
                  <span className={statusColor(status)}>{status}</span>
                </td>
                <td className="border p-2">
                  <Link
                    to={`/timesheets/${t.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {action}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {timesheets.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No timesheets found
        </div>
      )}
    </div>
  );
}