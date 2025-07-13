import localforage from "localforage";
import { formatNumber, formatDate } from "@/lib/utils";
import { offlineStorage } from "@/utils/offlineStorage";

export interface Member {
  id: string;
  name: string;
  membershipStatus: "active" | "expired" | "pending";
  lastAttendance: string;
  imageUrl?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  membershipType?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  subscriptionType?: "13 حصة" | "15 حصة" | "30 حصة";
  sessionsRemaining?: number;
  subscriptionPrice?: number;
  paymentStatus?: "paid" | "unpaid" | "partial";
  partialPaymentAmount?: number;
  note?: string;
  profileImage?: string;
}

// Initialize the database with better configuration
const membersDB = localforage.createInstance({
  name: "gym-tracker",
  storeName: "members",
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  version: 1.0,
  description: "Gym members database",
});

// Initialize the database
const initDB = async () => {
  // Database is now empty by default - no seed data
  // Users will add their own members
};

// Get all members with error handling and caching
let membersCache: Member[] | null = null;
let membersCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export const getAllMembers = async (
  forceRefresh = false,
): Promise<Member[]> => {
  try {
    // Return cached data if available and not expired
    if (
      !forceRefresh &&
      membersCache &&
      Date.now() - membersCacheTime < CACHE_DURATION
    ) {
      return membersCache;
    }

    await initDB();
    const members: Member[] = [];
    await membersDB.iterate((value: Member) => {
      if (value && typeof value === "object" && value.id) {
        members.push(value);
      }
    });

    const sortedMembers = members.sort((a, b) =>
      a.name.localeCompare(b.name, "ar"),
    );

    // Update cache
    membersCache = sortedMembers;
    membersCacheTime = Date.now();

    return sortedMembers;
  } catch (error) {
    console.error("Error getting all members:", error);
    return membersCache || [];
  }
};

// Clear members cache when data changes
export const clearMembersCache = () => {
  membersCache = null;
  membersCacheTime = 0;
};

// Get a member by ID
export const getMemberById = async (id: string): Promise<Member | null> => {
  return await membersDB.getItem(id);
};

// Add a new member with validation
export const addMember = async (
  member: Omit<Member, "id">,
): Promise<Member> => {
  try {
    if (!member.name || member.name.trim() === "") {
      throw new Error("اسم العضو مطلوب");
    }

    const id = Date.now().toString();
    const newMember = {
      ...member,
      id,
      name: member.name.trim(),
      membershipStatus: member.membershipStatus || "active",
      lastAttendance: member.lastAttendance || "",
      paymentStatus: member.paymentStatus || "unpaid",
    };

    // If offline, add to queue
    if (!offlineStorage.isOnline()) {
      await offlineStorage.addToOfflineQueue({
        type: "member_add",
        data: newMember,
      });
      // Still save locally for immediate UI update
      await membersDB.setItem(id, newMember);
      clearMembersCache(); // Clear cache when data changes
      return newMember;
    }

    await membersDB.setItem(id, newMember);
    clearMembersCache(); // Clear cache when data changes
    return newMember;
  } catch (error) {
    console.error("Error adding member:", error);
    throw error;
  }
};

// Add or update member with specific ID (for imports)
export const addOrUpdateMemberWithId = async (
  member: Member,
): Promise<Member> => {
  try {
    // Ensure the member data is valid before saving
    const validMember = {
      ...member,
      name: member.name?.trim() || "عضو جديد",
      membershipStatus: member.membershipStatus || "pending",
      lastAttendance:
        member.lastAttendance || new Date().toISOString().split("T")[0],
      paymentStatus: member.paymentStatus || "unpaid",
      sessionsRemaining: Number(member.sessionsRemaining) || 0,
      subscriptionPrice: Number(member.subscriptionPrice) || 0,
    };

    // Use a transaction-like approach for better reliability
    await membersDB.setItem(member.id, validMember);

    // Verify the data was written correctly
    const savedMember = await membersDB.getItem(member.id);
    if (!savedMember) {
      throw new Error(`فشل في حفظ العضو ${member.name}`);
    }

    // Force database sync and wait for completion
    await membersDB.ready();

    // Additional verification after sync
    const verifiedMember = await membersDB.getItem(member.id);
    if (!verifiedMember) {
      throw new Error(`فشل في التحقق من حفظ العضو ${member.name}`);
    }

    return validMember;
  } catch (error) {
    console.error("Error adding/updating member:", error);
    throw error;
  }
};

// Update a member with validation
export const updateMember = async (member: Member): Promise<Member> => {
  try {
    if (!member.id) {
      throw new Error("معرف العضو مطلوب");
    }

    if (!member.name || member.name.trim() === "") {
      throw new Error("اسم العضو مطلوب");
    }

    const updatedMember = {
      ...member,
      name: member.name.trim(),
    };

    // If offline, add to queue
    if (!offlineStorage.isOnline()) {
      await offlineStorage.addToOfflineQueue({
        type: "member_update",
        data: updatedMember,
      });
    }

    await membersDB.setItem(member.id, updatedMember);
    clearMembersCache(); // Clear cache when data changes
    return updatedMember;
  } catch (error) {
    console.error("Error updating member:", error);
    throw error;
  }
};

// Reset member sessions based on subscription type
export const resetMemberSessions = async (
  memberId: string,
): Promise<Member | null> => {
  const member = await getMemberById(memberId);
  if (!member) return null;

  // Reset sessions based on subscription type
  let newSessionsRemaining = 0;
  if (member.subscriptionType === "13 حصة") {
    newSessionsRemaining = 13;
  } else if (member.subscriptionType === "15 حصة") {
    newSessionsRemaining = 15;
  } else if (member.subscriptionType === "20 حصة") {
    newSessionsRemaining = 20;
  } else if (member.subscriptionType === "30 حصة") {
    newSessionsRemaining = 30;
  }

  const updatedMember = {
    ...member,
    sessionsRemaining: newSessionsRemaining,
    paymentStatus: "paid" as const,
    membershipStatus: "active" as const,
  };

  await membersDB.setItem(memberId, updatedMember);

  // Add activity for session reset
  await addActivity({
    memberId: member.id,
    memberName: member.name,
    memberImage: member.imageUrl,
    activityType: "membership-renewal",
    timestamp: new Date().toISOString(),
    details: `تم إعادة تعيين الحصص - ${formatNumber(newSessionsRemaining)}/${formatNumber(newSessionsRemaining)} حصة`,
  });

  return updatedMember;
};

// Delete a member
export const deleteMember = async (id: string): Promise<void> => {
  await membersDB.removeItem(id);
};

// Mark attendance for a member
export const markAttendance = async (id: string): Promise<Member | null> => {
  const member = await getMemberById(id);
  if (!member) return null;

  // Initialize sessions remaining if not set (for new members)
  if (member.subscriptionType && member.sessionsRemaining === undefined) {
    if (member.subscriptionType === "13 حصة") {
      member.sessionsRemaining = 13;
    } else if (member.subscriptionType === "15 حصة") {
      member.sessionsRemaining = 15;
    } else if (member.subscriptionType === "30 حصة") {
      member.sessionsRemaining = 30;
    } else {
      member.sessionsRemaining = 0;
    }
  }

  // Check if member has sessions remaining (only if they have a subscription type)
  if (member.subscriptionType && member.sessionsRemaining !== undefined) {
    if (member.sessionsRemaining <= 0) {
      throw new Error("لا توجد حصص متبقية لهذا العضو");
    }

    // Decrement sessions remaining
    member.sessionsRemaining -= 1;
  }

  const updatedMember = {
    ...member,
    lastAttendance: new Date().toISOString().split("T")[0],
  };

  // If offline, add to queue
  if (!offlineStorage.isOnline()) {
    await offlineStorage.addToOfflineQueue({
      type: "attendance_mark",
      data: { memberId: id },
    });
  }

  // Save the updated member with decremented sessions to the database
  await membersDB.setItem(id, updatedMember);

  // Add check-in activity (only one activity per attendance)
  await addActivity({
    memberId: member.id,
    memberName: member.name,
    memberImage: member.imageUrl,
    activityType: "check-in",
    timestamp: new Date().toISOString(),
    details:
      member.subscriptionType && updatedMember.sessionsRemaining !== undefined
        ? `تسجيل حضور - متبقي ${formatNumber(updatedMember.sessionsRemaining)} حصة`
        : `تسجيل حضور`,
  });

  return updatedMember;
};

// Search members by name
export const searchMembersByName = async (query: string): Promise<Member[]> => {
  const allMembers = await getAllMembers();
  return allMembers.filter((member) =>
    member.name.toLowerCase().includes(query.toLowerCase()),
  );
};

// Filter members by status
export const filterMembersByStatus = async (
  status: string | null,
): Promise<Member[]> => {
  const allMembers = await getAllMembers();
  if (!status) return allMembers;

  return allMembers.filter((member) => member.membershipStatus === status);
};

// Search and filter combined
export const searchAndFilterMembers = async (
  query: string,
  status: string | null,
): Promise<Member[]> => {
  const allMembers = await getAllMembers();
  return allMembers.filter((member) => {
    const matchesSearch = member.name
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter = status ? member.membershipStatus === status : true;
    return matchesSearch && matchesFilter;
  });
};

// Initialize activities database with better configuration
const activitiesDB = localforage.createInstance({
  name: "gym-tracker",
  storeName: "activities",
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  version: 1.0,
  description: "Gym activities database",
});

export interface MemberActivity {
  id?: string;
  memberId: string;
  memberName?: string;
  memberImage?: string;
  activityType:
    | "check-in"
    | "membership-renewal"
    | "payment"
    | "registration"
    | "membership-expiry"
    | "other";
  timestamp: string;
  details: string;
}

// Add an activity
export const addActivity = async (
  activity: MemberActivity,
): Promise<MemberActivity> => {
  const id = Date.now().toString();
  const newActivity = { ...activity, id };
  await activitiesDB.setItem(id, newActivity);
  clearActivitiesCache(); // Clear cache when data changes
  return newActivity;
};

// Add or update activity with specific ID (for imports)
export const addOrUpdateActivityWithId = async (
  activity: MemberActivity,
): Promise<MemberActivity> => {
  try {
    const activityWithId = {
      ...activity,
      id: activity.id || Date.now().toString(),
      timestamp: activity.timestamp || new Date().toISOString(),
      details: activity.details || "",
      activityType: activity.activityType || "other",
      memberName: activity.memberName || "",
    };

    // Use transaction-like approach for activities
    await activitiesDB.setItem(activityWithId.id, activityWithId);

    // Verify the data was written
    const savedActivity = await activitiesDB.getItem(activityWithId.id);
    if (!savedActivity) {
      throw new Error(`فشل في حفظ النشاط ${activityWithId.id}`);
    }

    // Force database sync
    await activitiesDB.ready();

    return activityWithId;
  } catch (error) {
    console.error("Error adding/updating activity:", error);
    throw error;
  }
};

// Get recent activities with error handling and caching
let activitiesCache: MemberActivity[] | null = null;
let activitiesCacheTime = 0;
const ACTIVITIES_CACHE_DURATION = 15000; // 15 seconds

export const getRecentActivities = async (
  limit: number = 10,
  forceRefresh = false,
): Promise<MemberActivity[]> => {
  try {
    // Return cached data if available and not expired
    if (
      !forceRefresh &&
      activitiesCache &&
      Date.now() - activitiesCacheTime < ACTIVITIES_CACHE_DURATION
    ) {
      return activitiesCache.slice(0, limit);
    }

    const activities: MemberActivity[] = [];
    await activitiesDB.iterate((value: MemberActivity) => {
      if (value && typeof value === "object" && value.timestamp) {
        activities.push(value);
      }
    });

    // Sort by timestamp (newest first)
    const sortedActivities = activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Update cache with all activities
    activitiesCache = sortedActivities;
    activitiesCacheTime = Date.now();

    return sortedActivities.slice(0, limit);
  } catch (error) {
    console.error("Error getting recent activities:", error);
    return activitiesCache?.slice(0, limit) || [];
  }
};

// Clear activities cache when data changes
export const clearActivitiesCache = () => {
  activitiesCache = null;
  activitiesCacheTime = 0;
};
