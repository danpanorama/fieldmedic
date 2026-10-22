export interface Medic {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiresOn: Date;
}

export const hasValidLicense = (medic: Medic, now: Date) => medic.licenseExpiresOn > now;
