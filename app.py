from flask import (
	Flask,
	request,
	render_template,
	send_from_directory,
	url_for,
	jsonify
)
import os
from werkzeug import secure_filename

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)

from logging import Formatter, FileHandler
handler = FileHandler(os.path.join(basedir, 'log.txt'), encoding='utf8')
handler.setFormatter(
	Formatter("[%(asctime)s] %(levelname)-8s %(message)s", "%Y-%m-%d %H:%M:%S")
)
app.logger.addHandler(handler)


@app.context_processor
def override_url_for():
	return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
	if endpoint == "js_static":
		filename = values.get('filename', None)
		if filename:
			file_path = os.path.join(app.root_path, 'static', filename)
			values['q'] = int(os.stat(file_path).st_mtime)
	if endpoint == "css_static":
		filename = values.get('filename', None)
		if filename:
			file_path = os.path.join(app.root_path, 'css', filename)
			values['q'] = int(os.stat(file_path).st_mtime)
	return url_for(endpoint, **values)


@app.route('/css/<path:filename>')
def css_static(filename):
	return send_from_directory(app.root_path + '/css/', filename)

@app.route('/static/<path:filename>')
def js_static(filename):
	return send_from_directory(app.root_path + '/static/', filename)

# @app.route('/')
@app.route('/')
def index():
    return render_template('index.html')


if __name__ == "__main__":
	app.run(debug=True)