from flask import Flask, jsonify, request, send_from_directory
import requests
from flask_cors import CORS
import uuid
from datetime import datetime
import os 
app = Flask(__name__, static_folder='public') 
CORS(app)
API_URL = 'https://thequoteshub.com/api/'
tasks = []
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path == "" or not os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, 'index.html')
    return send_from_directory(app.static_folder, path)
@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    new_task = {
        'id': str(uuid.uuid4()),
        'text': data['text'],
        'completed': False,
        'createdAt': datetime.now().timestamp() * 1000,  # milliseconds
        'starred': False
    }
    tasks.append(new_task)
    return jsonify(new_task), 201

@app.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    for task in tasks:
        if task['id'] == task_id:
            task.update(data)
            return jsonify(task)
    return jsonify({'error': 'Task not found'}), 404

@app.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    tasks = [task for task in tasks if task['id'] != task_id]
    return jsonify({'message': 'Task deleted'}), 200


@app.route('/quote', methods=['GET'])
def get_quote():
    try:
        response = requests.get(API_URL, timeout=5)
        response.raise_for_status()  
        
        raw_data = response.json()
        quote_to_process = None 

        if isinstance(raw_data, list) and raw_data:  
            quote_to_process = raw_data[0] 
        elif isinstance(raw_data, dict): 
            quote_to_process = raw_data 
        
        actual_quote = '' 
        actual_author = ''  
        actual_tags = None 

        if isinstance(quote_to_process, dict): 
            print(quote_to_process) 
            actual_quote = quote_to_process.get('quote', '') or quote_to_process.get('text', '')
            actual_author = quote_to_process.get('author', '')
            tags_value = quote_to_process.get('tags') 
            
            if isinstance(tags_value, list): 
                tags_list = [str(tag).strip() for tag in tags_value]  
            elif isinstance(tags_value, str):  
                tags_list = [tag.strip() for tag in tags_value.split(',') if tag.strip()]
            elif tags_value is not None: 
                tags_list = [str(tags_value).strip()]
            else:
                tags_list = [] 
        
            actual_quote = actual_quote.strip() if isinstance(actual_quote, str) else ''
            actual_author = actual_author.strip() if isinstance(actual_author, str) else ''

        if actual_quote and actual_author:
            return jsonify({
                'quote': actual_quote,
                'author': actual_author,
                'tags': tags_list 
            })
        else:
            return jsonify({'error': 'No valid quote received from API'}), 500 

    except requests.exceptions.RequestException as e: 
        return jsonify({'error': f'API request failed: {str(e)}'}), 500
    except ValueError:
        return jsonify({'error': 'Invalid JSON response from API'}), 500

if __name__ == '__main__':
    app.run(debug=True) 
