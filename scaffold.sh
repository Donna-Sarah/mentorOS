#!/bin/bash
# ============================================================
# mentorOS — Project Scaffold Script
# Run this ONCE after `npx create-next-app` to create the
# full folder structure before opening in Cursor.
# ============================================================
# Usage:
#   cd mentoros
#   chmod +x scaffold.sh
#   ./scaffold.sh
# ============================================================

echo "🚀 Scaffolding mentorOS project structure..."

# ============================================================
# src/app — Route pages
# ============================================================
mkdir -p src/app/pmp
mkdir -p src/app/askbetter
mkdir -p src/app/nextup
mkdir -p src/app/bidmentor
mkdir -p src/app/login
mkdir -p src/app/api/ai
mkdir -p src/app/api/auth
mkdir -p src/app/api/pmp
mkdir -p src/app/api/askbetter
mkdir -p src/app/api/nextup

# ============================================================
# src/components
# ============================================================
mkdir -p src/components/layout
mkdir -p src/components/ui
mkdir -p src/components/shared
mkdir -p src/components/pmp
mkdir -p src/components/askbetter
mkdir -p src/components/nextup

# ============================================================
# src/lib
# ============================================================
mkdir -p src/lib/i18n
mkdir -p src/lib/supabase
mkdir -p src/lib/ai/prompts
mkdir -p src/lib/utils

# ============================================================
# src/hooks
# ============================================================
mkdir -p src/hooks

# ============================================================
# src/types
# ============================================================
mkdir -p src/types

# ============================================================
# src/styles
# ============================================================
mkdir -p src/styles

# ============================================================
# Create placeholder files so folders appear in git
# ============================================================

# App pages
cat > src/app/pmp/page.tsx << 'EOF'
// PMP Thinking Coach — placeholder
// Will be replaced in Phase 2
export default function PMPPage() {
  return <div>PMP Thinking Coach — coming soon</div>
}
EOF

cat > src/app/askbetter/page.tsx << 'EOF'
// AskBetter — placeholder
// Will be replaced in Phase 3
export default function AskBetterPage() {
  return <div>AskBetter — coming soon</div>
}
EOF

cat > src/app/nextup/page.tsx << 'EOF'
// NextUp — placeholder
// Will be replaced in Phase 3
export default function NextUpPage() {
  return <div>NextUp — coming soon</div>
}
EOF

cat > src/app/bidmentor/page.tsx << 'EOF'
// BidMentor — links to external app
// Will be replaced in Phase 4
export default function BidMentorPage() {
  return <div>BidMentor — redirecting...</div>
}
EOF

cat > src/app/login/page.tsx << 'EOF'
// Login — placeholder
// Will be replaced when auth UI is built
export default function LoginPage() {
  return <div>Login — coming soon</div>
}
EOF

# API routes
cat > src/app/api/ai/route.ts << 'EOF'
// AI provider route — placeholder
// Will be implemented in Phase 0 Prompt 0.7
export async function POST() {
  return Response.json({ error: 'Not implemented yet' }, { status: 501 })
}
EOF

cat > src/app/api/pmp/route.ts << 'EOF'
// PMP API route — placeholder
// Will be implemented in Phase 2
export async function POST() {
  return Response.json({ error: 'Not implemented yet' }, { status: 501 })
}
EOF

cat > src/app/api/askbetter/route.ts << 'EOF'
// AskBetter API route — placeholder
// Will be implemented in Phase 3
export async function POST() {
  return Response.json({ error: 'Not implemented yet' }, { status: 501 })
}
EOF

cat > src/app/api/nextup/route.ts << 'EOF'
// NextUp API route — placeholder
// Will be implemented in Phase 3
export async function POST() {
  return Response.json({ error: 'Not implemented yet' }, { status: 501 })
}
EOF

# Components — layout
cat > src/components/layout/Navbar.tsx << 'EOF'
// Navbar — placeholder shell
// Will be implemented in Phase 1 Prompt 1.2
export default function Navbar() {
  return <nav>Navbar</nav>
}
EOF

cat > src/components/layout/Footer.tsx << 'EOF'
// Footer — placeholder shell
// Will be implemented in Phase 1 Prompt 1.3
export default function Footer() {
  return <footer>Footer</footer>
}
EOF

cat > src/components/layout/ProductSwitcher.tsx << 'EOF'
// ProductSwitcher — placeholder shell
// Will be implemented in Phase 1
export default function ProductSwitcher() {
  return null
}
EOF

# Components — ui
cat > src/components/ui/Button.tsx << 'EOF'
// Button — placeholder
// Will be implemented in Phase 0 Prompt 0.8
export default function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>
}
EOF

cat > src/components/ui/Card.tsx << 'EOF'
// Card — placeholder
// Will be implemented in Phase 0 Prompt 0.8
export default function Card({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
EOF

cat > src/components/ui/Badge.tsx << 'EOF'
// Badge — placeholder
// Will be implemented in Phase 0 Prompt 0.8
export default function Badge({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>
}
EOF

cat > src/components/ui/Tooltip.tsx << 'EOF'
// Tooltip — placeholder
// Will be implemented when PMP glossary is built
export default function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
EOF

# Components — shared
cat > src/components/shared/ProductCard.tsx << 'EOF'
// ProductCard — placeholder
// Will be implemented in Phase 0 Prompt 0.8
export default function ProductCard() {
  return null
}
EOF

# lib/i18n
cat > src/lib/i18n/vi.ts << 'EOF'
// Vietnamese strings — placeholder
// Will be implemented in Phase 0 Prompt 0.5
export const vi = {}
EOF

cat > src/lib/i18n/en.ts << 'EOF'
// English strings — placeholder
// Will be implemented in Phase 0 Prompt 0.5
export const en = {}
EOF

cat > src/lib/i18n/index.ts << 'EOF'
// i18n context and hook — placeholder
// Will be implemented in Phase 0 Prompt 0.5
export function useLanguage() {
  return { lang: 'vi', setLang: () => {}, t: (key: string) => key }
}
EOF

# lib/supabase
cat > src/lib/supabase/client.ts << 'EOF'
// Supabase browser client — placeholder
// Will be implemented in Phase 0 Prompt 0.6
EOF

cat > src/lib/supabase/server.ts << 'EOF'
// Supabase server client — placeholder
// Will be implemented in Phase 0 Prompt 0.6
EOF

# lib/ai
cat > src/lib/ai/provider.ts << 'EOF'
// AI provider abstraction — placeholder
// Will be implemented in Phase 0 Prompt 0.7
EOF

cat > src/lib/ai/prompts/pmp.ts << 'EOF'
// PMP system prompts — placeholder
// Will be implemented in Phase 2
export const PMP_MOOD1_SYSTEM_PROMPT = ''
export const PMP_MOOD2_SYSTEM_PROMPT = ''
EOF

cat > src/lib/ai/prompts/askbetter.ts << 'EOF'
// AskBetter system prompts — placeholder
// Will be implemented in Phase 3
export const ASKBETTER_SYSTEM_PROMPT = ''
EOF

cat > src/lib/ai/prompts/nextup.ts << 'EOF'
// NextUp system prompts — placeholder
// Will be implemented in Phase 3
export const NEXTUP_SYSTEM_PROMPT = ''
EOF

# lib/utils
cat > src/lib/utils/cn.ts << 'EOF'
// classnames utility — placeholder
// Will be implemented in Phase 0 Prompt 0.8
export function cn(...args: unknown[]) {
  return args.filter(Boolean).join(' ')
}
EOF

# hooks
cat > src/hooks/useLanguage.ts << 'EOF'
// useLanguage hook — re-export from lib/i18n
// Will be implemented in Phase 0 Prompt 0.5
export { useLanguage } from '@/lib/i18n'
EOF

cat > src/hooks/useAuth.ts << 'EOF'
// useAuth hook — placeholder
// Will be implemented in Phase 0 Prompt 0.6
export function useAuth() {
  return { user: null, session: null, loading: true, signInWithGoogle: async () => {}, signOut: async () => {} }
}
EOF

# types
cat > src/types/index.ts << 'EOF'
// Shared types — placeholder
// Will be populated as modules are built
export {}
EOF

cat > src/types/database.ts << 'EOF'
// Database types — generated from schema
// Copy TypeScript types from mentorOS_Database_Schema.sql comments here

export type UserPlan = 'free' | 'pmp_monthly' | 'pmp_quarterly' | 'beta'
export type Lang = 'vi' | 'en'

// TODO: Add full types after running schema in Supabase
// See mentorOS_Database_Schema.sql for the complete type definitions
EOF

cat > src/types/products.ts << 'EOF'
// Product-level types
export type ProductId = 'pmp' | 'askbetter' | 'nextup' | 'bidmentor'

export interface Product {
  id: ProductId
  name: string
  tagline: string
  href: string
  badge?: string
  accentColor: string
  external?: boolean
}
EOF

# ============================================================
# Create .env.example
# ============================================================
cat > .env.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Providers
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BIDMENTOR_URL=

# Feature flags
NEXT_PUBLIC_PMP_ENABLED=true
NEXT_PUBLIC_ASKBETTER_ENABLED=true
NEXT_PUBLIC_NEXTUP_ENABLED=true
EOF

echo "✅ .env.example created"

# ============================================================
# Update .gitignore
# ============================================================
echo "" >> .gitignore
echo "# mentorOS" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

echo "✅ .gitignore updated"

# ============================================================
# Create .env.local from example (user fills in values)
# ============================================================
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✅ .env.local created from .env.example — fill in your values"
else
  echo "⚠️  .env.local already exists — skipping"
fi

# ============================================================
# Done
# ============================================================
echo ""
echo "✅ mentorOS scaffold complete."
echo ""
echo "Folder structure created:"
echo "  src/app/           — route pages"
echo "  src/components/    — UI components"
echo "  src/lib/           — business logic, i18n, supabase, ai"
echo "  src/hooks/         — React hooks"
echo "  src/types/         — TypeScript types"
echo "  src/styles/        — global styles"
echo ""
echo "Next steps:"
echo "  1. Fill in .env.local with your Supabase and API keys"
echo "  2. Run the schema in Supabase: mentorOS_Database_Schema.sql"
echo "  3. Copy .cursorrules to the project root"
echo "  4. Open mentoros/ in Cursor"
echo "  5. Start with Phase 0 Prompt 0.1"
echo ""
echo "Run: npm run dev — to confirm the project starts."
