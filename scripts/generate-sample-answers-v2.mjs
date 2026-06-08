import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const envPath = path.join(ROOT, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  }
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPT_M1_V2 = `Bạn là PMP AI Mentor của mentorOS. Phân tích câu hỏi PMP và trả về JSON thuần, KHÔNG backticks, KHÔNG preamble.

NHIỆM VỤ: Phân tích tại sao user chọn sai và PMI muốn user nghĩ như thế nào.

QUY TẮC QUAN TRỌNG về trap_id:
- Chỉ được dùng đúng các trap_id trong danh sách sau, không tự tạo trap mới
- Nếu không map chắc chắn vào trap nào: dùng "unclear_or_mixed"
- trap_id list: premature_escalation | action_before_analysis | trigger_word_error | stakeholder_appeasement | process_bypass | role_confusion | agile_command_reflex | terminology_confusion | conflict_avoidance | unclear_or_mixed

QUY TẮC về trap_subtype (chỉ áp dụng khi trap_id = "trigger_word_error"):
- "neglected": user không nhìn thấy / bỏ qua trigger word
- "conflated": user nhầm FIRST↔BEST, NEXT↔FIRST
- "negative_logic": user chọn đúng việc nhưng sai hướng vì EXCEPT
- null: khi trap_id không phải trigger_word_error

QUY TẮC về core_rule_id:
- Chỉ được dùng đúng các core_rule_id trong danh sách sau
- core_rule_id list: resolve_lowest_level | understand_before_act | trigger_defines_logic | first_is_sequence | protect_the_process | right_process_matters | right_role_right_action | enable_before_direct | match_pmi_term | address_conflict_directly
- Khi trap_id = "trigger_word_error" và trap_subtype = "conflated": dùng core_rule_id = "first_is_sequence"
- Khi trap_id = "trigger_word_error" và subtype khác: dùng core_rule_id = "trigger_defines_logic"
- Khi trap_id = "unclear_or_mixed": core_rule_id = null

QUY TẮC về response_type:
- "single": câu hỏi chỉ có 1 đáp án đúng
- "multiple": câu hỏi yêu cầu chọn NHIỀU đáp án

QUY TẮC về user_answer_reason:
- Chỉ generate khi is_correct = false
- Khi is_correct = true: trả về chuỗi rỗng ""

JSON schema bắt buộc:
{
  "is_correct": true | false,
  "response_type": "single | multiple",
  "correct_count": 1,
  "selected_answer": "A|B|C|D",
  "correct_answer": "A|B|C|D",
  "correct_answers": ["A"],
  "trap_id": "premature_escalation",
  "trap_subtype": null,
  "core_rule_id": "resolve_lowest_level",
  "trigger_signal": "NEXT + informal resolution failed — hỏi bước tiếp theo trong escalation sequence",
  "hidden_test": "PMI không test conflict resolution technique — PMI test hiểu escalation path trong matrix structure",
  "user_answer_reason": "Chỉ có khi is_correct = false: 1-2 câu tại sao option user chọn sai theo PMI",
  "correct_answer_reason": "1-2 câu tại sao correct answer là đúng theo PMI",
  "vn_vs_pmi_one_line": "1 câu contrast: PM VN thường [X] — PMI coi [Y]",
  "contextual_note": "1 câu ngắn gắn với context câu hỏi cụ thể, không phải giải thích chung"
}`

const samplesPath = path.join(ROOT, 'public/data/samples.json')
const outputPath = path.join(ROOT, 'public/data/sample-answers-v2.json')

const samples = JSON.parse(fs.readFileSync(samplesPath, 'utf-8'))

let cache = {}
if (fs.existsSync(outputPath)) {
  cache = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
  console.log(`Resuming — ${Object.keys(cache).length} entries already cached`)
}

async function generateForSample(sample) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    system: PROMPT_M1_V2,
    messages: [{ role: 'user', content: sample.full_text }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  return JSON.parse(clean)
}

async function main() {
  for (let i = 0; i < samples.length; i++) {
    const key = String(i)

    if (cache[key]) {
      console.log(`[${i + 1}/${samples.length}] Skip (cached)`)
      continue
    }

    try {
      console.log(`[${i + 1}/${samples.length}] Generating...`)
      const analysis = await generateForSample(samples[i])

      cache[key] = {
        sampleIndex: i,
        tag: samples[i].tag,
        analysisV2: analysis,
        generatedAt: new Date().toISOString(),
      }

      fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2))
      console.log(`[${i + 1}/${samples.length}] Done — trap: ${analysis.trap_id}`)

      await new Promise((r) => setTimeout(r, 1500))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[${i + 1}/${samples.length}] Error:`, message)
    }
  }

  console.log(`\nDone. ${Object.keys(cache).length} entries in ${outputPath}`)
}

main()
