import "dotenv/config";
import { BlogPostStatus, UserRole } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

type VideoCandidate = {
  title: string;
  slug: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  description: string;
  duration: string | null;
  isFeatured: boolean;
  displayOrder: number;
  thumbnailUrl: string | null;
  authorName: string | null;
  doctorId: string | null;
};

const videoCandidates: VideoCandidate[] = [
  {
    title: "Understanding Diabetes — Mayo Clinic Explains",
    slug: "understanding-diabetes-mayo-clinic",
    youtubeUrl: "https://www.youtube.com/watch?v=Txqe_CAD43c",
    youtubeVideoId: "Txqe_CAD43c",
    description:
      "An expert overview of diabetes types, symptoms, and practical daily management strategies. Learn how glucose regulation impacts your long-term health.",
    duration: null,
    isFeatured: true,
    displayOrder: 1,
    thumbnailUrl: null,
    authorName: "Mayo Clinic",
    doctorId: null,
  },
  {
    title: "Hypertension in 2024 & Beyond — Cleveland Clinic",
    slug: "hypertension-in-2024-and-beyond-cleveland-clinic",
    youtubeUrl: "https://www.youtube.com/watch?v=mBpdD3j2oqM",
    youtubeVideoId: "mBpdD3j2oqM",
    description:
      "Cardiologists discuss modern approaches to identifying and controlling high blood pressure. Understand lifestyle interventions and medication guidelines.",
    duration: null,
    isFeatured: true,
    displayOrder: 2,
    thumbnailUrl: null,
    authorName: "Cleveland Clinic",
    doctorId: null,
  },
  {
    title: "Daily Habits for a Healthier Heart — Mayo Clinic Minute",
    slug: "daily-habits-for-a-healthier-heart-mayo-clinic",
    youtubeUrl: "https://www.youtube.com/watch?v=wXk1Nj28Hm4",
    youtubeVideoId: "wXk1Nj28Hm4",
    description:
      "Simple everyday changes to protect your cardiovascular system and reduce cardiovascular risk. Actionable advice on diet, movement, and stress management.",
    duration: null,
    isFeatured: true,
    displayOrder: 3,
    thumbnailUrl: null,
    authorName: "Mayo Clinic",
    doctorId: null,
  },
  {
    title: "School Lunch & Child Nutrition — Mayo Clinic Kids Podcast",
    slug: "school-lunch-and-child-nutrition-mayo-clinic",
    youtubeUrl: "https://www.youtube.com/watch?v=WXz6NdB7F1Q",
    youtubeVideoId: "WXz6NdB7F1Q",
    description:
      "Pediatric guidance on packing balanced meals and instilling nutritious food habits in children. Practical tips for parents dealing with picky eaters.",
    duration: null,
    isFeatured: true,
    displayOrder: 4,
    thumbnailUrl: null,
    authorName: "Mayo Clinic",
    doctorId: null,
  },
  {
    title: "Early Pregnancy Essentials: What to Expect — Mayo Clinic Minute",
    slug: "early-pregnancy-essentials-mayo-clinic",
    youtubeUrl: "https://www.youtube.com/watch?v=0fH_4sqPAvI",
    youtubeVideoId: "0fH_4sqPAvI",
    description:
      "A quick medical checklist for early pregnancy milestones and prenatal care routines. Learn essential questions to ask your obstetrician during initial checkups.",
    duration: null,
    isFeatured: false,
    displayOrder: 5,
    thumbnailUrl: null,
    authorName: "Mayo Clinic",
    doctorId: null,
  },
  {
    title: "Guardian of Health — World Health Organization",
    slug: "guardian-of-health-who",
    youtubeUrl: "https://www.youtube.com/watch?v=p7liQk45fFk",
    youtubeVideoId: "p7liQk45fFk",
    description:
      "A documentary look into global health defense, public disease surveillance, and equitable primary care. Discover how international standards shape community medicine.",
    duration: null,
    isFeatured: false,
    displayOrder: 6,
    thumbnailUrl: null,
    authorName: "World Health Organization",
    doctorId: null,
  },
];

async function main() {
  console.log("Starting demo blog and video seed...");

  // 1. Locate ADMIN user
  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deletedAt: null },
    select: { id: true, email: true },
  });

  if (!admin) {
    console.error("STATUS: BLOCKED — No active ADMIN user found in database.");
    process.exit(1);
  }
  console.log(`Using admin user: ${admin.email} (${admin.id})`);

  // 2. Locate active doctors for attribution
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { yearsExperience: "desc" },
    take: 2,
    select: { id: true, name: true, slug: true, yearsExperience: true },
  });

  if (doctors.length < 2) {
    console.warn(`Warning: Expected 2 active doctors, found ${doctors.length}.`);
  }
  const doctor1 = doctors[0] ?? null;
  const doctor2 = doctors[1] ?? doctors[0] ?? null;
  if (doctor1) console.log(`Attribution Doctor 1: ${doctor1.name} (${doctor1.yearsExperience} yrs)`);
  if (doctor2) console.log(`Attribution Doctor 2: ${doctor2.name} (${doctor2.yearsExperience} yrs)`);

  // 3. Define 5 blog posts
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const blogPosts = [
    {
      title: "Understanding Type 2 Diabetes: Early Signs You Shouldn't Ignore",
      slug: "understanding-type-2-diabetes-early-signs",
      isFeatured: true,
      excerpt:
        "Learn the subtle early warning signs of type 2 diabetes and why early screening is crucial for long-term health.",
      content:
        "Type 2 diabetes has become one of the most widespread chronic health challenges in Bangladesh, affecting millions of adults across both urban and rural communities. Because blood sugar levels often climb gradually over several years, the early signs can be remarkably subtle and easy to dismiss as everyday fatigue or normal aging. Recognizing these early warning indicators allows you to intervene before serious complications develop.\n\nOne of the earliest signs is unusual thirst accompanied by frequent urination, especially during the night. When excess glucose accumulates in your bloodstream, your kidneys work overtime to filter and absorb the sugar. If they cannot keep up, the excess glucose is excreted into your urine, dragging fluids from your tissues and leaving you constantly dehydrated.\n\nPersistent fatigue and unexplained hunger are also common red flags. Even when you are eating regular meals, your body's cells cannot efficiently absorb glucose without adequate insulin response. As a result, your muscles and organs remain deprived of energy, triggering constant hunger signals and an overwhelming feeling of sluggishness throughout the day.\n\nOther subtle symptoms include blurred vision, slow-healing cuts or bruises, and frequent skin infections. High blood glucose levels pull fluid from the lenses of your eyes, affecting your ability to focus clearly. Additionally, compromised circulation and weakened immune responses delay your body's natural tissue repair process.\n\nIn South Asian populations, genetic predisposition combined with diets high in refined carbohydrates like polished white rice increases vulnerability to insulin resistance. Routine screening with a fasting blood glucose test or HbA1c test is recommended at least once a year for anyone over thirty or those with a family history of diabetes. Simple lifestyle modifications, such as incorporating daily thirty-minute brisk walks and replacing refined carbs with whole grains and vegetables, make a profound difference.",
      tags: ["diabetes", "prevention", "lifestyle", "endocrine"],
      authorName: "Capsule Editorial Team",
      doctorId: null,
      publishedAt: new Date(now - 20 * dayMs),
      viewsCount: 420,
    },
    {
      title: "High Blood Pressure: The Silent Risk and How to Control It",
      slug: "high-blood-pressure-silent-risk-control",
      isFeatured: true,
      excerpt:
        "High blood pressure often develops without noticeable symptoms, making regular monitoring and dietary discipline essential.",
      content:
        "High blood pressure, clinically known as hypertension, is frequently referred to as the silent killer because it rarely causes noticeable symptoms in its initial stages. In Bangladesh, where diets traditionally incorporate high amounts of sodium and fried snacks, millions live with dangerously elevated blood pressure without realizing their heart, kidneys, and brain are under continuous strain.\n\nA resting blood pressure consistently above 130 over 80 millimeters of mercury indicates hypertension. Left unmanaged, the persistent mechanical pressure damages the delicate inner lining of your blood vessels. Over time, arteries become stiff and narrow, drastically increasing your vulnerability to heart attacks, ischemic strokes, heart failure, and chronic kidney disease.\n\nBecause headaches and dizziness only occur during severe or life-threatening spikes, you cannot rely on physical sensations to judge your cardiovascular status. Regular blood pressure measurement is the only reliable diagnostic method. Adults should check their blood pressure at least every six months at a local pharmacy, healthcare center, or using a validated digital home monitor.\n\nManaging hypertension begins with intentional dietary adjustments. Reducing daily salt consumption is the single most effective dietary change. Limiting processed spices, pickles, and salty snacks while emphasizing potassium-rich vegetables, lentils, and fresh fruits helps balance electrolyte levels and relaxes blood vessel walls.\n\nPhysical activity plays an equally pivotal role in vascular health. Engaging in moderate cardiovascular exercise, such as brisk walking for forty minutes five days a week, significantly lowers vascular resistance. Weight management and stress reduction through adequate sleep also reduce sympathetic nervous system stimulation. If your physician prescribes antihypertensive medication, taking it consistently every day without unapproved interruptions is critical to safeguarding your vital organs.",
      tags: ["hypertension", "cardiology", "blood pressure", "prevention"],
      authorName: null,
      doctorId: doctor1?.id ?? null,
      publishedAt: new Date(now - 15 * dayMs),
      viewsCount: 650,
    },
    {
      title: "Heart Health Basics: Small Daily Habits That Protect Your Heart",
      slug: "heart-health-basics-daily-habits",
      isFeatured: true,
      excerpt:
        "Adopting small daily cardiovascular habits can significantly lower the risk of heart disease and stroke.",
      content:
        "Cardiovascular diseases remain the leading cause of premature mortality worldwide, and South Asian populations face an elevated risk at younger ages. Fortunately, heart disease is not an inevitable outcome of aging or genetics. Making targeted, evidence-based adjustments to your everyday routine builds significant cardiovascular resilience and protects your vascular system over decades.\n\nA foundational habit is prioritizing consistent physical movement. Sedentary lifestyles contribute directly to arterial stiffness and metabolic dysfunction. You do not need extreme gym routines to achieve meaningful cardiac protection. Brisk walking for thirty to forty minutes daily improves endothelial function, enhances circulation, and helps maintain healthy lipid levels by raising protective HDL cholesterol.\n\nNutrition is another powerful pillar of heart wellness. Modern Bangladeshi diets often feature excessive saturated fats from repeated reheating of cooking oils, alongside high intake of refined sugars and processed flours. Transitioning toward heart-friendly fats, including mustard oil or olive oil in moderation, while integrating abundant green leafy vegetables, legumes, and omega-3 rich fish like hilsa and salmon, actively reduces inflammatory markers.\n\nAdequate, restful sleep is equally vital for cardiovascular recovery. Chronic sleep deprivation elevates cortisol and catecholamines, driving up nighttime blood pressure and causing endothelial stress. Strive for seven to eight hours of uninterrupted sleep each night, maintaining a consistent sleep schedule and avoiding digital screens before bedtime.\n\nFinally, managing chronic stress and avoiding tobacco are non-negotiable. Smoking and using smokeless tobacco such as jarda or gul directly damage arterial walls and promote plaque rupture. Combining tobacco cessation with regular stress-relief practices, such as deep breathing or prayer, keeps vascular tone balanced. Proactive annual lipid profile screenings provide the data needed to keep your heart working efficiently.",
      tags: ["heart health", "cardiology", "fitness", "prevention"],
      authorName: "Capsule Editorial Team",
      doctorId: null,
      publishedAt: new Date(now - 10 * dayMs),
      viewsCount: 310,
    },
    {
      title: "Child Nutrition: Building Healthy Eating Habits Early",
      slug: "child-nutrition-healthy-eating-habits",
      isFeatured: true,
      excerpt:
        "Establishing balanced dietary habits during childhood supports cognitive development and protects against chronic conditions.",
      content:
        "Establishing nutritious eating habits during early childhood is one of the greatest investments parents can make in their child's long-term health and cognitive potential. During the developmental years, adequate macro and micronutrients fuel rapid brain growth, strengthen skeletal formation, and program metabolic pathways that persist into adulthood.\n\nA common challenge in urban households is the widespread availability of packaged snacks, sugary juices, and deep-fried fast foods. These calorie-dense items provide little nutritional value and displace essential vitamins, zinc, and iron. When children fill up on processed sugars and artificial additives, their appetite for nutrient-dense whole foods declines, leading to both childhood obesity and micronutrient deficiencies.\n\nA balanced meal plate for a growing child should always prioritize diverse food groups. Incorporating seasonal fruits, brightly colored vegetables, lentils, eggs, and dairy ensures a steady supply of protein and essential fatty acids. In Bangladesh, where iron deficiency anemia remains common among children, pairing iron-rich foods like eggs and dark leafy greens with vitamin C sources such as citrus fruits significantly improves mineral absorption.\n\nFostering a positive relationship with food is just as important as the ingredients themselves. Avoid using confectionery as emotional rewards or bargaining chips for good behavior, as this practice reinforces cravings for refined sugars. Instead, invite children to participate in selecting fresh fruits at the market and preparing simple meals at home to spark curiosity and ownership.\n\nPatience is key when introducing new flavors and textures. Children may need repeated exposures to a vegetable before developing an acceptance for it. Offering balanced portions in an unhurried, screen-free family dining environment encourages natural hunger cues and establishes healthy dietary patterns that last a lifetime.",
      tags: ["child health", "pediatrics", "nutrition", "parenting"],
      authorName: null,
      doctorId: doctor2?.id ?? null,
      publishedAt: new Date(now - 5 * dayMs),
      viewsCount: 540,
    },
    {
      title: "When to See a Doctor for Fever: A Practical Guide",
      slug: "when-to-see-a-doctor-for-fever-practical-guide",
      isFeatured: false,
      excerpt:
        "Understanding the difference between a self-limiting fever and a medical emergency helps you seek timely care without panic.",
      content:
        "Fever is one of the most frequent reasons parents and adults seek medical guidance, yet it is often misunderstood. A fever is not an illness in itself, but rather an innate physiological defense mechanism. When your body detects viral or bacterial invaders, your hypothalamus raises core temperature to create an environment that inhibits pathogen replication while accelerating white blood cell activity.\n\nIn most cases, an uncomplicated low-grade fever between 99 and 101 degrees Fahrenheit accompanying a mild viral upper respiratory infection can be safely managed at home. Resting adequately, dressing in light breathable clothing, and staying thoroughly hydrated with oral rehydration salts, coconut water, or clear soups helps prevent dehydration while your immune system resolves the infection.\n\nHowever, recognizing red flag symptoms is essential to prevent severe complications, particularly in tropical climates like Bangladesh where vector-borne infections such as dengue and chikungunya are prevalent. If a high fever exceeds 103 degrees Fahrenheit or persists for more than three consecutive days without signs of improvement, medical evaluation by a licensed physician is mandatory.\n\nImmediate emergency care is required if the fever is accompanied by severe persistent vomiting, abdominal pain, difficulty breathing, extreme lethargy, confusion, or a stiff neck. In dengue-endemic seasons, warning signs such as bleeding from the gums or nose, blood in stool, or unusual bruising require prompt complete blood count testing and platelet monitoring.\n\nFor infants under three months of age, any rectal temperature of 100.4 degrees Fahrenheit or higher warrants an urgent emergency room visit, even if the baby appears otherwise calm. When dealing with fever, avoid indiscriminate use of leftover antibiotics without a doctor's prescription. Paracetamol remains the safest initial antipyretic when used at age-appropriate dosages.",
      tags: ["fever", "infection", "general health", "dengue"],
      authorName: "Capsule Editorial Team",
      doctorId: null,
      publishedAt: new Date(now - 1 * dayMs),
      viewsCount: 185,
    },
  ];

  // 4. Upsert blog posts
  console.log("Upserting blog posts...");
  let blogUpsertCount = 0;
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: null,
        tags: post.tags,
        status: BlogPostStatus.PUBLISHED,
        publishedAt: post.publishedAt,
        isFeatured: post.isFeatured,
        viewsCount: post.viewsCount,
        authorName: post.authorName,
        doctorId: post.doctorId,
        createdById: admin.id,
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: null,
        tags: post.tags,
        status: BlogPostStatus.PUBLISHED,
        publishedAt: post.publishedAt,
        isFeatured: post.isFeatured,
        viewsCount: post.viewsCount,
        authorName: post.authorName,
        doctorId: post.doctorId,
        deletedAt: null,
      },
    });
    blogUpsertCount++;
  }
  console.log(`Blog posts upserted: ${blogUpsertCount}`);

  // 5. Video verification gate
  console.log("Running video verification gate (oEmbed)...");
  const verifiedVideos: VideoCandidate[] = [];

  for (const video of videoCandidates) {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${video.youtubeVideoId}`
    )}&format=json`;

    try {
      const response = await fetch(oembedUrl, {
        signal: AbortSignal.timeout(10000),
      });

      if (response.status === 200) {
        const data = (await response.json()) as { title?: string };
        const fetchedTitle = data.title ?? "OK";
        console.log(`${video.youtubeVideoId} → OK(${fetchedTitle})`);
        verifiedVideos.push(video);
      } else {
        console.log(`${video.youtubeVideoId} → SKIP(HTTP ${response.status})`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`${video.youtubeVideoId} → SKIP(${message})`);
    }
  }

  if (verifiedVideos.length < 4) {
    console.warn(
      `\nWARNING: Fewer than 4 videos passed verification (${verifiedVideos.length}/4 minimum expected). Proceeding with verified videos.\n`
    );
  }

  // 6. Upsert verified videos
  console.log("Upserting verified videos...");
  let videoUpsertCount = 0;
  for (const video of verifiedVideos) {
    await prisma.video.upsert({
      where: { slug: video.slug },
      create: {
        title: video.title,
        slug: video.slug,
        description: video.description,
        youtubeUrl: video.youtubeUrl,
        youtubeVideoId: video.youtubeVideoId,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        isFeatured: video.isFeatured,
        displayOrder: video.displayOrder,
        authorName: video.authorName,
        doctorId: video.doctorId,
        createdById: admin.id,
      },
      update: {
        title: video.title,
        description: video.description,
        youtubeUrl: video.youtubeUrl,
        youtubeVideoId: video.youtubeVideoId,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        isFeatured: video.isFeatured,
        displayOrder: video.displayOrder,
        authorName: video.authorName,
        doctorId: video.doctorId,
        deletedAt: null,
      },
    });
    videoUpsertCount++;
  }
  console.log(`Videos upserted: ${videoUpsertCount}`);

  console.log("Demo content seed completed successfully.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
