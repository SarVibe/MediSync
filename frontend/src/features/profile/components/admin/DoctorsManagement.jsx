import React, { useState, useEffect, useCallback } from "react";
import { Eye, UserX, UserCheck, Stethoscope, Briefcase, GraduationCap, Clock, Info } from "lucide-react";
import { listUsersByAdmin, blockUserByAdmin, unblockUserByAdmin } from "../../../auth/services/authService";
import { getDoctorProfilesBatch } from "../../services/profileService";
import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import AdminSearchFilter from "./AdminSearchFilter";
import { notifyApiSuccess, notifyError } from "../../../../utils/toast";

const DoctorsManagement = () => {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Fetch users with role=DOCTOR and approvalStatus=APPROVED
      const userRes = await listUsersByAdmin({ 
        role: "DOCTOR", 
        approvalStatus: "APPROVED",
        searchTerm: searchTerm || undefined 
      });
      const userList = userRes?.data || [];
      setUsers(userList);

      // 2. Fetch profiles in batch
      if (userList.length > 0) {
        const userIds = userList.map(u => u.id);
        const profileRes = await getDoctorProfilesBatch(userIds);
        const profileMap = (profileRes?.data || []).reduce((acc, p) => {
          acc[p.userId] = p;
          return acc;
        }, {});
        setProfiles(profileMap);
      }
    } catch (err) {
      notifyError("Failed to fetch doctors.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDoctors();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [fetchDoctors]);

  const handleBlockUnblock = async (user) => {
    try {
      const isBlocked = user.status === "BLOCKED";
      const res = isBlocked 
        ? await unblockUserByAdmin(user.id) 
        : await blockUserByAdmin(user.id);
      
      notifyApiSuccess(res);
      fetchDoctors(); // Refresh list
    } catch (err) {
      notifyError("Action failed.");
    }
  };

  const openDetails = (user) => {
    setSelectedDoctor({
      ...user,
      profile: profiles[user.id] || {}
    });
    setIsModalOpen(true);
  };

  const headers = ["Name", "Specialization", "Email", "Experience", "Status", "Actions"];

  const renderRow = (user) => {
    const profile = profiles[user.id] || {};
    return (
      <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-neutral-900">{user.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-neutral-600 font-medium">
          {profile.specialization || "N/A"}
        </td>
        <td className="px-6 py-4 text-sm text-neutral-600">{user.email}</td>
        <td className="px-6 py-4 text-sm text-neutral-500 font-mono">
          {profile.experienceYears ? `${profile.experienceYears}y` : "N/A"}
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
  };

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
        emptyMessage="No approved doctors found."
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Doctor Profile Details"
        subtitle={`User ID: ${selectedDoctor?.id}`}
        icon={Stethoscope}
        iconBg="bg-violet-100"
        iconColor="text-violet-600"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={Briefcase} label="Specialization" value={selectedDoctor.profile?.specialization} />
              <DetailItem icon={Clock} label="Experience" value={selectedDoctor.profile?.experienceYears ? `${selectedDoctor.profile.experienceYears} Years` : null} />
              <DetailItem icon={GraduationCap} label="Qualifications" value={selectedDoctor.profile?.qualifications} />
              <DetailItem icon={Info} label="Gender" value={selectedDoctor.profile?.gender} />
            </div>
            <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-4">
              <DetailItem icon={Eye} label="Full Name" value={selectedDoctor.name} />
              <DetailItem icon={Mail} label="Email" value={selectedDoctor.email} />
            </div>
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
    <p className="text-sm font-medium text-neutral-700 leading-tight">{value || "N/A"}</p>
  </div>
);

export default DoctorsManagement;
