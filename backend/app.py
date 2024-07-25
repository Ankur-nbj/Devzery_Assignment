import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///default.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Define the TestCase model
class TestCase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    test_case_id = db.Column(db.String(50), unique=True, nullable=False)
    estimate_time = db.Column(db.String(50), nullable=False)
    module = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=True)
    last_updated = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'test_case_name': self.test_case_id,
            'estimate_time': self.estimate_time,
            'module': self.module,
            'priority': self.priority,
            'status': self.status,
            'last_updated': self.last_updated.isoformat()
        }

# Initialize the database
with app.app_context():
    db.create_all()

# Route to get all test cases
@app.route('/testcases', methods=['GET'])
def get_testcases():
    testcases = TestCase.query.all()
    return jsonify([testcase.to_dict() for testcase in testcases])

@app.route('/add_testcase', methods=['POST'])
def add_testcase():
    data = request.json
    new_testcase = TestCase(
        test_case_id=data['test_case_id'],
        estimate_time=data['estimate_time'],
        module=data['module'],
        priority=data['priority'],
        status=data['status']
    )
    db.session.add(new_testcase)
    db.session.commit()
    return jsonify(new_testcase.to_dict()), 201

# Route to update a test case status
@app.route('/testcases/<int:id>', methods=['PUT'])
def update_testcase(id):
    data = request.json
    testcase = TestCase.query.get(id)
    if not testcase:
        return jsonify({'message': 'Test case not found'}), 404
    testcase.status = data.get('status', testcase.status)
    testcase.last_updated = datetime.now(timezone.utc)  # Updated to use timezone-aware datetime
    db.session.commit()
    return jsonify(testcase.to_dict())

if __name__ == '__main__':
    app.run(debug=True)
