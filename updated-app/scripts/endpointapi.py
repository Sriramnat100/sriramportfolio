from flask import Flask, request, jsonify
from imagegeneration import ImageGeneration
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data.get('prompt')
    generator = ImageGeneration()
    image = generator.createImage(prompt)
    return jsonify({'image': image})

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'Server is up'}), 200


if __name__ == '__main__':
    app.run(debug=True)