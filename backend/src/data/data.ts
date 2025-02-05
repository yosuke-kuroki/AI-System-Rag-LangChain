// @ts-nocheck
import faker from "faker";

// Generate fake team members
export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  personal_quote: string;
  related_insights: Array<{
    title: string;
    date: string;
    link: string;
  }>;
}

export const teamMembers: TeamMember[] = Array.from({ length: 5 }).map(() => ({
  name: faker.name.findName(),
  role: faker.name.jobTitle(),
  bio: faker.lorem.sentences(2),
  personal_quote: faker.lorem.sentence(),
  related_insights: Array.from({ length: 2 }).map(() => ({
    title: faker.lorem.sentence(),
    date: faker.date.past().toLocaleDateString(),
    link: faker.internet.url(),
  })),
}));

// Generate fake investments data
export interface Investment {
  company_name: string;
  location: string;
  website: string;
  sectors: string[];
  insights: Array<{
    date: string;
    title: string;
    url: string;
  }>;
}

export const investments: Investment[] = Array.from({ length: 5 }).map(() => ({
  company_name: faker.company.companyName(),
  location: `${faker.address.city()}, ${faker.address.stateAbbr()}`,
  website: faker.internet.url(),
  sectors: [faker.commerce.department(), faker.commerce.department()],
  insights: Array.from({ length: 2 }).map(() => ({
    date: faker.date.recent().toLocaleDateString(),
    title: faker.lorem.sentence(),
    url: faker.internet.url(),
  })),
}));

// Generate fake sectors data
export interface Sector {
  sector: string;
  description: string;
  companies: string[];
  investment_team: string[];
}

export const sectors: Sector[] = Array.from({ length: 3 }).map(() => ({
  sector: faker.commerce.department(),
  description: faker.lorem.sentence(),
  companies: [
    faker.company.companyName(),
    faker.company.companyName(),
    faker.company.companyName(),
  ],
  investment_team: [faker.name.findName(), faker.name.findName()],
}));

// Generate fake consultations data
export interface Consultation {
  date: string;
  company_name: string;
  consultation_details: string;
  hours: number;
}

export const consultations: Consultation[] = Array.from({ length: 3 }).map(
  () => ({
    date: faker.date.recent().toLocaleDateString(),
    company_name: faker.company.companyName(),
    consultation_details: faker.lorem.sentences(2),
    hours: faker.datatype.number({ min: 1, max: 5 }),
  }),
);
