import graphene  # type: ignore
from graphene_sqlalchemy import SQLAlchemyObjectType  # type: ignore
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity  # type: ignore
from models import User, db


# -------------------------
# GraphQL Types
# -------------------------

class UserType(SQLAlchemyObjectType):
    class Meta:
        model = User
        only_fields = ("id", "email", "credits", "created_at")


# -------------------------
# Input Types
# -------------------------

class RegisterInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)


class LoginInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)


# -------------------------
# Mutations
# -------------------------

class RegisterMutation(graphene.Mutation):
    class Arguments:
        input = RegisterInput(required=True)

    user = graphene.Field(UserType)
    access_token = graphene.String(name="accessToken")  # 👈 expose as accessToken

    def mutate(self, info, input):
        if User.query.filter_by(email=input.email).first():
            raise Exception("Email already exists")

        user = User(email=input.email, credits=50)
        user.set_password(input.password)
        db.session.add(user)
        db.session.commit()

        token = create_access_token(identity=user.id)
        return RegisterMutation(user=user, access_token=token)


class LoginMutation(graphene.Mutation):
    class Arguments:
        input = LoginInput(required=True)

    user = graphene.Field(UserType)
    access_token = graphene.String(name="accessToken")  # 👈 expose as accessToken

    def mutate(self, info, input):
        user = User.query.filter_by(email=input.email).first()
        if not user or not user.check_password(input.password):
            raise Exception("Invalid credentials")

        token = create_access_token(identity=user.id)
        return LoginMutation(user=user, access_token=token)


# -------------------------
# Queries
# -------------------------

class MeQuery(graphene.ObjectType):
    me = graphene.Field(UserType)

    @jwt_required()
    def resolve_me(self, info):
        user_id = get_jwt_identity()
        return User.query.get(user_id)


class Query(MeQuery, graphene.ObjectType):
    pass


class Mutation(graphene.ObjectType):
    register = RegisterMutation.Field()
    login = LoginMutation.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
