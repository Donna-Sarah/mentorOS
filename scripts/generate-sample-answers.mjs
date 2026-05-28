import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// Load env manually (no dotenv dependency needed)
const envPath = path.join(ROOT, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) {
    process.env[key.trim()] = rest.join('=').trim()
  }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Prompts (copy exact strings from src/lib/ai/prompts/pmp.ts) ──────────
const PROMPT_M1 = `Bạn là PMP AI Mentor của mentorOS. Phân tích câu hỏi PMP. Trả về JSON thuần, KHÔNG backticks, KHÔNG preamble.
QUAN TRỌNG về response_type:
- "single": câu hỏi chỉ có 1 đáp án đúng (dạng thông thường)
- "multiple": câu hỏi yêu cầu chọn NHIỀU đáp án đúng — thường có dấu hiệu: "Which TWO", "Select TWO", "Which THREE", "Select all that apply", "Which of the following are", hoặc rõ ràng có 2+ đáp án đúng về mặt nội dung
{
  "response_type": "single | multiple",
  "correct_count": 1,
  "correct_answer": "A",
  "correct_answers": ["A"],
  "answer_verdict": {
    "A": { "correct": true, "explanation": "1-2 câu lý do cụ thể theo PMI" },
    "B": { "correct": false, "explanation": "1-2 câu lý do cụ thể theo PMI" },
    "C": { "correct": false, "explanation": "1-2 câu lý do cụ thể theo PMI" },
    "D": { "correct": false, "explanation": "1-2 câu lý do cụ thể theo PMI" }
  },
  "anatomy": {
    "role_anchor": "vai trò + giải thích nếu ảnh hưởng scope",
    "situation": "tình huống cốt lõi sau khi lọc nhiễu",
    "trigger_word": "FIRST|NEXT|BEST|EXCEPT",
    "trigger_meaning": "ý nghĩa trigger word",
    "hidden_test": "PMI không test [X] — PMI thực sự test [Y]"
  },
  "mindset": {
    "vn_thinking": "phản xạ CỤ THỂ của người Việt",
    "vn_reason": "lý do văn hoá tạo ra reflex này",
    "pmi_thinking": "approach đúng theo PMI",
    "pmi_reason": "tại sao PMI ưu tiên approach này"
  },
  "core_rule": "1 câu dưới 15 từ tiếng Việt, dễ nhớ",
  "trap": {
    "category": "Mindset Trap|Terminology Trap|Technical Trap|Language Trap",
    "name": "Tối đa 4 từ tiếng Anh",
    "why_feels_right": "Nghe có vẻ đúng vì...",
    "domain": "People|Process|Business Environment",
    "approach": "Agile|Predictive|Hybrid|All"
  }
}`

const PROMPT_TRANSLATE = `Bạn là trợ lý dịch thuật PMP. Dịch câu hỏi PMP từ tiếng Anh sang tiếng Việt.
Yêu cầu:
- Dịch sát nghĩa, giữ nguyên các thuật ngữ PMI quan trọng kèm bản gốc tiếng Anh trong ngoặc
- Giữ nguyên cấu trúc câu hỏi và các lựa chọn A B C D
- Các trigger word quan trọng (FIRST, NEXT, BEST, EXCEPT) phải được giữ nguyên tiếng Anh và in hoa
- Trả về CHỈ bản dịch, không có giải thích hay preamble`

// ── Helpers ───────────────────────────────────────────────────────────────
async function analyzeQuestion(fullText) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    system: PROMPT_M1,
    messages: [{ role: 'user', content: fullText }],
  })
  const text = response.content[0].text
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function translateQuestion(fullText) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    system: PROMPT_TRANSLATE,
    messages: [{ role: 'user', content: fullText }],
  })
  return response.content[0].text.trim()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Main ──────────────────────────────────────────────────────────────────
// Output file is committed to repo — regenerate only when samples change
const samplesPath = path.join(ROOT, 'public/data/samples.json')
const outputPath = path.join(ROOT, 'public/data/sample-answers.json')
const samples = JSON.parse(fs.readFileSync(samplesPath, 'utf-8'))

// Load existing output if any (for resume support)
let existing = {}
if (fs.existsSync(outputPath)) {
  existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
  console.log(`Resuming — ${Object.keys(existing).length} already done.`)
}

const results = { ...existing }

for (let i = 0; i < samples.length; i++) {
  const sample = samples[i]
  const key = String(i)
  if (results[key]) {
    console.log(`[${i + 1}/${samples.length}] SKIP (cached): ${sample.tag}`)
    continue
  }

  console.log(`[${i + 1}/${samples.length}] Processing: ${sample.tag}`)
  try {
    // Step 1: Analyze (Mood 1)
    console.log(`  → Analyzing...`)
    const analysis = await analyzeQuestion(sample.full_text)

    // Step 2: Translate full question text
    console.log(`  → Translating...`)
    const translation = await translateQuestion(sample.full_text)

    results[key] = {
      sampleIndex: i,
      tag: sample.tag,
      analysis,
      translation,
      generatedAt: new Date().toISOString(),
    }

    // Save after each question (resume support)
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`  ✓ Done`)

    // Rate limiting: 1.5s between calls
    if (i < samples.length - 1) await sleep(1500)
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`)
    console.log(`  Skipping — will retry on next run`)
    await sleep(2000)
  }
}

console.log('\n✅ Complete!')
console.log(`Total: ${Object.keys(results).length}/${samples.length} questions`)
console.log(`Output: ${outputPath}`)

