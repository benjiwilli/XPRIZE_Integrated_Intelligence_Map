import fs from "fs";
const data = fs.readFileSync("src/data/syntheticData.ts", "utf8");

const replaced = data.replace(/approvedEvidenceCount:\s*(\d+),/g, (match, p1) => {
  const num = parseInt(p1, 10);
  let status = "needs_evidence";
  if (num > 5) status = "report_ready";
  else if (num > 2) status = "human_reviewed";
  else if (num > 0) status = "evidence_added";
  return match + "\n    evidenceStatus: \"" + status + "\",";
});

fs.writeFileSync("src/data/syntheticData.ts", replaced);
