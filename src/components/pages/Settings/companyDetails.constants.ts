import type { ActiveSession, CompanyProfileFormData } from '@/schemas/companyDetails.schema';

export const LOGO_ACCEPT = 'image/jpeg,image/png,image/jpg';

export const INITIAL_PROFILE_INFO: CompanyProfileFormData = {
  companyName: 'SM Logistics',
  registeredNumber: '+44 1234-678909',
  registeredAddress: '123 Logistics Park, London, UK',
  primaryContact: 'John Doe',
  accountsEmail: 'accounts@yoursite.co.uk',
  vatNumber: 'GB123456789',
};

export const ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: '1',
    device: 'Chrome on Windows',
    ip: '192.163.100.12',
    lastUsed: 'Today 10:15 AM',
    location: 'Bristol, UK',
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    ip: '192.163.100.12',
    lastUsed: 'Yesterday 08:44 PM',
    location: 'London, UK',
  },
];
