import { writeFile } from "fs/promises";
import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    prompt: "The photo: Create a cinematic, photorealistic medium shot capturing the dynamic energy of a high-octane action film. The focus is a young woman with wind-swept dark hair streaked with pink highlights and determined features, looking directly and intently into the camera lens, she is slightly off-center. She wears a fitted pink and gold racing jacket over a black tank top with \"Imagen 4 Fast\" in motion-stylized lettering and on the next line \"on Replicate\" emblazoned across the chest and aviator sunglasses pushed up on her head. The lighting is dramatic with motion blur streaks and neon reflections from passing city lights, creating dynamic lens flares and light trails (they do not cover her face). The background shows a blurred urban nightscape with streaking car headlights and illuminated skyscrapers rushing past, rendered with heavy motion blur and shallow depth of field. High contrast lighting, vibrant neon color palette with deep blues and electric yellows, and razor-sharp focus on her intense eyes enhance the fast-paced, electrifying atmosphere. She is illuminated while the background is darker.",
    aspect_ratio: "4:3"
};

const output = await replicate.run("google/imagen-4-fast", { input });
await writeFile("output.jpg", output);
//=> output.jpg written to disk