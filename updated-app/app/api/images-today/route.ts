import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');
  if (!since) {
    return NextResponse.json({ error: 'Missing since parameter' }, { status: 400 });
  }

  console.log('API: Fetching images since:', since);

  const { count, error } = await supabase
    .from('image_generations')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);

  if (error) {
    console.error('API: Error fetching count:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('API: Returning count:', count);
  return NextResponse.json({ count });
} 