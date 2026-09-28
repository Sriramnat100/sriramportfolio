import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const { email, prompt, image_url } = await req.json();

  if (!email || !prompt) {
    return NextResponse.json({ error: 'Email and prompt are required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('image_generations')
    .insert([{ email, prompt, image_url: image_url || "" }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
} 