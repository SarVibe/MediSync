import React, { useState, useEffect, useCallback } from "react";
import { Eye, CheckCircle2, XCircle, Stethoscope, Briefcase, GraduationCap, Clock, AlertTriangle } from "lucide-react";
import { listUsersByAdmin, approveDoctorByAdmin, rejectDoctorByAdmin } from "../../../auth/services/authService";
import { getDoctorProfilesBatch } from "../../services/profileService";
import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import AdminSearchFilter from "./AdminSearchFilter";
import { notifyApiSuccess, notifyError } from "../../../../utils/toast";

const PendingDoctorRequests = () => {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch users with approvalStatus=PENDING
      const userRes = await listUsersByAdmin({ 
        approvalStatus: "PENDING",
        searchTerm: searchTerm || undefined 
      });
      const userList = userRes?.data || [];
      setUsers(userList);

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
      notifyError("Failed to fetch pending requests.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (userId) => {
    try {
      setIsSubmitting(true);
      const res = await approveDoctorByAdmin(userId);
      notifyApiSuccess(res);
      setIsModalOpen(false);
      fetchRequests();
    } catch (err) {
      notifyError("Approval failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      notifyError("Rejection reason is required.");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await rejectDoctorByAdmin(selectedRequest.id, rejectReason);
      notifyApiSuccess(res);
      setIsRejectModalOpen(false);
      setIsModalOpen(false);
      setRejectReason("");
      fetchRequests();
    } catch (err) {
      notifyError("Rejection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const headers = ["Name", "Specialization", "Email", "Application Date", "Actions"];

  const renderRow = (user) => {
    const profile = profiles[user.id] || {};
    return (
      <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
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
          {new Date(user.registration_date).toLocaleDateString()}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setSelectedRequest({...user, profile}); setIsModalOpen(true); }}
              className="cursor-pointer p-1.5 rounded-lg text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
              title="View Application"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => handleApprove(user.id)}
              className="cursor-pointer p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
              title="Approve"
            >
              <CheckCircle2 size={16} />
            </button>
            <button 
              onClick={() => { setSelectedRequest({...user, profile}); setIsRejectModalOpen(true); }}
              className="cursor-pointer p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              title="Reject"
            >
              <XCircle size={16} />
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
        emptyMessage="No pending doctor requests."
      />

      {/* Details Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Doctor Application Details"
        subtitle={`User ID: ${selectedRequest?.id}`}
        icon={Stethoscope}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        footer={
          <>
            <button 
              onClick={() => setIsRejectModalOpen(true)}
              className="btn btn-secondary cursor-pointer text-red-600 border-red-100 hover:bg-red-50"
              disabled={isSubmitting}
            >
              Reject Application
            </button>
            <button 
              onClick={() => handleApprove(selectedRequest.id)}
              className="btn btn-primary cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Approve Doctor"}
            </button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={Briefcase} label="Specialization" value={selectedRequest.profile?.specialization} />
              <DetailItem icon={Clock} label="Experience" value={selectedRequest.profile?.experienceYears ? `${selectedRequest.profile.experienceYears} Years` : null} />
              <DetailItem icon={GraduationCap} label="Qualifications" value={selectedRequest.profile?.qualifications} />
              <DetailItem icon={Eye} label="User Role" value={selectedRequest.role} />
            </div>
            <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-4">
              <DetailItem icon={Eye} label="Full Name" value={selectedRequest.name} />
              <DetailItem icon={Eye} label="Email" value={selectedRequest.email} />
            </div>
          </div>
        )}
      </AdminModal>

      {/* Rejection Reason Modal */}
      <AdminModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Application"
        icon={AlertTriangle}
        iconBg="bg-red-100"
        iconColor="text-red-600"
        footer={
          <button 
            onClick={handleReject}
            className="btn btn-danger w-full cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm Rejection"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Please provide a clear reason for rejecting the doctor's application. An automated notification will be sent to the user.
          </p>
          <textarea 
            className="input min-h-[120px] py-3 text-sm"
            placeholder="Type rejection reason here..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
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

export default PendingDoctorRequests;
