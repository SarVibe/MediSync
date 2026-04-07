import React, { useState, useEffect, useCallback } from "react";
import { Eye, UserX, UserCheck, Mail, Phone, Calendar, MapPin, Droplets, Info } from "lucide-react";
import { listUsersByAdmin, blockUserByAdmin, unblockUserByAdmin } from "../../../auth/services/authService";
import { getPatientProfilesBatch } from "../../services/profileService";
import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import AdminSearchFilter from "./AdminSearchFilter";
import { notifyApiSuccess, notifyError } from "../../../../utils/toast";

const PatientsManagement = () => {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Fetch users from auth-service with role=PATIENT
      const userRes = await listUsersByAdmin({ 
        role: "PATIENT", 
        searchTerm: searchTerm || undefined 
      });
      const userList = userRes?.data || [];
      setUsers(userList);

      // 2. Fetch profiles from profile-service in batch
      if (userList.length > 0) {
        const userIds = userList.map(u => u.id);
        const profileRes = await getPatientProfilesBatch(userIds);
        const profileMap = (profileRes?.data || []).reduce((acc, p) => {
          acc[p.userId] = p;
          return acc;
        }, {});
        setProfiles(profileMap);
      }
    } catch (err) {
      notifyError("Failed to fetch patients.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [fetchPatients]);

  const handleBlockUnblock = async (user) => {
    try {
      const isBlocked = user.status === "BLOCKED";
      const res = isBlocked 
        ? await unblockUserByAdmin(user.id) 
        : await blockUserByAdmin(user.id);
      
      notifyApiSuccess(res);
      fetchPatients(); // Refresh list
    } catch (err) {
      notifyError("Action failed.");
    }
  };

  const openDetails = (user) => {
    setSelectedUser({
      ...user,
      profile: profiles[user.id] || {}
    });
    setIsModalOpen(true);
  };

  const headers = ["Name", "Email", "Phone", "Registration Date", "Status", "Actions"];

  const renderRow = (user) => (
    <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-neutral-900">{user.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-neutral-600">{user.email}</td>
      <td className="px-6 py-4 text-sm text-neutral-600">{user.phone}</td>
      <td className="px-6 py-4 text-sm text-neutral-500 font-mono">
        {new Date(user.registration_date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          user.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openDetails(user)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => handleBlockUnblock(user)}
            className={`p-1.5 rounded-lg transition-colors ${
              user.status === "BLOCKED" 
                ? "text-emerald-500 hover:bg-emerald-50" 
                : "text-red-400 hover:text-red-600 hover:bg-red-50"
            }`}
            title={user.status === "BLOCKED" ? "Unblock User" : "Block User"}
          >
            {user.status === "BLOCKED" ? <UserCheck size={16} /> : <UserX size={16} />}
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminSearchFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchClear={() => setSearchTerm("")}
      />

      <AdminTable 
        headers={headers}
        data={users}
        renderRow={renderRow}
        isLoading={isLoading}
        emptyMessage="No patients found."
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Patient Details"
        subtitle={`User ID: ${selectedUser?.id}`}
        icon={Info}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={Mail} label="Email" value={selectedUser.email} />
              <DetailItem icon={Phone} label="Phone" value={selectedUser.phone} />
              <DetailItem icon={Calendar} label="Registered" value={new Date(selectedUser.registration_date).toLocaleString()} />
              <DetailItem icon={MapPin} label="Address" value={selectedUser.profile?.address || "Not provided"} />
              <DetailItem icon={Droplets} label="Blood Group" value={selectedUser.profile?.bloodGroup || "Not provided"} />
              <DetailItem icon={User} label="Gender" value={selectedUser.profile?.gender || "Not provided"} />
            </div>
            {selectedUser.profile?.basicHealthInfo && (
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Basic Health Info</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{selectedUser.profile.basicHealthInfo}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
      <Icon size={10} />
      {label}
    </div>
    <p className="text-sm font-medium text-neutral-700 truncate">{value || "N/A"}</p>
  </div>
);

export default PatientsManagement;
