export type Role = "admin" | "faculty" | "hod";

export interface AuthUser {
  _id: string;
  role: Role;
  name: string;
  email?: string;
  employeeId?: string;
  department?: string;
  signatureImage?: string;
  drawnSignatureData?: string;
}
