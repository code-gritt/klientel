from flask import Flask  # type: ignore
from flask_graphql import GraphQLView  # type: ignore
from flask_jwt_extended import JWTManager  # type: ignore
from flask_cors import CORS
from models import db
from schema import schema
import os

app = Flask(__name__)

# Configure CORS to allow frontend access
CORS(
    app,
    resources={r"/graphql": {"origins": ["http://localhost:5000","http://localhost:3000", "https://klientel.vercel.app"]}},
    supports_credentials=True
)

# Neon DB connection (replace with your Neon URL)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://neondb_owner:npg_vHu7T0IQStWK@ep-dawn-haze-adje30tu-pooler.c-2.us-east-1.aws.neon.tech/klientel-database?sslmode=require&channel_binding=require'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Secret Key
app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY',
    '372d3e34dcbf20e002e24016cac13db7a28be8a18ab48735e2deec8e7ccbb8c4'
)  # Change in production!

# Initialize extensions
db.init_app(app)
JWTManager(app)

# Create DB tables if they don't exist
with app.app_context():
    db.create_all()

# GraphQL endpoint
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)

if __name__ == '__main__':
    app.run(debug=True)
