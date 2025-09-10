import graphene  # type: ignore
from graphene_sqlalchemy import SQLAlchemyObjectType  # type: ignore
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity  # type: ignore
from models import User, Lead, db

# ----------------------------
# Types
# ----------------------------
class UserType(SQLAlchemyObjectType):
    class Meta:
        model = User
        exclude_fields = ("password_hash", "created_at")

    id = graphene.ID()
    email = graphene.String()
    credits = graphene.Int()
    createdAt = graphene.String()  # ✅ camelCase resolver

    def resolve_createdAt(parent, info):
        return parent.created_at.isoformat()


class LeadType(SQLAlchemyObjectType):
    class Meta:
        model = Lead
        exclude_fields = ("created_at",)

    id = graphene.ID()
    name = graphene.String()
    email = graphene.String()
    status = graphene.String()
    createdAt = graphene.String()  # ✅ camelCase resolver

    def resolve_createdAt(parent, info):
        return parent.created_at.isoformat()

# ----------------------------
# Inputs
# ----------------------------
class RegisterInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)


class LeadInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    email = graphene.String(required=True)
    status = graphene.String()

# ----------------------------
# Mutations
# ----------------------------
class RegisterMutation(graphene.Mutation):
    class Arguments:
        input = RegisterInput(required=True)

    user = graphene.Field(UserType)
    access_token = graphene.String()

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
        input = RegisterInput(required=True)  # same shape as register

    user = graphene.Field(UserType)
    access_token = graphene.String()

    def mutate(self, info, input):
        user = User.query.filter_by(email=input.email).first()
        if not user or not user.check_password(input.password):
            raise Exception("Invalid credentials")
        token = create_access_token(identity=user.id)
        return LoginMutation(user=user, access_token=token)


class CreateLeadMutation(graphene.Mutation):
    class Arguments:
        input = LeadInput(required=True)

    lead = graphene.Field(LeadType)

    @jwt_required()
    def mutate(self, info, input):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user.credits < 1:
            raise Exception("Insufficient credits")
        lead = Lead(
            user_id=user_id,
            name=input.name,
            email=input.email,
            status=input.status or "New",
        )
        user.credits -= 1
        db.session.add(lead)
        db.session.commit()
        return CreateLeadMutation(lead=lead)


class DeleteLeadMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @jwt_required()
    def mutate(self, info, id):
        user_id = get_jwt_identity()
        lead = Lead.query.filter_by(id=id, user_id=user_id).first()
        if not lead:
            raise Exception("Lead not found")
        db.session.delete(lead)
        db.session.commit()
        return DeleteLeadMutation(success=True)

# ----------------------------
# Queries
# ----------------------------
class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    leads = graphene.List(LeadType)

    @jwt_required()
    def resolve_me(self, info):
        user_id = get_jwt_identity()
        return User.query.get(user_id)

    @jwt_required()
    def resolve_leads(self, info):
        user_id = get_jwt_identity()
        return Lead.query.filter_by(user_id=user_id).all()

# ----------------------------
# Root Schema
# ----------------------------
class Mutation(graphene.ObjectType):
    register = RegisterMutation.Field()
    login = LoginMutation.Field()
    createLead = CreateLeadMutation.Field()   # ✅ camelCase in schema
    deleteLead = DeleteLeadMutation.Field()   # ✅ camelCase in schema

schema = graphene.Schema(query=Query, mutation=Mutation)
