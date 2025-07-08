import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 8) + '...');

export async function POST(req: NextRequest) {
  const { email, prompt } = await req.json();

  if (!email || !prompt) {
    return NextResponse.json({ error: 'Email and prompt are required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('image_generations')
    .insert([{ email, prompt, image_url: "" }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
} 