import graphene# type: ignore
from graphene_sqlalchemy import SQLAlchemyObjectType # type: ignore
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity# type: ignore
from models import User, Lead, Activity, Note, db
from sqlalchemy.sql import func# type: ignore
from datetime import datetime

class UserType(SQLAlchemyObjectType):
    class Meta:
        model = User
        only_fields = ('id', 'email', 'credits', 'created_at')

class LeadType(SQLAlchemyObjectType):
    class Meta:
        model = Lead
        only_fields = ('id', 'user_id', 'name', 'email', 'status', 'created_at')

class ActivityType(SQLAlchemyObjectType):
    class Meta:
        model = Activity
        only_fields = ('id', 'user_id', 'action', 'created_at')

class NoteType(SQLAlchemyObjectType):
    class Meta:
        model = Note
        only_fields = ('id', 'lead_id', 'user_id', 'content', 'created_at')

class PipelineMetricsType(graphene.ObjectType):
    status = graphene.String()
    lead_count = graphene.Int()
    conversion_rate = graphene.Float()
    avg_time_in_stage = graphene.Float()

class RegisterInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)

class LeadInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    email = graphene.String(required=True)
    status = graphene.String()

class NoteInput(graphene.InputObjectType):
    content = graphene.String(required=True)

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
        access_token = create_access_token(identity=str(user.id))
        return RegisterMutation(user=user, access_token=access_token)

class LoginInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)

class LoginMutation(graphene.Mutation):
    class Arguments:
        input = LoginInput(required=True)
    
    user = graphene.Field(UserType)
    access_token = graphene.String()

    def mutate(self, info, input):
        user = User.query.filter_by(email=input.email).first()
        if not user or not user.check_password(input.password):
            raise Exception("Invalid credentials")
        access_token = create_access_token(identity=str(user.id)) 
        return LoginMutation(user=user, access_token=access_token)

class CreateLeadMutation(graphene.Mutation):
    class Arguments:
        input = LeadInput(required=True)

    lead = graphene.Field(LeadType)

    @jwt_required()
    def mutate(self, info, input):
        user_id = int(get_jwt_identity())
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
        activity = Activity(user_id=user_id, action=f"Created lead: {input.name}")
        db.session.add(lead)
        db.session.add(activity)
        db.session.commit()
        return CreateLeadMutation(lead=lead)

class UpdateLeadMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = LeadInput(required=True)

    lead = graphene.Field(LeadType)

    @jwt_required()
    def mutate(self, info, id, input):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=id, user_id=user_id).first()
        if not lead:
            raise Exception("Lead not found")
        old_status = lead.status
        lead.name = input.name
        lead.email = input.email
        lead.status = input.status or lead.status
        action = f"Updated lead: {input.name}"
        if old_status != lead.status:
            action += f"; Changed status from {old_status} to {lead.status}"
        activity = Activity(user_id=user_id, action=action)
        db.session.add(activity)
        db.session.commit()
        return UpdateLeadMutation(lead=lead)

class DeleteLeadMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @jwt_required()
    def mutate(self, info, id):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=id, user_id=user_id).first()
        if not lead:
            raise Exception("Lead not found")
        activity = Activity(user_id=user_id, action=f"Deleted lead: {lead.name}")
        db.session.add(activity)
        db.session.delete(lead)
        db.session.commit()
        return DeleteLeadMutation(success=True)

class CreateNoteMutation(graphene.Mutation):
    class Arguments:
        lead_id = graphene.ID(required=True)
        input = NoteInput(required=True)

    note = graphene.Field(NoteType)

    @jwt_required()
    def mutate(self, info, lead_id, input):
        user_id = int(get_jwt_identity())
        lead = Lead.query.filter_by(id=lead_id, user_id=user_id).first()
        if not lead:
            raise Exception("Lead not found")
        note = Note(
            lead_id=lead_id,
            user_id=user_id,
            content=input.content,
        )
        activity = Activity(user_id=user_id, action=f"Added note to lead: {lead.name}")
        db.session.add(note)
        db.session.add(activity)
        db.session.commit()
        return CreateNoteMutation(note=note)

class DeleteNoteMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @jwt_required()
    def mutate(self, info, id):
        user_id = int(get_jwt_identity())
        note = Note.query.filter_by(id=id, user_id=user_id).first()
        if not note:
            raise Exception("Note not found")
        lead = Lead.query.filter_by(id=note.lead_id, user_id=user_id).first()
        activity = Activity(user_id=user_id, action=f"Deleted note from lead: {lead.name}")
        db.session.add(activity)
        db.session.delete(note)
        db.session.commit()
        return DeleteNoteMutation(success=True)

class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    leads = graphene.List(LeadType)
    activities = graphene.List(ActivityType, limit=graphene.Int(default_value=10))
    pipeline_metrics = graphene.List(PipelineMetricsType)
    notes = graphene.List(NoteType, lead_id=graphene.ID(required=True))

    @jwt_required()
    def resolve_me(self, info):
        user_id = get_jwt_identity()
        return User.query.get(user_id)

    @jwt_required()
    def resolve_leads(self, info):
        user_id = get_jwt_identity()
        return Lead.query.filter_by(user_id=user_id).all()

    @jwt_required()
    def resolve_activities(self, info, limit):
        user_id = get_jwt_identity()
        return Activity.query.filter_by(user_id=user_id).order_by(Activity.created_at.desc()).limit(limit).all()

    @jwt_required()
    def resolve_pipeline_metrics(self, info):
        user_id = get_jwt_identity()
        stages = ['New', 'Contacted', 'Qualified', 'Closed']
        metrics = []

        lead_counts = (
            Lead.query.filter_by(user_id=user_id)
            .group_by(Lead.status)
            .with_entities(Lead.status, func.count(Lead.id).label('count'))
            .all()
        )
        lead_count_dict = {status: count for status, count in lead_counts}

        for i, status in enumerate(stages):
            count = lead_count_dict.get(status, 0)
            conversion_rate = 0.0
            if i < len(stages) - 1:
                next_status = stages[i + 1]
                current_count = lead_count_dict.get(status, 0)
                next_count = lead_count_dict.get(next_status, 0)
                conversion_rate = (next_count / current_count * 100) if current_count > 0 else 0.0

            avg_time = 0.0
            status_changes = (
                Activity.query.filter_by(user_id=user_id)
                .filter(Activity.action.contains(f"Changed status to {status}"))
                .all()
            )
            if status_changes:
                total_days = 0
                count_changes = 0
                for change in status_changes:
                    lead_id = change.action.split('lead: ')[1].split(';')[0]
                    next_changes = (
                        Activity.query.filter_by(user_id=user_id)
                        .filter(Activity.created_at > change.created_at)
                        .filter(
                            (Activity.action.contains(f"Changed status from {status}")) |
                            (Activity.action.contains(f"Deleted lead: {lead_id}"))
                        )
                        .order_by(Activity.created_at.asc())
                        .first()
                    )
                    if next_changes:
                        time_diff = (next_changes.created_at - change.created_at).total_seconds() / (60 * 60 * 24)
                        total_days += time_diff
                        count_changes += 1
                avg_time = total_days / count_changes if count_changes > 0 else 0.0

            metrics.append({
                'status': status,
                'lead_count': count,
                'conversion_rate': round(conversion_rate, 2),
                'avg_time_in_stage': round(avg_time, 2),
            })

        return [PipelineMetricsType(**metric) for metric in metrics]

    @jwt_required()
    def resolve_notes(self, info, lead_id):
        user_id = get_jwt_identity()
        return Note.query.filter_by(lead_id=lead_id, user_id=user_id).order_by(Note.created_at.desc()).all()

class Mutation(graphene.ObjectType):
    register = RegisterMutation.Field()
    login = LoginMutation.Field()
    createLead = CreateLeadMutation.Field()
    updateLead = UpdateLeadMutation.Field()
    deleteLead = DeleteLeadMutation.Field()
    createNote = CreateNoteMutation.Field()
    deleteNote = DeleteNoteMutation.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)