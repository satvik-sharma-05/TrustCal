/**
 * Feature names in exact order expected by Python model.
 */
const FEATURE_NAMES = [
  'hour_normalized',
  'deviation_from_typical_hour',
  'is_weekend',
  'region_frequency_score',
  'is_new_region',
  'region_rarity_score',
  'device_seen_count_normalized',
  'is_new_device',
  'failed_attempts_normalized',
  'failed_attempt_rate',
  'time_since_last_login_normalized',
  'login_frequency_normalized',
  'role_importance',
];

const REGIONS = [
  'US-East', 'US-West', 'US-Central', 'US-Pacific',
  'EU-Central', 'EU-West', 'EU-North', 'EU-South',
  'AP-South', 'AP-North', 'AP-Southeast', 'AP-East',
  'SA-East', 'SA-West', 'AF-South', 'AF-North',
  'Other',
];

const USER_TYPE_ENCODING = {
  employee: 0.2, admin: 0.4, super_admin: 0.5, guest: 0.6, contractor: 0.8,
  viewer: 0.15, developer: 0.35, manager: 0.45, vendor: 0.7, service_account: 0.9,
};
const ROLE_IMPORTANCE = {
  user: 0.2, employee: 0.2, viewer: 0.15, developer: 0.35, manager: 0.45,
  admin: 0.4, super_admin: 0.5, guest: 0.6, contractor: 0.8, vendor: 0.7,
  service_account: 0.9,
};

const DEVICE_TYPE_ENCODING = {
  mobile: 0.2, desktop: 0.4, tablet: 0.5, server: 0.7, unknown: 0.5,
  laptop: 0.35, workstation: 0.6, vm: 0.65, kiosk: 0.55, iot: 0.8,
};

const USER_TYPES = Object.keys(USER_TYPE_ENCODING);
const DEVICE_TYPES = Object.keys(DEVICE_TYPE_ENCODING);

module.exports = {
  FEATURE_NAMES,
  REGIONS,
  ROLE_IMPORTANCE,
  USER_TYPE_ENCODING,
  DEVICE_TYPE_ENCODING,
  USER_TYPES,
  DEVICE_TYPES,
};
