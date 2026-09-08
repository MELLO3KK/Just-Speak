"""
Speaking Practice App - Flask Web Application
A web app for practicing speaking skills with speech recognition and scoring.
"""

from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)


def levenshtein_distance(s1, s2):
    """
    Calculate the Levenshtein distance between two strings.
    This is the minimum number of single-character edits (insertions, deletions, substitutions)
    required to change one word into the other.
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            # Calculate costs
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def calculate_accuracy(spoken, expected):
    """
    Calculate accuracy percentage using Levenshtein distance.

    Normalization rules:
    - Trim both strings
    - Convert to lowercase
    - Do not remove punctuation
    - Do not stem or lemmatize

    Formula: Similarity = ((maxLength - distance) / maxLength) * 100
    If both strings are empty, return 100.
    """
    # Normalize strings
    spoken_normalized = spoken.strip().lower()
    expected_normalized = expected.strip().lower()

    # Handle empty strings
    if len(spoken_normalized) == 0 and len(expected_normalized) == 0:
        return 100.0

    # Calculate max length
    max_length = max(len(spoken_normalized), len(expected_normalized))

    if max_length == 0:
        return 100.0

    # Calculate Levenshtein distance
    distance = levenshtein_distance(spoken_normalized, expected_normalized)

    # Calculate similarity percentage
    similarity = ((max_length - distance) / max_length) * 100

    # Round to one decimal place
    return round(similarity, 1)


def validate_json_data(data):
    """
    Validate the uploaded JSON data structure.

    Rules:
    - Root element must be an array
    - Each item must be an object
    - Each item must have non-empty "question" and "answer" strings

    Returns: (is_valid, error_message_or_none)
    """
    # Check if root is an array
    if not isinstance(data, list):
        return False, "JSON must be an array of items"

    # Check each item
    for i, item in enumerate(data):
        item_number = i + 1

        # Check if item is an object
        if not isinstance(item, dict):
            return False, f"Item {item_number}: Must be an object"

        # Check question field
        if 'question' not in item:
            return False, f"Item {item_number}: Missing \"question\" field"
        if not isinstance(item['question'], str) or not item['question'].strip():
            return False, f"Item {item_number}: Missing or invalid \"question\" field"

        # Check answer field
        if 'answer' not in item:
            return False, f"Item {item_number}: Missing \"answer\" field"
        if not isinstance(item['answer'], str) or not item['answer'].strip():
            return False, f"Item {item_number}: Missing or invalid \"answer\" field"

    return True, None


@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


@app.route('/api/import-json', methods=['POST'])
def import_json():
    """
    Handle JSON file upload and validation.

    Accepts multipart/form-data with a 'file' field.
    Returns JSON with success status and data or error message.
    """
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No file uploaded'
        }), 400

    file = request.files['file']

    # Check if filename exists
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected'
        }), 400

    try:
        # Read and parse JSON
        file_content = file.read().decode('utf-8')
        data = json.loads(file_content)

        # Validate structure
        is_valid, error_message = validate_json_data(data)

        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_message
            }), 400

        # Return success with data
        return jsonify({
            'success': True,
            'data': data
        })

    except json.JSONDecodeError as e:
        return jsonify({
            'success': False,
            'error': f'Failed to parse JSON: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error processing file: {str(e)}'
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
