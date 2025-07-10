import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import { createCanvas, loadImage } from 'canvas';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

interface GenerateImageRequest {
  prompt: string;
  aspect_ratio?: string;
  safety_filter_level?: string;
  output_format?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    const { prompt, aspect_ratio = "1:1", safety_filter_level = "block_only_high", output_format = "png" } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('🎨 Generating image with prompt:', prompt);

    // Generate image using Replicate with Google Imagen 4 Fast
    const output = await replicate.run(
      "google/imagen-4-fast",
      {
        input: {
          prompt: prompt,
          aspect_ratio: aspect_ratio,
          safety_filter_level: safety_filter_level,
          output_format: output_format
        }
      }
    ) as unknown as string;

    if (!output) {
      throw new Error('Failed to generate image with Replicate');
    }

    console.log('✅ Image generated successfully:', output);

    // Load the transparent overlay image FIRST to get its dimensions
    const overlayPath = path.join(process.cwd(), 'public', 'untitled folder 2', 'sriramtransparent.png');
    const foregroundImage = await loadImage(overlayPath);
    const overlayWidth = foregroundImage.width;
    const overlayHeight = foregroundImage.height;

    // Download the generated image
    const imageResponse = await fetch(output);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const backgroundImage = await loadImage(Buffer.from(imageBuffer));

    // Create canvas with overlay's dimensions
    const canvas = createCanvas(overlayWidth, overlayHeight);
    const ctx = canvas.getContext('2d');

    // Draw the background image, resized to overlay's dimensions
    ctx.drawImage(backgroundImage, 0, 0, overlayWidth, overlayHeight);

    // Draw the overlay image on top
    ctx.drawImage(foregroundImage, 0, 0, overlayWidth, overlayHeight);

    // Convert canvas to buffer
    const outBuffer = canvas.toBuffer('image/png');

    // Generate unique filename
    const filename = `${uuidv4()}.png`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, outBuffer, { contentType: 'image/png' });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      throw new Error('Failed to upload image to Supabase');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filename);

    console.log('✅ Image uploaded successfully:', publicUrl);

    // Note: Database insertion is handled by the submit-generation API
    // to avoid duplicate records

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      prompt: prompt,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in generate-images API:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
