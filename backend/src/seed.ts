// @ts-nocheck
import faker from "faker";
import TeamMember from "./models/TeamMember";
import Investment from "./models/Investment";
import Sector from "./models/Sector";
import Consultation from "./models/Consultation";

export const seedData = async () => {
  // Seed a large number of TeamMembers if none exist
  const teamCount = await TeamMember.countDocuments({});
  if (teamCount === 0) {
    const teamMembers = Array.from({ length: 100 }).map(() => ({
      name: faker.name.findName(),
      role: faker.name.jobTitle(),
      bio: faker.lorem.sentences(2),
      personal_quote: faker.lorem.sentence(),
      related_insights: Array.from({ length: 5 }).map(() => ({
        title: faker.lorem.sentence(),
        date: faker.date.past().toLocaleDateString(),
        link: faker.internet.url(),
      })),
    }));
    await TeamMember.insertMany(teamMembers);
    console.log("Seeded 100 TeamMembers");
  }

  // Seed a large number of Investments if none exist
  const investmentCount = await Investment.countDocuments({});
  if (investmentCount === 0) {
    const investments = Array.from({ length: 200 }).map(() => ({
      company_name: faker.company.companyName(),
      location: `${faker.address.city()}, ${faker.address.stateAbbr()}`,
      website: faker.internet.url(),
      sectors: [
        faker.commerce.department(),
        faker.commerce.department(),
        faker.commerce.department(),
      ],
      insights: Array.from({ length: 5 }).map(() => ({
        date: faker.date.recent().toLocaleDateString(),
        title: faker.lorem.sentence(),
        url: faker.internet.url(),
      })),
    }));
    await Investment.insertMany(investments);
    console.log("Seeded 200 Investments");
  }

  // Seed a large number of Sectors if none exist
  const sectorCount = await Sector.countDocuments({});
  if (sectorCount === 0) {
    const sectors = Array.from({ length: 50 }).map(() => ({
      sector: faker.commerce.department(),
      description: faker.lorem.sentence(),
      companies: [
        faker.company.companyName(),
        faker.company.companyName(),
        faker.company.companyName(),
        faker.company.companyName(),
      ],
      investment_team: [
        faker.name.findName(),
        faker.name.findName(),
        faker.name.findName(),
      ],
    }));
    await Sector.insertMany(sectors);
    console.log("Seeded 50 Sectors");
  }

  // Seed a large number of Consultations if none exist
  const consultationCount = await Consultation.countDocuments({});
  if (consultationCount === 0) {
    const consultations = Array.from({ length: 300 }).map(() => ({
      date: faker.date.recent().toLocaleDateString(),
      company_name: faker.company.companyName(),
      consultation_details: faker.lorem.sentences(3),
      hours: faker.datatype.number({ min: 1, max: 10 }),
    }));
    await Consultation.insertMany(consultations);
    console.log("Seeded 300 Consultations");
  }
};
