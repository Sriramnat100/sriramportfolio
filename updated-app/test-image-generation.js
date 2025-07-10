// Test script for image generation API
const testImageGeneration = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/generate-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "A beautiful landscape with a river and mountains",
        aspect_ratio: "1:1",
        safety_filter_level: "block_only_high",
        output_format: "png"
      })
    });

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ Image generated successfully!');
      console.log('Image URL:', result.imageUrl);
    } else {
      console.log('❌ Failed to generate image:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testImageGeneration(); 