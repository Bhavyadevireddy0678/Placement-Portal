const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const placementData = [
  {
    content: "Eligibility criteria: Students must have a minimum CGPA of 6.0 to sit for campus placements. Students with active backlogs are not eligible. Students must register on the placement portal before the deadline.",
    metadata: { category: "eligibility" },
  },
  {
    content: "Placement process: The placement process consists of 3 rounds - Aptitude Test, Technical Interview, and HR Interview. Students must clear each round to proceed to the next.",
    metadata: { category: "process" },
  },
  {
    content: "Google is visiting campus for Software Engineer roles. Package offered: 18-24 LPA. Required skills: Data Structures, Algorithms, System Design. Eligibility: CGPA 7.5+, CS/IT/ECE branches only.",
    metadata: { category: "company", company: "Google" },
  },
  {
    content: "TCS is visiting campus for System Engineer roles. Package: 3.36 LPA. Required skills: Any programming language, basic aptitude. Eligibility: CGPA 6.0+, all branches eligible.",
    metadata: { category: "company", company: "TCS" },
  },
  {
    content: "Infosys is visiting for Systems Engineer and Digital Specialist roles. Package: 3.6 LPA to 9 LPA. Skills required: Programming basics, logical reasoning. All branches eligible with CGPA 6.0+.",
    metadata: { category: "company", company: "Infosys" },
  },
  {
    content: "Wipro is visiting for Project Engineer roles. Package: 3.5 LPA. Eligibility: CGPA 6.0+, all branches. Skills: Basic programming, communication skills.",
    metadata: { category: "company", company: "Wipro" },
  },
  {
    content: "FAQ: How do I register for placements? Answer: Log in to the placement portal, go to your profile, fill in all details including resume, CGPA, and branch, then click Register for Placements.",
    metadata: { category: "faq" },
  },
  {
    content: "FAQ: Can I apply to multiple companies? Answer: Yes, you can apply to multiple companies. However once you receive and accept an offer, you cannot sit for other drives unless you are in the Dream Company category.",
    metadata: { category: "faq" },
  },
  {
    content: "FAQ: What documents do I need for placements? Answer: You need your updated resume, all semester marksheets, ID proof, and passport-size photos. Keep both physical and digital copies ready.",
    metadata: { category: "faq" },
  },
  {
    content: "FAQ: When is the placement season? Answer: The placement season typically starts in August for final year students. Pre-placement talks begin in July. Keep checking the portal for company announcements.",
    metadata: { category: "faq" },
  },
];

async function getEmbedding(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  const data = await res.json();
  return data.data[0].embedding;
}

router.get("/", async (req, res) => {
  if (req.query.secret !== process.env.INGEST_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let inserted = 0;
  for (const doc of placementData) {
    const embedding = await getEmbedding(doc.content);
    await supabase.from("documents").insert({
      content: doc.content,
      embedding,
      metadata: doc.metadata,
    });
    inserted++;
  }

  res.json({ success: true, inserted });
});

module.exports = router;
