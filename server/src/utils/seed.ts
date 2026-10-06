import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { ClientProfile } from '../models/ClientProfile';
import { Project } from '../models/Project';
import { ProjectMilestone } from '../models/ProjectMilestone';
import { ProjectFile } from '../models/ProjectFile';
import { Message } from '../models/Message';
import { Service } from '../models/Service';
import { Skill } from '../models/Skill';
import { ContactMessage } from '../models/ContactMessage';
import { Settings } from '../models/Settings';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_platform';

export const seedDatabase = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured before seeding.');
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    console.log('[Seed] Cleaning old database collections...');
    await Promise.all([
      User.deleteMany({}),
      ClientProfile.deleteMany({}),
      Project.deleteMany({}),
      ProjectMilestone.deleteMany({}),
      ProjectFile.deleteMany({}),
      Message.deleteMany({}),
      Service.deleteMany({}),
      Skill.deleteMany({}),
      ContactMessage.deleteMany({}),
      Settings.deleteMany({})
    ]);

    // 1. Seed Admin User
    console.log('[Seed] Creating Administrator account...');
    const admin = await User.create({
      name: 'Maron Jake Dinopol',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isActive: true
    });

    // 2. Seed Client User
    console.log('[Seed] Creating Sample Client account...');
    const clientUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'client@acme.com',
      password: 'ClientPassword123!',
      role: 'client',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      isActive: true
    });

    await ClientProfile.create({
      userId: clientUser._id,
      company: 'Acme Ventures',
      phone: '+1 (415) 555-0192',
      location: 'San Francisco, CA',
      bio: 'Managing Partner at Acme Ventures specializing in seed-stage B2B SaaS investments.',
      website: 'https://acme-ventures-demo.com'
    });

    // 3. Seed Website Settings
    console.log('[Seed] Creating Website Settings...');
    await Settings.create({
      name: 'Maron Jake Dinopol',
      title: 'Freelance Developer & Computer Engineering Student',
      bio: 'I’m a Computer Engineering student and freelance developer. I build websites and web apps, and keep clients in the loop from the first idea to launch.',
      heroHeadline: 'I turn ideas into working websites.',
      heroDescription:
        'I’m a Computer Engineering student and freelance developer. I work with you to plan, build, and polish websites and web apps, and keep you in the loop along the way.',
      availabilityStatus: 'Available for Projects',
      availabilityPeriod: 'Q4 2026',
      typicalResponseTime: 'Within 24 hours',
      email: 'alex@rivera.dev',
      phone: '+1 (415) 890-4321',
      location: 'San Francisco, CA / Remote',
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        dribbble: 'https://dribbble.com'
      }
    });

    // 4. Seed Services
    console.log('[Seed] Seeding Services...');
    await Service.create([
      {
        title: 'High-Converting Landing Pages',
        description:
          'Modern responsive landing pages with interactive micro-animations, fast load times, and conversion-focused visual hierarchy.',
        icon: 'Layout',
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
        featured: true,
        enabled: true,
        order: 1
      },
      {
        title: 'UI & Component Systems',
        description:
          'Reusable, accessible component systems engineered with TypeScript, strict design tokens, and fluid responsiveness.',
        icon: 'Palette',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'],
        featured: true,
        enabled: true,
        order: 2
      },
      {
        title: 'Full-Stack MVP Development',
        description:
          'Production-ready MVP architectures with secure RESTful APIs, JWT role-based authentication, and performant MongoDB databases.',
        icon: 'Cpu',
        technologies: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JWT'],
        featured: true,
        enabled: true,
        order: 3
      },
      {
        title: 'Performance & API Optimization',
        description:
          'Optimizing core web vitals, response payloads, database queries, and indexing for enterprise scalability.',
        icon: 'Zap',
        technologies: ['MongoDB Indexes', 'Caching', 'Lighthouse 98+', 'Docker'],
        featured: false,
        enabled: true,
        order: 4
      }
    ]);

    // 5. Seed Skills
    console.log('[Seed] Seeding Skills...');
    await Skill.create([
      // Frontend
      { name: 'React.js', category: 'Frontend', icon: 'Code', proficiency: 96, featured: true, order: 1 },
      { name: 'TypeScript', category: 'Frontend', icon: 'FileCode', proficiency: 92, featured: true, order: 2 },
      { name: 'Tailwind CSS', category: 'Frontend', icon: 'Palette', proficiency: 98, featured: true, order: 3 },
      { name: 'Next.js', category: 'Frontend', icon: 'Globe', proficiency: 90, featured: true, order: 4 },
      { name: 'Framer Motion', category: 'Frontend', icon: 'Sparkles', proficiency: 88, featured: true, order: 5 },

      // Backend
      { name: 'Node.js', category: 'Backend', icon: 'Server', proficiency: 94, featured: true, order: 6 },
      { name: 'Express.js', category: 'Backend', icon: 'Layers', proficiency: 95, featured: true, order: 7 },
      { name: 'REST APIs', category: 'Backend', icon: 'Network', proficiency: 96, featured: true, order: 8 },
      { name: 'JWT & Security', category: 'Backend', icon: 'Shield', proficiency: 90, featured: true, order: 9 },

      // Database
      { name: 'MongoDB', category: 'Database', icon: 'Database', proficiency: 92, featured: true, order: 10 },
      { name: 'Mongoose ORM', category: 'Database', icon: 'Boxes', proficiency: 94, featured: true, order: 11 },
      { name: 'PostgreSQL', category: 'Database', icon: 'HardDrive', proficiency: 82, featured: false, order: 12 },

      // Tools & Design
      { name: 'Git & GitHub', category: 'Tools', icon: 'GitBranch', proficiency: 94, featured: true, order: 13 },
      { name: 'Figma', category: 'Design', icon: 'Figma', proficiency: 88, featured: true, order: 14 },
      { name: 'Docker', category: 'DevOps', icon: 'Container', proficiency: 80, featured: false, order: 15 }
    ]);

    // 6. Seed Public Portfolio Projects
    console.log('[Seed] Seeding Public Portfolio Projects...');
    await Project.create([
      {
        title: 'Nexus AI - Intelligent UI & Design Engine',
        slug: 'nexus-ai-design-engine',
        category: 'Full-Stack AI Application',
        description:
          'Next-generation web studio generating production-grade React component tokens and responsive layouts using LLM prompt intelligence.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        technologies: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'OpenAI API'],
        liveUrl: 'https://nexus-ai-demo.dev',
        githubUrl: 'https://github.com/alexrivera/nexus-ai-engine',
        projectType: 'portfolio',
        status: 'completed',
        progress: 100,
        featured: true,
        published: false,
        isPrivate: false,
        problem:
          'Designers and engineers waste dozens of hours every sprint hand-crafting boilerplate UI design tokens and mapping them into type-safe components.',
        solution:
          'Architected an end-to-end full-stack platform that consumes conversational briefs, generates structured JSON schemas, and outputs clean React Tailwind code instantly.',
        features: [
          'Real-time interactive code sandboxing',
          'Token export to Tailwind, CSS Modules, and Figma tokens',
          'JWT authentication with workspace project saving',
          'Instant preview across mobile, tablet, and widescreen breakpoints'
        ],
        processNotes: [
          'Researched AST parsing to validate generated code syntax before preview rendering',
          'Implemented optimistic UI updates with Framer Motion transitions',
          'Reduced API latency by 45% using redis-like query caching'
        ],
        screenshots: [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        title: 'Veloce FinTech - Real-Time Asset Management Platform',
        slug: 'veloce-fintech-platform',
        category: 'FinTech Web Application',
        description:
          'Institutional-grade analytics platform providing real-time portfolio performance tracking, asset rebalancing, and compliance auditing.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS'],
        liveUrl: 'https://veloce-fintech-demo.dev',
        githubUrl: 'https://github.com/alexrivera/veloce-fintech',
        projectType: 'portfolio',
        status: 'completed',
        progress: 100,
        featured: true,
        published: false,
        isPrivate: false,
        problem:
          'Boutique investment firms struggled with clunky spreadsheets and outdated legacy tools that failed to provide real-time risk exposure data.',
        solution:
          'Built an ultra-fast dashboard powered by MongoDB aggregation pipelines and streaming WebSocket data, presenting portfolio allocations with sub-second recalculations.',
        features: [
          'Interactive asset distribution charts and risk heatmaps',
          'Role-based auditing and downloadable PDF reports',
          'Multi-currency conversion with live market rates',
          'Bank-grade authentication with HTTP-only session cookies'
        ],
        processNotes: [
          'Optimized database queries with compound indexes on timestamps and user accounts',
          'Created modular charting primitives with zero external chart bloat',
          'Conducted security threat modeling for sensitive financial data'
        ]
      },
      {
        title: 'Aura Studio - Headless Digital Flagship',
        slug: 'aura-studio-luxury',
        category: 'E-Commerce & Digital Experience',
        description:
          'Award-winning e-commerce storefront for an architectural lighting design studio with immersive 3D interactions and frictionless checkout.',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'REST API'],
        liveUrl: 'https://aura-studio-demo.dev',
        githubUrl: 'https://github.com/alexrivera/aura-studio',
        projectType: 'portfolio',
        status: 'completed',
        progress: 100,
        featured: true,
        published: false,
        isPrivate: false,
        problem:
          'High-end interior architecture clients expect luxury visual storytelling, yet existing platforms felt slow and generic.',
        solution:
          'Designed a custom dark-mode aesthetic with fluid page transitions, lazy-loaded visual media, and seamless cart state synchronization.',
        features: [
          'Custom interactive dimension calculator for custom fixtures',
          'Smooth scroll-linked animations and bento showcase',
          'Lighthouse 99 performance score across mobile and desktop'
        ]
      },
      {
        title: 'Pulse Metrics - Cloud Infrastructure Monitor',
        slug: 'pulse-metrics-cloud',
        category: 'DevOps & Developer Tools',
        description:
          'Lightweight cloud service monitoring tool designed for indie developers and micro-startups with instant health ping alerts.',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        technologies: ['Node.js', 'Express', 'MongoDB', 'React', 'TypeScript'],
        liveUrl: 'https://pulse-metrics-demo.dev',
        githubUrl: 'https://github.com/alexrivera/pulse-metrics',
        projectType: 'portfolio',
        status: 'completed',
        progress: 100,
        featured: false,
        published: false,
        isPrivate: false,
        problem:
          'Enterprise monitoring platforms are costly and overwhelmingly complex for early-stage startup teams.',
        solution:
          'Created a zero-friction monitoring system with automated endpoint pings, latency alerts, and clean incident timeline logs.'
      }
    ]);

    // 7. Seed Client Private Project
    console.log('[Seed] Seeding Client Private Project for Sarah Jenkins...');
    const clientProject = await Project.create({
      title: 'Acme Ventures - Partner Dealflow & Investor Portal',
      slug: 'acme-ventures-investor-portal',
      category: 'Client Portal & B2B SaaS',
      description:
        'Secure deal management and investor communications portal with granular confidentiality access levels and interactive metrics.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'JWT RBAC'],
      clientId: clientUser._id,
      projectType: 'client',
      status: 'development',
      progress: 75,
      featured: false,
      published: false,
      isPrivate: true,
      problem: 'Confidential deal evaluation required an airtight proprietary portal with role restrictions.',
      solution: 'Custom client dashboard with milestone tracking, encrypted file assets, and secure messaging.',
      startDate: new Date('2026-08-15'),
      targetEndDate: new Date('2026-10-30')
    });

    // 8. Seed Milestones for Client Project
    console.log('[Seed] Seeding Milestones...');
    await ProjectMilestone.create([
      {
        projectId: clientProject._id,
        title: 'Phase 1: Architecture & RBAC Security Specification',
        description: 'Completed technical blueprint, database schemas, and threat evaluation.',
        status: 'completed',
        dueDate: new Date('2026-08-30'),
        completedAt: new Date('2026-08-28'),
        order: 1
      },
      {
        projectId: clientProject._id,
        title: 'Phase 2: High-Fidelity UI Design & Design System',
        description: 'Finalized Figma interactive component prototypes and client sign-off.',
        status: 'completed',
        dueDate: new Date('2026-09-12'),
        completedAt: new Date('2026-09-11'),
        order: 2
      },
      {
        projectId: clientProject._id,
        title: 'Phase 3: Dealflow Database & REST API Endpoints',
        description: 'Implementing MongoDB aggregation pipelines, filtering, and authorization middleware.',
        status: 'in-progress',
        dueDate: new Date('2026-10-05'),
        order: 3
      },
      {
        projectId: clientProject._id,
        title: 'Phase 4: Investor Analytics & Document Vault',
        description: 'Encrypted document uploads and granular file download auditing.',
        status: 'pending',
        dueDate: new Date('2026-10-18'),
        order: 4
      },
      {
        projectId: clientProject._id,
        title: 'Phase 5: Staging Review, QA Testing & Production Launch',
        description: 'Vulnerability scan, edge caching verification, and client handover.',
        status: 'pending',
        dueDate: new Date('2026-10-30'),
        order: 5
      }
    ]);

    // 9. Seed Project Files
    console.log('[Seed] Seeding Project Files...');
    await ProjectFile.create([
      {
        projectId: clientProject._id,
        uploadedBy: admin._id,
        name: 'Acme_Portal_Technical_Architecture_v2.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: 'application/pdf',
        size: 2457600
      },
      {
        projectId: clientProject._id,
        uploadedBy: admin._id,
        name: 'Design_Tokens_and_Brand_Assets.zip',
        url: 'https://example.com/assets.zip',
        type: 'application/zip',
        size: 8912896
      },
      {
        projectId: clientProject._id,
        uploadedBy: clientUser._id,
        name: 'Q4_Deal_Pipeline_Requirements.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: 'application/pdf',
        size: 1153433
      }
    ]);

    // 10. Seed Project Messages
    console.log('[Seed] Seeding Project Messages...');
    await Message.create([
      {
        projectId: clientProject._id,
        senderId: clientUser._id,
        receiverId: admin._id,
        content:
          "Hi Alex, the interactive Figma prototype looks stellar! The partners are really excited about the dealflow stage tracker. When will the API integration for Phase 3 be ready for staging testing?",
        read: true,
        createdAt: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        projectId: clientProject._id,
        senderId: admin._id,
        receiverId: clientUser._id,
        content:
          "Thanks Sarah! Phase 3 is progressing rapidly. All Mongoose schemas and RBAC middlewares are in place. I will have the deal filtering and document vault endpoints ready for staging review early next week.",
        read: true,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        projectId: clientProject._id,
        senderId: clientUser._id,
        receiverId: admin._id,
        content:
          "Perfect! Also uploaded the Q4 Deal Pipeline Requirements document to the files tab for your reference.",
        read: false,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000)
      }
    ]);

    // 11. Seed Contact Submissions
    console.log('[Seed] Seeding Contact Messages...');
    await ContactMessage.create([
      {
        name: 'David Miller',
        email: 'david@strataflow.io',
        projectBrief:
          'Looking for a full-stack engineer to build our B2B SaaS MVP for real-time logistics tracking. We have Figma wireframes ready and need React + Node.js backend integration within 6 weeks.',
        status: 'new'
      },
      {
        name: 'Elena Rostova',
        email: 'elena@novacreative.co',
        projectBrief:
          'We need an ultra-slick portfolio revamp with dynamic animations and client proof for our design agency. Loved your work on Aura Studio!',
        status: 'replied'
      }
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEED COMPLETE!');
    console.log('Default Admin Account:');
    console.log(`  Email:    ${adminEmail}`);
    console.log('  Password: configured in server environment');
    console.log('Default Client Account:');
    console.log('  Email:    client@acme.com');
    console.log('  Password: ClientPassword123!');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}
