import { createPilotRequest as storeCreatePilotRequest, listPilots as storeListPilots } from "./ecoroute-store";

export async function listDemoRequests() {
  return storeListPilots();
}

export async function getDemoRequests() {
  return storeListPilots();
}

export async function listPilots() {
  return storeListPilots();
}

export async function getPilots() {
  return storeListPilots();
}

export async function createDemoRequest(input) {
  return storeCreatePilotRequest(input);
}

export async function addDemoRequest(input) {
  return storeCreatePilotRequest(input);
}

export async function createPilotRequest(input) {
  return storeCreatePilotRequest(input);
}

export default {
  listDemoRequests,
  getDemoRequests,
  listPilots,
  getPilots,
  createDemoRequest,
  addDemoRequest,
  createPilotRequest,
};
