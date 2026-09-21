import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Overridable via env so a real deployment never has to ship with the well-known
// admin@example.com/admin123 default. Only takes effect on first seed — an existing
// user is never touched by reseeding (see the `update: {}` below), so changing these
// after the account already exists does not change its email/password; use the app's
// own "reset password" flow for that instead.
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "System Administrator";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

const USER_NAME = process.env.SEED_USER_NAME ?? "Field Engineer";
const USER_EMAIL = process.env.SEED_USER_EMAIL ?? "user@example.com";
const USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? "user123";

async function main() {
  console.log("Seeding database...");

  const adminAlreadyExisted = !!(await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } }));
  const userAlreadyExisted = !!(await prisma.user.findUnique({ where: { email: USER_EMAIL } }));

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const userPasswordHash = await bcrypt.hash(USER_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: "9800000001",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      language: "EN",
      isActive: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {},
    create: {
      fullName: USER_NAME,
      email: USER_EMAIL,
      phone: "9800000002",
      passwordHash: userPasswordHash,
      role: "USER",
      language: "EN",
      isActive: true,
    },
  });

  const contractorsData = [
    {
      name: "Rajesh Shrestha",
      companyName: "Himalayan Builders Pvt. Ltd.",
      phone: "9841000001",
      alternatePhone: "01-4000001",
      email: "contact@himalayanbuilders.com.np",
      address: "New Baneshwor, Kathmandu",
      contactPerson: "Rajesh Shrestha",
      notes: "Specializes in road and bridge construction.",
    },
    {
      name: "Sunita Gurung",
      companyName: "Gandaki Infra Works",
      phone: "9846000002",
      alternatePhone: null,
      email: "info@gandakiinfra.com.np",
      address: "Lakeside, Pokhara",
      contactPerson: "Sunita Gurung",
      notes: "Strong track record on irrigation projects.",
    },
    {
      name: "Bikash Thapa",
      companyName: "Terai Construction Co.",
      phone: "9855000003",
      alternatePhone: "051-520003",
      email: "terai.construction@example.com",
      address: "Buddha Chowk, Biratnagar",
      contactPerson: "Bikash Thapa",
      notes: null,
    },
    {
      name: "Anita Rai",
      companyName: "Sagarmatha Engineering Works",
      phone: "9862000004",
      alternatePhone: null,
      email: null,
      address: "Damak, Jhapa",
      contactPerson: "Anita Rai",
      notes: "Prefers advance payment for material procurement.",
    },
  ];

  const contractors = [];
  for (const data of contractorsData) {
    const existing = await prisma.contractor.findFirst({ where: { name: data.name } });
    contractors.push(existing ?? (await prisma.contractor.create({ data })));
  }

  const today = new Date();
  const daysFromNow = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d;
  };

  const projectsData = [
    {
      name: "Biratnagar Ring Road Upgrade",
      province: "Koshi",
      district: "Morang",
      municipality: "Biratnagar Metropolitan City",
      ward: "5",
      locationDescription: "Ring road section between Traffic Chowk and Rani Chapri",
      contractor: contractors[0],
      contactPersonName: "Hari Prasad Koirala",
      contactPersonPhone: "9801234567",
      governingBody: "METROPOLITAN_CITY" as const,
      status: "PROGRESS" as const,
      budget: 45000000,
      startDate: daysFromNow(-120),
      deadline: daysFromNow(45),
      description: "Widening and blacktopping of the 6.2km ring road including drainage upgrades.",
    },
    {
      name: "Itahari Sub-Metro Water Supply Extension",
      province: "Koshi",
      district: "Sunsari",
      municipality: "Itahari Sub-Metropolitan City",
      ward: "12",
      locationDescription: "Extension to wards 10-14",
      contractor: contractors[2],
      contactPersonName: "Krishna Bahadur Karki",
      contactPersonPhone: "9812345678",
      governingBody: "SUB_METROPOLITAN_CITY" as const,
      status: "STARTED" as const,
      budget: 18500000,
      startDate: daysFromNow(-30),
      deadline: daysFromNow(150),
      description: "Laying of new HDPE pipelines and construction of an overhead reservoir.",
    },
    {
      name: "Kathmandu Metropolitan Footpath Reconstruction",
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kathmandu Metropolitan City",
      ward: "10",
      locationDescription: "New Road to Basantapur stretch",
      contractor: contractors[0],
      contactPersonName: "Sarita Maharjan",
      contactPersonPhone: "9841122334",
      governingBody: "METROPOLITAN_CITY" as const,
      status: "COMPLETED" as const,
      budget: 9800000,
      startDate: daysFromNow(-200),
      deadline: daysFromNow(-20),
      description: "Reconstruction of footpaths with heritage-style paving stones and street lighting.",
    },
    {
      name: "Pokhara Lakeside Drainage Improvement",
      province: "Gandaki",
      district: "Kaski",
      municipality: "Pokhara Metropolitan City",
      ward: "6",
      locationDescription: "Lakeside road, near Barahi Temple jetty",
      contractor: contractors[1],
      contactPersonName: "Dipendra Bastola",
      contactPersonPhone: "9846123456",
      governingBody: "METROPOLITAN_CITY" as const,
      status: "HALTED" as const,
      budget: 12300000,
      startDate: daysFromNow(-90),
      deadline: daysFromNow(-5),
      description: "Storm-water drainage upgrade halted pending environmental clearance.",
    },
    {
      name: "Butwal Sub-Metro Bus Park Construction",
      province: "Lumbini",
      district: "Rupandehi",
      municipality: "Butwal Sub-Metropolitan City",
      ward: "8",
      locationDescription: "Near Traffic Chowk, Milanchowk road",
      contractor: contractors[2],
      contactPersonName: "Manisha Oli",
      contactPersonPhone: "9857012345",
      governingBody: "SUB_METROPOLITAN_CITY" as const,
      status: "BID" as const,
      budget: 62000000,
      startDate: null,
      deadline: daysFromNow(300),
      description: "Construction of a modern bus park with covered platforms and ticket counters.",
    },
    {
      name: "Birendranagar Municipal Office Building",
      province: "Karnali",
      district: "Surkhet",
      municipality: "Birendranagar Municipality",
      ward: "3",
      locationDescription: "Municipal office premises",
      contractor: contractors[3],
      contactPersonName: "Prakash Bogati",
      contactPersonPhone: "9868012345",
      governingBody: "MUNICIPALITY" as const,
      status: "PLANNED" as const,
      budget: 28000000,
      startDate: daysFromNow(30),
      deadline: daysFromNow(400),
      description: "Three-story earthquake-resilient municipal office building with public service counters.",
    },
    {
      name: "Dhangadhi Irrigation Canal Rehabilitation",
      province: "Sudurpashchim",
      district: "Kailali",
      municipality: "Dhangadhi Sub-Metropolitan City",
      ward: "15",
      locationDescription: "Main canal from Mohana river intake",
      contractor: contractors[1],
      contactPersonName: "Yogendra Chand",
      contactPersonPhone: "9848012345",
      governingBody: "INFRASTRUCTURE_DEVELOPMENT" as const,
      status: "PROGRESS" as const,
      budget: 33500000,
      startDate: daysFromNow(-60),
      deadline: daysFromNow(10),
      description: "Rehabilitation of 8km irrigation canal to restore full command area coverage.",
    },
    {
      name: "Janakpurdham Heritage Corridor Beautification",
      province: "Madhesh",
      district: "Dhanusha",
      municipality: "Janakpurdham Sub-Metropolitan City",
      ward: "2",
      locationDescription: "Ram Janaki Temple approach road",
      contractor: contractors[0],
      contactPersonName: "Bimala Yadav",
      contactPersonPhone: "9821012345",
      governingBody: "URBAN_DEVELOPMENT" as const,
      status: "HANDOVER" as const,
      budget: 15700000,
      startDate: daysFromNow(-250),
      deadline: daysFromNow(-60),
      description: "Beautification of the temple approach corridor including paving and heritage lighting.",
    },
    {
      name: "Ghorahi Sub-Metro Solid Waste Management Site",
      province: "Lumbini",
      district: "Dang",
      municipality: "Ghorahi Sub-Metropolitan City",
      ward: "19",
      locationDescription: "Proposed landfill site, Sishaniya",
      contractor: null,
      contactPersonName: "Ramesh Chaudhary",
      contactPersonPhone: "9866012345",
      governingBody: "SUB_METROPOLITAN_CITY" as const,
      status: "CANCELED" as const,
      budget: 21000000,
      startDate: null,
      deadline: daysFromNow(-90),
      description: "Cancelled due to local community opposition over site location.",
    },
  ];

  const projects = [];
  for (const p of projectsData) {
    const existing = await prisma.project.findFirst({ where: { name: p.name } });
    if (existing) {
      projects.push(existing);
      continue;
    }
    const created = await prisma.project.create({
      data: {
        name: p.name,
        province: p.province,
        district: p.district,
        municipality: p.municipality,
        ward: p.ward,
        locationDescription: p.locationDescription,
        contractorId: p.contractor?.id ?? null,
        contractorName: p.contractor?.name ?? null,
        contractorPhone: p.contractor?.phone ?? null,
        contactPersonName: p.contactPersonName,
        contactPersonPhone: p.contactPersonPhone,
        governingBody: p.governingBody,
        status: p.status,
        budget: p.budget,
        startDate: p.startDate,
        deadline: p.deadline,
        description: p.description,
        createdById: admin.id,
        statusHistory: {
          create: {
            previousStatus: null,
            newStatus: p.status,
            changedById: admin.id,
            comment: "Initial status on project creation.",
          },
        },
      },
    });
    projects.push(created);
  }

  const followupData: Array<{
    projectIndex: number;
    note: string;
    daysAgo: number;
    externalLink?: string;
    createdBy: typeof admin;
  }> = [
    {
      projectIndex: 0,
      note: "Site visit conducted. Blacktopping completed for 3.2km out of 6.2km.",
      daysAgo: 10,
      createdBy: user,
    },
    {
      projectIndex: 0,
      note: "Contractor requested a 2-week extension due to monsoon delays.",
      daysAgo: 3,
      externalLink: "https://example.com/reports/ring-road-extension-request",
      createdBy: admin,
    },
    {
      projectIndex: 1,
      note: "Pipeline material delivered to site, laying to begin next week.",
      daysAgo: 15,
      createdBy: user,
    },
    {
      projectIndex: 3,
      note: "Work halted pending environmental clearance from the Department of Forests.",
      daysAgo: 20,
      externalLink: "https://example.com/notices/lakeside-drainage-halt",
      createdBy: admin,
    },
    {
      projectIndex: 6,
      note: "Canal rehabilitation on track, 70% of the 8km stretch completed.",
      daysAgo: 5,
      createdBy: user,
    },
  ];

  for (const f of followupData) {
    const project = projects[f.projectIndex];
    if (!project) continue;
    const d = new Date();
    d.setDate(d.getDate() - f.daysAgo);
    await prisma.projectFollowupNote.create({
      data: {
        projectId: project.id,
        note: f.note,
        followupDate: d,
        externalLink: f.externalLink,
        createdById: f.createdBy.id,
      },
    });
  }

  const complaintsData: Array<{
    trackingCode: string;
    name: string;
    phone: string;
    description: string;
    province: string;
    district: string;
    municipality: string;
    ward: string;
    addressDetail?: string;
    status: "PENDING" | "ACCEPTED" | "IN_ACTION" | "FORWARDED" | "RESOLVED";
    daysAgo: number;
    note?: string;
  }> = [
    {
      trackingCode: "B7K3M",
      name: "Sita Poudel",
      phone: "9841122233",
      description: "Ring road construction near our house has blocked the drainage, causing waterlogging every monsoon.",
      province: "Koshi",
      district: "Morang",
      municipality: "Biratnagar Metropolitan City",
      ward: "5",
      addressDetail: "Near Traffic Chowk",
      status: "IN_ACTION",
      daysAgo: 12,
      note: "Site inspection scheduled with the ward engineer.",
    },
    {
      trackingCode: "X9P2Q",
      name: "Ramesh Karki",
      phone: "9812233445",
      description: "The contractor working on the water supply extension left an open trench unmarked on our street, which is a safety hazard at night.",
      province: "Koshi",
      district: "Sunsari",
      municipality: "Itahari Sub-Metropolitan City",
      ward: "12",
      status: "PENDING",
      daysAgo: 2,
    },
    {
      trackingCode: "L4T8N",
      name: "Gita Tamang",
      phone: "9846001122",
      description: "The footpath reconstruction near New Road used substandard paving stones that are already cracking.",
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "Kathmandu Metropolitan City",
      ward: "10",
      status: "RESOLVED",
      daysAgo: 40,
      note: "Contractor replaced the cracked paving stones. Issue resolved and verified on site.",
    },
  ];

  for (const c of complaintsData) {
    const existing = await prisma.complaint.findUnique({ where: { trackingCode: c.trackingCode } });
    if (existing) continue;

    const createdAt = daysFromNow(-c.daysAgo);
    const complaint = await prisma.complaint.create({
      data: {
        trackingCode: c.trackingCode,
        name: c.name,
        phone: c.phone,
        description: c.description,
        province: c.province,
        district: c.district,
        municipality: c.municipality,
        ward: c.ward,
        addressDetail: c.addressDetail,
        status: c.status,
        createdAt,
      },
    });

    if (c.status !== "PENDING") {
      await prisma.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          previousStatus: "PENDING",
          newStatus: c.status,
          changedById: admin.id,
          comment: "Status updated after review.",
        },
      });
    }

    if (c.note) {
      await prisma.complaintNote.create({
        data: { complaintId: complaint.id, note: c.note, createdById: admin.id },
      });
    }
  }

  console.log("Seed complete.");
  console.log(
    adminAlreadyExisted
      ? `Admin account already existed: ${ADMIN_EMAIL} (password unchanged by reseeding)`
      : `Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`
  );
  console.log(
    userAlreadyExisted
      ? `User account already existed: ${USER_EMAIL} (password unchanged by reseeding)`
      : `User login:  ${USER_EMAIL} / ${USER_PASSWORD}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
