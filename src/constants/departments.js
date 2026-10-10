export const DEPARTMENT_COLORS = {
    Cardiology: "#B83B5E",
    Radiology: "#4A5FC1",
    System: "#718096"
};

export const DEPARTMENT_USERS = {
    Cardiology: "HospitalStaffUser1",
    Radiology: "HospitalStaffUser2"
};

export function departmentColor(name) {
    return DEPARTMENT_COLORS[name] || "#5C6B73";
}