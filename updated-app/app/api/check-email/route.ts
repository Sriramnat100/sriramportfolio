import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Returns whether an email has been seen before (i.e. already verified once).
export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const { email } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('image_generations')
    .select('email')
    .ilike('email', email.trim())
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ exists: (data?.length ?? 0) > 0 });
}
