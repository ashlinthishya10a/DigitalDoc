import { StatusLog } from "../models/StatusLog.js";

export const createStatusLog = async ({ requestId, changedBy, role, status, remarks }) =>
  StatusLog.create({ requestId, changedBy, role, status, remarks });
